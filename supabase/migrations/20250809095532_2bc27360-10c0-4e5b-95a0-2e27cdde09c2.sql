-- Fix linter warnings: add SET search_path TO 'public' for functions missing it

-- 1) generate_referral_code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
    code TEXT;
    exists_check INTEGER;
BEGIN
    LOOP
        code := upper(substring(md5(random()::text) from 1 for 8));
        SELECT COUNT(*) INTO exists_check 
        FROM public.agents 
        WHERE referral_code = code;
        IF exists_check = 0 THEN
            EXIT;
        END IF;
    END LOOP;
    RETURN code;
END;
$function$;

-- 2) handle_new_agent
CREATE OR REPLACE FUNCTION public.handle_new_agent()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    IF NEW.referral_code IS NULL THEN
        NEW.referral_code = generate_referral_code();
    END IF;
    RETURN NEW;
END;
$function$;

-- 3) handle_referral_signup
CREATE OR REPLACE FUNCTION public.handle_referral_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    agent_record RECORD;
    v_referral_id uuid;
BEGIN
    IF NEW.referred_by IS NOT NULL THEN
        SELECT * INTO agent_record 
        FROM public.agents 
        WHERE id = NEW.referred_by;
        IF FOUND THEN
            SELECT id INTO v_referral_id
            FROM public.agent_referrals
            WHERE agent_id = agent_record.id AND referred_user_id = NEW.user_id
            LIMIT 1;
            IF v_referral_id IS NULL THEN
                INSERT INTO public.agent_referrals (agent_id, referred_user_id)
                VALUES (agent_record.id, NEW.user_id);
            END IF;
            UPDATE public.agents 
            SET referral_count = (
              SELECT COUNT(*) FROM public.agent_referrals ar WHERE ar.agent_id = agent_record.id
            ),
                updated_at = now()
            WHERE id = agent_record.id;
        END IF;
    END IF;
    RETURN NEW;
END;
$function$;

-- 4) update_agent_referrals_updated_at
CREATE OR REPLACE FUNCTION public.update_agent_referrals_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- 5) create_or_update_admin_user
CREATE OR REPLACE FUNCTION public.create_or_update_admin_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    admin_user_id uuid;
    admin_email text := 'admin@admin.com';
    admin_password text := '123456';
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
$function$;