-- Create bank table for bank information
CREATE TABLE public.bank (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  qr_code_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for bank table
ALTER TABLE public.bank ENABLE ROW LEVEL SECURITY;

-- Bank policies - anyone can view active banks for deposits
CREATE POLICY "Anyone can view active banks" 
ON public.bank 
FOR SELECT 
USING (is_active = true);

-- Create transactions table for deposit/withdrawal requests
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  bank_id UUID REFERENCES public.bank(id),
  proof_image_url TEXT,
  admin_note TEXT,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for transactions table
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Transaction policies
CREATE POLICY "Users can view their own transactions" 
ON public.transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" 
ON public.transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending transactions" 
ON public.transactions 
FOR UPDATE 
USING (auth.uid() = user_id AND status = 'pending');

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_bank_updated_at
BEFORE UPDATE ON public.bank
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample bank data
INSERT INTO public.bank (bank_name, account_number, account_holder, qr_code_url) VALUES 
('Vietcombank', '1234567890', 'CONG TY TNHH CASINO GAME', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=VCB-1234567890'),
('Techcombank', '0987654321', 'CONG TY TNHH CASINO GAME', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TCB-0987654321');