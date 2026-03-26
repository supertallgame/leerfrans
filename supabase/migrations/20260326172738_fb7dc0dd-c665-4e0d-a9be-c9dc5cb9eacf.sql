
-- Table to store admin settings like disabled subjects
CREATE TABLE public.admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (needed for checking disabled subjects)
CREATE POLICY "Anyone can read admin settings"
  ON public.admin_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only admins can modify settings
CREATE POLICY "Admins can insert settings"
  ON public.admin_settings
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() ->> 'email') IN ('brankovantland@gmail.com', 'branko18vantland@gmail.com'));

CREATE POLICY "Admins can update settings"
  ON public.admin_settings
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'email') IN ('brankovantland@gmail.com', 'branko18vantland@gmail.com'))
  WITH CHECK ((auth.jwt() ->> 'email') IN ('brankovantland@gmail.com', 'branko18vantland@gmail.com'));

CREATE POLICY "Admins can delete settings"
  ON public.admin_settings
  FOR DELETE
  TO authenticated
  USING ((auth.jwt() ->> 'email') IN ('brankovantland@gmail.com', 'branko18vantland@gmail.com'));

-- Insert default row for disabled subjects
INSERT INTO public.admin_settings (key, value) VALUES ('disabled_subjects', '[]'::jsonb);
