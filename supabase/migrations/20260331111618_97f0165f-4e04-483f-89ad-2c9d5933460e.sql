
-- Remove reviews and review_replies from Realtime to prevent email exposure
ALTER PUBLICATION supabase_realtime DROP TABLE public.reviews;
ALTER PUBLICATION supabase_realtime DROP TABLE public.review_replies;
