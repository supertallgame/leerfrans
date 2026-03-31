
DROP POLICY IF EXISTS "Authenticated users can insert votes" ON public.review_votes;
DROP POLICY IF EXISTS "Authenticated users can update own vote" ON public.review_votes;
DROP POLICY IF EXISTS "Authenticated users can delete own vote" ON public.review_votes;

CREATE POLICY "Authenticated users can insert votes"
ON public.review_votes
FOR INSERT
TO authenticated
WITH CHECK (voter_id = auth.uid()::text);

CREATE POLICY "Authenticated users can update own vote"
ON public.review_votes
FOR UPDATE
TO authenticated
USING (voter_id = auth.uid()::text)
WITH CHECK (voter_id = auth.uid()::text);

CREATE POLICY "Authenticated users can delete own vote"
ON public.review_votes
FOR DELETE
TO authenticated
USING (voter_id = auth.uid()::text);
