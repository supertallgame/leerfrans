-- Create a public view for game_rooms that excludes the questions column
CREATE OR REPLACE VIEW public.game_rooms_public AS
SELECT id, code, host_name, host_player_id, status, current_question_index, total_questions, direction, created_at
FROM public.game_rooms;

-- Grant access to the view
GRANT SELECT ON public.game_rooms_public TO anon, authenticated;

-- Now restrict direct SELECT on game_rooms to prevent reading questions
DROP POLICY IF EXISTS "Anyone can view rooms" ON public.game_rooms;
CREATE POLICY "Anyone can view rooms" ON public.game_rooms
  FOR SELECT TO anon, authenticated
  USING (false);