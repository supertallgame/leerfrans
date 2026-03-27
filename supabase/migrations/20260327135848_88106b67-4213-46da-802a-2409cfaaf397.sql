
-- Create a public view that omits user_email
CREATE OR REPLACE VIEW public.reviews_public AS
SELECT id, display_name, rating, message, created_at, user_id
FROM public.reviews;

-- Restrict direct SELECT to admins only
DROP POLICY IF EXISTS "Anyone can read reviews" ON public.reviews;
CREATE POLICY "Admins can read reviews"
ON public.reviews
FOR SELECT
TO authenticated
USING ((auth.jwt() ->> 'email') = ANY(ARRAY['brankovantland@gmail.com','branko18vantland@gmail.com','tamoopdam@gmail.com','jack.ouwerkerk@vsodaafgeluk.nl']));

-- Allow anon+authenticated to read the safe view
CREATE POLICY "Anyone can read reviews_public"
ON public.reviews
FOR SELECT
TO anon, authenticated
USING (true);
