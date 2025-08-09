-- Add 'agent' role to app_role enum if it does not exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'app_role' AND e.enumlabel = 'agent'
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'agent';
  END IF;
END $$;