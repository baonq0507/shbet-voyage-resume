-- Create promotion codes table for tracking code usage
CREATE TABLE public.promotion_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id UUID REFERENCES public.promotions(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on promotion codes
ALTER TABLE public.promotion_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for promotion codes
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

-- Add trigger for updated_at
CREATE TRIGGER update_promotion_codes_updated_at
BEFORE UPDATE ON public.promotion_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();