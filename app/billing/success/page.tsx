'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAppStore } from '@/stores/useAppStore';

export default function BillingSuccessPage() {
  const router = useRouter();
  const { setIsPremium } = useAppStore();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    setIsPremium(true);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/home');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [setIsPremium, router]);

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center space-y-6 max-w-sm"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="text-7xl"
        >
          ✨
        </motion.div>

        <h1 className="font-serif text-3xl text-paper">
          Welcome to Vesper Pro
        </h1>

        <p className="text-paper/70">
          Your subscription is active. Enjoy unlimited stories, audio, and voice chats.
        </p>

        <p className="text-paper/40 text-sm">
          Redirecting in {countdown}...
        </p>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/home')}
          className="w-full py-4 bg-lime text-void font-semibold rounded-lg"
        >
          Start Exploring
        </motion.button>
      </motion.div>
    </div>
  );
}
