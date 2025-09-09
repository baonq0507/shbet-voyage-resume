-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.agent_commission_levels (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL,
  level integer NOT NULL CHECK (level > 0),
  commission_percentage numeric NOT NULL DEFAULT 0.00,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT agent_commission_levels_pkey PRIMARY KEY (id),
  CONSTRAINT agent_commission_levels_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agents(id)
);

CREATE TABLE public.agent_levels (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  commission_percentage numeric NOT NULL DEFAULT 0.00,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT agent_levels_pkey PRIMARY KEY (id)
);

CREATE TABLE public.agent_referrals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL,
  referred_user_id uuid NOT NULL,
  referral_date timestamp with time zone NOT NULL DEFAULT now(),
  commission_earned numeric DEFAULT 0.00,
  status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text, 'cancelled'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT agent_referrals_pkey PRIMARY KEY (id),
  CONSTRAINT agent_referrals_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agents(id),
  CONSTRAINT agent_referrals_referred_user_id_fkey FOREIGN KEY (referred_user_id) REFERENCES public.profiles(user_id)
);

CREATE TABLE public.agents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  commission_percentage numeric NOT NULL DEFAULT 10.00,
  total_commission numeric NOT NULL DEFAULT 0.00,
  referral_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  referral_code text UNIQUE,
  level_id uuid,
  CONSTRAINT agents_pkey PRIMARY KEY (id),
  CONSTRAINT agents_level_id_fkey FOREIGN KEY (level_id) REFERENCES public.agent_levels(id)
);

CREATE TABLE public.bank (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  bank_name text NOT NULL,
  account_number text NOT NULL,
  account_holder text NOT NULL,
  qr_code_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT bank_pkey PRIMARY KEY (id)
);

CREATE TABLE public.games (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  game_id character varying NOT NULL,
  name character varying NOT NULL,
  image text,
  type character varying,
  category character varying,
  provider character varying,
  gpid integer NOT NULL,
  game_provider_id integer,
  game_type integer,
  new_game_type integer,
  rank integer DEFAULT 0,
  rtp numeric,
  rows integer,
  reels integer,
  lines integer,
  supported_currencies text[],
  block_countries text[],
  is_active boolean DEFAULT true,
  is_enabled boolean DEFAULT true,
  is_maintain boolean DEFAULT false,
  is_provider_online boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT games_pkey PRIMARY KEY (id)
);

CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  target_users text[] DEFAULT '{}'::text[],
  type text NOT NULL DEFAULT 'info'::text,
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id)
);

CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  full_name text NOT NULL,
  phone_number text,
  username text NOT NULL UNIQUE,
  balance numeric DEFAULT 0.00,
  avatar_url text,
  last_login_at timestamp with time zone,
  last_login_ip inet,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  referred_by uuid,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_referred_by_fkey FOREIGN KEY (referred_by) REFERENCES public.agents(id),
  CONSTRAINT fk_profiles_referred_by_agents FOREIGN KEY (referred_by) REFERENCES public.agents(id)
);

CREATE TABLE public.promotion_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  promotion_id uuid,
  code text NOT NULL UNIQUE,
  used_by uuid,
  used_at timestamp with time zone,
  is_used boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT promotion_codes_pkey PRIMARY KEY (id),
  CONSTRAINT promotion_codes_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES public.promotions(id)
);

CREATE TABLE public.promotions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  promotion_type text DEFAULT 'time_based'::text CHECK (promotion_type = ANY (ARRAY['first_deposit'::text, 'time_based'::text, 'code_based'::text])),
  bonus_percentage integer,
  bonus_amount numeric,
  promotion_code text UNIQUE,
  is_first_deposit_only boolean DEFAULT false,
  min_deposit numeric,
  max_uses integer,
  current_uses integer NOT NULL DEFAULT 0,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT promotions_pkey PRIMARY KEY (id)
);

CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['deposit'::text, 'withdrawal'::text, 'bonus'::text])),
  amount numeric NOT NULL CHECK (amount > 0::numeric),
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['awaiting_payment'::text, 'pending'::text, 'approved'::text, 'rejected'::text])),
  bank_id uuid,
  proof_image_url text,
  admin_note text,
  approved_by uuid,
  approved_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_bank_id_fkey FOREIGN KEY (bank_id) REFERENCES public.bank(id),
  CONSTRAINT fk_transactions_profiles_user FOREIGN KEY (user_id) REFERENCES public.profiles(user_id),
  CONSTRAINT fk_transactions_bank FOREIGN KEY (bank_id) REFERENCES public.bank(id)
);

CREATE TABLE public.user_bank_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  bank_name text NOT NULL,
  account_number text NOT NULL,
  account_holder text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_bank_accounts_pkey PRIMARY KEY (id)
);

-- Tạo enum type trước khi sử dụng
CREATE TYPE app_role AS ENUM ('user', 'admin', 'agent');

CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role app_role NOT NULL DEFAULT 'user'::app_role,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_roles_pkey PRIMARY KEY (id)
);
