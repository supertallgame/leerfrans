CREATE TABLE public.leadership_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_email TEXT NOT NULL,
  sender_display TEXT NOT NULL,
  message TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.leadership_chat_messages TO authenticated;
GRANT ALL ON public.leadership_chat_messages TO service_role;

ALTER TABLE public.leadership_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_leadership(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = _user_id
        AND email = ANY(ARRAY['brankovantland@gmail.com','branko18vantland@gmail.com'])
    )
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = _user_id
        AND role IN ('head_admin','head_tester')
    )
$$;

CREATE POLICY "Leadership can read chat"
  ON public.leadership_chat_messages
  FOR SELECT
  TO authenticated
  USING (public.is_leadership(auth.uid()));

CREATE POLICY "Leadership can post chat"
  ON public.leadership_chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_leadership(auth.uid()) AND sender_id = auth.uid());

CREATE POLICY "Leadership can delete own chat"
  ON public.leadership_chat_messages
  FOR DELETE
  TO authenticated
  USING (public.is_leadership(auth.uid()) AND sender_id = auth.uid());
