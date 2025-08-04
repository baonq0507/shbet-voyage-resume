-- Check current constraint details
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.update_rule,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
    AND tc.table_schema = rc.constraint_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'user_roles';

-- Drop ALL foreign key constraints on user_roles table
DO $$
DECLARE
    constraint_name text;
BEGIN
    FOR constraint_name IN 
        SELECT tc.constraint_name
        FROM information_schema.table_constraints AS tc
        WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name = 'user_roles'
        AND tc.table_schema = 'public'
    LOOP
        EXECUTE 'ALTER TABLE public.user_roles DROP CONSTRAINT ' || constraint_name;
        RAISE NOTICE 'Dropped constraint: %', constraint_name;
    END LOOP;
END;
$$;

-- Recreate the correct foreign key constraint
ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Verify the constraint is correct
SELECT 
    conname as constraint_name,
    conrelid::regclass as table_name,
    confrelid::regclass as foreign_table,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.user_roles'::regclass 
AND contype = 'f';

-- Now try to insert the admin role
INSERT INTO public.user_roles (user_id, role)
VALUES ('7a2c924b-4c0a-420e-ad6f-bff38d6981d5', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;