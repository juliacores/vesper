'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { motion } from 'framer-motion';

export default function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Check for error in URL params (from callback)
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      setMessage(`Auth error: ${decodeURIComponent(error)}`);
    }
  }, [searchParams]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isSignUp) {
        // Sign up with email/password (email confirmation disabled in Supabase)
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          setMessage('Account created! Redirecting...');
          // Redirect to onboarding
          setTimeout(() => router.push('/onboarding/quiz'), 500);
        }
      } else {
        // Sign in with email/password
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          setMessage('Signed in! Redirecting...');
          // Redirect to home or onboarding based on user state
          setTimeout(() => router.push('/home'), 500);
        }
      }
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
        if (error.message?.includes('provider is not enabled')) {
          setMessage('Google sign-in is not configured. Please use email/password instead.');
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
      <form onSubmit={handleAuth} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2 text-paper">
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

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2 text-paper">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
            className="w-full px-4 py-3 bg-paper/10 border border-paper/20 rounded-lg text-paper placeholder-paper/40 focus:outline-none focus:border-lime focus:ring-1 focus:ring-lime"
          />
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 bg-lime text-void font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
        </motion.button>
      </form>

      <button
        onClick={() => setIsSignUp(!isSignUp)}
        className="w-full mt-4 text-sm text-paper/60 hover:text-paper"
      >
        {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
      </button>

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
          className={`mt-4 text-sm text-center ${message.includes('error') || message.includes('Error') ? 'text-blood' : 'text-lime'}`}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}

