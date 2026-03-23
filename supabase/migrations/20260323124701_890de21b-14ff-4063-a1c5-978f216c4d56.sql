
-- Create a view that hides player_token from public reads
CREATE VIEW public.game_players_public AS
  SELECT id, room_id, player_name, score, has_answered, joined_at
  FROM public.game_players;

-- Grant access to the view
GRANT SELECT ON public.game_players_public TO anon, authenticated;
