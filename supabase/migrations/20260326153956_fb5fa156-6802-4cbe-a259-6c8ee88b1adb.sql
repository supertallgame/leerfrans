
-- 1. Recreate view WITHOUT host_player_id
DROP VIEW IF EXISTS public.game_rooms_public;
CREATE VIEW public.game_rooms_public WITH (security_invoker = true) AS
SELECT id, code, host_name, status, current_question_index, total_questions, direction, created_at, game_mode, team_mode, num_teams, team_names, team_emojis
FROM public.game_rooms;

GRANT SELECT ON public.game_rooms_public TO anon, authenticated;

-- 2. Restrict direct SELECT on game_rooms to deny direct client access
-- (Realtime still works because it uses the replication stream, not RLS)
DROP POLICY IF EXISTS "Anyone can view rooms" ON public.game_rooms;
CREATE POLICY "No direct select on game_rooms"
  ON public.game_rooms FOR SELECT
  TO anon, authenticated
  USING (false);
