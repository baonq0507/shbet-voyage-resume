-- Remove admin role from user baonq123 (only if user exists)
DELETE FROM public.user_roles 
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'baonq123@gmail.com')
AND role = 'admin';

-- Add default user role for baonq123 if no roles exist
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'user'::app_role 
FROM auth.users 
WHERE email = 'baonq123@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.users.id
  );