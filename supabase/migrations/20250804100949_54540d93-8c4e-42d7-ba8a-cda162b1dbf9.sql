-- Remove duplicate 'user' role for admin user
DELETE FROM user_roles 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@admin.com') 
AND role = 'user';