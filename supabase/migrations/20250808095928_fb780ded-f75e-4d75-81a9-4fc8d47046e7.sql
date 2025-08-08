-- Allow admin to insert transactions and update balance on bonus inserts

-- 1) Ensure profiles.user_id is unique so we can FK to it
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_user_id_key'
  ) THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- 2) Add FK from transactions.user_id -> profiles.user_id (for PostgREST relationships and data integrity)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_transactions_profiles_user'
  ) THEN
    ALTER TABLE public.transactions
    ADD CONSTRAINT fk_transactions_profiles_user
    FOREIGN KEY (user_id)
    REFERENCES public.profiles(user_id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- 3) Add FK from transactions.bank_id -> bank.id (so joins to bank work reliably)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_transactions_bank'
  ) THEN
    ALTER TABLE public.transactions
    ADD CONSTRAINT fk_transactions_bank
    FOREIGN KEY (bank_id)
    REFERENCES public.bank(id)
    ON DELETE SET NULL;
  END IF;
END $$;

-- 4) RLS: allow admins to insert transactions (needed for admin bonus credit)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'transactions' AND policyname = 'Admins can insert all transactions'
  ) THEN
    CREATE POLICY "Admins can insert all transactions"
    ON public.transactions
    FOR INSERT
    WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;

-- 5) When a bonus transaction is inserted as approved, increment the user's balance automatically
CREATE OR REPLACE FUNCTION public.handle_bonus_transaction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.type = 'bonus' AND NEW.status = 'approved' THEN
    UPDATE public.profiles
    SET balance = COALESCE(balance, 0) + NEW.amount,
        updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_handle_bonus_transaction ON public.transactions;
CREATE TRIGGER trg_handle_bonus_transaction
AFTER INSERT ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.handle_bonus_transaction();