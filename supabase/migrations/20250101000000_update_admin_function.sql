-- Cập nhật function để nhận tham số email và password
CREATE OR REPLACE FUNCTION public.create_or_update_admin_user(
    admin_email text DEFAULT 'admin@admin.com',
    admin_password text DEFAULT '123456'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_user_id uuid;
    existing_profile_count integer;
    existing_role_count integer;
BEGIN
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = admin_email;
    
    IF admin_user_id IS NULL THEN
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
        
        RAISE NOTICE 'Admin user created with email: % and password: %', admin_email, admin_password;
    ELSE
        UPDATE auth.users 
        SET encrypted_password = crypt(admin_password, gen_salt('bf')),
            updated_at = now(),
            email_confirmed_at = now(),
            confirmation_token = ''
        WHERE id = admin_user_id;
        
        RAISE NOTICE 'Admin user password updated and email confirmed for email: %', admin_email;
    END IF;
    
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
    
    SELECT COUNT(*) INTO existing_role_count
    FROM public.user_roles 
    WHERE user_id = admin_user_id AND role = 'admin';
    
    IF existing_role_count = 0 THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (admin_user_id, 'admin');
    END IF;
    
    RAISE NOTICE 'Admin setup completed. Login with: username=admin password=%', admin_password;
END;
$$; 