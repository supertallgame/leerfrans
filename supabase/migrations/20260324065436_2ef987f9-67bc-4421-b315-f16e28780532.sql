CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text NOT NULL,
  rating integer NOT NULL,
  message text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews
CREATE POLICY "Anyone can read reviews" ON public.reviews
  FOR SELECT TO anon, authenticated
  USING (true);

-- Anyone can insert reviews
CREATE POLICY "Anyone can insert reviews" ON public.reviews
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(display_name) BETWEEN 1 AND 50
    AND rating BETWEEN 1 AND 5
    AND char_length(message) BETWEEN 1 AND 500
  );

-- Validation trigger for rating
CREATE OR REPLACE FUNCTION public.validate_review()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.rating < 1 OR NEW.rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;
  IF char_length(NEW.display_name) < 1 OR char_length(NEW.display_name) > 50 THEN
    RAISE EXCEPTION 'Name must be between 1 and 50 characters';
  END IF;
  IF char_length(NEW.message) < 1 OR char_length(NEW.message) > 500 THEN
    RAISE EXCEPTION 'Message must be between 1 and 500 characters';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_review_trigger
  BEFORE INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.validate_review();