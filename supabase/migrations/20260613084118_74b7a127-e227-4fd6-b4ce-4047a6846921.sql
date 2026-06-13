
-- Prevent vote abuse by tracking voter email persistently
ALTER TABLE public.poll_votes ADD COLUMN IF NOT EXISTS voter_email text;

-- Backfill existing votes from auth.users
UPDATE public.poll_votes pv
SET voter_email = lower(au.email)
FROM auth.users au
WHERE pv.user_id = au.id AND pv.voter_email IS NULL;

-- Trigger to auto-set voter_email from JWT on insert/update
CREATE OR REPLACE FUNCTION public.set_poll_vote_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.voter_email := lower(coalesce(auth.jwt() ->> 'email', NEW.voter_email));
  IF NEW.voter_email IS NULL OR NEW.voter_email = '' THEN
    RAISE EXCEPTION 'voter email required';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_poll_vote_email_trg ON public.poll_votes;
CREATE TRIGGER set_poll_vote_email_trg
BEFORE INSERT OR UPDATE ON public.poll_votes
FOR EACH ROW EXECUTE FUNCTION public.set_poll_vote_email();

-- Deduplicate any existing duplicates before unique constraint
DELETE FROM public.poll_votes a
USING public.poll_votes b
WHERE a.ctid < b.ctid
  AND a.poll_id = b.poll_id
  AND a.voter_email = b.voter_email;

-- Unique per poll per email — survives account deletion
CREATE UNIQUE INDEX IF NOT EXISTS poll_votes_poll_email_unique
ON public.poll_votes (poll_id, voter_email);
