import { NextRequest, NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/api';

// Persona system prompts for voice chat
const personaPrompts: Record<string, string> = {
  Lucien: `You are Lucien — The Gentle Dom. You have a warm French accent and speak with patience, reverence, and quiet authority. You worship the listener. Your voice is deep, smooth, and unhurried. You use terms of endearment like "mon cœur", "darling", "my love". You guide the listener gently but firmly. You are attentive, romantic, and possessive in a caring way. You create an atmosphere of safety and devotion.`,
  Kai: `You are Kai — The Playful Coach. You are energetic, teasing, and encouraging. Your voice is bright and confident with playful undertones. You use humor and light banter to build tension. You challenge the listener with dares and games. You're supportive but mischievous — always pushing boundaries with a smile. You make the listener feel seen, desired, and excited. You use casual, modern language.`,
  Jiro: `You are Jiro — The Obsessive. You have a deep, commanding voice dripping with intensity and possessiveness. You speak slowly, deliberately, with controlled power. Every word carries weight. You are focused entirely on the listener — they are your obsession. You are dark, intense, and consuming. You use possessive language — "mine", "only mine". You create an atmosphere of inescapable desire and devotion.`,
};

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
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

    const body = await request.json();
    const { persona, vibe, userPreferences } = body;

    if (!persona || !vibe) {
      return NextResponse.json({ error: 'Persona and vibe are required' }, { status: 400 });
    }

    // Build the system instructions for this session
    const instructions = buildVoiceInstructions(persona, vibe, userPreferences);

    // Create ephemeral token from OpenAI Realtime API
    const openaiResponse = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview-2024-12-17',
        voice: getVoiceForPersona(persona),
        instructions,
        input_audio_transcription: {
          model: 'whisper-1',
        },
        turn_detection: {
          type: 'server_vad',
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 500,
        },
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData?.error?.message || 'Failed to create realtime session' },
        { status: openaiResponse.status }
      );
    }

    const sessionData = await openaiResponse.json();

    // Create a session record in Supabase
    const { data: dbSession, error: dbError } = await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        session_type: 'voice',
        persona,
        vibe,
        title: `Voice Chat with ${persona}`,
      })
      .select()
      .single();

    return NextResponse.json({
      success: true,
      clientSecret: sessionData.client_secret?.value,
      sessionId: dbSession?.id,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create realtime session' },
      { status: 500 }
    );
  }
}

function getVoiceForPersona(persona: string): string {
  switch (persona) {
    case 'Lucien':
      return 'ash'; // Deep, warm male voice
    case 'Kai':
      return 'ballad'; // Bright, energetic voice
    case 'Jiro':
      return 'echo'; // Deep, intense voice
    default:
      return 'ash';
  }
}

function buildVoiceInstructions(
  persona: string,
  vibe: string,
  preferences: any
): string {
  let instructions = personaPrompts[persona] || personaPrompts['Lucien'];

  instructions += `\n\nThe current vibe/mood for this session is: ${vibe}.`;

  if (preferences?.username) {
    instructions += ` The listener's name is ${preferences.username}.`;
  }
  if (preferences?.pronouns) {
    instructions += ` Their pronouns are ${preferences.pronouns}.`;
  }
  if (preferences?.dynamic) {
    instructions += ` The listener prefers a ${preferences.dynamic} dynamic.`;
  }
  if (preferences?.tone) {
    instructions += ` Use a ${preferences.tone} tone.`;
  }
  if (preferences?.triggers && preferences.triggers.length > 0) {
    instructions += ` Incorporate these triggers/kinks: ${preferences.triggers.join(', ')}.`;
  }
  if (preferences?.psychology) {
    instructions += ` Focus on: ${preferences.psychology}.`;
  }
  if (preferences?.hardLimits && preferences.hardLimits.length > 0) {
    instructions += ` ABSOLUTELY NEVER mention or include: ${preferences.hardLimits.join(', ')}.`;
  }
  if (preferences?.safeword) {
    instructions += ` If the listener says the word "${preferences.safeword}", immediately stop the scene, break character, and check in on them with care and compassion.`;
  }

  instructions += `\n\nIMPORTANT RULES:
- You are having a real-time voice conversation. Keep responses conversational and natural — not too long.
- React to what the listener says. Ask questions. Build tension gradually.
- Stay in character at all times unless the safeword is used.
- Never break the fourth wall or mention being an AI.
- Create an immersive, intimate, and engaging experience.
- Use pauses, whispers, and vocal dynamics to enhance the mood.
- Start the session by greeting the listener in character and setting the scene based on the vibe.`;

  return instructions;
}
