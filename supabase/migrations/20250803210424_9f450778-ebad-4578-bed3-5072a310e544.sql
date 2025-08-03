-- Grant admin role to user baonq123
INSERT INTO public.user_roles (user_id, role) 
VALUES ('7a2c924b-4c0a-420e-ad6f-bff38d6981d5', 'admin');

-- Verify the admin role has been assigned
SELECT 
  p.user_id, 
  p.full_name, 
  p.username,
  ur.role 
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id
WHERE p.username = 'baonq123';