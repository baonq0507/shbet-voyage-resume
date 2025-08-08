
-- Thêm cột referral_code vào bảng agents để tạo link mời riêng
ALTER TABLE public.agents ADD COLUMN referral_code TEXT UNIQUE;

-- Tạo function để tự động tạo referral_code khi tạo đại lý mới
CREATE OR REPLACE FUNCTION generate_referral_code() 
RETURNS TEXT 
LANGUAGE plpgsql 
AS $$
DECLARE
    code TEXT;
    exists_check INTEGER;
BEGIN
    LOOP
        -- Tạo mã referral ngẫu nhiên 8 ký tự
        code := upper(substring(md5(random()::text) from 1 for 8));
        
        -- Kiểm tra xem mã đã tồn tại chưa
        SELECT COUNT(*) INTO exists_check 
        FROM public.agents 
        WHERE referral_code = code;
        
        -- Nếu chưa tồn tại thì thoát khỏi loop
        IF exists_check = 0 THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN code;
END;
$$;

-- Thêm trigger để tự động tạo referral_code khi insert agent mới
CREATE OR REPLACE FUNCTION handle_new_agent()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Tự động tạo referral_code nếu chưa có
    IF NEW.referral_code IS NULL THEN
        NEW.referral_code = generate_referral_code();
    END IF;
    
    RETURN NEW;
END;
$$;

-- Tạo trigger
DROP TRIGGER IF EXISTS on_agent_created ON public.agents;
CREATE TRIGGER on_agent_created
    BEFORE INSERT ON public.agents
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_agent();

-- Cập nhật referral_code cho các agents hiện tại nếu chưa có
UPDATE public.agents 
SET referral_code = generate_referral_code() 
WHERE referral_code IS NULL;

-- Thêm cột referred_by vào bảng profiles để theo dõi ai giới thiệu user
ALTER TABLE public.profiles ADD COLUMN referred_by UUID REFERENCES public.agents(id);

-- Thêm index để tối ưu query
CREATE INDEX IF NOT EXISTS idx_agents_referral_code ON public.agents(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON public.profiles(referred_by);

-- Tạo bảng agent_referrals để theo dõi chi tiết các lượt giới thiệu
CREATE TABLE IF NOT EXISTS public.agent_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
    referred_user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
    referral_date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    commission_earned NUMERIC DEFAULT 0.00,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(agent_id, referred_user_id)
);

-- Enable RLS cho bảng agent_referrals
ALTER TABLE public.agent_referrals ENABLE ROW LEVEL SECURITY;

-- RLS policies cho agent_referrals
CREATE POLICY "Agents can view their own referrals"
    ON public.agent_referrals
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.agents a
            WHERE a.id = agent_id AND a.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all referrals"
    ON public.agent_referrals
    FOR ALL
    USING (has_role(auth.uid(), 'admin'::app_role));

-- Tạo function để xử lý khi user đăng ký qua referral link
CREATE OR REPLACE FUNCTION handle_referral_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    agent_record RECORD;
BEGIN
    -- Nếu có referred_by thì tạo record trong agent_referrals
    IF NEW.referred_by IS NOT NULL THEN
        SELECT * INTO agent_record 
        FROM public.agents 
        WHERE id = NEW.referred_by;
        
        IF FOUND THEN
            INSERT INTO public.agent_referrals (agent_id, referred_user_id)
            VALUES (agent_record.id, NEW.user_id);
            
            -- Cập nhật referral_count của agent
            UPDATE public.agents 
            SET referral_count = referral_count + 1,
                updated_at = now()
            WHERE id = agent_record.id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Tạo trigger để xử lý referral khi có profile mới
DROP TRIGGER IF EXISTS on_referral_signup ON public.profiles;
CREATE TRIGGER on_referral_signup
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION handle_referral_signup();

-- Thêm trigger để update updated_at
CREATE OR REPLACE FUNCTION update_agent_referrals_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_agent_referrals_updated_at ON public.agent_referrals;
CREATE TRIGGER update_agent_referrals_updated_at
    BEFORE UPDATE ON public.agent_referrals
    FOR EACH ROW
    EXECUTE FUNCTION update_agent_referrals_updated_at();
