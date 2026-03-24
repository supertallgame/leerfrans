CREATE TABLE public.review_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  message text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.review_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read replies"
ON public.review_replies FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Anyone can insert replies"
ON public.review_replies FOR INSERT
TO anon, authenticated
WITH CHECK (
  char_length(display_name) >= 1 AND char_length(display_name) <= 50
  AND char_length(message) >= 1 AND char_length(message) <= 500
);

CREATE POLICY "Operator can delete replies"
ON public.review_replies FOR DELETE
TO authenticated
USING (auth.jwt() ->> 'email' = 'brankovantland@gmail.com');