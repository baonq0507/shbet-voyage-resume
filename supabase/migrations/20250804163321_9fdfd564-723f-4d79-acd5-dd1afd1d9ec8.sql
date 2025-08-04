-- Delete the existing admin@admin.com user and use the existing admin user
DELETE FROM auth.users WHERE email = 'admin@admin.com';

-- Update the existing admin user (quangbaorp@gmail.com) to have admin role
DO $$
DECLARE
    existing_admin_user_id uuid := 'a590655e-edf2-42c0-b0b5-94abc57723e1';
BEGIN
    -- Ensure admin role exists for this user
    INSERT INTO public.user_roles (user_id, role)
    VALUES (existing_admin_user_id, 'admin')
    ON CONFLICT DO NOTHING;
    
    -- Update password to 123456
    UPDATE auth.users 
    SET encrypted_password = crypt('123456', gen_salt('bf')),
        email_confirmed_at = now(),
        confirmation_token = '',
        updated_at = now()
    WHERE id = existing_admin_user_id;
END $$;