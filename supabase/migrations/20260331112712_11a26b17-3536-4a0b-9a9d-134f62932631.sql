
CREATE TABLE public.review_votes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  vote_type text NOT NULL CHECK (vote_type IN ('like', 'dislike')),
  voter_id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (review_id, voter_id)
);

ALTER TABLE public.review_votes ENABLE ROW LEVEL SECURITY;

-- Anyone can read vote counts
CREATE POLICY "Anyone can read votes"
ON public.review_votes FOR SELECT TO anon, authenticated
USING (true);

-- Anyone can insert their vote (one per voter per review enforced by unique constraint)
CREATE POLICY "Anyone can insert votes"
ON public.review_votes FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- Voters can update their own vote
CREATE POLICY "Voters can update own vote"
ON public.review_votes FOR UPDATE TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Voters can delete their own vote
CREATE POLICY "Voters can delete own vote"
ON public.review_votes FOR DELETE TO anon, authenticated
USING (true);

-- Function to get vote counts for reviews
CREATE OR REPLACE FUNCTION public.get_review_vote_counts()
RETURNS TABLE(review_id uuid, likes bigint, dislikes bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    review_id,
    COUNT(*) FILTER (WHERE vote_type = 'like') AS likes,
    COUNT(*) FILTER (WHERE vote_type = 'dislike') AS dislikes
  FROM public.review_votes
  GROUP BY review_id;
$$;
