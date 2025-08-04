-- Remove admin role from user baonq123
DELETE FROM public.user_roles 
WHERE user_id = '7a2c924b-4c0a-420e-ad6f-bff38d6981d5' 
AND role = 'admin';

-- Verify the role has been removed
DO $$
DECLARE
    role_count integer;
BEGIN
    SELECT COUNT(*) INTO role_count
    FROM public.user_roles 
    WHERE user_id = '7a2c924b-4c0a-420e-ad6f-bff38d6981d5';
    
    IF role_count = 0 THEN
        RAISE NOTICE 'All roles removed for user baonq123';
        
        -- Add default user role if no roles exist
        INSERT INTO public.user_roles (user_id, role)
        VALUES ('7a2c924b-4c0a-420e-ad6f-bff38d6981d5', 'user');
        
        RAISE NOTICE 'Default user role added for baonq123';
    ELSE
        RAISE NOTICE 'User baonq123 still has % role(s)', role_count;
    END IF;
END;
$$;