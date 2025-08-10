-- Fix RLS policy for games table to properly allow service role access
DROP POLICY IF EXISTS "Allow service role and authenticated users to manage games" ON public.games;

-- Create a new policy that properly handles service role
CREATE POLICY "Allow service role full access to games" 
ON public.games 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Also ensure the policy allows upsert operations
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;