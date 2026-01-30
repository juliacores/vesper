'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
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
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // User is authenticated, redirect to home
        router.push('/home');
      } else {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleNext = () => {
    if (currentSlide < valueProps.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      router.push('/auth');
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <p className="text-paper/60">Loading...</p>
      </div>
    );
  }

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
