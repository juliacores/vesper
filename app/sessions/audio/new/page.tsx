'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AudioPlayerScreen from '@/components/sessions/AudioPlayerScreen';
import { useAppStore } from '@/stores/useAppStore';

export default function NewAudioSessionPage() {
  const router = useRouter();
  const { selectedPersona, currentVibe, userPreferences, isPremium, freeGenerationsUsed } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedPersona || !currentVibe) {
      router.push('/home');
      return;
    }

    // Check freemium limits
    if (!isPremium && freeGenerationsUsed >= 1) {
      router.push('/paywall?reason=generation_limit');
      return;
    }

    // Generate audio
    const generateAudio = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/generate/audio', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            persona: selectedPersona,
            vibe: currentVibe,
            userPreferences,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate audio');
        }

        const data = await response.json();
        setSessionId(data.sessionId);
        setAudioUrl(data.audioUrl || null);
      } catch (err: any) {
        setError(err.message || 'Failed to generate audio');
      } finally {
        setLoading(false);
      }
    };

    generateAudio();
  }, [selectedPersona, currentVibe, userPreferences, isPremium, freeGenerationsUsed, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">✨</div>
          <p className="text-paper/60">Generating your audio...</p>
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
      title={`Audio Session with ${selectedPersona}`}
      persona={selectedPersona}
      vibe={currentVibe}
    />
  );
}
