'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAppStore } from '@/stores/useAppStore';
import { supabase } from '@/lib/supabase/client';

export default function IdentityPage() {
  const router = useRouter();
  const { setUserPreferences, userPreferences } = useAppStore();
  const [username, setUsername] = useState('');
  const [pronouns, setPronouns] = useState<'She/Her' | 'He/Him' | 'They/Them' | ''>('');

  const handleComplete = async () => {
    if (!username.trim() || !pronouns) return;

    try {
      // Verify user is authenticated before proceeding
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        router.push('/auth');
        return;
      }

      // Update store
      setUserPreferences({
        ...userPreferences,
        username: username.trim(),
        pronouns: pronouns as 'She/Her' | 'He/Him' | 'They/Them',
      });

      // Save to Supabase
      try {
        // First try to update existing record
        const { error: updateError } = await supabase
          .from('users')
          .update({
            username: username.trim(),
            pronouns: pronouns as 'She/Her' | 'He/Him' | 'They/Them',
          })
          .eq('id', user.id);

        // If update fails (no record exists), insert new record
        if (updateError) {
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              email: user.email,
              username: username.trim(),
              pronouns: pronouns as 'She/Her' | 'He/Him' | 'They/Them',
            });

          if (insertError) {
            // Don't block navigation - continue even if save fails
          }
        }
      } catch (error) {
        // Don't block navigation - continue even if save fails
      }

      // Ensure session is fresh before navigation
      await supabase.auth.refreshSession();
      
      // Use hard navigation to ensure middleware runs with fresh cookies
      window.location.href = '/home';
    } catch (error) {
      // Fallback: try to navigate anyway
      window.location.href = '/home';
    }
  };

  return (
    <div className="min-h-screen bg-void p-6">
      <div className="max-w-2xl mx-auto flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full space-y-8">
            <div>
              <h1 className="font-serif text-4xl text-paper mb-2">
                Almost there
              </h1>
              <p className="text-paper/70 text-lg">
                Tell us a bit about yourself.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-paper">
                  What should we call you?
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 bg-paper/10 border border-paper/20 rounded-lg text-paper placeholder-paper/40 focus:outline-none focus:border-lime focus:ring-1 focus:ring-lime"
                  maxLength={30}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-paper">
                  Preferred Pronouns?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['She/Her', 'He/Him', 'They/Them'] as const).map((option) => (
                    <motion.button
                      key={option}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPronouns(option)}
                      className={`py-3 rounded-lg border-2 transition-all ${
                        pronouns === option
                          ? 'border-lime bg-lime/10 text-lime'
                          : 'border-paper/20 bg-paper/5 text-paper/70 hover:border-paper/40'
                      }`}
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleComplete}
          disabled={!username.trim() || !pronouns}
          className={`w-full py-4 font-semibold rounded-lg ${
            username.trim() && pronouns
              ? 'bg-lime text-void'
              : 'bg-paper/10 text-paper/40 cursor-not-allowed'
          }`}
        >
          Complete Setup
        </motion.button>
      </div>
    </div>
  );
}

