
ALTER TABLE game_rooms ADD COLUMN host_player_id uuid REFERENCES game_players(id) ON DELETE SET NULL;
