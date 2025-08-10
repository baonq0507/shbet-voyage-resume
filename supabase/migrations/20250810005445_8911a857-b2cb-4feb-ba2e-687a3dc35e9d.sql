-- Create bonus transaction for user who missed first deposit bonus
INSERT INTO transactions (user_id, type, amount, status, admin_note, approved_at)
VALUES (
  'bdc83782-9dd8-4691-aa9e-7b04630ea5cb',
  'bonus',
  88000,
  'approved',
  'Khuyến mãi "Nập đầu" - 88,000 VND (Nạp đầu) - Bù lại cho giao dịch đầu tiên',
  now()
);

-- Update promotion usage count
UPDATE promotions 
SET current_uses = current_uses + 1 
WHERE id = 'd799304a-f33a-483b-94f2-88bfbc1aa6cd';