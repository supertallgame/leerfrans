
DROP POLICY IF EXISTS "Anyone can insert reviews" ON public.reviews;
CREATE POLICY "Anyone can insert reviews"
ON public.reviews
FOR INSERT
TO anon, authenticated
WITH CHECK (
  (char_length(display_name) >= 1 AND char_length(display_name) <= 50)
  AND (rating >= 1 AND rating <= 5)
  AND (char_length(message) >= 1 AND char_length(message) <= 500)
  AND (
    (auth.uid() IS NULL AND user_email IS NULL AND user_id IS NULL)
    OR
    (auth.uid() IS NOT NULL AND (user_email IS NULL OR user_email = (auth.jwt() ->> 'email')) AND (user_id IS NULL OR user_id = auth.uid()))
  )
);
