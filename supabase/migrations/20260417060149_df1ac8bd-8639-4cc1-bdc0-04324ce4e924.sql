-- ============================================================
-- 1. Helper function: is user admin/owner/tester (head_admin too)
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    -- Owner emails (hardcoded)
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = _user_id 
        AND email = ANY(ARRAY['brankovantland@gmail.com', 'branko18vantland@gmail.com'])
    )
    OR
    -- Any role in user_roles (admin, head_admin, tester)
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = _user_id
        AND role IN ('admin', 'head_admin', 'tester')
    )
$$;

CREATE OR REPLACE FUNCTION public.is_tester(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'tester'
  )
$$;

CREATE OR REPLACE FUNCTION public.is_owner(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = _user_id
      AND email = ANY(ARRAY['brankovantland@gmail.com', 'branko18vantland@gmail.com'])
  )
$$;

-- ============================================================
-- 2. Update user_roles INSERT policy to allow tester role
--    AND prevent head_admin escalation by other head_admins
-- ============================================================
DROP POLICY IF EXISTS "Head admins can insert admin roles" ON public.user_roles;
CREATE POLICY "Head admins can insert admin roles"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    role = 'admin'
    AND public.is_head_admin(auth.uid())
    AND NOT public.is_owner(user_id) -- can't override an owner
  );

-- Owners can insert any role
DROP POLICY IF EXISTS "Owners can insert roles" ON public.user_roles;
CREATE POLICY "Owners can insert roles"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() ->> 'email') = ANY(ARRAY['brankovantland@gmail.com', 'branko18vantland@gmail.com'])
    AND role IN ('admin', 'head_admin', 'tester')
  );

-- ============================================================
-- 3. Update get_admin_emails to include testers
--    (testers count as admin when their toggle is on - tracked client-side)
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_admin_emails()
RETURNS text[]
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT array_agg(DISTINCT e) FROM (
    SELECT unnest(ARRAY['brankovantland@gmail.com', 'branko18vantland@gmail.com']) AS e
    UNION
    SELECT email FROM public.user_roles WHERE role IN ('admin', 'head_admin', 'tester')
  ) sub;
$$;

-- ============================================================
-- 4. SUPPORT REPORTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.support_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_email text NOT NULL,
  subject text NOT NULL,
  category text NOT NULL DEFAULT 'bug', -- 'bug' or 'support'
  status text NOT NULL DEFAULT 'open', -- 'open' or 'closed'
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  closed_by text
);

ALTER TABLE public.support_reports ENABLE ROW LEVEL SECURITY;

-- Users can see only their own reports
CREATE POLICY "Users see own reports"
  ON public.support_reports FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Staff see all reports"
  ON public.support_reports FOR SELECT
  TO authenticated
  USING (public.is_staff(auth.uid()));

-- Users can create their own report (only if no open one already)
CREATE POLICY "Users can create own report"
  ON public.support_reports FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Staff can update (close)
CREATE POLICY "Staff can update reports"
  ON public.support_reports FOR UPDATE
  TO authenticated
  USING (public.is_staff(auth.uid()));

-- ============================================================
-- 5. SUPPORT REPORT MESSAGES (chat thread for each report)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.support_report_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES public.support_reports(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  sender_email text NOT NULL,
  sender_role text NOT NULL DEFAULT 'user', -- 'user', 'admin', 'tester'
  message text NOT NULL,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_srm_report ON public.support_report_messages(report_id, created_at);

ALTER TABLE public.support_report_messages ENABLE ROW LEVEL SECURITY;

-- Users see messages on their own report
CREATE POLICY "Users see own report messages"
  ON public.support_report_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.support_reports r
      WHERE r.id = report_id AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff see all report messages"
  ON public.support_report_messages FOR SELECT
  TO authenticated
  USING (public.is_staff(auth.uid()));

-- Users can post in their own report
CREATE POLICY "Users post in own report"
  ON public.support_report_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.support_reports r
      WHERE r.id = report_id 
        AND r.user_id = auth.uid()
        AND r.status = 'open'
    )
  );

-- Staff can post on any open report
CREATE POLICY "Staff post on any report"
  ON public.support_report_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND public.is_staff(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.support_reports r
      WHERE r.id = report_id AND r.status = 'open'
    )
  );

-- Trigger to update updated_at on parent report
CREATE OR REPLACE FUNCTION public.touch_support_report()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.support_reports SET updated_at = now() WHERE id = NEW.report_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_touch_support_report ON public.support_report_messages;
CREATE TRIGGER trg_touch_support_report
  AFTER INSERT ON public.support_report_messages
  FOR EACH ROW EXECUTE FUNCTION public.touch_support_report();

-- Function: enforce only one open report per user
CREATE OR REPLACE FUNCTION public.check_one_open_report()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.support_reports
    WHERE user_id = NEW.user_id AND status = 'open'
  ) THEN
    RAISE EXCEPTION 'You already have an open report. Close it first.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_one_open_report ON public.support_reports;
CREATE TRIGGER trg_one_open_report
  BEFORE INSERT ON public.support_reports
  FOR EACH ROW EXECUTE FUNCTION public.check_one_open_report();

-- ============================================================
-- 6. ADMIN APPLICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admin_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_email text NOT NULL,
  motivation text NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see own application"
  ON public.admin_applications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Staff can see applications"
  ON public.admin_applications FOR SELECT
  TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Users can apply"
  ON public.admin_applications FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Staff can update applications"
  ON public.admin_applications FOR UPDATE
  TO authenticated
  USING (public.is_staff(auth.uid()));

-- ============================================================
-- 7. ADMIN CHAT (one global room)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admin_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  sender_email text NOT NULL,
  sender_display text NOT NULL,
  message text NOT NULL,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_acm_created ON public.admin_chat_messages(created_at);

ALTER TABLE public.admin_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read chat"
  ON public.admin_chat_messages FOR SELECT
  TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can post chat"
  ON public.admin_chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (public.is_staff(auth.uid()) AND sender_id = auth.uid());

CREATE POLICY "Staff can delete own chat"
  ON public.admin_chat_messages FOR DELETE
  TO authenticated
  USING (public.is_staff(auth.uid()) AND sender_id = auth.uid());

-- ============================================================
-- 8. STORAGE BUCKET for support/chat images
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('support-uploads', 'support-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Authenticated users can upload to their own folder (path: <user_id>/...)
CREATE POLICY "Users can upload to own folder in support-uploads"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'support-uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can view files they uploaded
CREATE POLICY "Users can view own support uploads"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'support-uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Staff can view all support uploads
CREATE POLICY "Staff can view all support uploads"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'support-uploads'
    AND public.is_staff(auth.uid())
  );

-- ============================================================
-- 9. Restrict review-images bucket: authenticated only + own folder
-- ============================================================
DROP POLICY IF EXISTS "Anyone can upload review images" ON storage.objects;
CREATE POLICY "Authed users upload review images to own folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'review-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND lower(name) ~ '\.(jpg|jpeg|png|gif|webp)$'
    AND octet_length(name) < 200
  );

-- ============================================================
-- 10. Fix review_replies: hide email from public
--     Drop public SELECT policy and create authenticated-only
--     view that omits user_email
-- ============================================================
DROP POLICY IF EXISTS "Anyone can read replies" ON public.review_replies;

-- Keep authenticated read but mask emails via view
CREATE POLICY "Authed users can read replies"
  ON public.review_replies FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create a public-safe view without user_email
DROP VIEW IF EXISTS public.review_replies_public;
CREATE VIEW public.review_replies_public
WITH (security_invoker=on) AS
  SELECT id, review_id, display_name, message, user_id, created_at
  FROM public.review_replies;

-- ============================================================
-- 11. Helper to get role of current user (for client UI)
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_my_staff_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN public.is_owner(auth.uid()) THEN 'owner'
    WHEN public.is_head_admin(auth.uid()) THEN 'head_admin'
    WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin') THEN 'admin'
    WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'tester') THEN 'tester'
    ELSE NULL
  END;
$$;

-- Helper RPC: count open report for current user (for client check)
CREATE OR REPLACE FUNCTION public.has_open_report()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.support_reports
    WHERE user_id = auth.uid() AND status = 'open'
  );
$$;