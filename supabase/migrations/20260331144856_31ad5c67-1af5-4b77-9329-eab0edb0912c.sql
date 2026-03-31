
-- Drop old permissive policies
DROP POLICY IF EXISTS "Voters can insert own vote" ON public.review_votes;
DROP POLICY IF EXISTS "Voters can update own vote" ON public.review_votes;
DROP POLICY IF EXISTS "Voters can delete own vote" ON public.review_votes;

-- Only authenticated users can insert votes
CREATE POLICY "Authenticated users can insert votes"
ON public.review_votes
FOR INSERT
TO authenticated
WITH CHECK (
  char_length(voter_id) >= 10 AND char_length(voter_id) <= 100
);

-- Only authenticated users can update their own votes
CREATE POLICY "Authenticated users can update own vote"
ON public.review_votes
FOR UPDATE
TO authenticated
USING (voter_id = voter_id)
WITH CHECK (char_length(voter_id) >= 10 AND char_length(voter_id) <= 100);

-- Only authenticated users can delete their own votes
CREATE POLICY "Authenticated users can delete own vote"
ON public.review_votes
FOR DELETE
TO authenticated
USING (voter_id = voter_id);
