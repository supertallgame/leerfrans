
DROP POLICY IF EXISTS "Operator can delete reviews" ON public.reviews;
CREATE POLICY "Operator can delete reviews" ON public.reviews
  FOR DELETE TO authenticated
  USING ((auth.jwt() ->> 'email') IN ('brankovantland@gmail.com', 'branko18vantland@gmail.com'));

DROP POLICY IF EXISTS "Operator can delete replies" ON public.review_replies;
CREATE POLICY "Operator can delete replies" ON public.review_replies
  FOR DELETE TO authenticated
  USING ((auth.jwt() ->> 'email') IN ('brankovantland@gmail.com', 'branko18vantland@gmail.com'));
