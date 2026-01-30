'use client';

import { motion } from 'framer-motion';

interface QuizStep4Props {
  value?: string;
  onChange: (value: string) => void;
}

const options = [
  { value: 'Feeling used', emoji: '💋' },
  { value: 'Feeling safe', emoji: '🛡️' },
  { value: 'Feeling overpowered', emoji: '⚡' },
  { value: 'Emotional connection', emoji: '💕' },
];

export default function QuizStep4({ value, onChange }: QuizStep4Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="font-serif text-3xl mb-2 text-paper">
          The Psychology
        </h2>
        <p className="text-paper/70 text-lg">
          What is your primary turn-on?
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
              <span className="font-semibold text-paper text-lg">{option.value}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

