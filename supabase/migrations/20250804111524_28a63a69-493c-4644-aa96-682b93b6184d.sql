-- Add new columns without referencing old ones
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

-- Update existing promotions to copy discount values to bonus values
UPDATE public.promotions 
SET bonus_percentage = discount_percentage,
    bonus_amount = discount_amount
WHERE bonus_percentage IS NULL AND bonus_amount IS NULL;

-- Add constraint for promotion types
ALTER TABLE public.promotions 
ADD CONSTRAINT promotions_promotion_type_check 
CHECK (promotion_type IN ('first_deposit', 'time_based', 'code_based'));