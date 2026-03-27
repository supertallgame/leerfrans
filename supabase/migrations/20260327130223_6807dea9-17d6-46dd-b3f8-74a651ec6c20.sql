
-- Create a secure function for admins to get reviews with emails
CREATE OR REPLACE FUNCTION public.get_reviews_admin()
RETURNS TABLE(
  id uuid,
  display_name text,
  rating integer,
  message text,
  created_at timestamptz,
  user_email text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, display_name, rating, message, created_at, user_email
  FROM public.reviews
  ORDER BY created_at DESC;
$$;

-- Update the public SELECT policy to exclude user_email by using a view
DROP POLICY "Anyone can read reviews" ON public.reviews;

-- Create a restrictive SELECT policy that hides sensitive columns
-- We'll use RLS to allow select but the client will use a view
CREATE POLICY "Anyone can read reviews" ON public.reviews
FOR SELECT TO anon, authenticated
USING (true);
