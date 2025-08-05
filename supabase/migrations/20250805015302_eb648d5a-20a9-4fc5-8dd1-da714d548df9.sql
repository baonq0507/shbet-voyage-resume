-- =============================================
-- COMPREHENSIVE DATABASE MIGRATION
-- Consolidates all existing migration logic
-- =============================================

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  username TEXT UNIQUE NOT NULL,
  balance NUMERIC(15,2) DEFAULT 0.00,
  avatar_url TEXT,
  last_login_at TIMESTAMP WITH TIME ZONE,
  last_login_ip INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- USER ROLES TABLE
-- =============================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- User roles RLS policies
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- BANK TABLE
-- =============================================
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

-- Bank RLS policies
CREATE POLICY "Anyone can view active banks" 
ON public.bank 
FOR SELECT 
USING (is_active = true);

-- =============================================
-- TRANSACTIONS TABLE
-- =============================================
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

-- Transaction RLS policies
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

CREATE POLICY "Admins can view all transactions" 
ON public.transactions 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all transactions" 
ON public.transactions 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- PROMOTIONS TABLE
-- =============================================
CREATE TABLE public.promotions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  promotion_type TEXT DEFAULT 'time_based' CHECK (promotion_type IN ('first_deposit', 'time_based', 'code_based')),
  bonus_percentage INTEGER,
  bonus_amount NUMERIC,
  promotion_code TEXT UNIQUE,
  is_first_deposit_only BOOLEAN DEFAULT false,
  min_deposit NUMERIC,
  max_uses INTEGER,
  current_uses INTEGER NOT NULL DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for promotions table
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- Promotions RLS policies
CREATE POLICY "Anyone can view active promotions" 
ON public.promotions 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage all promotions" 
ON public.promotions 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- PROMOTION CODES TABLE
-- =============================================
CREATE TABLE public.promotion_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id UUID REFERENCES public.promotions(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  used_by UUID,
  used_at TIMESTAMP WITH TIME ZONE,
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on promotion codes
ALTER TABLE public.promotion_codes ENABLE ROW LEVEL SECURITY;

-- Promotion codes RLS policies
CREATE POLICY "Anyone can view unused codes" 
ON public.promotion_codes 
FOR SELECT 
USING (is_used = false);

CREATE POLICY "Admins can manage all codes" 
ON public.promotion_codes 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update codes they use" 
ON public.promotion_codes 
FOR UPDATE 
USING (auth.uid() = used_by);

-- =============================================
-- GAMES TABLE
-- =============================================
CREATE TABLE public.games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  image TEXT,
  type VARCHAR,
  category VARCHAR,
  provider VARCHAR,
  gpid INTEGER NOT NULL,
  game_provider_id INTEGER,
  game_type INTEGER,
  new_game_type INTEGER,
  rank INTEGER DEFAULT 0,
  rtp NUMERIC,
  rows INTEGER,
  reels INTEGER,
  lines INTEGER,
  supported_currencies TEXT[],
  block_countries TEXT[],
  is_active BOOLEAN DEFAULT true,
  is_enabled BOOLEAN DEFAULT true,
  is_maintain BOOLEAN DEFAULT false,
  is_provider_online BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for games table
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Games RLS policies
CREATE POLICY "Allow public read access to games" 
ON public.games 
FOR SELECT 
USING (true);

CREATE POLICY "Allow authenticated users to manage games" 
ON public.games 
FOR ALL 
USING (auth.role() = 'authenticated');

-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  target_users TEXT[] DEFAULT '{}',
  type TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Notifications RLS policies
CREATE POLICY "Users can view their notifications" 
ON public.notifications 
FOR SELECT 
USING (user_id IS NULL OR user_id = auth.uid() OR auth.uid()::text = ANY(target_users));

CREATE POLICY "Users can update their own notification read status" 
ON public.notifications 
FOR UPDATE 
USING (user_id = auth.uid() OR auth.uid()::text = ANY(target_users))
WITH CHECK (user_id = auth.uid() OR auth.uid()::text = ANY(target_users));

CREATE POLICY "Admins can manage all notifications" 
ON public.notifications 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- AGENTS TABLE
-- =============================================
CREATE TABLE public.agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  commission_percentage NUMERIC NOT NULL DEFAULT 10.00,
  total_commission NUMERIC NOT NULL DEFAULT 0.00,
  referral_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for agents table
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- Agents RLS policies
CREATE POLICY "Agents can view their own data" 
ON public.agents 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all agents" 
ON public.agents 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- UTILITY FUNCTIONS
-- =============================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = 'public';

-- Function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
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

-- Function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role 
  FROM public.user_roles 
  WHERE user_id = auth.uid() 
  LIMIT 1
$$;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if avatar_url column exists before inserting
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
      '/src/assets/avatars/avatar-1.jpg'
    );
  ELSE
    -- Insert without avatar_url
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
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = 'public';

-- Function to auto-assign user role
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
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
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = 'public';

-- Function to handle transaction status changes
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
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = 'public';

-- Function to handle deposit approval
CREATE OR REPLACE FUNCTION public.handle_deposit_approval()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = 'public';

-- Function to check if user's first deposit
CREATE OR REPLACE FUNCTION public.is_first_deposit(user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.transactions 
    WHERE user_id = user_id_param 
    AND type = 'deposit' 
    AND status = 'approved'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = 'public';

-- Function to validate promotion dates
CREATE OR REPLACE FUNCTION public.validate_promotion_dates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.end_date <= NEW.start_date THEN
    RAISE EXCEPTION 'End date must be after start date';
  END IF;
  
  IF NEW.bonus_percentage IS NOT NULL AND NEW.bonus_amount IS NOT NULL THEN
    RAISE EXCEPTION 'Cannot have both percentage and fixed amount bonus';
  END IF;
  
  IF NEW.bonus_percentage IS NULL AND NEW.bonus_amount IS NULL THEN
    RAISE EXCEPTION 'Must have either percentage or fixed amount bonus';
  END IF;
  
  IF NEW.promotion_type = 'code_based' AND NEW.promotion_code IS NULL THEN
    RAISE EXCEPTION 'Code-based promotions must have a promotion code';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function to update games timestamps
CREATE OR REPLACE FUNCTION public.update_games_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = 'public';

-- Function to create or update admin user
CREATE OR REPLACE FUNCTION public.create_or_update_admin_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_user_id uuid;
    admin_email text := 'admin@admin.com';
    admin_password text := '123456';
    existing_profile_count integer;
    existing_role_count integer;
BEGIN
    -- Check if admin user already exists
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = admin_email;
    
    -- If admin user doesn't exist, create one
    IF admin_user_id IS NULL THEN
        -- Insert into auth.users with hashed password and confirmed email
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_user_meta_data,
            is_super_admin,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            admin_email,
            crypt(admin_password, gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"username": "admin", "full_name": "Administrator"}',
            false,
            '',
            '',
            '',
            ''
        ) RETURNING id INTO admin_user_id;
        
        RAISE NOTICE 'Admin user created with email: % and password: %', admin_email, admin_password;
    ELSE
        -- Update password and confirm email for existing admin user
        UPDATE auth.users 
        SET encrypted_password = crypt(admin_password, gen_salt('bf')),
            updated_at = now(),
            email_confirmed_at = now(),
            confirmation_token = ''
        WHERE id = admin_user_id;
        
        RAISE NOTICE 'Admin user password updated and email confirmed for email: %', admin_email;
    END IF;
    
    -- Check and create/update profile
    SELECT COUNT(*) INTO existing_profile_count
    FROM public.profiles 
    WHERE user_id = admin_user_id;
    
    IF existing_profile_count = 0 THEN
        INSERT INTO public.profiles (user_id, username, full_name)
        VALUES (admin_user_id, 'admin', 'Administrator');
    ELSE
        UPDATE public.profiles 
        SET username = 'admin', full_name = 'Administrator'
        WHERE user_id = admin_user_id;
    END IF;
    
    -- Check and create admin role
    SELECT COUNT(*) INTO existing_role_count
    FROM public.user_roles 
    WHERE user_id = admin_user_id AND role = 'admin';
    
    IF existing_role_count = 0 THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (admin_user_id, 'admin');
    END IF;
    
    RAISE NOTICE 'Admin setup completed. Login with: username=admin password=%', admin_password;
END;
$$;

-- =============================================
-- TRIGGERS
-- =============================================

-- Triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bank_updated_at
  BEFORE UPDATE ON public.bank
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_promotions_updated_at
  BEFORE UPDATE ON public.promotions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_promotion_codes_updated_at
  BEFORE UPDATE ON public.promotion_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON public.games
  FOR EACH ROW
  EXECUTE FUNCTION public.update_games_updated_at();

CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- User registration triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user_role();

-- Transaction triggers
CREATE TRIGGER on_withdrawal_transaction
  AFTER INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_withdrawal_transaction();

CREATE TRIGGER on_transaction_status_change
  AFTER UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_transaction_status_change();

CREATE TRIGGER on_deposit_approval
  AFTER UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_deposit_approval();

-- Promotion validation trigger
CREATE TRIGGER validate_promotion_dates_trigger
  BEFORE INSERT OR UPDATE ON public.promotions
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_promotion_dates();

-- =============================================
-- STORAGE BUCKETS AND POLICIES
-- =============================================

-- Create storage bucket for user avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for promotion images
INSERT INTO storage.buckets (id, name, public) VALUES ('promotion-images', 'promotion-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatar uploads
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =============================================
-- ENABLE REALTIME
-- =============================================

-- Enable realtime for key tables
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.transactions REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;

-- =============================================
-- SAMPLE DATA
-- =============================================

-- Insert sample bank data
INSERT INTO public.bank (bank_name, account_number, account_holder, qr_code_url) VALUES 
('Vietcombank', '1234567890', 'CONG TY TNHH CASINO GAME', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=VCB-1234567890'),
('Techcombank', '0987654321', 'CONG TY TNHH CASINO GAME', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TCB-0987654321')
ON CONFLICT DO NOTHING;

-- Create admin user
SELECT public.create_or_update_admin_user();