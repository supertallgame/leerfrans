
ALTER TABLE public.game_rooms ADD COLUMN team_names jsonb NOT NULL DEFAULT '[]'::jsonb;

DROP VIEW IF EXISTS public.game_rooms_public;
CREATE VIEW public.game_rooms_public WITH (security_invoker = true) AS
SELECT id, code, host_name, host_player_id, status, current_question_index, total_questions, direction, created_at, game_mode, team_mode, num_teams, team_names
FROM game_rooms;
