'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AudioPlayerScreen from '@/components/sessions/AudioPlayerScreen';
import { useAppStore } from '@/stores/useAppStore';
import { supabase } from '@/lib/supabase/client';

export default function AudioSessionPage() {
  const params = useParams();
  const id = params.id as string;
  const { selectedPersona, currentVibe } = useAppStore();
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('sessions')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();
          
          if (data) {
            setSessionData(data);
          }
        }
      } catch (error) {
        // Error fetching session
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <p className="text-paper/60">Loading...</p>
      </div>
    );
  }

  return (
    <AudioPlayerScreen
      sessionId={id}
      audioUrl={sessionData?.audio_url}
      storyText={sessionData?.transcript}
      title={sessionData?.title || `Audio Session with ${selectedPersona || 'Partner'}`}
      persona={sessionData?.persona || selectedPersona || undefined}
      vibe={sessionData?.vibe || currentVibe || undefined}
    />
  );
}
