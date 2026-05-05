-- ============================================================
-- BACKUP: users RLS Policies (before inviter read fix)
-- Saved before adding co-author inviter profile read access
-- See: docs/sql/users_rls_pre_inviter_read_fix.sql
-- ============================================================

-- Policy: Allow users to read own profile by email (SELECT)
DROP POLICY IF EXISTS "Allow users to read own profile by email" ON public.users;

CREATE POLICY "Allow users to read own profile by email"
ON public.users
FOR SELECT
TO public
USING (
  auth.email() = (email)::text
);