-- Check current constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.transactions'::regclass 
AND contype = 'c';

-- Drop the existing check constraint
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_status_check;

-- Add new check constraint with awaiting_payment status
ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_status_check 
CHECK (status IN ('awaiting_payment', 'pending', 'approved', 'rejected'));