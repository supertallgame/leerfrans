
-- Drop the existing permissive insert policy
DROP POLICY IF EXISTS "Anyone can insert replies" ON public.review_replies;

-- Create a new insert policy restricted to authenticated users only
CREATE POLICY "Authenticated users can insert replies"
ON public.review_replies
FOR INSERT
TO authenticated
WITH CHECK (
  (char_length(display_name) >= 1) AND (char_length(display_name) <= 50)
  AND (char_length(message) >= 1) AND (char_length(message) <= 500)
);
