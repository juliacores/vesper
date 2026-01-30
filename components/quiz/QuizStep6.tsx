'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface QuizStep6Props {
  value: string;
  onChange: (value: string) => void;
}

export default function QuizStep6({ value, onChange }: QuizStep6Props) {
  const [inputValue, setInputValue] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
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
          The Safeword
        </h2>
        <p className="text-paper/70 text-lg mb-4">
          Choose a word you can say at any time to stop the scene.
        </p>
        <p className="text-paper/50 text-sm">
          This is your safety net. Say this word and everything stops immediately.
        </p>
      </div>

      <div>
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          placeholder="Red"
          className="w-full px-6 py-4 bg-paper/10 border-2 border-paper/20 rounded-lg text-paper text-xl text-center placeholder-paper/40 focus:outline-none focus:border-lime focus:ring-1 focus:ring-lime"
          maxLength={20}
        />
        <p className="mt-2 text-sm text-paper/50 text-center">
          Default: &ldquo;Red&rdquo;
        </p>
      </div>

      {inputValue && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-lime/10 border border-lime rounded-lg"
        >
          <p className="text-center text-paper">
            <span className="font-semibold text-lime">&ldquo;{inputValue}&rdquo;</span> will stop any scene immediately.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

