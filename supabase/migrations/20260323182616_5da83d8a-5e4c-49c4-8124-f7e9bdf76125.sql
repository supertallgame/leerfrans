-- Update game_rooms_public view since questions column no longer exists
CREATE OR REPLACE VIEW public.game_rooms_public
WITH (security_invoker = on) AS
SELECT id, code, host_name, host_player_id, status, current_question_index, total_questions, direction, created_at
FROM public.game_rooms;