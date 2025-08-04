-- Drop existing foreign key constraint if exists
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;

-- Add correct foreign key constraint to auth.users
ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Now insert the admin role for the existing user
INSERT INTO public.user_roles (user_id, role) 
VALUES ('7a2c924b-4c0a-420e-ad6f-bff38d6981d5', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;