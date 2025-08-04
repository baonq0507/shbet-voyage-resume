-- Create admin user function
CREATE OR REPLACE FUNCTION create_admin_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_user_id uuid;
    admin_email text := 'admin@admin.com';
    admin_password text := '123456';
BEGIN
    -- Check if admin user already exists
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = admin_email;
    
    -- If admin user doesn't exist, create one
    IF admin_user_id IS NULL THEN
        -- Insert into auth.users with hashed password
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_user_meta_data,
            is_super_admin,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            admin_email,
            crypt(admin_password, gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"username": "admin", "full_name": "Administrator"}',
            false,
            '',
            '',
            '',
            ''
        ) RETURNING id INTO admin_user_id;
        
        -- Insert into profiles table (only if not exists)
        INSERT INTO public.profiles (user_id, username, full_name)
        VALUES (admin_user_id, 'admin', 'Administrator')
        ON CONFLICT (user_id) DO NOTHING;
        
        -- Insert admin role (only if not exists)
        INSERT INTO public.user_roles (user_id, role)
        VALUES (admin_user_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
        
        RAISE NOTICE 'Admin user created with email: % and password: %', admin_email, admin_password;
    ELSE
        RAISE NOTICE 'Admin user already exists with email: %', admin_email;
    END IF;
END;
$$;

-- Execute the function to create admin user
SELECT create_admin_user();