'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAppStore } from '@/stores/useAppStore';
import { Howl } from 'howler';

interface AudioPlayerScreenProps {
  sessionId?: string;
  audioUrl?: string;
  title?: string;
  persona?: string;
  vibe?: string;
}

export default function AudioPlayerScreen({
  sessionId,
  audioUrl,
  title = 'Untitled Session',
  persona,
  vibe,
}: AudioPlayerScreenProps) {
  const router = useRouter();
  const { isPremium, freeGenerationsUsed, incrementFreeGenerations } = useAppStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isStopped, setIsStopped] = useState(false);
  const soundRef = useRef<Howl | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio and freemium timer
  useEffect(() => {
    if (!isPremium && freeGenerationsUsed >= 1) {
      router.push('/paywall?reason=generation_limit');
      return;
    }

    if (!isPremium) {
      setTimeRemaining(120); // 2 minutes
      incrementFreeGenerations();
    }

    // Initialize Howl with audio URL
    if (audioUrl) {
      const { Howl } = require('howler');
      soundRef.current = new Howl({
        src: [audioUrl],
        html5: true,
        onload: () => {
          setDuration(soundRef.current?.duration() || 0);
        },
        onend: () => {
          setIsPlaying(false);
        },
        onerror: () => {
          setIsPlaying(false);
        },
      });
    }

    return () => {
      if (soundRef.current) {
        soundRef.current.unload();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [audioUrl, isPremium, freeGenerationsUsed, router, incrementFreeGenerations]);

  // Update progress and handle freemium timer
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        // Update progress
        // const seek = soundRef.current?.seek() || 0;
        // setProgress(seek);
        // setDuration(soundRef.current?.duration() || 0);

        // Update freemium timer
        if (!isPremium && timeRemaining !== null) {
          setTimeRemaining((prev) => {
            if (prev === null) return null;
            if (prev <= 1) {
              handleStop();
              return 0;
            }
            return prev - 1;
          });
        }
      }, 100);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, timeRemaining, isPremium]);

  const handlePlayPause = () => {
    if (!soundRef.current) return;

    if (isPlaying) {
      soundRef.current.pause();
    } else {
      soundRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    if (soundRef.current) {
      soundRef.current.stop();
    }
    setIsPlaying(false);
    setIsStopped(true);
    setProgress(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    setProgress(newProgress);
    // soundRef.current?.seek(newProgress);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
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
          <h2 className="font-serif text-2xl text-paper">Session Complete</h2>
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
    <div className="min-h-screen bg-void flex flex-col p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="text-paper/60 mb-4"
        >
          ← Back
        </button>
        <h1 className="font-serif text-2xl text-paper mb-2">{title}</h1>
        {persona && vibe && (
          <p className="text-paper/60 text-sm">
            {persona} • {vibe}
          </p>
        )}
      </div>

      {/* Cover Art */}
      <div className="w-full max-w-md mx-auto mb-8">
        <div className="aspect-square bg-paper/10 rounded-lg flex items-center justify-center border border-paper/20">
          <span className="text-6xl">🎧</span>
        </div>
      </div>

      {/* Timer (for free users) */}
      {!isPremium && timeRemaining !== null && (
        <div className="text-center mb-6">
          <div className="text-2xl font-mono text-paper mb-1">
            {formatTime(timeRemaining)}
          </div>
          <p className="text-xs text-paper/60">Time remaining</p>
        </div>
      )}

      {/* Progress Bar */}
      <div className="w-full max-w-md mx-auto mb-8 space-y-2">
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={progress}
          onChange={handleSeek}
          className="w-full h-2 bg-paper/10 rounded-lg appearance-none cursor-pointer accent-lime"
        />
        <div className="flex justify-between text-xs text-paper/60">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 mb-8">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            // Seek backward 10 seconds
            const newProgress = Math.max(0, progress - 10);
            setProgress(newProgress);
            // soundRef.current?.seek(newProgress);
          }}
          className="text-paper/60 text-2xl"
        >
          ⏪
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handlePlayPause}
          className="w-16 h-16 rounded-full bg-lime text-void flex items-center justify-center text-2xl"
        >
          {isPlaying ? '⏸' : '▶'}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            // Seek forward 10 seconds
            const newProgress = Math.min(duration, progress + 10);
            setProgress(newProgress);
            // soundRef.current?.seek(newProgress);
          }}
          className="text-paper/60 text-2xl"
        >
          ⏩
        </motion.button>
      </div>

      {/* STOP Button */}
      <div className="w-full max-w-md mx-auto">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleStop}
          className="w-full py-4 bg-blood text-paper font-bold text-lg rounded-lg"
        >
          STOP
        </motion.button>
      </div>
    </div>
  );
}

