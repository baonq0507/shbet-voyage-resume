-- Create triggers for referral and commission flows
-- 1) Auto-generate referral_code for agents on insert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_agents_generate_referral_code'
  ) THEN
    CREATE TRIGGER trg_agents_generate_referral_code
    BEFORE INSERT ON public.agents
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_agent();
  END IF;
END $$;

-- 2) Handle referral signup when a profile is created
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_profiles_handle_referral_insert'
  ) THEN
    CREATE TRIGGER trg_profiles_handle_referral_insert
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_referral_signup();
  END IF;
END $$;

-- 3) Handle referral updates when referred_by changes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_profiles_handle_referral_update'
  ) THEN
    CREATE TRIGGER trg_profiles_handle_referral_update
    AFTER UPDATE OF referred_by ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_referral_signup();
  END IF;
END $$;

-- 4) Award commission when a deposit transaction is approved
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_transactions_handle_deposit_approval'
  ) THEN
    CREATE TRIGGER trg_transactions_handle_deposit_approval
    AFTER UPDATE OF status ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_deposit_approval();
  END IF;
END $$;