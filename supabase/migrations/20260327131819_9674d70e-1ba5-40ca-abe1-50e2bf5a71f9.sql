
CREATE OR REPLACE FUNCTION public.rate_limit_reviews()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  recent_count integer;
BEGIN
  SELECT count(*) INTO recent_count
  FROM public.reviews
  WHERE display_name = NEW.display_name
    AND created_at > now() - interval '5 minutes';

  IF recent_count >= 2 THEN
    RAISE EXCEPTION 'Too many reviews. Please wait before posting again.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER check_review_rate_limit
  BEFORE INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.rate_limit_reviews();
