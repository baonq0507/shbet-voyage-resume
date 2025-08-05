-- Disable email confirmation requirement and auto-confirm emails
-- This migration will:
-- 1. Update the handle_new_user function to auto-confirm email
-- 2. Create a trigger to auto-confirm email for new users
-- 3. Update existing unconfirmed users

-- First, update the handle_new_user function to also confirm email
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
  
  -- Check if avatar_url column exists before inserting profile
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'avatar_url'
  ) THEN
    -- Insert with avatar_url
    INSERT INTO public.profiles (user_id, full_name, username, phone_number, avatar_url)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
      COALESCE(NEW.raw_user_meta_data ->> 'username', ''),
      COALESCE(NEW.raw_user_meta_data ->> 'phone_number', ''),
      '/src/assets/avatars/avatar-1.jpg' -- Set default avatar
    );
  ELSE
    -- Insert without avatar_url (fallback for older schema)
    INSERT INTO public.profiles (user_id, full_name, username, phone_number)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
      COALESCE(NEW.raw_user_meta_data ->> 'username', ''),
      COALESCE(NEW.raw_user_meta_data ->> 'phone_number', '')
    );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user registration
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$function$;

-- Update all existing unconfirmed users to be confirmed
UPDATE auth.users 
SET email_confirmed_at = now(),
    confirmation_token = '',
    updated_at = now()
WHERE email_confirmed_at IS NULL;

-- Create a function to auto-confirm any new user registration
CREATE OR REPLACE FUNCTION public.auto_confirm_user_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Auto-confirm email for new users
  UPDATE auth.users 
  SET email_confirmed_at = now(),
      confirmation_token = '',
      updated_at = now()
  WHERE id = NEW.id AND email_confirmed_at IS NULL;
  
  RETURN NEW;
END;
$function$;

-- Create trigger to auto-confirm email on user creation
DROP TRIGGER IF EXISTS auto_confirm_email_trigger ON auth.users;
CREATE TRIGGER auto_confirm_email_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_user_email();

-- Also create trigger to auto-confirm on update if email_confirmed_at is NULL
DROP TRIGGER IF EXISTS auto_confirm_email_update_trigger ON auth.users;
CREATE TRIGGER auto_confirm_email_update_trigger
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NULL)
  EXECUTE FUNCTION public.auto_confirm_user_email(); 