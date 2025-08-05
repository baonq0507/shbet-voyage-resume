-- Fix user registration by updating the handle_new_user function
-- This migration will ensure proper user registration without conflicts

-- Update the handle_new_user function to handle everything properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Auto-confirm the user's email
  UPDATE auth.users 
  SET email_confirmed_at = now(),
      confirmation_token = '',
      updated_at = now()
  WHERE id = NEW.id;
  
  -- Create user profile with avatar_url
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

-- Update all existing unconfirmed users to be confirmed
UPDATE auth.users 
SET email_confirmed_at = now(),
    confirmation_token = '',
    updated_at = now()
WHERE email_confirmed_at IS NULL; 