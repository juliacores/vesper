'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { motion } from 'framer-motion';

export default function AuthForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Check for error in URL params (from callback)
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      setMessage(`Auth error: ${decodeURIComponent(error)}`);
    }
  }, [searchParams]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      setMessage('Check your email for the magic link!');
    } catch (error: any) {
      setMessage(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        // Check if it's a provider not enabled error
        if (error.message?.includes('provider is not enabled')) {
          setMessage('Google sign-in is not configured. Please use email magic link instead, or enable Google OAuth in your Supabase dashboard.');
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      setMessage(error.message || 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <form onSubmit={handleEmailSignIn} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full px-4 py-3 bg-paper/10 border border-paper/20 rounded-lg text-paper placeholder-paper/40 focus:outline-none focus:border-lime focus:ring-1 focus:ring-lime"
          />
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 bg-lime text-void font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending...' : 'Send Magic Link'}
        </motion.button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-paper/20"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-void text-paper/60">or</span>
        </div>
      </div>

      <motion.button
        onClick={handleGoogleSignIn}
        disabled={loading}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 bg-paper/10 border border-paper/20 text-paper font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <span>🔐</span>
        Continue with Google
      </motion.button>

      {message && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-sm text-center text-paper/80"
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}

