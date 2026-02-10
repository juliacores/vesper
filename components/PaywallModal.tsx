'use client';

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/stores/useAppStore';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: 'time_limit' | 'generation_limit';
}

export default function PaywallModal({ isOpen, onClose, reason }: PaywallModalProps) {
  const router = useRouter();
  const { setIsPremium } = useAppStore();

  const handleSubscribe = () => {
    // TODO: Implement Stripe subscription flow
    setIsPremium(true);
    onClose();
  };

  const getMessage = () => {
    if (reason === 'time_limit') {
      return "You've reached the climax of the free trial. Subscribe to finish the scene.";
    }
    return "You've used your free generation. Subscribe for unlimited access.";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-void/80 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-void border-2 border-paper/20 rounded-lg p-6 z-50 flex flex-col"
          >
            <div className="flex-1 space-y-6">
              <div className="text-center">
                <div className="text-6xl mb-4">✨</div>
                <h2 className="font-serif text-3xl text-paper mb-2">
                  Vesper Pro
                </h2>
                <p className="text-paper/70">{getMessage()}</p>
              </div>

              <div className="space-y-3 text-left">
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
            </div>

            <div className="space-y-3 mt-6">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSubscribe}
                className="w-full py-4 bg-lime text-void font-semibold rounded-lg"
              >
                Subscribe to Vesper Pro
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="w-full py-3 bg-paper/10 border border-paper/20 text-paper font-semibold rounded-lg"
              >
                Maybe Later
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

