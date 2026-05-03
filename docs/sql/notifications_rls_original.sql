CREATE POLICY "Users can read own notifications"
ON public.notifications
FOR SELECT
USING (
  user_id = ( SELECT auth.uid() AS uid)
);

CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
USING (
  user_id = ( SELECT auth.uid() AS uid)
)
WITH CHECK (
  user_id = ( SELECT auth.uid() AS uid)
);