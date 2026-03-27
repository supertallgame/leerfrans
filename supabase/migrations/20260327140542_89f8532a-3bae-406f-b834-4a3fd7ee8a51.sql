
-- Restrict SELECT on reviews to admins only; public reads use reviews_public view
DROP POLICY IF EXISTS "Public can read reviews" ON public.reviews;
CREATE POLICY "Admins can read reviews"
ON public.reviews
FOR SELECT
TO authenticated
USING (
  (auth.jwt() ->> 'email') = ANY(ARRAY['brankovantland@gmail.com','branko18vantland@gmail.com','tamoopdam@gmail.com','jack.ouwerkerk@vsodaafgeluk.nl'])
);
