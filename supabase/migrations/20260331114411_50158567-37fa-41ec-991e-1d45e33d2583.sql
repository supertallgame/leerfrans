-- Add user_id to review_replies for future tracking
ALTER TABLE public.review_replies ADD COLUMN user_id uuid DEFAULT NULL;