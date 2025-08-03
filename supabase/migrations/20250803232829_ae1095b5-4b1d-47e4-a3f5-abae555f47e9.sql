-- Fix security issues by setting search_path for all functions

-- Update handle_withdrawal_transaction function with secure search_path
CREATE OR REPLACE FUNCTION public.handle_withdrawal_transaction()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  -- Only process if this is a withdrawal transaction
  IF NEW.type = 'withdrawal' AND NEW.status = 'pending' THEN
    -- Check if user has sufficient balance
    DECLARE
      current_balance NUMERIC;
    BEGIN
      SELECT balance INTO current_balance 
      FROM public.profiles 
      WHERE user_id = NEW.user_id;
      
      -- If insufficient balance, raise exception
      IF current_balance < NEW.amount THEN
        RAISE EXCEPTION 'Insufficient balance. Current balance: %, Withdrawal amount: %', current_balance, NEW.amount;
      END IF;
      
      -- Deduct the amount from user balance
      UPDATE public.profiles 
      SET balance = balance - NEW.amount,
          updated_at = now()
      WHERE user_id = NEW.user_id;
      
      -- Log the balance deduction
      RAISE NOTICE 'Withdrawal processed: User %, Amount: %, New balance: %', 
        NEW.user_id, NEW.amount, (current_balance - NEW.amount);
    END;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update handle_transaction_status_change function with secure search_path
CREATE OR REPLACE FUNCTION public.handle_transaction_status_change()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  -- If withdrawal transaction is rejected, refund the amount
  IF OLD.type = 'withdrawal' AND OLD.status = 'pending' AND NEW.status = 'rejected' THEN
    UPDATE public.profiles 
    SET balance = balance + NEW.amount,
        updated_at = now()
    WHERE user_id = NEW.user_id;
    
    RAISE NOTICE 'Withdrawal refunded: User %, Amount: %', NEW.user_id, NEW.amount;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update existing functions to include secure search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, username, phone_number)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'username', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'phone_number', '')
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role 
  FROM public.user_roles 
  WHERE user_id = auth.uid() 
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;