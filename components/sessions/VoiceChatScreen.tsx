'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useAppStore } from '@/stores/useAppStore';

interface VoiceChatScreenProps {
  persona: string;
  vibe: string;
}

export default function VoiceChatScreen({ persona, vibe }: VoiceChatScreenProps) {
  const router = useRouter();
  const { isPremium, freeGenerationsUsed, incrementFreeGenerations } = useAppStore();
  const [isRecording, setIsRecording] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isStopped, setIsStopped] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const scale = useMotionValue(1);
  const opacity = useMotionValue(0.6);

  // Freemium timer logic
  useEffect(() => {
    if (!isPremium && isRecording && timeRemaining !== null) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null) return null;
          if (prev <= 1) {
            handleStop();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording, timeRemaining, isPremium]);

  // Start session
  useEffect(() => {
    if (!isPremium && freeGenerationsUsed >= 1) {
      // Free user has used their generation
      router.push('/paywall?reason=generation_limit');
      return;
    }

    // Initialize timer for free users
    if (!isPremium) {
      setTimeRemaining(120); // 2 minutes
      incrementFreeGenerations();
    }

    // Start breathing animation
    const breathingAnimation = () => {
      animate(scale, [1, 1.2, 1], {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      });
      animate(opacity, [0.6, 1, 0.6], {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      });
    };

    breathingAnimation();
    setIsRecording(true);
  }, []);

  const handleStop = () => {
    setIsRecording(false);
    setIsStopped(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    // TODO: Stop audio/recording
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isStopped) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center p-6">
        <div className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-6xl mb-4"
          >
            ✓
          </motion.div>
          <h2 className="font-serif text-2xl text-paper">Session Stopped</h2>
          <p className="text-paper/60">You safely ended the session.</p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/home')}
            className="px-8 py-3 bg-lime text-void font-semibold rounded-lg"
          >
            Return Home
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center p-6 relative">
      {/* Background illustration placeholder */}
      <div className="absolute inset-0 opacity-10 flex items-center justify-center">
        <div className="text-9xl">💋</div>
      </div>

      {/* Breathing Circle Visualizer */}
      <div className="relative z-10 mb-12">
        <motion.div
          style={{ scale, opacity }}
          className="w-64 h-64 rounded-full border-4 border-lime flex items-center justify-center"
        >
          <div className="w-48 h-48 rounded-full bg-lime/20 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-lime/40 flex items-center justify-center">
              <span className="text-4xl">🎤</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Timer (for free users) */}
      {!isPremium && timeRemaining !== null && (
        <div className="mb-8 text-center">
          <div className="text-3xl font-mono text-paper mb-2">
            {formatTime(timeRemaining)}
          </div>
          <p className="text-sm text-paper/60">Time remaining</p>
        </div>
      )}

      {/* Controls */}
      <div className="space-y-4 w-full max-w-md">
        {/* Mute button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="w-full py-4 bg-paper/10 border border-paper/20 text-paper font-semibold rounded-lg"
        >
          {isRecording ? '🔇 Mute' : '🔊 Unmute'}
        </motion.button>

        {/* Text input (for typing) */}
        <input
          type="text"
          placeholder="Type your response..."
          className="w-full px-4 py-3 bg-paper/10 border border-paper/20 rounded-lg text-paper placeholder-paper/40 focus:outline-none focus:border-lime focus:ring-1 focus:ring-lime"
        />

        {/* STOP Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleStop}
          className="w-full py-4 bg-blood text-paper font-bold text-lg rounded-lg shadow-lg"
        >
          STOP
        </motion.button>
      </div>

      {/* Safeword reminder */}
      <div className="mt-8 text-center">
        <p className="text-xs text-paper/50">
          Say your safeword at any time to stop
        </p>
      </div>
    </div>
  );
}

