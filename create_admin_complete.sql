-- =============================================
-- SCRIPT TẠO DATABASE VÀ TÀI KHOẢN ADMIN HOÀN CHỈNH
-- =============================================

-- Bước 1: Bật các extension cần thiết
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Bước 2: Tạo enum cho user roles
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Bước 3: Tạo bảng profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  username TEXT UNIQUE NOT NULL,
  balance NUMERIC(15,2) DEFAULT 0.00,
  avatar_url TEXT,
  last_login_at TIMESTAMP WITH TIME ZONE,
  last_login_ip INET,
  referred_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bước 4: Tạo bảng user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Bước 5: Tạo bảng bank
CREATE TABLE IF NOT EXISTS public.bank (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  qr_code_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bước 6: Tạo bảng transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'bonus')),
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

-- Bước 7: Tạo bảng games
CREATE TABLE IF NOT EXISTS public.games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  provider TEXT NOT NULL,
  image_url TEXT,
  game_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  min_bet NUMERIC(10,2) DEFAULT 0.01,
  max_bet NUMERIC(10,2) DEFAULT 1000.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bước 8: Tạo bảng notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT false,
  target_users TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bước 9: Tạo bảng agents
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(user_id),
  referral_code TEXT UNIQUE NOT NULL,
  commission_rate NUMERIC(5,2) DEFAULT 0.00,
  total_commission NUMERIC(15,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bước 10: Tạo bảng agent_commission_levels
CREATE TABLE IF NOT EXISTS public.agent_commission_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  level_name TEXT NOT NULL,
  min_referrals INTEGER NOT NULL,
  commission_rate NUMERIC(5,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bước 11: Tạo bảng agent_referrals
CREATE TABLE IF NOT EXISTS public.agent_referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.agents(id),
  referred_user_id UUID NOT NULL REFERENCES public.profiles(user_id),
  commission_amount NUMERIC(15,2) DEFAULT 0.00,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bước 12: Tạo bảng promotions
CREATE TABLE IF NOT EXISTS public.promotions (
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
  max_bonus NUMERIC,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bước 13: Tạo bảng promotion_codes
CREATE TABLE IF NOT EXISTS public.promotion_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  promotion_id UUID REFERENCES public.promotions(id),
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bước 14: Tạo tài khoản admin
DO $$
DECLARE
    admin_user_id uuid;
    admin_email text := 'admin@admin.com';
    admin_password text := '123456';
BEGIN
    -- Xóa tài khoản admin cũ nếu có
    DELETE FROM auth.users WHERE email = admin_email;
    
    -- Tạo tài khoản admin mới với bcrypt hash
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
        recovery_token,
        last_sign_in_at,
        raw_app_meta_data,
        is_sso_user,
        deleted_at,
        phone,
        phone_confirmed_at,
        phone_change,
        phone_change_token,
        email_change_token_current,
        email_change_confirm_status,
        banned_until,
        reauthentication_token,
        reauthentication_sent_at
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
        '',
        now(),
        '{"provider": "email", "providers": ["email"]}',
        false,
        null,
        null,
        null,
        '',
        '',
        '',
        0,
        null,
        '',
        null
    ) RETURNING id INTO admin_user_id;
    
    -- Tạo profile cho admin
    INSERT INTO public.profiles (user_id, username, full_name)
    VALUES (admin_user_id, 'admin', 'Administrator');
    
    -- Tạo role admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin');
    
    RAISE NOTICE 'Tài khoản admin đã được tạo thành công với ID: %', admin_user_id;
    RAISE NOTICE 'Thông tin đăng nhập: email=% password=%', admin_email, admin_password;
END $$;

-- Bước 15: Thêm dữ liệu mẫu cho bank
INSERT INTO public.bank (bank_name, account_number, account_holder, qr_code_url) VALUES 
('Vietcombank', '1234567890', 'CONG TY TNHH CASINO GAME', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=VCB-1234567890'),
('Techcombank', '0987654321', 'CONG TY TNHH CASINO GAME', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TCB-0987654321')
ON CONFLICT DO NOTHING;

-- Bước 16: Kiểm tra kết quả
SELECT 
    u.id,
    u.email,
    u.email_confirmed_at,
    u.created_at,
    p.username,
    p.full_name,
    ur.role
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'admin@admin.com';

-- Hiển thị tất cả bảng đã tạo
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
