
-- Add quiz info columns to game_rooms
ALTER TABLE public.game_rooms
  ADD COLUMN quiz_language text NOT NULL DEFAULT 'french',
  ADD COLUMN quiz_chapter_id text NOT NULL DEFAULT '',
  ADD COLUMN quiz_sections jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Recreate the public view to include new columns
DROP VIEW IF EXISTS public.game_rooms_public;
CREATE VIEW public.game_rooms_public AS
  SELECT id, code, host_name, status, current_question_index, total_questions,
         direction, game_mode, team_mode, num_teams, team_names, team_emojis,
         is_public, kahoot_timer, created_at,
         quiz_language, quiz_chapter_id, quiz_sections
  FROM public.game_rooms;

-- Update the create_game_room function (latest overload with kahoot_timer)
CREATE OR REPLACE FUNCTION public.create_game_room(
  p_code text, p_host_name text,
  p_total_questions integer DEFAULT 20, p_game_mode text DEFAULT 'normal',
  p_team_mode text DEFAULT 'solo', p_num_teams integer DEFAULT 2,
  p_team_names jsonb DEFAULT '[]', p_team_emojis jsonb DEFAULT '["🔵","🔴","🟢","🟡"]',
  p_is_public boolean DEFAULT false, p_max_players integer DEFAULT 20,
  p_kahoot_timer integer DEFAULT 5,
  p_quiz_language text DEFAULT 'french',
  p_quiz_chapter_id text DEFAULT '',
  p_quiz_sections jsonb DEFAULT '[]'
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_room game_rooms%ROWTYPE;
BEGIN
  INSERT INTO public.game_rooms (code, host_name, total_questions, game_mode, team_mode, num_teams, team_names, team_emojis, is_public, max_players, kahoot_timer, quiz_language, quiz_chapter_id, quiz_sections)
  VALUES (p_code, p_host_name, p_total_questions, p_game_mode, p_team_mode, p_num_teams, p_team_names, p_team_emojis, p_is_public, p_max_players, p_kahoot_timer, p_quiz_language, p_quiz_chapter_id, p_quiz_sections)
  RETURNING * INTO v_room;
  RETURN jsonb_build_object(
    'id', v_room.id, 'code', v_room.code, 'host_name', v_room.host_name,
    'status', v_room.status, 'current_question_index', v_room.current_question_index,
    'total_questions', v_room.total_questions, 'direction', v_room.direction,
    'game_mode', v_room.game_mode, 'team_mode', v_room.team_mode,
    'num_teams', v_room.num_teams, 'team_names', v_room.team_names,
    'team_emojis', v_room.team_emojis, 'is_public', v_room.is_public,
    'max_players', v_room.max_players, 'kahoot_timer', v_room.kahoot_timer,
    'quiz_language', v_room.quiz_language, 'quiz_chapter_id', v_room.quiz_chapter_id,
    'quiz_sections', v_room.quiz_sections
  );
END; $$;
