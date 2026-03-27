
-- Fix security definer view: use security_invoker = true
DROP VIEW IF EXISTS public.game_rooms_public;
CREATE VIEW public.game_rooms_public
WITH (security_invoker = true)
AS
SELECT id, code, host_name, status, current_question_index, total_questions, direction, created_at, game_mode, team_mode, num_teams, team_names, team_emojis
FROM public.game_rooms;

-- Allow public reads on game_rooms so the view works for anon users
DROP POLICY IF EXISTS "No direct select on game_rooms" ON public.game_rooms;
CREATE POLICY "Anyone can read game rooms"
ON public.game_rooms
FOR SELECT
TO anon, authenticated
USING (true);
