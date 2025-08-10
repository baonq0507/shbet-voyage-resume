-- Create a bonus transaction for the user who should have received it
-- This is for transaction 83b84a7f-67a3-46f2-a4d1-82463296b09f (2000 VND deposit)
-- Assuming 98% first deposit bonus = 98,000 VND

INSERT INTO public.transactions (
  user_id, 
  amount, 
  type, 
  status, 
  admin_note,
  approved_at
) VALUES (
  'bc73498c-0ea6-43f3-b555-ee310eca8334',
  98000,
  'bonus',
  'approved',
  'Khuyến mãi nạp đầu - Tạo thủ công cho giao dịch 83b84a7f-67a3-46f2-a4d1-82463296b09f',
  now()
);