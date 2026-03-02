'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useMotionValue, animate } from 'framer-motion';
import { useAppStore } from '@/stores/useAppStore';
import { supabase } from '@/lib/supabase/client';

interface VoiceChatScreenProps {
  persona: string;
  vibe: string;
}

type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error' | 'ended';

export default function VoiceChatScreen({ persona, vibe }: VoiceChatScreenProps) {
  const router = useRouter();
  const { isPremium, userPreferences } = useAppStore();

  // Connection state
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [transcript, setTranscript] = useState<string[]>([]);

  // Refs for WebRTC
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasStarted = useRef(false);

  // Breathing animation
  const scale = useMotionValue(1);
  const opacity = useMotionValue(0.6);

  // Clean up everything
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (dcRef.current) {
      dcRef.current.close();
      dcRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
  }, []);

  // Save transcript to Supabase when session ends
  const saveTranscript = useCallback(async (sid: string, lines: string[]) => {
    if (!sid || lines.length === 0) return;
    try {
      await supabase
        .from('sessions')
        .update({ transcript: lines.join('\n') })
        .eq('id', sid);
    } catch {
      // Silent fail
    }
  }, []);

  // Start the voice session
  const startSession = useCallback(async () => {
    try {
      setStatus('connecting');

      // 1. Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      // 2. Get ephemeral token from our API
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const tokenResponse = await fetch('/api/openai/realtime/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          persona,
          vibe,
          userPreferences,
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        if (tokenResponse.status === 402 || errorData.code === 'limit_reached') {
          router.push('/paywall?reason=generation_limit');
          return;
        }
        throw new Error(errorData.error || 'Failed to create session');
      }

      const { clientSecret, sessionId: sid } = await tokenResponse.json();
      setSessionId(sid);

      if (!clientSecret) {
        throw new Error('No client secret received from server');
      }

      // 3. Create WebRTC peer connection
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      // 4. Set up remote audio playback
      pc.ontrack = (event) => {
        if (audioRef.current) {
          audioRef.current.srcObject = event.streams[0];
          audioRef.current.muted = false;
          // Ensure playback starts even with autoplay policies
          audioRef.current
            .play()
            .catch(() => {
              // Ignore autoplay errors; user action (mute button / STOP) will retrigger
            });
        }
      };

      // 5. Add local audio track (microphone)
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // 6. Create data channel for events
      const dc = pc.createDataChannel('oai-events');
      dcRef.current = dc;

      dc.onopen = () => {
        setStatus('connected');
        // Seed transcript so it always gets saved and shows something in history
        setTranscript((prev) =>
          prev.length === 0 ? [`${persona}: Connected to you. Breathe with me.`] : prev
        );

        // Start breathing animation
        animate(scale, [1, 1.2, 1], {
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        });
        animate(opacity, [0.6, 1, 0.6], {
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        });
      };

      dc.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          handleRealtimeEvent(msg);
        } catch {
          // Ignore parse errors
        }
      };

      dc.onclose = () => {
        if (status !== 'ended') {
          setStatus('ended');
        }
      };

      // 7. Create SDP offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // 8. Send offer to OpenAI's WebRTC endpoint
      const sdpResponse = await fetch(
        'https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${clientSecret}`,
            'Content-Type': 'application/sdp',
          },
          body: offer.sdp,
        }
      );

      if (!sdpResponse.ok) {
        throw new Error('Failed to establish WebRTC connection with OpenAI');
      }

      // 9. Set remote description (OpenAI's answer)
      const answerSdp = await sdpResponse.text();
      await pc.setRemoteDescription({
        type: 'answer',
        sdp: answerSdp,
      });

      // 10. Start freemium timer
      if (!isPremium) {
        setTimeRemaining(120); // 2 minutes for free users
        timerRef.current = setInterval(() => {
          setTimeRemaining((prev) => {
            if (prev === null) return null;
            if (prev <= 1) {
              handleStop();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error: any) {
      setStatus('error');

      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setErrorMessage('Microphone access is required for voice chat. Please allow microphone access and try again.');
      } else {
        setErrorMessage(error.message || 'Failed to start voice session');
      }

      cleanup();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persona, vibe, userPreferences, isPremium, cleanup]);

  // Handle events from OpenAI data channel
  const handleRealtimeEvent = (event: any) => {
    switch (event.type) {
      case 'response.audio_transcript.done':
        // AI finished speaking — add to transcript
        if (event.transcript) {
          setTranscript((prev) => [...prev, `${persona}: ${event.transcript}`]);
        }
        break;

      case 'conversation.item.input_audio_transcription.completed':
        // User speech transcribed
        if (event.transcript) {
          setTranscript((prev) => [...prev, `You: ${event.transcript}`]);
        }
        break;

      case 'error':
        if (event.error?.message) {
          setErrorMessage(event.error.message);
        }
        break;
    }
  };

  // Stop the session
  const handleStop = useCallback(() => {
    setStatus('ended');
    cleanup();

    // Save transcript
    if (sessionId && transcript.length > 0) {
      saveTranscript(sessionId, transcript);
    }
  }, [cleanup, sessionId, transcript, saveTranscript]);

  // Toggle mute
  const handleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // Auto-start on mount
  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    startSession();

    return () => {
      // Save transcript on unmount as a fallback, e.g. if user closes tab
      if (sessionId && transcript.length > 0) {
        saveTranscript(sessionId, transcript);
      }
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, transcript, saveTranscript, cleanup]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ── Error Screen ──
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-sm">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="font-serif text-2xl text-paper">Connection Failed</h2>
          <p className="text-paper/60 text-sm">{errorMessage}</p>
          <div className="space-y-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                hasStarted.current = false;
                setStatus('idle');
                setErrorMessage(null);
                startSession();
              }}
              className="w-full py-3 bg-lime text-void font-semibold rounded-lg"
            >
              Try Again
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/home')}
              className="w-full py-3 bg-paper/10 border border-paper/20 text-paper font-semibold rounded-lg"
            >
              Go Back
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  // ── Session Ended Screen ──
  if (status === 'ended') {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-sm">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-6xl mb-4"
          >
            ✓
          </motion.div>
          <h2 className="font-serif text-2xl text-paper">Session Complete</h2>
          <p className="text-paper/60 text-sm">You safely ended the session.</p>

          {/* Show transcript summary */}
          {transcript.length > 0 && (
            <div className="text-left bg-paper/5 p-4 rounded-lg border border-paper/10 max-h-48 overflow-y-auto">
              <p className="text-xs text-paper/40 mb-2 uppercase tracking-wide">Transcript</p>
              {transcript.slice(-6).map((line, i) => (
                <p key={i} className="text-paper/70 text-sm mb-1">
                  {line}
                </p>
              ))}
              {transcript.length > 6 && (
                <p className="text-paper/40 text-xs mt-2">
                  ...and {transcript.length - 6} more messages
                </p>
              )}
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/home')}
            className="w-full py-3 bg-lime text-void font-semibold rounded-lg"
          >
            Return Home
          </motion.button>
        </div>
      </div>
    );
  }

  // ── Connecting Screen ──
  if (status === 'connecting' || status === 'idle') {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="text-5xl animate-pulse">🎤</div>
          <h2 className="font-serif text-2xl text-paper">
            Connecting to {persona}...
          </h2>
          <p className="text-paper/60 text-sm">
            Setting up your voice session
          </p>
        </div>
      </div>
    );
  }

  // ── Active Voice Chat Screen ──
  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-between p-6 relative">
      {/* Hidden audio element for AI voice output */}
      <audio ref={audioRef} autoPlay playsInline />

      {/* Header */}
      <div className="w-full text-center pt-4">
        <p className="text-paper/40 text-xs uppercase tracking-widest mb-1">
          Voice Chat
        </p>
        <h1 className="font-serif text-2xl text-paper">{persona}</h1>
        <p className="text-paper/60 text-sm">{vibe}</p>
      </div>

      {/* Breathing Circle Visualizer */}
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          style={{ scale, opacity }}
          className="w-64 h-64 rounded-full border-4 border-lime flex items-center justify-center"
        >
          <div className="w-48 h-48 rounded-full bg-lime/20 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-lime/40 flex items-center justify-center">
              <span className="text-4xl">
                {isMuted ? '🔇' : '🎤'}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Timer (for free users) */}
      {!isPremium && timeRemaining !== null && (
        <div className="mb-4 text-center">
          <div className="text-2xl font-mono text-paper mb-1">
            {formatTime(timeRemaining)}
          </div>
          <p className="text-xs text-paper/60">Time remaining</p>
        </div>
      )}

      {/* Live transcript (last message) */}
      {transcript.length > 0 && (
        <div className="w-full max-w-md mb-4">
          <div className="bg-paper/5 px-4 py-3 rounded-lg border border-paper/10">
            <p className="text-paper/80 text-sm text-center">
              {transcript[transcript.length - 1]}
            </p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="w-full max-w-md space-y-3 pb-4">
        {/* Mute Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleMute}
          className={`w-full py-4 font-semibold rounded-lg border transition-colors ${
            isMuted
              ? 'bg-blood/20 border-blood text-blood'
              : 'bg-paper/10 border-paper/20 text-paper'
          }`}
        >
          {isMuted ? '🔇 Unmute Microphone' : '🎤 Mute Microphone'}
        </motion.button>

        {/* STOP Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleStop}
          className="w-full py-4 bg-blood text-paper font-bold text-lg rounded-lg shadow-lg"
        >
          STOP
        </motion.button>

        {/* Safeword reminder */}
        <p className="text-xs text-paper/40 text-center">
          Say &ldquo;{userPreferences.safeword || 'Red'}&rdquo; at any time to stop
        </p>
      </div>
    </div>
  );
}
