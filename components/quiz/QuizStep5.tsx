'use client';

import { motion } from 'framer-motion';

interface QuizStep5Props {
  value: string[];
  onChange: (value: string[]) => void;
}

const hardLimits = [
  'Pain',
  'Blood',
  'Humiliation',
  'Names',
  'Age Play',
  'Scat',
  'Watersports',
];

export default function QuizStep5({ value, onChange }: QuizStep5Props) {
  const toggleLimit = (limit: string) => {
    if (value.includes(limit)) {
      onChange(value.filter((l) => l !== limit));
    } else {
      onChange([...value, limit]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="font-serif text-3xl mb-2 text-paper">
          Hard Limits
        </h2>
        <p className="text-paper/70 text-lg">
          We will never cross these lines. Select all that apply.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {hardLimits.map((limit) => {
          const isSelected = value.includes(limit);
          return (
            <motion.button
              key={limit}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleLimit(limit)}
              className={`p-4 rounded-lg border-2 text-center transition-all ${
                isSelected
                  ? 'border-blood bg-blood/10 text-blood'
                  : 'border-paper/20 bg-paper/5 text-paper/70 hover:border-paper/40'
              }`}
            >
              <span className="font-medium">{limit}</span>
            </motion.button>
          );
        })}
      </div>

      {value.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-paper/60 text-center"
        >
          {value.length} hard limit{value.length !== 1 ? 's' : ''} set
        </motion.p>
      )}
    </motion.div>
  );
}

