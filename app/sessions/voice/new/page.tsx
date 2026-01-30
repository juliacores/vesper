'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/stores/useAppStore';

export default function NewVoiceChatPage() {
  const router = useRouter();
  const { selectedPersona, currentVibe, isPremium, freeGenerationsUsed } = useAppStore();
  const [loading, setLoading] = useState(true);

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

    // Voice chat feature is not yet implemented
    // Redirect to home with a message
    setLoading(false);
    router.push('/home?message=voice_chat_coming_soon');
  }, [selectedPersona, currentVibe, isPremium, freeGenerationsUsed, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🎤</div>
          <p className="text-paper/60">Preparing voice chat...</p>
        </div>
      </div>
    );
  }

  return null;
}

