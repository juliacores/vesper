'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCheckout } from '@/lib/useCheckout';

export default function PaywallPage() {
  const router = useRouter();
  const [reason, setReason] = useState<string | null>(null);
  const { startCheckout, loading, error } = useCheckout();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setReason(params.get('reason'));
  }, []);

  const getMessage = () => {
    if (reason === 'time_limit') {
      return "You\u2019ve reached the climax of the free trial. Subscribe to finish the scene.";
    }
    if (reason === 'generation_limit') {
      return "You\u2019ve used your free generations. Subscribe for unlimited access.";
    }
    return 'Unlock unlimited stories, audios, and voice chats.';
  };

  return (
    <div className="min-h-screen bg-void p-6">
      <div className="max-w-2xl mx-auto flex flex-col h-full min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-6 w-full">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-6xl mb-4"
            >
              ✨
            </motion.div>

            <h1 className="font-serif text-4xl text-paper mb-2">
              Vesper Pro
            </h1>

            <p className="text-paper/70 text-lg mb-8">
              {getMessage()}
            </p>

            <div className="space-y-4 text-left bg-paper/5 p-6 rounded-lg border border-paper/20">
              <div className="flex items-center gap-3">
                <span className="text-lime text-xl">✓</span>
                <span className="text-paper">Unlimited generations</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lime text-xl">✓</span>
                <span className="text-paper">No time limits</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lime text-xl">✓</span>
                <span className="text-paper">Advanced kinks</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lime text-xl">✓</span>
                <span className="text-paper">Priority support</span>
              </div>
            </div>

            {error && (
              <p className="text-blood text-sm">{error}</p>
            )}

            <p className="text-paper/40 text-xs">
              Have a promo code? You can apply it at checkout.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => startCheckout('yearly')}
            disabled={loading}
            className="w-full py-4 bg-lime text-void font-semibold rounded-lg disabled:opacity-50"
          >
            {loading ? 'Redirecting to checkout...' : 'Subscribe Yearly (Recommended)'}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => startCheckout('monthly')}
            disabled={loading}
            className="w-full py-4 bg-paper/10 border border-paper/20 text-paper font-semibold rounded-lg disabled:opacity-50"
          >
            Subscribe Monthly
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/home')}
            className="w-full py-4 bg-paper/5 border border-paper/20 text-paper font-semibold rounded-lg"
          >
            Continue with Free
          </motion.button>
        </div>
      </div>
    </div>
  );
}
