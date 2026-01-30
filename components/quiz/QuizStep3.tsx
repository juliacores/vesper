'use client';

import { motion } from 'framer-motion';

interface QuizStep3Props {
  value: string[];
  onChange: (value: string[]) => void;
}

const triggers = [
  'Possessiveness',
  'Breathplay',
  'Public/Risky',
  'Primal Noises',
  'Reassurance',
  'Aftercare',
];

export default function QuizStep3({ value, onChange }: QuizStep3Props) {
  const toggleTrigger = (trigger: string) => {
    if (value.includes(trigger)) {
      onChange(value.filter((t) => t !== trigger));
    } else {
      onChange([...value, trigger]);
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
          The Triggers
        </h2>
        <p className="text-paper/70 text-lg">
          What creates the spark? Select all that apply.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {triggers.map((trigger) => {
          const isSelected = value.includes(trigger);
          return (
            <motion.button
              key={trigger}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleTrigger(trigger)}
              className={`p-4 rounded-lg border-2 text-center transition-all ${
                isSelected
                  ? 'border-lime bg-lime/10 text-lime'
                  : 'border-paper/20 bg-paper/5 text-paper/70 hover:border-paper/40'
              }`}
            >
              <span className="font-medium">{trigger}</span>
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
          {value.length} selected
        </motion.p>
      )}
    </motion.div>
  );
}

