-- ============================================================
-- BACKUP: paper_views RLS Policies (original)
-- Saved before email-based resolution migration
-- See: docs/sql/paper_views_rls_original.sql
-- ============================================================

-- Policy: Allow students to insert own view records (INSERT)
DROP POLICY IF EXISTS "Allow students to insert own view records" ON public.paper_views;

CREATE POLICY "Allow students to insert own view records"
ON public.paper_views
FOR INSERT
TO public
WITH CHECK (
  auth.uid() = user_id
);