-- ============================================================
-- BACKUP: research_papers RLS Policies (before co-author read fix)
-- Saved before adding co-author invitee read access
-- See: docs/sql/research_papers_rls_co_author_read_pre_fix.sql
-- ============================================================

-- Policy: Users can insert own papers (INSERT)
DROP POLICY IF EXISTS "Users can insert own papers" ON public.research_papers;

CREATE POLICY "Users can insert own papers"
ON public.research_papers
FOR INSERT
TO public
WITH CHECK (
  author_id = (
    SELECT id FROM public.users
    WHERE (users.email)::text = auth.email()
  )
);

-- Policy: Combined research read access (SELECT)
DROP POLICY IF EXISTS "Combined research read access" ON public.research_papers;

CREATE POLICY "Combined research read access"
ON public.research_papers
FOR SELECT
TO public
USING (
  ((status)::text = 'approved'::text)
  OR (
    author_id = (
      SELECT id FROM public.users
      WHERE (users.email)::text = auth.email()
    )
  )
  OR (
    faculty_id = (
      SELECT id FROM public.users
      WHERE (users.email)::text = auth.email()
    )
  )
  OR (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE (users.email)::text = auth.email()
        AND (users.role)::text = ANY (
          (ARRAY['staff'::character varying, 'admin'::character varying])::text[]
        )
    )
  )
);

-- Policy: Combined research update access (UPDATE)
DROP POLICY IF EXISTS "Combined research update access" ON public.research_papers;

CREATE POLICY "Combined research update access"
ON public.research_papers
FOR UPDATE
TO public
USING (
  (
    author_id = (
      SELECT id FROM public.users
      WHERE (users.email)::text = auth.email()
    )
    AND (status)::text = ANY (
      (ARRAY['pending'::character varying, 'revision_required'::character varying])::text[]
    )
  )
  OR (
    faculty_id = (
      SELECT id FROM public.users
      WHERE (users.email)::text = auth.email()
    )
    AND (status)::text = 'pending_faculty'::text
  )
  OR (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE (users.email)::text = auth.email()
        AND (users.role)::text = ANY (
          (ARRAY['staff'::character varying, 'admin'::character varying])::text[]
        )
    )
  )
)
WITH CHECK (
  (
    author_id = (
      SELECT id FROM public.users
      WHERE (users.email)::text = auth.email()
    )
    AND (status)::text = ANY (
      (ARRAY['pending'::character varying, 'revision_required'::character varying])::text[]
    )
  )
  OR (
    faculty_id = (
      SELECT id FROM public.users
      WHERE (users.email)::text = auth.email()
    )
    AND (status)::text = 'pending_faculty'::text
  )
  OR (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE (users.email)::text = auth.email()
        AND (users.role)::text = ANY (
          (ARRAY['staff'::character varying, 'admin'::character varying])::text[]
        )
    )
  )
);