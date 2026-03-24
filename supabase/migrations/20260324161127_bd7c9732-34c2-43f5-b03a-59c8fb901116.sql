
ALTER TABLE public.game_rooms ADD COLUMN team_mode text NOT NULL DEFAULT 'solo';
ALTER TABLE public.game_rooms ADD COLUMN num_teams integer NOT NULL DEFAULT 2;
ALTER TABLE public.game_players ADD COLUMN team_number integer;
