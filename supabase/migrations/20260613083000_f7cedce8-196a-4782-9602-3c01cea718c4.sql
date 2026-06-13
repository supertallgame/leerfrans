
CREATE TABLE public.staff_warnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  sender_email TEXT NOT NULL,
  recipient_id UUID NOT NULL,
  recipient_email TEXT NOT NULL,
  role_target TEXT NOT NULL CHECK (role_target IN ('admin','tester')),
  reason TEXT NOT NULL,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_warnings TO authenticated;
GRANT ALL ON public.staff_warnings TO service_role;

ALTER TABLE public.staff_warnings ENABLE ROW LEVEL SECURITY;

-- Recipient can read own warnings
CREATE POLICY "Recipients view own warnings"
ON public.staff_warnings FOR SELECT TO authenticated
USING (recipient_id = auth.uid());

-- Senders (head admin/head tester/owner) can view what they sent and their domain
CREATE POLICY "Head staff view domain warnings"
ON public.staff_warnings FOR SELECT TO authenticated
USING (
  public.is_owner(auth.uid())
  OR (role_target = 'admin' AND public.is_head_admin(auth.uid()))
  OR (role_target = 'tester' AND public.is_head_tester(auth.uid()))
);

-- Insert: head admin -> admin; head tester -> tester; owner -> both
CREATE POLICY "Head staff send warnings"
ON public.staff_warnings FOR INSERT TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND (
    public.is_owner(auth.uid())
    OR (role_target = 'admin' AND public.is_head_admin(auth.uid()))
    OR (role_target = 'tester' AND public.is_head_tester(auth.uid()))
  )
);

-- Recipient can acknowledge (mark read)
CREATE POLICY "Recipients acknowledge own"
ON public.staff_warnings FOR UPDATE TO authenticated
USING (recipient_id = auth.uid())
WITH CHECK (recipient_id = auth.uid());

-- Sender or owner can delete
CREATE POLICY "Senders delete warnings"
ON public.staff_warnings FOR DELETE TO authenticated
USING (sender_id = auth.uid() OR public.is_owner(auth.uid()));
