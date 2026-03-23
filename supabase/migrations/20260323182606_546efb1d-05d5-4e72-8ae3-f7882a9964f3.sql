-- Remove the questions column from game_rooms since questions are now in game_questions
ALTER TABLE public.game_rooms DROP COLUMN questions;