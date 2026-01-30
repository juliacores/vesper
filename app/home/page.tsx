'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/stores/useAppStore';
import { supabase } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';

const vibeChips = [
  'Domination',
  'Tenderness',
  'Praise',
  'Punishment',
  'Sleep Aid',
];

const personas = [
  {
    id: 'Lucien' as const,
    name: 'Lucien',
    description: 'The Gentle Dom. French accent. Patient & worshipful.',
    emoji: '🇫🇷',
  },
  {
    id: 'Kai' as const,
    name: 'Kai',
    description: 'The Playful Coach. Energetic & teasing.',
    emoji: '⚡',
  },
  {
    id: 'Jiro' as const,
    name: 'Jiro',
    description: 'The Obsessive. Deep voice. Possessive & intense.',
    emoji: '🔥',
  },
];

export default function HomePage() {
  const router = useRouter();
  const { currentVibe, selectedPersona, setCurrentVibe, setSelectedPersona, userPreferences } =
    useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication on mount with retry
    const checkAuth = async (retryCount = 0) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setLoading(false);
        return;
      }

      // No session, try getting user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // User exists but no session - try refresh
        await supabase.auth.refreshSession();
        setLoading(false);
        return;
      }

      // No user found - retry once after a short delay (session might be initializing)
      if (retryCount < 2) {
        setTimeout(() => checkAuth(retryCount + 1), 500);
        return;
      }

      // Still no user after retries - redirect to auth
      router.push('/auth');
    };
    
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <p className="text-paper/60">Loading...</p>
      </div>
    );
  }

  const username = userPreferences.username || 'there';

  return (
    <div className="min-h-screen bg-void pb-20">
      <div className="max-w-2xl mx-auto p-6 space-y-8">
        {/* Daily Vibe Check */}
        <section>
          <h2 className="font-serif text-2xl mb-4 text-paper">
            Good evening, {username}. What do you crave right now?
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {vibeChips.map((vibe) => (
              <motion.button
                key={vibe}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentVibe(vibe)}
                className={`px-4 py-2 rounded-full whitespace-nowrap ${
                  currentVibe === vibe
                    ? 'bg-lime text-void'
                    : 'bg-paper/10 text-paper border border-paper/20'
                }`}
              >
                {vibe}
              </motion.button>
            ))}
          </div>
        </section>

        {/* Partner Selection */}
        <section>
          <h2 className="font-serif text-2xl mb-4 text-paper">
            Select your partner.
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {personas.map((persona) => (
              <motion.button
                key={persona.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedPersona(persona.id)}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  selectedPersona === persona.id
                    ? 'border-lime bg-lime/10'
                    : 'border-paper/20 bg-paper/5'
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{persona.emoji}</span>
                  <div>
                    <h3 className="font-serif text-xl text-paper mb-1">
                      {persona.name}
                    </h3>
                    <p className="text-paper/70 text-sm">{persona.description}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Action Buttons */}
        <section className="space-y-3">
          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={!currentVibe || !selectedPersona}
            onClick={() => {
              if (currentVibe && selectedPersona) {
                // TODO: Generate story and create session, then navigate
                router.push('/sessions/story/new');
              }
            }}
            className="w-full py-4 bg-lime text-void font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate Story
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={!currentVibe || !selectedPersona}
            onClick={() => {
              if (currentVibe && selectedPersona) {
                // TODO: Generate audio and create session, then navigate
                router.push('/sessions/audio/new');
              }
            }}
            className="w-full py-4 bg-paper/10 border border-paper/20 text-paper font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate Audio
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={!currentVibe || !selectedPersona}
            onClick={() => {
              if (currentVibe && selectedPersona) {
                // Navigate to voice chat
                router.push('/sessions/voice/new');
              }
            }}
            className="w-full py-4 bg-paper/10 border border-paper/20 text-paper font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Voice Chat
          </motion.button>
        </section>
      </div>

      <Navigation />
    </div>
  );
}

