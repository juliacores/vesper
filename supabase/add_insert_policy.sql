-- Safe: Only add the missing INSERT policy
-- This does NOT drop or modify any existing policies
-- Run this in your Supabase SQL Editor

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);




