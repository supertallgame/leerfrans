
-- Restrict reply INSERT to admins or the review owner
DROP POLICY IF EXISTS "Authenticated users can insert replies" ON public.review_replies;
CREATE POLICY "Admins or review owner can insert replies"
ON public.review_replies
FOR INSERT
TO authenticated
WITH CHECK (
  (char_length(display_name) >= 1 AND char_length(display_name) <= 50 AND char_length(message) >= 1 AND char_length(message) <= 500)
  AND (
    -- Admin
    (auth.jwt() ->> 'email') = ANY(ARRAY['brankovantland@gmail.com','branko18vantland@gmail.com','tamoopdam@gmail.com','jack.ouwerkerk@vsodaafgeluk.nl'])
    OR
    -- Owner of the review being replied to
    EXISTS (SELECT 1 FROM public.reviews WHERE id = review_id AND user_id = auth.uid())
  )
);
