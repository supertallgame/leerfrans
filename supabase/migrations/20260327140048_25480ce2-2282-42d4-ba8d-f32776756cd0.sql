
-- Clean up: remove admin-only SELECT since admins use get_reviews_admin RPC
DROP POLICY IF EXISTS "Admins can read reviews" ON public.reviews;
