-- Expand allowed values in transactions.type to include 'bonus'
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'transactions_type_check' 
      AND conrelid = 'public.transactions'::regclass
  ) THEN
    ALTER TABLE public.transactions
    DROP CONSTRAINT transactions_type_check;
  END IF;
END $$;

ALTER TABLE public.transactions
ADD CONSTRAINT transactions_type_check
CHECK (type IN ('deposit', 'withdrawal', 'bonus'));
