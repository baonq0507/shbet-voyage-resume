-- Add new columns without constraints first
ALTER TABLE public.promotions 
ADD COLUMN promotion_type TEXT DEFAULT 'time_based';

ALTER TABLE public.promotions 
ADD COLUMN bonus_percentage INTEGER;

ALTER TABLE public.promotions 
ADD COLUMN bonus_amount NUMERIC;

ALTER TABLE public.promotions 
ADD COLUMN promotion_code TEXT;

ALTER TABLE public.promotions 
ADD COLUMN is_first_deposit_only BOOLEAN DEFAULT false;

-- Update existing promotions to have proper values
UPDATE public.promotions 
SET promotion_type = 'time_based',
    bonus_percentage = old_discount_percentage,
    bonus_amount = old_discount_amount
WHERE promotion_type IS NULL OR promotion_type = 'general';

-- Now add the constraint
ALTER TABLE public.promotions 
ADD CONSTRAINT promotions_promotion_type_check 
CHECK (promotion_type IN ('first_deposit', 'time_based', 'code_based'));