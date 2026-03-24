CREATE POLICY "Operator can delete reviews"
ON public.reviews
FOR DELETE
TO authenticated
USING (auth.jwt() ->> 'email' = 'brankovantland@gmail.com');