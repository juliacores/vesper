import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { persona, vibe, userPreferences } = body;

    // Build system prompt for guided audio/meditation
    const systemPrompt = buildAudioPrompt(persona, vibe, userPreferences);

    // Generate script using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `Create a guided audio/meditation script with a ${vibe} vibe, featuring ${persona}. Make it immersive and relaxing.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const scriptText = completion.choices[0]?.message?.content || '';

    // Save session to database first
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        session_type: 'audio',
        persona,
        vibe,
        title: `Audio with ${persona}`,
        transcript: scriptText,
      })
      .select()
      .single();

    if (sessionError) {
      return NextResponse.json(
        { error: 'Failed to save session' },
        { status: 500 }
      );
    }

    // Generate TTS audio using ElevenLabs
    let audioUrl: string | null = null;
    try {
      const ttsResponse = await fetch(
        `${request.nextUrl.origin}/api/elevenlabs/tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: scriptText.substring(0, 5000), // Limit text length for TTS
          }),
        }
      );

      if (ttsResponse.ok) {
        const ttsData = await ttsResponse.json();
        
        // Save audio to Supabase Storage
        if (ttsData.audio && session?.id) {
          const audioBuffer = Buffer.from(ttsData.audio, 'base64');
          const fileName = `${user.id}/${session.id}.mp3`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('audio-sessions')
            .upload(fileName, audioBuffer, {
              contentType: 'audio/mpeg',
              upsert: true,
            });

          if (!uploadError && uploadData) {
            // Get public URL
            const { data: urlData } = supabase.storage
              .from('audio-sessions')
              .getPublicUrl(fileName);
            
            audioUrl = urlData.publicUrl;

            // Update session with audio URL
            await supabase
              .from('sessions')
              .update({ audio_url: audioUrl })
              .eq('id', session.id);
          }
        }
      }
    } catch (ttsError) {
      // TTS generation failed, but continue with script text
    }

    return NextResponse.json({
      success: true,
      scriptText,
      sessionId: session?.id,
      audioUrl,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate audio' },
      { status: 500 }
    );
  }
}

function buildAudioPrompt(
  persona: string,
  vibe: string,
  preferences: any
): string {
  let prompt = `You are ${persona}, creating a guided audio/meditation experience. `;

  if (preferences.dynamic) {
    prompt += `The user prefers a ${preferences.dynamic} dynamic. `;
  }
  if (preferences.tone) {
    prompt += `Use a ${preferences.tone} tone. `;
  }
  if (preferences.triggers && preferences.triggers.length > 0) {
    prompt += `Incorporate these elements: ${preferences.triggers.join(', ')}. `;
  }

  prompt += `Create a calming, immersive, and sensual guided experience.`;
  return prompt;
}
