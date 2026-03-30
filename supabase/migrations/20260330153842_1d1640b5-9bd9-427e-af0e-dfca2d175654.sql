-- Drop the overly permissive upload policy
DROP POLICY IF EXISTS "Anyone can upload review images" ON storage.objects;

-- Create a restricted upload policy: only image extensions, short path names
CREATE POLICY "Anyone can upload review images"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'review-images'
  AND (storage.filename(name) ~* '\.(jpg|jpeg|png|gif|webp)$')
  AND octet_length(name) < 200
);