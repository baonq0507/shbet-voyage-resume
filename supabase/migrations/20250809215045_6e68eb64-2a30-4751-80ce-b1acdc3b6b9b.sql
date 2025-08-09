-- Update the handle_deposit_approval function to also update user balance
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
  -- Handle deposit approval: update balance and process commissions
  IF NEW.type = 'deposit' AND OLD.status = 'pending' AND NEW.status = 'approved' THEN
    
    -- Update user balance first
    UPDATE public.profiles
    SET balance = COALESCE(balance, 0) + NEW.amount,
        updated_at = now()
    WHERE user_id = NEW.user_id;
    
    RAISE NOTICE 'Updated balance for user %: added % VND', NEW.user_id, NEW.amount;

    -- Find agent who referred this user
    SELECT referred_by INTO v_agent_id
    FROM public.profiles
    WHERE user_id = NEW.user_id;

    IF v_agent_id IS NOT NULL THEN
      -- Prefer commission from agent level if set
      SELECT COALESCE(al.commission_percentage, a.commission_percentage)
      INTO v_commission_percent
      FROM public.agents a
      LEFT JOIN public.agent_levels al ON al.id = a.level_id AND al.is_active = true
      WHERE a.id = v_agent_id
        AND a.is_active = true;

      v_commission_percent := COALESCE(v_commission_percent, 0);
      v_commission_amount := (NEW.amount * v_commission_percent) / 100.0;

      -- Upsert referral earnings
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

      -- Update agent total commission
      UPDATE public.agents
      SET total_commission = COALESCE(total_commission, 0) + v_commission_amount,
          updated_at = now()
      WHERE id = v_agent_id;
      
      RAISE NOTICE 'Processed agent commission: % VND for agent %', v_commission_amount, v_agent_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;