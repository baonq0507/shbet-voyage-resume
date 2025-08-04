-- Delete the existing admin@admin.com user and use the existing admin user
DELETE FROM auth.users WHERE email = 'admin@admin.com';

-- Update the existing admin user to have admin role
DO $$
DECLARE
    existing_admin_user_id uuid;
BEGIN
    -- Get the first admin user that exists
    SELECT id INTO existing_admin_user_id FROM auth.users WHERE email = 'quangbaorp@gmail.com' LIMIT 1;
    
    -- If no admin user found, create one
    IF existing_admin_user_id IS NULL THEN
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, confirmation_token, created_at, updated_at)
        VALUES (gen_random_uuid(), 'quangbaorp@gmail.com', crypt('123456', gen_salt('bf')), now(), '', now(), now())
        RETURNING id INTO existing_admin_user_id;
        
        -- Create profile for new admin user (with conflict handling)
        INSERT INTO public.profiles (user_id, username, full_name, balance)
        VALUES (existing_admin_user_id, 'admin', 'Administrator', 0.00)
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
    
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