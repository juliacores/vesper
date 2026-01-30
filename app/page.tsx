'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ValuePropSlide from '@/components/onboarding/ValuePropSlide';
import { AnimatePresence } from 'framer-motion';

const valueProps = [
  {
    title: 'Immersive Audio Erotica.',
    subtext: 'Stories that listen to you. Fantasies that respond.',
    visual: '🎧',
  },
  {
    title: 'Your Perfect Partner.',
    subtext: 'Dominant, gentle, or obsessive. Custom AI personas tailored to your desires.',
    visual: '💋',
  },
  {
    title: 'Private & Judgment Free.',
    subtext: 'A safe space to explore your deepest kinks.',
    visual: '🔒',
  },
];

export default function Home() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < valueProps.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      router.push('/auth');
    }
  };

  return (
    <main className="min-h-screen bg-void">
      <AnimatePresence mode="wait">
        <ValuePropSlide
          key={currentSlide}
          title={valueProps[currentSlide].title}
          subtext={valueProps[currentSlide].subtext}
          visual={valueProps[currentSlide].visual}
          onNext={handleNext}
          isLast={currentSlide === valueProps.length - 1}
        />
      </AnimatePresence>
    </main>
  );
}
