'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const tourSlides = [
  {
    title: 'Generate infinite stories',
    description: 'Based on your mood.',
    emoji: '📖',
  },
  {
    title: 'Chat in real-time',
    description: 'With our AI Voice models.',
    emoji: '🎤',
  },
  {
    title: 'Tap "Red" at any time',
    description: 'To stop the scene.',
    emoji: '🛑',
  },
];

export default function TourPage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < tourSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      // Navigate to paywall (can be skipped)
      router.push('/onboarding/paywall');
    }
  };

  const handleSkip = () => {
    router.push('/onboarding/paywall');
  };

  return (
    <div className="min-h-screen bg-void p-6">
      <div className="max-w-2xl mx-auto flex flex-col h-full">
        {/* Skip button */}
        <div className="flex justify-end mb-8">
          <button
            onClick={handleSkip}
            className="text-paper/60 text-sm hover:text-paper transition-colors"
          >
            Skip
          </button>
        </div>

        {/* Tour Content */}
        <div className="flex-1 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-8xl mb-8"
              >
                {tourSlides[currentSlide].emoji}
              </motion.div>

              <h2 className="font-serif text-3xl md:text-4xl text-paper mb-4">
                {tourSlides[currentSlide].title}
              </h2>

              <p className="text-paper/70 text-lg">
                {tourSlides[currentSlide].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="space-y-4">
          {/* Dots indicator */}
          <div className="flex justify-center gap-2">
            {tourSlides.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide ? 'bg-lime w-8' : 'bg-paper/20 w-2'
                }`}
              />
            ))}
          </div>

          {/* Next button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            className="w-full py-4 bg-lime text-void font-semibold rounded-lg"
          >
            {currentSlide === tourSlides.length - 1 ? 'Continue' : 'Next'}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

