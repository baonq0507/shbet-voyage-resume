-- Fix security warnings by setting search_path for functions
CREATE OR REPLACE FUNCTION public.validate_promotion_dates()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_date <= NEW.start_date THEN
    RAISE EXCEPTION 'End date must be after start date';
  END IF;
  
  IF NEW.discount_percentage IS NOT NULL AND NEW.discount_amount IS NOT NULL THEN
    RAISE EXCEPTION 'Cannot have both percentage and amount discount';
  END IF;
  
  IF NEW.discount_percentage IS NULL AND NEW.discount_amount IS NULL THEN
    RAISE EXCEPTION 'Must have either percentage or amount discount';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;