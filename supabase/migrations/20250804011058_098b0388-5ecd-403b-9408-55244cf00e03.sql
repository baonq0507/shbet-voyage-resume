-- Create admin user and assign admin role
DO $$
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
            is_super_admin
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
            jsonb_build_object('username', 'admin', 'full_name', 'Administrator'),
            false
        ) RETURNING id INTO admin_user_id;
        
        RAISE NOTICE 'Admin user created with ID: %', admin_user_id;
    END IF;
    
    -- Create profile if it doesn't exist
    INSERT INTO public.profiles (user_id, username, full_name)
    VALUES (admin_user_id, 'admin', 'Administrator')
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Create admin role if it doesn't exist
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Admin setup completed. Login with: email=% password=%', admin_email, admin_password;
    RAISE NOTICE 'Admin user ID: %', admin_user_id;
END;
$$;