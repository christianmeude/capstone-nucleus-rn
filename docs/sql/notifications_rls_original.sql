-- ============================================================
-- BACKUP: notifications RLS Policies (original)
-- Saved before email-based resolution migration
-- See: docs/sql/notifications_rls_original.sql
-- ============================================================

-- Policy: Users can read own notifications (SELECT)
DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;

CREATE POLICY "Users can read own notifications"
ON public.notifications
FOR SELECT
TO public
USING (
  user_id = ( SELECT auth.uid() AS uid)
);

-- Policy: Users can update own notifications (UPDATE)
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
TO public
USING (
  user_id = ( SELECT auth.uid() AS uid)
)
WITH CHECK (
  user_id = ( SELECT auth.uid() AS uid)
);