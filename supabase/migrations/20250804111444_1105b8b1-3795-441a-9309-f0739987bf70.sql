-- Add new columns without constraints first
-- Note: All columns were already added in previous migration 20250804111326_322b72e1-e61f-4685-af1b-5ec673e2203b.sql

-- Update existing promotions to have proper values
UPDATE public.promotions 
SET promotion_type = 'time_based',
    bonus_percentage = old_discount_percentage,
    bonus_amount = old_discount_amount
WHERE promotion_type IS NULL OR promotion_type = 'general';

-- Note: Constraint was already added inline in previous migration