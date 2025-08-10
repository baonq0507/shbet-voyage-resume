-- Drop existing restrictive policy for games management
DROP POLICY IF EXISTS "Allow authenticated users to manage games" ON public.games;

-- Create new policy that allows service role and authenticated users to manage games
CREATE POLICY "Allow service role and authenticated users to manage games" 
ON public.games 
FOR ALL 
USING (
  auth.role() = 'service_role' OR 
  auth.role() = 'authenticated'
)
WITH CHECK (
  auth.role() = 'service_role' OR 
  auth.role() = 'authenticated'
);