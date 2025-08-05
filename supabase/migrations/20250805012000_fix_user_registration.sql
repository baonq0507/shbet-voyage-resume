-- Fix user registration issues by cleaning up conflicting triggers and functions
-- This migration will:
-- 1. Drop all conflicting triggers
-- 2. Create a clean handle_new_user function
-- 3. Recreate the necessary triggers

-- First, drop all existing triggers that might conflict
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
DROP TRIGGER IF EXISTS auto_confirm_email_trigger ON auth.users;
DROP TRIGGER IF EXISTS auto_confirm_email_update_trigger ON auth.users;
DROP TRIGGER IF EXISTS auto_confirm_new_user_trigger ON auth.users;

-- Drop conflicting functions
DROP FUNCTION IF EXISTS public.auto_confirm_user_email();
DROP FUNCTION IF EXISTS public.auto_confirm_new_user();

-- Create a clean handle_new_user function that handles everything
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Auto-confirm the user's email
  UPDATE auth.users 
  SET email_confirmed_at = now(),
      confirmation_token = '',
      updated_at = now()
  WHERE id = NEW.id;
  
  -- Create user profile
  INSERT INTO public.profiles (user_id, full_name, username, phone_number, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'username', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'phone_number', ''),
    '/src/assets/avatars/avatar-1.jpg'
  );
  
  -- Create user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user registration
    RAISE WARNING 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$function$;

-- Create the main trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Update all existing unconfirmed users to be confirmed
UPDATE auth.users 
SET email_confirmed_at = now(),
    confirmation_token = '',
    updated_at = now()
WHERE email_confirmed_at IS NULL; 