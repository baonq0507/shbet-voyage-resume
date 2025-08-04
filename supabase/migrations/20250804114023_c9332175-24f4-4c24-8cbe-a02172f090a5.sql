-- Add image_url column to promotions table
ALTER TABLE public.promotions 
ADD COLUMN image_url text;

-- Create storage bucket for promotion images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('promotion-images', 'promotion-images', true);

-- Create policies for promotion images
CREATE POLICY "Anyone can view promotion images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'promotion-images');

CREATE POLICY "Admins can upload promotion images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'promotion-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update promotion images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'promotion-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete promotion images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'promotion-images' AND has_role(auth.uid(), 'admin'::app_role));