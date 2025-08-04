-- Update the admin user to have confirmed email
UPDATE auth.users 
SET email_confirmed_at = now(),
    confirmation_token = ''
WHERE email = 'admin@admin.com';

-- Also update the create_or_update_admin_user function to automatically confirm email
CREATE OR REPLACE FUNCTION public.create_or_update_admin_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    admin_user_id uuid;
    admin_email text := 'admin@admin.com';
    admin_password text := '123456';
    existing_profile_count integer;
    existing_role_count integer;
BEGIN
    -- Check if admin user already exists
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = admin_email;
    
    -- If admin user doesn't exist, create one
    IF admin_user_id IS NULL THEN
        -- Insert into auth.users with hashed password and confirmed email
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
            now(), -- Automatically confirm email
            now(),
            now(),
            '{"username": "admin", "full_name": "Administrator"}',
            false,
            '', -- Empty confirmation token since email is confirmed
            '',
            '',
            ''
        ) RETURNING id INTO admin_user_id;
        
        RAISE NOTICE 'Admin user created with email: % and password: %', admin_email, admin_password;
    ELSE
        -- Update password and confirm email for existing admin user
        UPDATE auth.users 
        SET encrypted_password = crypt(admin_password, gen_salt('bf')),
            updated_at = now(),
            email_confirmed_at = now(),
            confirmation_token = ''
        WHERE id = admin_user_id;
        
        RAISE NOTICE 'Admin user password updated and email confirmed for email: %', admin_email;
    END IF;
    
    -- Check and create/update profile
    SELECT COUNT(*) INTO existing_profile_count
    FROM public.profiles 
    WHERE user_id = admin_user_id;
    
    IF existing_profile_count = 0 THEN
        INSERT INTO public.profiles (user_id, username, full_name)
        VALUES (admin_user_id, 'admin', 'Administrator');
    ELSE
        UPDATE public.profiles 
        SET username = 'admin', full_name = 'Administrator'
        WHERE user_id = admin_user_id;
    END IF;
    
    -- Check and create admin role
    SELECT COUNT(*) INTO existing_role_count
    FROM public.user_roles 
    WHERE user_id = admin_user_id AND role = 'admin';
    
    IF existing_role_count = 0 THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (admin_user_id, 'admin');
    END IF;
    
    RAISE NOTICE 'Admin setup completed. Login with: username=admin password=%', admin_password;
END;
$function$;