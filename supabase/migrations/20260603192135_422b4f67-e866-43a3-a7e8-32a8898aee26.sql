
-- Helper: is user head_tester
CREATE OR REPLACE FUNCTION public.is_head_tester(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'head_tester'
  )
$$;

-- is_tester now also true for head_tester (cascading tester rights)
CREATE OR REPLACE FUNCTION public.is_tester(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('tester','head_tester')
  )
$$;

-- is_staff includes head_tester
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = _user_id
        AND email = ANY(ARRAY['brankovantland@gmail.com','branko18vantland@gmail.com'])
    )
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = _user_id
        AND role IN ('admin','head_admin','tester','head_tester')
    )
$$;

-- Surface head_tester in staff role helper
CREATE OR REPLACE FUNCTION public.get_my_staff_role()
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT CASE
    WHEN public.is_owner(auth.uid()) THEN 'owner'
    WHEN public.is_head_admin(auth.uid()) THEN 'head_admin'
    WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin') THEN 'admin'
    WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'head_tester') THEN 'head_tester'
    WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'tester') THEN 'tester'
    ELSE NULL
  END;
$$;

-- get_admin_emails includes head_tester
CREATE OR REPLACE FUNCTION public.get_admin_emails()
RETURNS text[]
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT array_agg(DISTINCT e) FROM (
    SELECT unnest(ARRAY['brankovantland@gmail.com','branko18vantland@gmail.com']) AS e
    UNION
    SELECT email FROM public.user_roles WHERE role IN ('admin','head_admin','tester','head_tester')
  ) sub;
$$;

-- Allow owners to insert head_tester too
DROP POLICY IF EXISTS "Owners can insert roles" ON public.user_roles;
CREATE POLICY "Owners can insert roles"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() ->> 'email') = ANY(ARRAY['brankovantland@gmail.com','branko18vantland@gmail.com'])
    AND role IN ('admin','head_admin','tester','head_tester')
  );

-- Head testers can SELECT only tester rows so the dashboard shows them
DROP POLICY IF EXISTS "Head testers can read tester roles" ON public.user_roles;
CREATE POLICY "Head testers can read tester roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (
    role = 'tester' AND public.is_head_tester(auth.uid())
  );

-- Head testers can INSERT tester roles (cannot escalate)
DROP POLICY IF EXISTS "Head testers can insert tester roles" ON public.user_roles;
CREATE POLICY "Head testers can insert tester roles"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    role = 'tester'
    AND public.is_head_tester(auth.uid())
    AND NOT public.is_owner(user_id)
  );

-- Head testers can DELETE tester roles (demote)
DROP POLICY IF EXISTS "Head testers can delete tester roles" ON public.user_roles;
CREATE POLICY "Head testers can delete tester roles"
  ON public.user_roles
  FOR DELETE
  TO authenticated
  USING (
    role = 'tester' AND public.is_head_tester(auth.uid())
  );
