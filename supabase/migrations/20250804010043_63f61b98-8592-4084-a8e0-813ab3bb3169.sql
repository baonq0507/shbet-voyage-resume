-- Check if user exists and get user info
DO $$
DECLARE
    user_exists boolean := false;
    user_id_found uuid;
BEGIN
    -- Check if the specific user ID exists
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = '7a2c924b-4c0a-420e-ad6f-bff38d6981d5') INTO user_exists;
    
    IF user_exists THEN
        RAISE NOTICE 'User with ID 7a2c924b-4c0a-420e-ad6f-bff38d6981d5 exists';
        -- Add admin role
        INSERT INTO public.user_roles (user_id, role)
        VALUES ('7a2c924b-4c0a-420e-ad6f-bff38d6981d5', 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
        RAISE NOTICE 'Admin role added successfully';
    ELSE
        RAISE NOTICE 'User with ID 7a2c924b-4c0a-420e-ad6f-bff38d6981d5 does not exist';
        
        -- Try to find user by email or username baonq123
        SELECT id INTO user_id_found 
        FROM auth.users 
        WHERE email = 'baonq123@gmail.com' OR email = 'baonq123@email.com'
        LIMIT 1;
        
        IF user_id_found IS NOT NULL THEN
            RAISE NOTICE 'Found user with email, ID: %', user_id_found;
            -- Add admin role to the found user
            INSERT INTO public.user_roles (user_id, role)
            VALUES (user_id_found, 'admin')
            ON CONFLICT (user_id, role) DO NOTHING;
            RAISE NOTICE 'Admin role added to user: %', user_id_found;
        ELSE
            -- Create new user with username baonq123
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
                '7a2c924b-4c0a-420e-ad6f-bff38d6981d5',
                'authenticated',
                'authenticated',
                'baonq123@gmail.com',
                crypt('123456', gen_salt('bf')),
                now(),
                now(),
                now(),
                jsonb_build_object('username', 'baonq123', 'full_name', 'Bao NQ'),
                false
            );
            
            RAISE NOTICE 'Created user baonq123 with ID: 7a2c924b-4c0a-420e-ad6f-bff38d6981d5';
            
            -- Add admin role
            INSERT INTO public.user_roles (user_id, role)
            VALUES ('7a2c924b-4c0a-420e-ad6f-bff38d6981d5', 'admin');
            
            RAISE NOTICE 'Admin role added to new user baonq123';
        END IF;
    END IF;
END;
$$;