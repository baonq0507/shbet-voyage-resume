-- Add new columns without referencing old ones
-- Note: All columns were already added in previous migration 20250804111326_322b72e1-e61f-4685-af1b-5ec673e2203b.sql

-- Update existing promotions to copy discount values to bonus values
UPDATE public.promotions 
SET bonus_percentage = old_discount_percentage,
    bonus_amount = old_discount_amount
WHERE bonus_percentage IS NULL AND bonus_amount IS NULL;

-- Note: Constraint was already added inline in previous migration