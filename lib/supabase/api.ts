import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

/**
 * Creates a Supabase client authenticated with the user's access token
 * from the Authorization header. Use this in API routes instead of the
 * cookie-based server client.
 */
export function createApiClient(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    }
  );

  return { supabase, token };
}
