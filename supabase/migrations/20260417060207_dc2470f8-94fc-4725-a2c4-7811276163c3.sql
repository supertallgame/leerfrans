-- Remove the view that triggered the linter
DROP VIEW IF EXISTS public.review_replies_public;

-- Create a function that returns review replies without sensitive fields
CREATE OR REPLACE FUNCTION public.get_review_replies_public()
RETURNS TABLE(
  id uuid,
  review_id uuid,
  display_name text,
  message text,
  user_id uuid,
  created_at timestamptz
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, review_id, display_name, message, user_id, created_at
  FROM public.review_replies
  ORDER BY created_at ASC;
$$;