'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

function AuthConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuth = async () => {
      const code = searchParams.get('code');
      
      if (!code) {
        setError('No authentication code provided');
        return;
      }

      try {
        // Exchange the code for a session using the browser client
        // This works because the browser client has access to the code_verifier cookie
        const { error: authError } = await supabase.auth.exchangeCodeForSession(code);
        
        if (authError) {
          setError(authError.message);
          return;
        }

        // Success! Redirect to onboarding
        router.push('/onboarding/quiz');
      } catch (err: any) {
        setError(err.message || 'An error occurred during authentication');
      }
    };

    handleAuth();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="font-serif text-2xl text-paper mb-4">Authentication Error</h1>
          <p className="text-paper/70 mb-6">{error}</p>
          <button
            onClick={() => router.push('/auth')}
            className="px-6 py-3 bg-lime text-void font-semibold rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-pulse">✨</div>
        <p className="text-paper/60">Confirming your login...</p>
      </div>
    </div>
  );
}

export default function AuthConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">✨</div>
          <p className="text-paper/60">Loading...</p>
        </div>
      </div>
    }>
      <AuthConfirmContent />
    </Suspense>
  );
}
