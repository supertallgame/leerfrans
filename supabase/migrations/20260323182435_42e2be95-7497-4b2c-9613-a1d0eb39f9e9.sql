-- Create a separate table for questions/answers, not readable by clients
CREATE TABLE public.game_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.game_rooms(id) ON DELETE CASCADE,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(room_id)
);

-- Enable RLS
ALTER TABLE public.game_questions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (needed for room creation)
CREATE POLICY "Anyone can insert questions" ON public.game_questions
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Block all SELECT from clients - only edge functions (service role) can read
CREATE POLICY "No direct read access" ON public.game_questions
  FOR SELECT TO anon, authenticated
  USING (false);

-- Block UPDATE/DELETE from clients
CREATE POLICY "No direct update" ON public.game_questions
  FOR UPDATE TO anon, authenticated
  USING (false) WITH CHECK (false);

CREATE POLICY "No direct delete" ON public.game_questions
  FOR DELETE TO anon, authenticated
  USING (false);