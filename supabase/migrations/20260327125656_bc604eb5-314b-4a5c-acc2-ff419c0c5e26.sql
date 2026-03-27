
DROP POLICY "Admins can insert settings" ON public.admin_settings;
CREATE POLICY "Admins can insert settings" ON public.admin_settings FOR INSERT TO authenticated
WITH CHECK ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['brankovantland@gmail.com','branko18vantland@gmail.com','tamoopdam@gmail.com','jack.ouwerkerk@vsodaafgeluk.nl']));

DROP POLICY "Admins can update settings" ON public.admin_settings;
CREATE POLICY "Admins can update settings" ON public.admin_settings FOR UPDATE TO authenticated
USING ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['brankovantland@gmail.com','branko18vantland@gmail.com','tamoopdam@gmail.com','jack.ouwerkerk@vsodaafgeluk.nl']))
WITH CHECK ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['brankovantland@gmail.com','branko18vantland@gmail.com','tamoopdam@gmail.com','jack.ouwerkerk@vsodaafgeluk.nl']));

DROP POLICY "Admins can delete settings" ON public.admin_settings;
CREATE POLICY "Admins can delete settings" ON public.admin_settings FOR DELETE TO authenticated
USING ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['brankovantland@gmail.com','branko18vantland@gmail.com','tamoopdam@gmail.com','jack.ouwerkerk@vsodaafgeluk.nl']));

DROP POLICY "Operator can delete reviews" ON public.reviews;
CREATE POLICY "Operator can delete reviews" ON public.reviews FOR DELETE TO authenticated
USING ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['brankovantland@gmail.com','branko18vantland@gmail.com','tamoopdam@gmail.com','jack.ouwerkerk@vsodaafgeluk.nl']));

DROP POLICY "Operator can delete replies" ON public.review_replies;
CREATE POLICY "Operator can delete replies" ON public.review_replies FOR DELETE TO authenticated
USING ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['brankovantland@gmail.com','branko18vantland@gmail.com','tamoopdam@gmail.com','jack.ouwerkerk@vsodaafgeluk.nl']));
