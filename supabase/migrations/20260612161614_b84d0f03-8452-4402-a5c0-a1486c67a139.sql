
CREATE TABLE public.staff_action_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_user_id UUID,
  actor_email TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX staff_action_logs_created_at_idx ON public.staff_action_logs (created_at DESC);
CREATE INDEX staff_action_logs_actor_email_idx ON public.staff_action_logs (actor_email);

GRANT SELECT, INSERT ON public.staff_action_logs TO authenticated;
GRANT ALL ON public.staff_action_logs TO service_role;

ALTER TABLE public.staff_action_logs ENABLE ROW LEVEL SECURITY;

-- Only owners can read logs
CREATE POLICY "Owners can read all staff logs"
ON public.staff_action_logs
FOR SELECT
TO authenticated
USING (public.is_owner(auth.uid()));

-- Staff can insert log rows about themselves
CREATE POLICY "Staff can insert their own log rows"
ON public.staff_action_logs
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = actor_user_id
  AND public.is_staff(auth.uid())
);
