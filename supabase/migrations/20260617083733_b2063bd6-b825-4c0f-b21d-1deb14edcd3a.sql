
CREATE TABLE public.direct_chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  user_id uuid NOT NULL,
  user_email text NOT NULL,
  user_display_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.direct_chats TO authenticated;
GRANT ALL ON public.direct_chats TO service_role;
ALTER TABLE public.direct_chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner can manage own chats" ON public.direct_chats
  FOR ALL TO authenticated
  USING (public.is_owner(auth.uid()))
  WITH CHECK (public.is_owner(auth.uid()) AND owner_id = auth.uid());

CREATE POLICY "user can view their chats" ON public.direct_chats
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE TABLE public.direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid NOT NULL REFERENCES public.direct_chats(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  sender_is_owner boolean NOT NULL DEFAULT false,
  body text NOT NULL,
  read_by_user boolean NOT NULL DEFAULT false,
  read_by_owner boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.direct_messages TO authenticated;
GRANT ALL ON public.direct_messages TO service_role;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner full access to messages" ON public.direct_messages
  FOR ALL TO authenticated
  USING (public.is_owner(auth.uid()))
  WITH CHECK (public.is_owner(auth.uid()));

CREATE POLICY "user can read messages in their chat" ON public.direct_messages
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.direct_chats c WHERE c.id = chat_id AND c.user_id = auth.uid()));

CREATE POLICY "user can insert messages in their chat" ON public.direct_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND sender_is_owner = false
    AND EXISTS (SELECT 1 FROM public.direct_chats c WHERE c.id = chat_id AND c.user_id = auth.uid())
  );

CREATE POLICY "user can mark messages read in their chat" ON public.direct_messages
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.direct_chats c WHERE c.id = chat_id AND c.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.direct_chats c WHERE c.id = chat_id AND c.user_id = auth.uid()));

CREATE INDEX direct_messages_chat_idx ON public.direct_messages(chat_id, created_at);

ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_chats;

CREATE OR REPLACE FUNCTION public.touch_direct_chat()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.direct_chats SET updated_at = now() WHERE id = NEW.chat_id;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_touch_direct_chat AFTER INSERT ON public.direct_messages
  FOR EACH ROW EXECUTE FUNCTION public.touch_direct_chat();

CREATE OR REPLACE FUNCTION public.create_direct_chat(p_user_email text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user_id uuid;
  v_chat_id uuid;
BEGIN
  IF NOT public.is_owner(auth.uid()) THEN
    RAISE EXCEPTION 'Only owners can create chats';
  END IF;
  SELECT id INTO v_user_id FROM auth.users WHERE email = lower(p_user_email) LIMIT 1;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  INSERT INTO public.direct_chats (owner_id, user_id, user_email)
  VALUES (auth.uid(), v_user_id, lower(p_user_email))
  ON CONFLICT (owner_id, user_id) DO UPDATE SET updated_at = now()
  RETURNING id INTO v_chat_id;
  RETURN v_chat_id;
END $$;
GRANT EXECUTE ON FUNCTION public.create_direct_chat(text) TO authenticated;
