'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AudioPlayerScreen from '@/components/sessions/AudioPlayerScreen';
import { useAppStore } from '@/stores/useAppStore';
import { supabase } from '@/lib/supabase/client';

export default function NewStorySessionPage() {
  const router = useRouter();
  const { selectedPersona, currentVibe, userPreferences, isPremium, freeGenerationsUsed, incrementFreeGenerations } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [storyText, setStoryText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    // Prevent double-fire from React Strict Mode
    if (hasStarted.current) return;

    if (!selectedPersona || !currentVibe) {
      router.push('/home');
      return;
    }

    // Check freemium limits (allow 3 free generations for testing)
    if (!isPremium && freeGenerationsUsed >= 3) {
      router.push('/paywall?reason=generation_limit');
      return;
    }

    hasStarted.current = true;

    // Generate story
    const generateStory = async () => {
      try {
        setLoading(true);

        // Get access token for API auth
        const { data: { session } } = await supabase.auth.getSession();
        const accessToken = session?.access_token;

        const response = await fetch('/api/generate/story', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify({
            persona: selectedPersona,
            vibe: currentVibe,
            userPreferences,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 402 || errorData.code === 'limit_reached') {
            router.push('/paywall?reason=generation_limit');
            return;
          }
          throw new Error(errorData.error || 'Failed to generate story');
        }

        const data = await response.json();
        setSessionId(data.sessionId);
        setStoryText(data.storyText || null);

        if (!isPremium) {
          incrementFreeGenerations();
        }
      } catch (err: any) {
        setError(err.message || 'Failed to generate story');
      } finally {
        setLoading(false);
      }
    };

    generateStory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">✨</div>
          <p className="text-paper/60">Generating your story...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-blood mb-4">{error}</p>
          <button
            onClick={() => router.push('/home')}
            className="px-6 py-3 bg-lime text-void font-semibold rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!selectedPersona || !currentVibe) {
    return null;
  }

  return (
    <AudioPlayerScreen
      sessionId={sessionId || undefined}
      storyText={storyText || undefined}
      title={`Story with ${selectedPersona}`}
      persona={selectedPersona}
      vibe={currentVibe}
    />
  );
}
