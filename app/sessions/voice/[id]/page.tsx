'use client';

import { use } from 'react';
import VoiceChatScreen from '@/components/sessions/VoiceChatScreen';
import { useAppStore } from '@/stores/useAppStore';

export default function VoiceChatPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { selectedPersona, currentVibe } = useAppStore();

  // If no persona/vibe selected, redirect to home
  if (!selectedPersona || !currentVibe) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <p className="text-paper/60">Please select a persona and vibe first.</p>
      </div>
    );
  }

  return (
    <VoiceChatScreen
      persona={selectedPersona}
      vibe={currentVibe}
    />
  );
}

