-- =============================================
-- FIX ADMIN USER MIGRATION
-- =============================================
-- This migration fixes the admin user creation issue
-- by creating a proper admin user with bcrypt hash

-- Enable pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Drop the old broken function
DROP FUNCTION IF EXISTS public.create_or_update_admin_user();

-- Create the fixed admin user creation function
CREATE OR REPLACE FUNCTION public.create_admin_user_fixed()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    admin_user_id uuid;
    admin_email text := 'admin@admin.com';
    admin_password text := '123456';
    existing_profile_count integer;
    existing_role_count integer;
BEGIN
    -- Check if pgcrypto extension is available
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') THEN
        RAISE EXCEPTION 'Extension pgcrypto is not available. Please enable it first.';
    END IF;
    
    -- Check if admin user already exists
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = admin_email;
    
    IF admin_user_id IS NULL THEN
        -- Create new admin user with proper bcrypt hash
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
            recovery_token,
            last_sign_in_at,
            raw_app_meta_data,
            is_sso_user,
            deleted_at,
            phone,
            phone_confirmed_at,
            phone_change,
            phone_change_token,
            email_change_token_current,
            email_change_confirm_status,
            banned_until,
            reauthentication_token,
            reauthentication_sent_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            admin_email,
            extensions.crypt(admin_password, extensions.gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"username": "admin", "full_name": "Administrator"}',
            false,
            '',
            '',
            '',
            '',
            now(),
            '{"provider": "email", "providers": ["email"]}',
            false,
            null,
            null,
            null,
            '',
            '',
            '',
            0,
            null,
            '',
            null
        ) RETURNING id INTO admin_user_id;
        
        RAISE NOTICE 'Admin user created with email: % and password: %', admin_email, admin_password;
    ELSE
        -- Update existing admin user password with bcrypt
        UPDATE auth.users 
        SET encrypted_password = extensions.crypt(admin_password, extensions.gen_salt('bf')),
            updated_at = now(),
            email_confirmed_at = now(),
            confirmation_token = '',
            last_sign_in_at = now()
        WHERE id = admin_user_id;
        
        RAISE NOTICE 'Admin user password updated with bcrypt for email: %', admin_email;
    END IF;
    
    -- Create or update profile
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
    
    -- Create or update admin role
    SELECT COUNT(*) INTO existing_role_count
    FROM public.user_roles 
    WHERE user_id = admin_user_id AND role = 'admin';
    
    IF existing_role_count = 0 THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (admin_user_id, 'admin');
    END IF;
    
    RAISE NOTICE 'Admin setup completed successfully. Login with: email=% password=%', admin_email, admin_password;
END;
$$;

-- Execute the function to create/fix admin user
SELECT public.create_admin_user_fixed();

-- =============================================
-- MIGRATION COMPLETED
-- =============================================
