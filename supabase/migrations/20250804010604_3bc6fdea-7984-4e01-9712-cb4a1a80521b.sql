-- Clean up all data related to the problematic user ID
DO $$
DECLARE
    problematic_user_id uuid := '7a2c924b-4c0a-420e-ad6f-bff38d6981d5';
    user_exists boolean := false;
BEGIN
    -- Check if user exists in auth.users
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = problematic_user_id) INTO user_exists;
    
    IF user_exists THEN
        RAISE NOTICE 'User exists in auth.users, keeping data';
    ELSE
        RAISE NOTICE 'User does not exist in auth.users, cleaning up orphaned data';
        
        -- Remove from user_roles
        DELETE FROM public.user_roles WHERE user_id = problematic_user_id;
        RAISE NOTICE 'Removed user_roles records for user: %', problematic_user_id;
        
        -- Remove from profiles
        DELETE FROM public.profiles WHERE user_id = problematic_user_id;
        RAISE NOTICE 'Removed profiles records for user: %', problematic_user_id;
        
        -- Remove from transactions
        DELETE FROM public.transactions WHERE user_id = problematic_user_id;
        RAISE NOTICE 'Removed transactions records for user: %', problematic_user_id;
        
        RAISE NOTICE 'Cleanup completed for user: %', problematic_user_id;
    END IF;
END;
$$;

-- Verify cleanup
SELECT 'user_roles' as table_name, COUNT(*) as count 
FROM public.user_roles 
WHERE user_id = '7a2c924b-4c0a-420e-ad6f-bff38d6981d5'
UNION ALL
SELECT 'profiles' as table_name, COUNT(*) as count 
FROM public.profiles 
WHERE user_id = '7a2c924b-4c0a-420e-ad6f-bff38d6981d5'
UNION ALL
SELECT 'transactions' as table_name, COUNT(*) as count 
FROM public.transactions 
WHERE user_id = '7a2c924b-4c0a-420e-ad6f-bff38d6981d5';