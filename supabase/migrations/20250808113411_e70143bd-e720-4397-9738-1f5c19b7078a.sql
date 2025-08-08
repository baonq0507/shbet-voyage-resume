-- Create triggers for agents and profiles, and enhance deposit approval to compute commissions

-- 1) Ensure referral code is generated for new agents
DROP TRIGGER IF EXISTS agents_before_insert_referral_code ON public.agents;
CREATE TRIGGER agents_before_insert_referral_code
BEFORE INSERT ON public.agents
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_agent();

-- 2) Record referrals when a profile is created with referred_by
DROP TRIGGER IF EXISTS profiles_after_insert_referral ON public.profiles;
CREATE TRIGGER profiles_after_insert_referral
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_referral_signup();

-- 3) Enhance deposit approval trigger function to compute agent commissions
CREATE OR REPLACE FUNCTION public.handle_deposit_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_agent_id uuid;
  v_commission_percent numeric;
  v_commission_amount numeric;
  v_referral_id uuid;
BEGIN
  IF NEW.type = 'deposit' AND OLD.status = 'pending' AND NEW.status = 'approved' THEN
    -- Find agent who referred this user
    SELECT referred_by INTO v_agent_id
    FROM public.profiles
    WHERE user_id = NEW.user_id;

    IF v_agent_id IS NOT NULL THEN
      -- Get commission percentage from agent
      SELECT commission_percentage
      INTO v_commission_percent
      FROM public.agents
      WHERE id = v_agent_id
        AND is_active = true;

      IF v_commission_percent IS NULL THEN
        v_commission_percent := 0;
      END IF;

      v_commission_amount := (NEW.amount * v_commission_percent) / 100.0;
      IF v_commission_amount IS NULL THEN
        v_commission_amount := 0;
      END IF;

      -- Update or insert referral record
      SELECT id INTO v_referral_id
      FROM public.agent_referrals
      WHERE agent_id = v_agent_id
        AND referred_user_id = NEW.user_id
      LIMIT 1;

      IF v_referral_id IS NULL THEN
        INSERT INTO public.agent_referrals (agent_id, referred_user_id, commission_earned, status)
        VALUES (v_agent_id, NEW.user_id, v_commission_amount, 'active');
      ELSE
        UPDATE public.agent_referrals
        SET commission_earned = COALESCE(commission_earned, 0) + v_commission_amount,
            updated_at = now()
        WHERE id = v_referral_id;
      END IF;

      -- Update agent's total commission
      UPDATE public.agents
      SET total_commission = COALESCE(total_commission, 0) + v_commission_amount,
          updated_at = now()
      WHERE id = v_agent_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- 4) Trigger on transactions status update
DROP TRIGGER IF EXISTS transactions_after_update_deposit ON public.transactions;
CREATE TRIGGER transactions_after_update_deposit
AFTER UPDATE OF status ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.handle_deposit_approval();