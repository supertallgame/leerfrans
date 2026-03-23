-- Block all direct INSERT on game_questions - only edge functions (service role) can insert
DROP POLICY IF EXISTS "Room creator can insert questions" ON public.game_questions;
CREATE POLICY "No direct insert" ON public.game_questions
  FOR INSERT TO anon, authenticated
  WITH CHECK (false);