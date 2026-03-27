-- Recreate view without security_invoker so it uses owner permissions (bypasses RLS on game_rooms)
DROP VIEW IF EXISTS public.game_rooms_public;
CREATE VIEW public.game_rooms_public
WITH (security_invoker = false)
AS
SELECT id, code, host_name, status, current_question_index, total_questions, direction, created_at, game_mode, team_mode, num_teams, team_names, team_emojis
FROM public.game_rooms;