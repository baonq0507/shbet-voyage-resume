-- Drop the existing incorrect policy
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;

-- Create a new policy that matches the filename pattern: user_id-timestamp.ext
CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = split_part(name, '-', 1)
);

-- Also update the update/delete policies to match
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = split_part(name, '-', 1)
);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = split_part(name, '-', 1)
);