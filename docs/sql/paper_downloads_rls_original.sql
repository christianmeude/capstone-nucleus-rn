-- ============================================================
-- BACKUP: paper_downloads RLS Policies (original)
-- Saved before email-based resolution migration
-- See: docs/sql/paper_downloads_rls_original.sql
-- ============================================================

-- Policy: Allow students to insert own download records (INSERT)
DROP POLICY IF EXISTS "Allow students to insert own download records" ON public.paper_downloads;

CREATE POLICY "Allow students to insert own download records"
ON public.paper_downloads
FOR INSERT
TO public
WITH CHECK (
  auth.uid() = user_id
);