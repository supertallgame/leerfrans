
-- admin_settings: 4 policies
DROP POLICY "Admins can read settings" ON public.admin_settings;
CREATE POLICY "Admins can read settings" ON public.admin_settings FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'email') = ANY (public.get_admin_emails()));

DROP POLICY "Admins can insert settings" ON public.admin_settings;
CREATE POLICY "Admins can insert settings" ON public.admin_settings FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() ->> 'email') = ANY (public.get_admin_emails()));

DROP POLICY "Admins can update settings" ON public.admin_settings;
CREATE POLICY "Admins can update settings" ON public.admin_settings FOR UPDATE TO authenticated
  USING ((auth.jwt() ->> 'email') = ANY (public.get_admin_emails()))
  WITH CHECK ((auth.jwt() ->> 'email') = ANY (public.get_admin_emails()));

DROP POLICY "Admins can delete settings" ON public.admin_settings;
CREATE POLICY "Admins can delete settings" ON public.admin_settings FOR DELETE TO authenticated
  USING ((auth.jwt() ->> 'email') = ANY (public.get_admin_emails()));

-- game_answers: juf admins
DROP POLICY "Juf admins can read answers" ON public.game_answers;
CREATE POLICY "Juf admins can read answers" ON public.game_answers FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'email') = ANY (public.get_admin_emails()));

-- game_rooms: admin read
DROP POLICY "Admins can read all game rooms" ON public.game_rooms;
CREATE POLICY "Admins can read all game rooms" ON public.game_rooms FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'email') = ANY (public.get_admin_emails()));

-- muted_users: 4 policies
DROP POLICY "Admins can read mutes" ON public.muted_users;
CREATE POLICY "Admins can read mutes" ON public.muted_users FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'email') = ANY (public.get_admin_emails()));

DROP POLICY "Admins can insert mutes" ON public.muted_users;
CREATE POLICY "Admins can insert mutes" ON public.muted_users FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() ->> 'email') = ANY (public.get_admin_emails()));

DROP POLICY "Admins can update mutes" ON public.muted_users;
CREATE POLICY "Admins can update mutes" ON public.muted_users FOR UPDATE TO authenticated
  USING ((auth.jwt() ->> 'email') = ANY (public.get_admin_emails()));

DROP POLICY "Admins can delete mutes" ON public.muted_users;
CREATE POLICY "Admins can delete mutes" ON public.muted_users FOR DELETE TO authenticated
  USING ((auth.jwt() ->> 'email') = ANY (public.get_admin_emails()));

-- review_votes: admin delete
DROP POLICY "Admins can delete any vote" ON public.review_votes;
CREATE POLICY "Admins can delete any vote" ON public.review_votes FOR DELETE TO authenticated
  USING ((auth.jwt() ->> 'email') = ANY (public.get_admin_emails()));

-- reviews: 2 policies
DROP POLICY "Admins can read reviews" ON public.reviews;
CREATE POLICY "Admins can read reviews" ON public.reviews FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'email') = ANY (public.get_admin_emails()));

DROP POLICY "Operator can delete reviews" ON public.reviews;
CREATE POLICY "Operator can delete reviews" ON public.reviews FOR DELETE TO authenticated
  USING ((auth.jwt() ->> 'email') = ANY (public.get_admin_emails()));

-- review_replies: 2 policies
DROP POLICY "Operator can delete replies" ON public.review_replies;
CREATE POLICY "Operator can delete replies" ON public.review_replies FOR DELETE TO authenticated
  USING ((auth.jwt() ->> 'email') = ANY (public.get_admin_emails()));

DROP POLICY "Admins or review owner can insert replies" ON public.review_replies;
CREATE POLICY "Admins or review owner can insert replies" ON public.review_replies FOR INSERT TO authenticated
  WITH CHECK (
    char_length(display_name) >= 1 AND char_length(display_name) <= 50
    AND char_length(message) >= 1 AND char_length(message) <= 500
    AND (
      (auth.jwt() ->> 'email') = ANY (public.get_admin_emails())
      OR EXISTS (SELECT 1 FROM reviews WHERE reviews.id = review_replies.review_id AND reviews.user_id = auth.uid())
    )
  );

-- juf_notes: 3 policies
DROP POLICY "Juf admins can read notes" ON public.juf_notes;
CREATE POLICY "Juf admins can read notes" ON public.juf_notes FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'email') = ANY (public.get_admin_emails()));

DROP POLICY "Juf admins can insert notes" ON public.juf_notes;
CREATE POLICY "Juf admins can insert notes" ON public.juf_notes FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() ->> 'email') = ANY (public.get_admin_emails()));

DROP POLICY "Juf admins can delete notes" ON public.juf_notes;
CREATE POLICY "Juf admins can delete notes" ON public.juf_notes FOR DELETE TO authenticated
  USING ((auth.jwt() ->> 'email') = ANY (public.get_admin_emails()));
