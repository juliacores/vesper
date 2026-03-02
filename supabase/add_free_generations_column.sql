-- Run this in your Supabase SQL Editor to add server-side freemium tracking.
-- Safe to run multiple times (uses IF NOT EXISTS pattern).

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'free_generations_used'
  ) THEN
    ALTER TABLE public.users ADD COLUMN free_generations_used INTEGER DEFAULT 0;
  END IF;
END
$$;
