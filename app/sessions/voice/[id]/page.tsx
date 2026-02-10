'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';

export default function VoiceSessionPage() {
  const router = useRouter();
  const params = useParams();
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const sessionId = params.id as string;

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('sessions')
            .select('*')
            .eq('id', sessionId)
            .eq('user_id', user.id)
            .single();

          if (data) {
            setSessionData(data);
          } else if (error) {
            router.push('/voice');
          }
        } else {
          router.push('/auth');
        }
      } catch {
        router.push('/voice');
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <p className="text-paper/60">Loading...</p>
      </div>
    );
  }

  if (!sessionData) {
    return null;
  }

  const transcriptLines = sessionData.transcript
    ? sessionData.transcript.split('\n').filter((l: string) => l.trim())
    : [];

  return (
    <div className="min-h-screen bg-void flex flex-col p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/voice')}
          className="text-paper/60 mb-4"
        >
          ← Back
        </button>
        <h1 className="font-serif text-2xl text-paper mb-2">
          {sessionData.title || 'Voice Chat'}
        </h1>
        {sessionData.persona && sessionData.vibe && (
          <p className="text-paper/60 text-sm">
            {sessionData.persona} • {sessionData.vibe}
          </p>
        )}
        <p className="text-paper/40 text-xs mt-1">
          {new Date(sessionData.created_at).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>

      {/* Transcript */}
      <div className="flex-1 overflow-y-auto mb-6">
        {transcriptLines.length > 0 ? (
          <div className="space-y-3">
            {transcriptLines.map((line: string, i: number) => {
              const isUser = line.startsWith('You:');
              const content = line.replace(/^(You:|[^:]+):/, '').trim();
              const speaker = isUser ? 'You' : line.split(':')[0];

              return (
                <div
                  key={i}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-lg ${
                      isUser
                        ? 'bg-lime/20 text-paper'
                        : 'bg-paper/10 text-paper'
                    }`}
                  >
                    <p className={`text-xs mb-1 ${isUser ? 'text-lime' : 'text-paper/50'}`}>
                      {speaker}
                    </p>
                    <p className="text-sm leading-relaxed">{content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🎤</div>
            <p className="text-paper/60">No transcript available for this session.</p>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push('/voice')}
        className="w-full py-4 bg-lime text-void font-semibold rounded-lg"
      >
        Done
      </motion.button>
    </div>
  );
}
