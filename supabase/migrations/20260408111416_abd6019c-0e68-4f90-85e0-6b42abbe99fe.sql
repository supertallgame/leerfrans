
-- Create a security definer function to check head_admin role without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.is_head_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'head_admin'
  )
$$;

-- Drop the old recursive policies
DROP POLICY IF EXISTS "Head admins can read roles" ON public.user_roles;
DROP POLICY IF EXISTS "Head admins can insert admin roles" ON public.user_roles;
DROP POLICY IF EXISTS "Head admins can delete admin roles" ON public.user_roles;

-- Re-create policies using the security definer function
CREATE POLICY "Head admins can read roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (public.is_head_admin(auth.uid()));

CREATE POLICY "Head admins can insert admin roles"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    role = 'admin' AND public.is_head_admin(auth.uid())
  );

CREATE POLICY "Head admins can delete admin roles"
  ON public.user_roles
  FOR DELETE
  TO authenticated
  USING (
    role = 'admin' AND public.is_head_admin(auth.uid())
  );
