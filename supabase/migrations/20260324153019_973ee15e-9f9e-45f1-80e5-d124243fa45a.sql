CREATE OR REPLACE FUNCTION public.rate_limit_replies()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  recent_count integer;
BEGIN
  SELECT count(*) INTO recent_count
  FROM public.review_replies
  WHERE display_name = NEW.display_name
    AND created_at > now() - interval '1 minute';

  IF recent_count >= 3 THEN
    RAISE EXCEPTION 'Too many replies. Please wait before posting again.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_reply_rate_limit
  BEFORE INSERT ON public.review_replies
  FOR EACH ROW
  EXECUTE FUNCTION public.rate_limit_replies();