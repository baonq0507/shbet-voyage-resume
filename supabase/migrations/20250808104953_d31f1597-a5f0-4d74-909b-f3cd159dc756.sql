-- Create table for per-agent multi-level commissions
CREATE TABLE IF NOT EXISTS public.agent_commission_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level > 0),
  commission_percentage NUMERIC NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_agent_level UNIQUE (agent_id, level)
);

-- Enable Row Level Security
ALTER TABLE public.agent_commission_levels ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can manage all agent commission levels"
ON public.agent_commission_levels
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Agent can view own commission levels"
ON public.agent_commission_levels
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.agents a 
    WHERE a.id = agent_commission_levels.agent_id AND a.user_id = auth.uid()
  )
);

-- Trigger to auto-update updated_at
CREATE TRIGGER trg_update_agent_commission_levels_updated_at
BEFORE UPDATE ON public.agent_commission_levels
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add FK from profiles.referred_by -> agents.id to track which agent a user belongs to
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_profiles_referred_by_agents'
  ) THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT fk_profiles_referred_by_agents
    FOREIGN KEY (referred_by)
    REFERENCES public.agents(id)
    ON DELETE SET NULL;
  END IF;
END $$;