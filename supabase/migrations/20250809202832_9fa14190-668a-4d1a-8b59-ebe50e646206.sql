-- Add admin RLS policy to manage banks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'bank' 
      AND policyname = 'Admins can manage all banks'
  ) THEN
    CREATE POLICY "Admins can manage all banks"
    ON public.bank
    FOR ALL
    USING (has_role(auth.uid(), 'admin'::app_role))
    WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;