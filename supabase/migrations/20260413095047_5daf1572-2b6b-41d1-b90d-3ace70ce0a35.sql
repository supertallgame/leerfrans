
DROP POLICY IF EXISTS "Admins or review owner can insert replies" ON public.review_replies;

CREATE POLICY "Authenticated users can insert replies"
ON public.review_replies
FOR INSERT
TO authenticated
WITH CHECK (
  char_length(display_name) >= 1 AND char_length(display_name) <= 50
  AND char_length(message) >= 1 AND char_length(message) <= 500
  AND (user_id IS NULL OR user_id = auth.uid())
);
