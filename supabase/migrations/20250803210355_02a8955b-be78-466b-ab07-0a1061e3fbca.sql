-- This migration is just for reference and should not be executed during reset
-- It contains example queries for granting admin roles after user creation
-- The actual queries should be run manually after users are created

-- Example queries (commented out to prevent execution during migration):
-- SELECT user_id, full_name, username FROM public.profiles;
-- INSERT INTO public.user_roles (user_id, role) VALUES ('YOUR_USER_ID_HERE', 'admin');