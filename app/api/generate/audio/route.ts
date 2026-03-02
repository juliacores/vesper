import { NextRequest, NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/api';
import { checkAndIncrementFreemium } from '@/lib/freemium';
import { validateGenerationInput } from '@/lib/validation';
import { rateLimit } from '@/lib/rateLimit';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ELEVENLABS_DEFAULT_VOICE = '21m00Tcm4TlvDq8ikWAM';
const TTS_MAX_CHARS = 5000;

async function generateTTS(text: string, voiceId = ELEVENLABS_DEFAULT_VOICE): Promise<Buffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY is not configured');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: text.substring(0, TTS_MAX_CHARS),
          model_id: 'eleven_monolingual_v1',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs API returned ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, token } = createApiClient(request);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - no token' }, { status: 401 });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rateLimited = rateLimit(request, user.id, { maxRequests: 5, windowMs: 60_000 });
    if (rateLimited) return rateLimited;

    const freemium = await checkAndIncrementFreemium(supabase, user.id);
    if (!freemium.allowed) {
      return NextResponse.json(
        { error: freemium.error, code: 'limit_reached' },
        { status: 402 }
      );
    }

    const body = await request.json();
    const input = validateGenerationInput(body);
    if (!input.valid) {
      return NextResponse.json({ error: input.error }, { status: 400 });
    }
    const { persona, vibe, userPreferences } = input;

    const systemPrompt = buildAudioPrompt(persona, vibe, userPreferences);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Create a guided audio/meditation script with a ${vibe} vibe, featuring ${persona}. Make it immersive and relaxing.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const scriptText = completion.choices[0]?.message?.content || '';

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
      return NextResponse.json({ error: 'Failed to save session' }, { status: 500 });
    }

    let audioBuffer: Buffer;
    try {
      audioBuffer = await generateTTS(scriptText);
    } catch {
      await supabase.from('sessions').delete().eq('id', session.id);
      return NextResponse.json(
        { error: 'Audio generation failed. Please check your ElevenLabs API key and try again.' },
        { status: 500 }
      );
    }

    let audioUrl: string;
    const fileName = `${user.id}/${session.id}.mp3`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio-sessions')
      .upload(fileName, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true,
      });

    if (uploadError || !uploadData) {
      const base64 = audioBuffer.toString('base64');
      audioUrl = `data:audio/mpeg;base64,${base64}`;
    } else {
      const { data: urlData } = supabase.storage
        .from('audio-sessions')
        .getPublicUrl(fileName);

      audioUrl = urlData.publicUrl;

      await supabase
        .from('sessions')
        .update({ audio_url: audioUrl })
        .eq('id', session.id);
    }

    return NextResponse.json({
      success: true,
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
