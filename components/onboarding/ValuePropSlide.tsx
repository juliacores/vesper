'use client';

import { motion } from 'framer-motion';

interface ValuePropSlideProps {
  title: string;
  subtext: string;
  visual: string; // Emoji or icon for now
  onNext: () => void;
  isLast?: boolean;
}

export default function ValuePropSlide({
  title,
  subtext,
  visual,
  onNext,
  isLast = false,
}: ValuePropSlideProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-6 bg-void"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-8xl mb-8"
      >
        {visual}
      </motion.div>

      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="font-serif text-3xl md:text-4xl text-paper text-center mb-4"
      >
        {title}
      </motion.h2>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-paper/70 text-center text-lg max-w-md mb-12"
      >
        {subtext}
      </motion.p>

      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        whileTap={{ scale: 0.95 }}
        onClick={onNext}
        className="px-8 py-4 bg-lime text-void font-semibold rounded-lg"
      >
        {isLast ? 'Get Started' : 'Next'}
      </motion.button>
    </motion.div>
  );
}

