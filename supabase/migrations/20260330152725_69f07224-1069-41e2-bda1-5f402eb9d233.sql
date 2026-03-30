-- Create storage bucket for review images
INSERT INTO storage.buckets (id, name, public) VALUES ('review-images', 'review-images', true);

-- Allow anyone to upload to review-images bucket (max 2MB images enforced client-side)
CREATE POLICY "Anyone can upload review images"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'review-images');

-- Allow anyone to view review images
CREATE POLICY "Anyone can view review images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'review-images');

-- Allow admins to delete review images
CREATE POLICY "Admins can delete review images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'review-images'
  AND (auth.jwt() ->> 'email'::text) = ANY (ARRAY['brankovantland@gmail.com', 'branko18vantland@gmail.com', 'tamoopdam@gmail.com', 'jack.ouwerkerk@vsodaafgeluk.nl'])
);

-- Add image_url column to reviews
ALTER TABLE public.reviews ADD COLUMN image_url text;

-- Recreate reviews_public view to include image_url
DROP VIEW IF EXISTS public.reviews_public;
CREATE VIEW public.reviews_public AS
  SELECT id, display_name, rating, message, created_at, image_url
  FROM public.reviews;