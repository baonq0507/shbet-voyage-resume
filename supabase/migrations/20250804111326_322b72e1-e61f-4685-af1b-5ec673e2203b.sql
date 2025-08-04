-- Update promotions table structure
ALTER TABLE public.promotions 
ADD COLUMN promotion_type TEXT DEFAULT 'general' CHECK (promotion_type IN ('first_deposit', 'time_based', 'code_based')),
ADD COLUMN bonus_percentage INTEGER, -- % bonus to add to account
ADD COLUMN bonus_amount NUMERIC, -- fixed amount bonus to add
ADD COLUMN promotion_code TEXT UNIQUE, -- unique code for code-based promotions
ADD COLUMN is_first_deposit_only BOOLEAN DEFAULT false;

-- Rename existing discount columns to be clearer
ALTER TABLE public.promotions 
RENAME COLUMN discount_percentage TO old_discount_percentage;

ALTER TABLE public.promotions 
RENAME COLUMN discount_amount TO old_discount_amount;

-- Create promotion codes table for tracking code usage
CREATE TABLE public.promotion_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id UUID REFERENCES public.promotions(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on promotion codes
ALTER TABLE public.promotion_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for promotion codes
CREATE POLICY "Anyone can view unused codes" 
ON public.promotion_codes 
FOR SELECT 
USING (is_used = false);

CREATE POLICY "Admins can manage all codes" 
ON public.promotion_codes 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update codes they use" 
ON public.promotion_codes 
FOR UPDATE 
USING (auth.uid() = used_by);

-- Add trigger for updated_at
CREATE TRIGGER update_promotion_codes_updated_at
BEFORE UPDATE ON public.promotion_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to track first deposits
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update validation function for new promotion structure
CREATE OR REPLACE FUNCTION public.validate_promotion_dates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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