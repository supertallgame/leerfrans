
CREATE TABLE public.muted_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  muted_until timestamptz NOT NULL,
  reason text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.muted_users ENABLE ROW LEVEL SECURITY;

-- Anyone can check if they're muted
CREATE POLICY "Anyone can read mutes" ON public.muted_users
FOR SELECT TO anon, authenticated USING (true);

-- Only admins can insert/update/delete mutes
CREATE POLICY "Admins can insert mutes" ON public.muted_users
FOR INSERT TO authenticated
WITH CHECK ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['brankovantland@gmail.com','branko18vantland@gmail.com','tamoopdam@gmail.com','jack.ouwerkerk@vsodaafgeluk.nl']));

CREATE POLICY "Admins can update mutes" ON public.muted_users
FOR UPDATE TO authenticated
USING ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['brankovantland@gmail.com','branko18vantland@gmail.com','tamoopdam@gmail.com','jack.ouwerkerk@vsodaafgeluk.nl']));

CREATE POLICY "Admins can delete mutes" ON public.muted_users
FOR DELETE TO authenticated
USING ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['brankovantland@gmail.com','branko18vantland@gmail.com','tamoopdam@gmail.com','jack.ouwerkerk@vsodaafgeluk.nl']));
