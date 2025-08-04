-- Create function to check if this is user's first deposit
CREATE OR REPLACE FUNCTION public.is_first_deposit(user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.transactions 
    WHERE user_id = user_id_param 
    AND type = 'deposit' 
    AND status = 'approved'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update validation function for new promotion structure
CREATE OR REPLACE FUNCTION public.validate_promotion_dates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NEW.end_date <= NEW.start_date THEN
    RAISE EXCEPTION 'End date must be after start date';
  END IF;
  
  IF NEW.bonus_percentage IS NOT NULL AND NEW.bonus_amount IS NOT NULL THEN
    RAISE EXCEPTION 'Cannot have both percentage and fixed amount bonus';
  END IF;
  
  IF NEW.bonus_percentage IS NULL AND NEW.bonus_amount IS NULL THEN
    RAISE EXCEPTION 'Must have either percentage or fixed amount bonus';
  END IF;
  
  IF NEW.promotion_type = 'code_based' AND NEW.promotion_code IS NULL THEN
    RAISE EXCEPTION 'Code-based promotions must have a promotion code';
  END IF;
  
  RETURN NEW;
END;
$function$