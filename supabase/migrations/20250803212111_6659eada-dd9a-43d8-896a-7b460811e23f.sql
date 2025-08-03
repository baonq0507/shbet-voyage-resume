-- Add bonus type to transactions
-- First, let's check what constraint exists on the type column
DO $$
BEGIN
  -- Update the type column to allow 'bonus' in addition to 'deposit' and 'withdrawal'
  -- We'll use a more flexible approach by removing the check constraint if it exists
  -- and adding a new one that includes 'bonus'
  
  -- Drop existing check constraint on type if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'transactions_type_check' 
    AND table_name = 'transactions'
  ) THEN
    ALTER TABLE public.transactions DROP CONSTRAINT transactions_type_check;
  END IF;
  
  -- Add new check constraint that includes bonus
  ALTER TABLE public.transactions 
  ADD CONSTRAINT transactions_type_check 
  CHECK (type IN ('deposit', 'withdrawal', 'bonus'));
  
END $$;