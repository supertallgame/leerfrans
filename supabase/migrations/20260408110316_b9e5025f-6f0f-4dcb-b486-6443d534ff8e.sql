
-- Update get_admin_emails to include head_admin role
CREATE OR REPLACE FUNCTION public.get_admin_emails()
 RETURNS text[]
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT array_agg(DISTINCT e) FROM (
    SELECT unnest(ARRAY['brankovantland@gmail.com', 'branko18vantland@gmail.com']) AS e
    UNION
    SELECT email FROM public.user_roles WHERE role IN ('admin', 'head_admin')
  ) sub;
$$;

-- Allow owners to also manage head_admin roles (existing policies already cover this since they check owner emails)
-- Add policy for head_admins to read user_roles (so they can see admins)
CREATE POLICY "Head admins can read roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'head_admin'
    )
  );

-- Allow head_admins to insert admin roles
CREATE POLICY "Head admins can insert admin roles"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    role = 'admin' AND
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'head_admin'
    )
  );

-- Allow head_admins to delete admin roles (not head_admin or owner)
CREATE POLICY "Head admins can delete admin roles"
  ON public.user_roles
  FOR DELETE
  TO authenticated
  USING (
    role = 'admin' AND
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'head_admin'
    )
  );
