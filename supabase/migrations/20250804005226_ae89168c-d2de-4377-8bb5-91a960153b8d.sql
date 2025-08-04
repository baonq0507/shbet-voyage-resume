-- First, let's check if the user actually exists in auth.users
DO $$
DECLARE
    user_exists boolean;
    user_count integer;
BEGIN
    -- Check if user exists in auth.users
    SELECT COUNT(*) INTO user_count 
    FROM auth.users 
    WHERE id = '7a2c924b-4c0a-420e-ad6f-bff38d6981d5';
    
    IF user_count > 0 THEN
        RAISE NOTICE 'User exists in auth.users';
        
        -- Try to insert the role safely
        INSERT INTO public.user_roles (user_id, role)
        VALUES ('7a2c924b-4c0a-420e-ad6f-bff38d6981d5', 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
        
        RAISE NOTICE 'Admin role inserted successfully';
    ELSE
        RAISE NOTICE 'User does not exist in auth.users with ID: 7a2c924b-4c0a-420e-ad6f-bff38d6981d5';
        
        -- List all users to see what we have
        FOR user_exists IN 
            SELECT 'User: ' || id || ' - ' || email 
            FROM auth.users 
            LIMIT 5
        LOOP
            RAISE NOTICE '%', user_exists;
        END LOOP;
    END IF;
END;
$$;