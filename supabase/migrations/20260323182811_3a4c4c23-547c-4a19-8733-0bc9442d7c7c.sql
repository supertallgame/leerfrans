-- Restrict game_questions INSERT: only allow if the inserting user also just created the room
-- We tie this to the game_rooms INSERT policy by checking room exists and is in 'waiting' status
DROP POLICY "Anyone can insert questions" ON public.game_questions;
CREATE POLICY "Room creator can insert questions" ON public.game_questions
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.game_rooms
      WHERE game_rooms.id = game_questions.room_id
      AND game_rooms.status = 'waiting'
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.game_questions existing
      WHERE existing.room_id = game_questions.room_id
    )
  );