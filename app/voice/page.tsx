'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import SessionCard from '@/components/sessions/SessionCard';
import { supabase } from '@/lib/supabase/client';

interface Session {
  id: string;
  title?: string;
  created_at: string;
  duration?: number;
  vibe?: string;
  persona?: string;
}

export default function VoicePage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('sessions')
            .select('*')
            .eq('user_id', user.id)
            .eq('session_type', 'voice')
            .order('created_at', { ascending: false });
          
          if (error) {
            // Error fetching sessions
          } else if (data) {
            setSessions(data);
          }
        }
      } catch (error) {
        // Error fetching sessions
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  return (
    <div className="min-h-screen bg-void pb-20">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="font-serif text-3xl mb-6 text-paper">Voice</h1>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-paper/60">Loading...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎤</div>
            <p className="text-paper/60 mb-2">No voice chats yet</p>
            <p className="text-paper/40 text-sm">
              Start your first voice chat from the Home tab
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                id={session.id}
                title={session.title || 'Untitled Voice Chat'}
                date={session.created_at}
                duration={session.duration}
                vibe={session.vibe}
                persona={session.persona}
                sessionType="voice"
              />
            ))}
          </div>
        )}
      </div>
      <Navigation />
    </div>
  );
}
