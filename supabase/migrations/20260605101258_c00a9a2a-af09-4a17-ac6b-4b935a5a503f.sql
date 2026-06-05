-- Allow Eminem role
ALTER POLICY "Owners can insert roles" ON public.user_roles
  WITH CHECK (
    ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['brankovantland@gmail.com'::text, 'branko18vantland@gmail.com'::text]))
    AND (role = ANY (ARRAY['admin','head_admin','tester','head_tester','eminem']))
  );

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = _user_id
        AND email = ANY(ARRAY['brankovantland@gmail.com','branko18vantland@gmail.com'])
    )
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = _user_id
        AND role IN ('admin','head_admin','tester','head_tester','eminem')
    )
$function$;

CREATE OR REPLACE FUNCTION public.get_admin_emails()
 RETURNS text[]
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT array_agg(DISTINCT e) FROM (
    SELECT unnest(ARRAY['brankovantland@gmail.com','branko18vantland@gmail.com']) AS e
    UNION
    SELECT email FROM public.user_roles WHERE role IN ('admin','head_admin','tester','head_tester')
  ) sub;
$function$;

CREATE OR REPLACE FUNCTION public.get_my_staff_role()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT CASE
    WHEN public.is_owner(auth.uid()) THEN 'owner'
    WHEN public.is_head_admin(auth.uid()) THEN 'head_admin'
    WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin') THEN 'admin'
    WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'head_tester') THEN 'head_tester'
    WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'tester') THEN 'tester'
    WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'eminem') THEN 'eminem'
    ELSE NULL
  END;
$function$;