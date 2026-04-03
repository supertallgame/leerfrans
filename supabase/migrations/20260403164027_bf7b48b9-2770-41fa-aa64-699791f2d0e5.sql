
CREATE OR REPLACE FUNCTION public.get_admin_emails()
RETURNS text[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT array_agg(DISTINCT e) FROM (
    SELECT unnest(ARRAY['brankovantland@gmail.com', 'branko18vantland@gmail.com']) AS e
    UNION
    SELECT email FROM public.user_roles WHERE role = 'admin'
  ) sub;
$$;
