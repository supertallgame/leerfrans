
ALTER TABLE public.staff_warnings DROP CONSTRAINT IF EXISTS staff_warnings_role_target_check;
ALTER TABLE public.staff_warnings ADD CONSTRAINT staff_warnings_role_target_check
  CHECK (role_target = ANY (ARRAY['admin'::text, 'tester'::text, 'head_admin'::text, 'head_tester'::text, 'member'::text]));

DROP POLICY IF EXISTS "Head staff send warnings" ON public.staff_warnings;
DROP POLICY IF EXISTS "Head staff view domain warnings" ON public.staff_warnings;

CREATE POLICY "Head staff send warnings"
  ON public.staff_warnings FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND (
      public.is_owner(auth.uid())
      OR (role_target = 'admin'   AND public.is_head_admin(auth.uid()))
      OR (role_target = 'tester'  AND public.is_head_tester(auth.uid()))
      OR (role_target = 'member'  AND (public.is_head_admin(auth.uid()) OR public.is_head_tester(auth.uid())))
    )
  );

CREATE POLICY "Head staff view domain warnings"
  ON public.staff_warnings FOR SELECT
  USING (
    public.is_owner(auth.uid())
    OR (role_target = 'admin'   AND public.is_head_admin(auth.uid()))
    OR (role_target = 'tester'  AND public.is_head_tester(auth.uid()))
    OR (role_target = 'member'  AND (public.is_head_admin(auth.uid()) OR public.is_head_tester(auth.uid())))
  );
