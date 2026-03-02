'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { useAppStore } from '@/stores/useAppStore';
import { supabase } from '@/lib/supabase/client';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const router = useRouter();
  const { userPreferences, isPremium, setIsPremium } = useAppStore();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        setUser(authUser);

        if (authUser) {
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single();
          if (data) {
            setUser(data);
            setIsPremium(data.is_premium ?? false);
          }
        }
      } catch {
        // Error fetching user
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [setIsPremium]);

  const openBillingPortal = async () => {
    setPortalLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // Silent fail
    } finally {
      setPortalLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-void pb-20 flex items-center justify-center">
        <p className="text-paper/60">Loading...</p>
        <Navigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void pb-20">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-serif text-3xl mb-2 text-paper">Profile</h1>
          <p className="text-paper/60">
            {userPreferences.username || user?.email || 'User'}
          </p>
        </div>

        {/* Pro Banner */}
        {!isPremium && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blood to-void border border-paper/20 rounded-lg p-6"
          >
            <h2 className="font-serif text-2xl mb-2 text-paper">Vesper Pro</h2>
            <p className="text-paper/70 mb-4">
              Unlock unlimited stories, audios, and voice chats.
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/paywall')}
              className="px-6 py-3 bg-lime text-void font-semibold rounded-lg"
            >
              Upgrade to Pro
            </motion.button>
          </motion.div>
        )}

        {/* Premium Badge */}
        {isPremium && (
          <div className="bg-lime/10 border border-lime rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">✨</span>
              <div>
                <p className="font-semibold text-lime">Vesper Pro</p>
                <p className="text-sm text-paper/70">You&apos;re a premium member</p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={openBillingPortal}
              disabled={portalLoading}
              className="w-full py-2 bg-paper/10 border border-paper/20 text-paper text-sm font-medium rounded-lg disabled:opacity-50"
            >
              {portalLoading ? 'Opening...' : 'Manage Subscription'}
            </motion.button>
          </div>
        )}

        {/* Preferences Section */}
        <section>
          <h2 className="font-serif text-xl mb-4 text-paper">Preferences</h2>
          <div className="space-y-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/onboarding/quiz')}
              className="w-full p-4 bg-paper/5 border border-paper/20 rounded-lg text-left hover:border-paper/40 transition-colors"
            >
              <span className="text-paper font-medium">Retake Desire Quiz</span>
              <p className="text-sm text-paper/60 mt-1">
                Update your preferences, limits, and safeword
              </p>
            </motion.button>
          </div>
        </section>

        {/* App Settings */}
        <section>
          <h2 className="font-serif text-xl mb-4 text-paper">Account</h2>
          <div className="space-y-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleSignOut}
              className="w-full p-4 bg-paper/5 border border-blood/20 rounded-lg text-left hover:border-blood/40 transition-colors"
            >
              <span className="text-blood font-medium">Sign Out</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={async () => {
                if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                  try {
                    await supabase.auth.signOut();
                    router.push('/auth');
                  } catch {
                    // Fall back to sign-out on error
                    router.push('/auth');
                  }
                }
              }}
              className="w-full p-4 bg-paper/5 border border-blood/20 rounded-lg text-left hover:border-blood/40 transition-colors"
            >
              <span className="text-blood font-medium">Delete Account</span>
              <p className="text-sm text-paper/40 mt-1">
                Contact support to permanently delete your data
              </p>
            </motion.button>
          </div>
        </section>
      </div>
      <Navigation />
    </div>
  );
}
