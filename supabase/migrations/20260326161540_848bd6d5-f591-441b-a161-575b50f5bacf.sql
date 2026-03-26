
CREATE OR REPLACE FUNCTION public.create_game_room(
  p_code text,
  p_host_name text,
  p_total_questions integer DEFAULT 20,
  p_game_mode text DEFAULT 'normal',
  p_team_mode text DEFAULT 'solo',
  p_num_teams integer DEFAULT 2,
  p_team_names jsonb DEFAULT '[]'::jsonb,
  p_team_emojis jsonb DEFAULT '["🔵", "🔴", "🟢", "🟡"]'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_room game_rooms%ROWTYPE;
BEGIN
  INSERT INTO public.game_rooms (code, host_name, total_questions, game_mode, team_mode, num_teams, team_names, team_emojis)
  VALUES (p_code, p_host_name, p_total_questions, p_game_mode, p_team_mode, p_num_teams, p_team_names, p_team_emojis)
  RETURNING * INTO v_room;

  RETURN jsonb_build_object(
    'id', v_room.id,
    'code', v_room.code,
    'host_name', v_room.host_name,
    'status', v_room.status,
    'current_question_index', v_room.current_question_index,
    'total_questions', v_room.total_questions,
    'direction', v_room.direction,
    'game_mode', v_room.game_mode,
    'team_mode', v_room.team_mode,
    'num_teams', v_room.num_teams,
    'team_names', v_room.team_names,
    'team_emojis', v_room.team_emojis
  );
END;
$$;
