-- Fix games table policy to allow service role operations
-- This allows the fetch-games-by-category.js script to work with local Supabase

-- Drop existing policy
DROP POLICY IF EXISTS "Allow authenticated users to manage games" ON public.games;

-- Create new policy that allows both authenticated users and service role
CREATE POLICY "Allow authenticated users and service role to manage games" 
ON public.games FOR ALL 
USING (
  auth.role() = 'authenticated' OR 
  auth.jwt() ->> 'role' = 'service_role'
);

-- Alternative: If you want to completely disable RLS for games table during development
-- ALTER TABLE public.games DISABLE ROW LEVEL SECURITY;
