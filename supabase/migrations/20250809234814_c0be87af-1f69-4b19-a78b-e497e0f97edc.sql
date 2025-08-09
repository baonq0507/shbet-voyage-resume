UPDATE promotions 
SET bonus_amount = 98000
WHERE promotion_type = 'first_deposit' 
AND title = 'Nạp đầu' 
AND is_active = true;