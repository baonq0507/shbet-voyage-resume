-- First, let's see current users to get the user_id
-- You'll need to replace 'YOUR_USER_ID_HERE' with the actual user_id after creating account

-- Example query to check existing users (for reference):
-- SELECT user_id, full_name, username FROM public.profiles;

-- Grant admin role to a specific user
-- Replace 'YOUR_USER_ID_HERE' with the actual user_id from the profiles table
-- INSERT INTO public.user_roles (user_id, role) 
-- VALUES ('YOUR_USER_ID_HERE', 'admin');

-- For testing, let's create a query that can be used after account creation:
-- First check if any users exist
SELECT 
  p.user_id, 
  p.full_name, 
  p.username,
  ur.role 
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id
ORDER BY p.created_at DESC;