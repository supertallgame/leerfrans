DROP VIEW IF EXISTS public.game_rooms_public;
CREATE VIEW public.game_rooms_public WITH (security_invoker = true) AS
SELECT id, code, host_name, host_player_id, status, current_question_index, total_questions, direction, created_at, game_mode
FROM game_rooms;