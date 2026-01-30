'use client';

import { motion } from 'framer-motion';

interface QuizStep1Props {
  value?: 'Submissive' | 'Dominant' | 'Switch' | 'Observer/Voyeur';
  onChange: (value: 'Submissive' | 'Dominant' | 'Switch' | 'Observer/Voyeur') => void;
}

const options = [
  { value: 'Submissive' as const, label: 'Submissive', emoji: '🌸' },
  { value: 'Dominant' as const, label: 'Dominant', emoji: '👑' },
  { value: 'Switch' as const, label: 'Switch', emoji: '🔄' },
  { value: 'Observer/Voyeur' as const, label: 'Observer/Voyeur', emoji: '👁️' },
];

export default function QuizStep1({ value, onChange }: QuizStep1Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="font-serif text-3xl mb-2 text-paper">
          The Dynamic
        </h2>
        <p className="text-paper/70 text-lg">
          In your fantasies, you usually prefer to take the role of...
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

