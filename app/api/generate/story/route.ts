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

    // Build system prompt from user preferences
    const systemPrompt = buildSystemPrompt(persona, vibe, userPreferences);

    // Generate story using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `Create an immersive erotic story with a ${vibe} vibe, featuring ${persona}. Make it engaging and detailed.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    });

    const storyText = completion.choices[0]?.message?.content || '';

    // Save session to database first
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        session_type: 'story',
        persona,
        vibe,
        title: `Story with ${persona}`,
        transcript: storyText,
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
            text: storyText.substring(0, 5000), // Limit text length for TTS
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
      // TTS generation failed, but continue with story text
    }

    return NextResponse.json({
      success: true,
      storyText,
      sessionId: session?.id,
      audioUrl,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate story' },
      { status: 500 }
    );
  }
}

function buildSystemPrompt(
  persona: string,
  vibe: string,
  preferences: any
): string {
  let prompt = `You are ${persona}, an AI companion creating immersive erotic content. `;

  if (preferences.dynamic) {
    prompt += `The user prefers a ${preferences.dynamic} dynamic. `;
  }
  if (preferences.tone) {
    prompt += `Use a ${preferences.tone} tone. `;
  }
  if (preferences.triggers && preferences.triggers.length > 0) {
    prompt += `Incorporate these triggers: ${preferences.triggers.join(', ')}. `;
  }
  if (preferences.psychology) {
    prompt += `Focus on: ${preferences.psychology}. `;
  }
  if (preferences.hardLimits && preferences.hardLimits.length > 0) {
    prompt += `NEVER include: ${preferences.hardLimits.join(', ')}. `;
  }

  prompt += `Create engaging, detailed, and immersive content.`;
  return prompt;
}
