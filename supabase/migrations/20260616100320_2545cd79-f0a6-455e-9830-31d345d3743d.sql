DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='leadership_chat_messages') THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.leadership_chat_messages';
  END IF;
END $$;
ALTER TABLE public.leadership_chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.admin_chat_messages REPLICA IDENTITY FULL;