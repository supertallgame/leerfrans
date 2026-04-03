
CREATE OR REPLACE FUNCTION public.list_all_users()
RETURNS TABLE(id uuid, email text, created_at timestamp with time zone)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT au.id, au.email::text, au.created_at
  FROM auth.users au
  ORDER BY au.created_at DESC;
$$;
