DROP VIEW IF EXISTS public.game_rooms_public;
CREATE VIEW public.game_rooms_public WITH (security_invoker = true) AS
SELECT id, code, host_name, status, current_question_index, total_questions, direction, game_mode, team_mode, num_teams, team_names, team_emojis, created_at, is_public, kahoot_timer
FROM public.game_rooms;