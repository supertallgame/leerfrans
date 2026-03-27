
-- Allow public reads on reviews table (the view strips sensitive columns)
CREATE POLICY "Public can read reviews"
ON public.reviews
FOR SELECT
TO anon, authenticated
USING (true);
