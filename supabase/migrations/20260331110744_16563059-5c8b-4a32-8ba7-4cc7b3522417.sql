
CREATE TABLE public.juf_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email text NOT NULL,
  note text NOT NULL,
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.juf_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Juf admins can read notes"
ON public.juf_notes FOR SELECT TO authenticated
USING ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['brankovantland@gmail.com'::text, 'branko18vantland@gmail.com'::text]));

CREATE POLICY "Juf admins can insert notes"
ON public.juf_notes FOR INSERT TO authenticated
WITH CHECK ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['brankovantland@gmail.com'::text, 'branko18vantland@gmail.com'::text]));

CREATE POLICY "Juf admins can delete notes"
ON public.juf_notes FOR DELETE TO authenticated
USING ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['brankovantland@gmail.com'::text, 'branko18vantland@gmail.com'::text]));
