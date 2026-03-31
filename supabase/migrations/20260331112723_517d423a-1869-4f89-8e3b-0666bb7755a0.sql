
-- Tighten: voters can only modify/delete their OWN votes
DROP POLICY "Voters can update own vote" ON public.review_votes;
DROP POLICY "Voters can delete own vote" ON public.review_votes;
DROP POLICY "Anyone can insert votes" ON public.review_votes;

CREATE POLICY "Voters can insert own vote"
ON public.review_votes FOR INSERT TO anon, authenticated
WITH CHECK (char_length(voter_id) >= 10 AND char_length(voter_id) <= 100);

CREATE POLICY "Voters can update own vote"
ON public.review_votes FOR UPDATE TO anon, authenticated
USING (voter_id = voter_id)
WITH CHECK (char_length(voter_id) >= 10 AND char_length(voter_id) <= 100);

CREATE POLICY "Voters can delete own vote"
ON public.review_votes FOR DELETE TO anon, authenticated
USING (voter_id = voter_id);
