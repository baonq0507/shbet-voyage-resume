-- Fix admin user permissions
-- Update existing admin user to have super admin privileges
UPDATE auth.users 
SET is_super_admin = true
WHERE email = 'admin@admin.com';

-- Ensure admin role exists for admin user
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role 
FROM auth.users 
WHERE email = 'admin@admin.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.users.id AND role = 'admin'
  );

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users u
    LEFT JOIN public.user_roles ur ON u.id = ur.user_id
    WHERE u.id = _user_id
      AND (u.is_super_admin = true OR ur.role = 'admin')
  )
$$;

-- Grant execute permission on is_admin function
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
