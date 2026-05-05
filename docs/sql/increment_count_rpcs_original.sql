-- ============================================================
-- BACKUP: increment_view_count and increment_download_count RPCs (original)
-- Saved before SECURITY DEFINER migration
-- See: docs/sql/increment_count_rpcs_original.sql
-- ============================================================

-- RPC: increment_view_count (INVOKER)
CREATE OR REPLACE FUNCTION public.increment_view_count(row_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  UPDATE research_papers
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = row_id;
END;
$$;

-- RPC: increment_download_count (INVOKER)
CREATE OR REPLACE FUNCTION public.increment_download_count(row_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  UPDATE research_papers
  SET download_count = COALESCE(download_count, 0) + 1
  WHERE id = row_id;
END;
$$;