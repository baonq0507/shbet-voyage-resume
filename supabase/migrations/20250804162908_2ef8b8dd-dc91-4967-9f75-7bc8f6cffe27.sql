-- Get admin user_id first
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Get admin user id
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@admin.com';
    
    -- Update or insert profile
    UPDATE public.profiles 
    SET username = 'admin', full_name = 'Administrator'
    WHERE user_id = admin_user_id;
    
    -- If no rows updated, insert new profile
    IF NOT FOUND THEN
        INSERT INTO public.profiles (user_id, username, full_name, balance)
        VALUES (admin_user_id, 'admin', 'Administrator', 0.00);
    END IF;
    
    -- Ensure admin role exists
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin')
    ON CONFLICT DO NOTHING;
END $$;