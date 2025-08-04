-- Create function to handle deposit approval with third-party API
CREATE OR REPLACE FUNCTION public.handle_deposit_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_profile RECORD;
BEGIN
  -- Only process deposit transactions that are being approved
  IF NEW.type = 'deposit' AND OLD.status = 'pending' AND NEW.status = 'approved' THEN
    -- Get user profile to get username
    SELECT username INTO user_profile 
    FROM public.profiles 
    WHERE user_id = NEW.user_id;
    
    -- Log the approval attempt
    RAISE NOTICE 'Processing deposit approval for user: %, amount: %', user_profile.username, NEW.amount;
    
    -- Note: The actual API call and balance update will be handled by the application
    -- This trigger just logs the approval for audit purposes
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for deposit approval
DROP TRIGGER IF EXISTS trigger_deposit_approval ON public.transactions;
CREATE TRIGGER trigger_deposit_approval
  AFTER UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_deposit_approval();