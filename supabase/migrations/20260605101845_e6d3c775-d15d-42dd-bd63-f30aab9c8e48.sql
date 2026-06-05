
-- RPC so staff (incl. non-owners) can fetch roles for visible chat senders
CREATE OR REPLACE FUNCTION public.get_staff_user_roles(_user_ids uuid[])
RETURNS TABLE(user_id uuid, role text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ur.user_id, ur.role
  FROM public.user_roles ur
  WHERE ur.user_id = ANY(_user_ids)
    AND public.is_staff(auth.uid());
$$;

GRANT EXECUTE ON FUNCTION public.get_staff_user_roles(uuid[]) TO authenticated;

-- Broadcast role changes to everyone via a public channel-friendly notification table
-- Using realtime on user_roles directly requires SELECT RLS — easier: enable replica + broadcast event row id only
ALTER TABLE public.user_roles REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'user_roles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_roles;
  END IF;
END $$;

-- Allow staff to see role rows (read-only) so realtime postgres_changes delivers payloads
CREATE POLICY "Staff can read user_roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.is_staff(auth.uid()));
