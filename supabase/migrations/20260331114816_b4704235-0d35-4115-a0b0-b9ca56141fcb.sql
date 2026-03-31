CREATE OR REPLACE VIEW public.reviews_public AS
SELECT id, display_name, rating, message, created_at, image_url, user_id
FROM public.reviews;