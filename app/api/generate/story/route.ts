import { NextRequest, NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/api';
import { checkAndIncrementFreemium } from '@/lib/freemium';
import { validateGenerationInput } from '@/lib/validation';
import { rateLimit } from '@/lib/rateLimit';
import OpenAI from 'openai';

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  return new OpenAI({ apiKey });
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

    const systemPrompt = buildSystemPrompt(persona, vibe, userPreferences);

    // Generate story using OpenAI
    const completion = await getOpenAIClient().chat.completions.create({
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

    // Story mode: return text only (no audio generation)
    return NextResponse.json({
      success: true,
      storyText,
      sessionId: session?.id,
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
