
-- Anonymous bug reports table (one-way, no auth required)
CREATE TABLE public.anonymous_bug_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'bug',
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.anonymous_bug_reports ENABLE ROW LEVEL SECURITY;

-- Anyone (incl. anon) can submit a bug report
CREATE POLICY "Anyone can submit anonymous bug report"
ON public.anonymous_bug_reports
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(username) BETWEEN 2 AND 30
  AND length(subject) BETWEEN 1 AND 120
  AND length(message) BETWEEN 1 AND 2000
);

-- Only staff can read / manage anonymous bug reports
CREATE POLICY "Staff read anonymous bug reports"
ON public.anonymous_bug_reports
FOR SELECT
TO authenticated
USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff update anonymous bug reports"
ON public.anonymous_bug_reports
FOR UPDATE
TO authenticated
USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff delete anonymous bug reports"
ON public.anonymous_bug_reports
FOR DELETE
TO authenticated
USING (public.is_staff(auth.uid()));

CREATE INDEX idx_anon_bug_reports_created ON public.anonymous_bug_reports (created_at DESC);
