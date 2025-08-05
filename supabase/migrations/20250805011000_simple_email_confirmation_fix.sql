-- Simple fix for email confirmation - auto-confirm all users
-- Update all existing unconfirmed users to be confirmed
UPDATE auth.users 
SET email_confirmed_at = now(),
    confirmation_token = '',
    updated_at = now()
WHERE email_confirmed_at IS NULL;

-- Create a simple function to auto-confirm new users
CREATE OR REPLACE FUNCTION public.auto_confirm_new_user()
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
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$function$;

-- Create trigger to auto-confirm email on user creation
DROP TRIGGER IF EXISTS auto_confirm_new_user_trigger ON auth.users;
CREATE TRIGGER auto_confirm_new_user_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_new_user(); 