CREATE POLICY "Admins can delete any vote"
ON public.review_votes
FOR DELETE
TO authenticated
USING (
  (auth.jwt() ->> 'email'::text) = ANY (ARRAY[
    'brankovantland@gmail.com'::text,
    'branko18vantland@gmail.com'::text,
    'tamoopdam@gmail.com'::text,
    'jack.ouwerkerk@vsodaafgeluk.nl'::text
  ])
);