'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/stores/useAppStore';
import VoiceChatScreen from '@/components/sessions/VoiceChatScreen';

export default function NewVoiceChatPage() {
  const router = useRouter();
  const { selectedPersona, currentVibe, isPremium, freeGenerationsUsed, incrementFreeGenerations } =
    useAppStore();
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    if (!selectedPersona || !currentVibe) {
      router.push('/home');
      return;
    }

    // Check freemium limits
    if (!isPremium && freeGenerationsUsed >= 3) {
      router.push('/paywall?reason=generation_limit');
      return;
    }

    // Increment free generation counter
    if (!isPremium) {
      incrementFreeGenerations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!selectedPersona || !currentVibe) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <p className="text-paper/60">Redirecting...</p>
      </div>
    );
  }

  return <VoiceChatScreen persona={selectedPersona} vibe={currentVibe} />;
}
