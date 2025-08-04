-- Update promotions table structure step by step
ALTER TABLE public.promotions 
ADD COLUMN promotion_type TEXT DEFAULT 'general' CHECK (promotion_type IN ('first_deposit', 'time_based', 'code_based'));

ALTER TABLE public.promotions 
ADD COLUMN bonus_percentage INTEGER;

ALTER TABLE public.promotions 
ADD COLUMN bonus_amount NUMERIC;

ALTER TABLE public.promotions 
ADD COLUMN promotion_code TEXT UNIQUE;

ALTER TABLE public.promotions 
ADD COLUMN is_first_deposit_only BOOLEAN DEFAULT false;