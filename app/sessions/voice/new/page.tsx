'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/stores/useAppStore';
import { motion } from 'framer-motion';

export default function NewVoiceChatPage() {
  const router = useRouter();
  const { selectedPersona, currentVibe } = useAppStore();

  useEffect(() => {
    if (!selectedPersona || !currentVibe) {
      router.push('/home');
    }
  }, [selectedPersona, currentVibe, router]);

  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-6xl">🎤</div>
        <h1 className="font-serif text-3xl text-paper">Voice Chat</h1>
        <p className="text-paper/60 text-lg max-w-sm">
          Real-time voice conversations are coming soon. Stay tuned for an immersive experience with {selectedPersona || 'your partner'}.
        </p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/home')}
          className="px-8 py-3 bg-lime text-void font-semibold rounded-lg"
        >
          Go Back
        </motion.button>
      </motion.div>
    </div>
  );
}
