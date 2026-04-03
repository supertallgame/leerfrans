
-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL DEFAULT 'admin',
  email text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Only owners can read
CREATE POLICY "Owners can read roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'email') IN ('brankovantland@gmail.com', 'branko18vantland@gmail.com'));

-- Only owners can insert
CREATE POLICY "Owners can insert roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() ->> 'email') IN ('brankovantland@gmail.com', 'branko18vantland@gmail.com'));

-- Only owners can delete
CREATE POLICY "Owners can delete roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING ((auth.jwt() ->> 'email') IN ('brankovantland@gmail.com', 'branko18vantland@gmail.com'));

-- Create a function to look up if an email is admin (checking both hardcoded + user_roles)
CREATE OR REPLACE FUNCTION public.get_admin_emails()
RETURNS text[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT array_agg(DISTINCT e) FROM (
    SELECT unnest(ARRAY['brankovantland@gmail.com', 'branko18vantland@gmail.com', 'tamoopdam@gmail.com', 'jack.ouwerkerk@vsodaafgeluk.nl']) AS e
    UNION
    SELECT email FROM public.user_roles WHERE role = 'admin'
  ) sub;
$$;

-- Create function to find user_id by email
CREATE OR REPLACE FUNCTION public.find_user_by_email(p_email text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM auth.users WHERE email = p_email LIMIT 1;
$$;
