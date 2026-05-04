-- ============================================================
-- BACKUP: research_papers RLS Policies (original)
-- Saved before email-based resolution migration
-- See: docs/sql/research_papers_rls_original.sql
-- ============================================================

-- Policy: Users can insert own papers (INSERT)
DROP POLICY IF EXISTS "Users can insert own papers" ON public.research_papers;

CREATE POLICY "Users can insert own papers"
ON public.research_papers
FOR INSERT
TO public
WITH CHECK (
  (( SELECT auth.uid() AS uid) = author_id)
);

-- Policy: Combined research read access (SELECT)
DROP POLICY IF EXISTS "Combined research read access" ON public.research_papers;

CREATE POLICY "Combined research read access"
ON public.research_papers
FOR SELECT
TO public
USING (
  (((status)::text = 'approved'::text)
  OR (( SELECT auth.uid() AS uid) = author_id)
  OR (( SELECT auth.uid() AS uid) = faculty_id)
  OR (EXISTS (
    SELECT 1
    FROM users
    WHERE (
      (users.id = ( SELECT auth.uid() AS uid))
      AND ((users.role)::text = ANY (ARRAY[
        ('staff'::character varying)::text,
        ('admin'::character varying)::text
      ]))
    )
  )))
);

-- Policy: Combined research update access (UPDATE)
DROP POLICY IF EXISTS "Combined research update access" ON public.research_papers;

CREATE POLICY "Combined research update access"
ON public.research_papers
FOR UPDATE
TO public
USING (
  ((( SELECT auth.uid() AS uid) = author_id)
    AND ((status)::text = ANY (ARRAY[
      ('pending'::character varying)::text,
      ('revision_required'::character varying)::text
    ]))
  )
  OR
  ((( SELECT auth.uid() AS uid) = faculty_id)
    AND ((status)::text = 'pending_faculty'::text)
  )
  OR (EXISTS (
    SELECT 1
    FROM users
    WHERE (
      (users.id = ( SELECT auth.uid() AS uid))
      AND ((users.role)::text = ANY (ARRAY[
        ('staff'::character varying)::text,
        ('admin'::character varying)::text
      ]))
    )
  ))
)
WITH CHECK (
  ((( SELECT auth.uid() AS uid) = author_id)
    AND ((status)::text = ANY (ARRAY[
      ('pending'::character varying)::text,
      ('revision_required'::character varying)::text
    ]))
  )
  OR
  ((( SELECT auth.uid() AS uid) = faculty_id)
    AND ((status)::text = 'pending_faculty'::text)
  )
  OR (EXISTS (
    SELECT 1
    FROM users
    WHERE (
      (users.id = ( SELECT auth.uid() AS uid))
      AND ((users.role)::text = ANY (ARRAY[
        ('staff'::character varying)::text,
        ('admin'::character varying)::text
      ]))
    )
  ))
);