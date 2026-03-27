
-- Update review rate limit to also check by user_id
CREATE OR REPLACE FUNCTION public.rate_limit_reviews()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  recent_count integer;
BEGIN
  -- Check by user_id if authenticated
  IF auth.uid() IS NOT NULL THEN
    SELECT count(*) INTO recent_count
    FROM public.reviews
    WHERE user_id = auth.uid()
      AND created_at > now() - interval '5 minutes';
    IF recent_count >= 2 THEN
      RAISE EXCEPTION 'Too many reviews. Please wait before posting again.';
    END IF;
  END IF;

  -- Also check by display_name
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

-- Update reply rate limit to check by auth.uid()
CREATE OR REPLACE FUNCTION public.rate_limit_replies()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  recent_count integer;
  current_uid uuid;
BEGIN
  current_uid := auth.uid();

  -- Check by user_id if authenticated
  IF current_uid IS NOT NULL THEN
    SELECT count(*) INTO recent_count
    FROM public.review_replies r
    JOIN public.reviews rv ON rv.id = r.review_id
    WHERE rv.user_id = current_uid
      AND r.created_at > now() - interval '1 minute';
    -- Also count by matching display_name from this user
    SELECT count(*) INTO recent_count
    FROM public.review_replies
    WHERE display_name = NEW.display_name
      AND created_at > now() - interval '1 minute';
    IF recent_count >= 3 THEN
      RAISE EXCEPTION 'Too many replies. Please wait before posting again.';
    END IF;
  ELSE
    SELECT count(*) INTO recent_count
    FROM public.review_replies
    WHERE display_name = NEW.display_name
      AND created_at > now() - interval '1 minute';
    IF recent_count >= 3 THEN
      RAISE EXCEPTION 'Too many replies. Please wait before posting again.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
