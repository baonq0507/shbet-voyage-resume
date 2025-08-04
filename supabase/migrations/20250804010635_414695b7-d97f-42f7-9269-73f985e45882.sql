-- Force delete all data related to the problematic user ID
DELETE FROM public.transactions WHERE user_id = '7a2c924b-4c0a-420e-ad6f-bff38d6981d5';
DELETE FROM public.user_roles WHERE user_id = '7a2c924b-4c0a-420e-ad6f-bff38d6981d5';
DELETE FROM public.profiles WHERE user_id = '7a2c924b-4c0a-420e-ad6f-bff38d6981d5';

-- Try to delete from auth.users if exists
DELETE FROM auth.users WHERE id = '7a2c924b-4c0a-420e-ad6f-bff38d6981d5';

-- Verify all data is removed
SELECT 
  'user_roles' as table_name, 
  COUNT(*) as remaining_records 
FROM public.user_roles 
WHERE user_id = '7a2c924b-4c0a-420e-ad6f-bff38d6981d5'
UNION ALL
SELECT 
  'profiles' as table_name, 
  COUNT(*) as remaining_records 
FROM public.profiles 
WHERE user_id = '7a2c924b-4c0a-420e-ad6f-bff38d6981d5'
UNION ALL
SELECT 
  'transactions' as table_name, 
  COUNT(*) as remaining_records 
FROM public.transactions 
WHERE user_id = '7a2c924b-4c0a-420e-ad6f-bff38d6981d5'
UNION ALL
SELECT 
  'auth.users' as table_name, 
  COUNT(*) as remaining_records 
FROM auth.users 
WHERE id = '7a2c924b-4c0a-420e-ad6f-bff38d6981d5';