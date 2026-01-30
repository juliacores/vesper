'use client';

import { motion } from 'framer-motion';

interface QuizStep2Props {
  value?: 'Worship/Praise' | 'Degradation/Dirty' | 'Stern/Commanding' | 'Soft/Romantic';
  onChange: (value: 'Worship/Praise' | 'Degradation/Dirty' | 'Stern/Commanding' | 'Soft/Romantic') => void;
}

const options = [
  { value: 'Worship/Praise' as const, label: 'Worship/Praise', emoji: '✨' },
  { value: 'Degradation/Dirty' as const, label: 'Degradation/Dirty', emoji: '🔥' },
  { value: 'Stern/Commanding' as const, label: 'Stern/Commanding', emoji: '⚡' },
  { value: 'Soft/Romantic' as const, label: 'Soft/Romantic', emoji: '💕' },
];

export default function QuizStep2({ value, onChange }: QuizStep2Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="font-serif text-3xl mb-2 text-paper">
          The Tone
        </h2>
        <p className="text-paper/70 text-lg">
          How do you want to be spoken to?
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {options.map((option) => (
          <motion.button
            key={option.value}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(option.value)}
            className={`p-6 rounded-lg border-2 text-left transition-all ${
              value === option.value
                ? 'border-lime bg-lime/10'
                : 'border-paper/20 bg-paper/5 hover:border-paper/40'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">{option.emoji}</span>
              <span className="font-semibold text-paper text-lg">{option.label}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

