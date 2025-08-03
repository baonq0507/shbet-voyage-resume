-- Function to handle withdrawal transactions
CREATE OR REPLACE FUNCTION public.handle_withdrawal_transaction()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for withdrawal transactions
CREATE OR REPLACE TRIGGER on_withdrawal_transaction
  AFTER INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_withdrawal_transaction();

-- Function to handle transaction status changes (for reversals)
CREATE OR REPLACE FUNCTION public.handle_transaction_status_change()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for transaction status changes
CREATE OR REPLACE TRIGGER on_transaction_status_change
  AFTER UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_transaction_status_change();