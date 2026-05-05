import { fetchAppUserProfile } from '../auth/fetchAppUserProfile';
import { supabase } from '../lib/supabase';
import {
  Category,
  PaperAuthor,
  ResearchPaper,
  StructuredAuthorEntry,
  WorkflowEntry,
} from '../types/domain';
import { getPrimaryAuthorName, paperDate } from '../utils/format';

interface ResearchDetailPayload {
  paper: ResearchPaper;
  workflowHistory: WorkflowEntry[];
}

interface ResearchFilePayload {
  fileUrl: string;
  isSigned?: boolean;
  source?: string;
  storagePath?: string;
}

interface ResearchAuthorRow {
  id: string;
  email?: string | null;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
}

type ResearchAuthorRelation = ResearchAuthorRow | ResearchAuthorRow[] | null | undefined;

interface ResearchAuthorEntryRow {
  id: string;
  author_order?: number | null;
  is_primary?: boolean | null;
  author?: ResearchAuthorRelation;
}

interface ResearchWorkflowRow {
  id: string;
  reviewer_role?: string | null;
  action_type?: string | null;
  status?: string | null;
  comments?: string | null;
  previous_status?: string | null;
  new_status?: string | null;
  reviewed_at?: string | null;
  created_at?: string | null;
  reviewer?: ResearchAuthorRelation;
}

interface ResearchPaperRow {
  id: string;
  title: string;
  abstract: string;
  status: string;
  category?: string | null;
  keywords?: string[] | null;
  created_at?: string | null;
  updated_at?: string | null;
  submission_date?: string | null;
  published_date?: string | null;
  file_url?: string | null;
  rejection_reason?: string | null;
  revision_notes?: string | null;
  view_count?: number | null;
  download_count?: number | null;
  author_id?: string | null;
  author?: ResearchAuthorRelation;
  users?: ResearchAuthorRelation;
  structured_authors?: ResearchAuthorEntryRow[] | null;
  approval_workflow?: ResearchWorkflowRow[] | null;
}

interface ResearchListParams {
  category?: string;
  search?: string;
  year?: string;
  author?: string;
}

const PUBLISHED_STATUSES = new Set(['approved', 'published']);

const PAPER_SELECT = `
  id,
  title,
  abstract,
  status,
  category,
  keywords,
  created_at,
  updated_at,
  submission_date,
  published_date,
  file_url,
  rejection_reason,
  revision_notes,
  view_count,
  download_count,
  author_id,
  author:users!research_papers_author_id_fkey(
    id,
    email,
    first_name,
    middle_name,
    last_name
  ),
  structured_authors:research_authors!research_authors_research_id_fkey(
    id,
    author_order,
    is_primary,
    author:users!research_authors_user_id_fkey(
      id,
      email,
      first_name,
      middle_name,
      last_name
    )
  )
`;

const PAPER_DETAIL_SELECT = `
  ${PAPER_SELECT},
  approval_workflow:approval_workflow!approval_workflow_research_id_fkey(
    id,
    reviewer_role,
    action_type,
    status,
    comments,
    previous_status,
    new_status,
    reviewed_at,
    created_at,
    reviewer:users!approval_workflow_reviewer_id_fkey(
      id,
      email,
      first_name,
      middle_name,
      last_name
    )
  )
`;

function pickAuthor(row?: ResearchAuthorRelation): ResearchAuthorRow | null {
  if (!row) return null;
  if (Array.isArray(row)) return row[0] ?? null;
  return row;
}

function buildFullName(row?: ResearchAuthorRow | null) {
  if (!row) return '';

  const parts = [row.first_name, row.middle_name, row.last_name].filter(Boolean) as string[];
  const joined = parts.join(' ').replace(/\s+/g, ' ').trim();
  return joined || String(row.email || '').trim();
}

function toPaperAuthor(row?: ResearchAuthorRelation): PaperAuthor | null {
  const normalized = pickAuthor(row);
  if (!normalized) return null;

  const fullName = buildFullName(normalized);

  return {
    id: normalized.id,
    email: normalized.email ?? undefined,
    first_name: normalized.first_name ?? undefined,
    middle_name: normalized.middle_name ?? undefined,
    last_name: normalized.last_name ?? undefined,
    fullName,
    name: fullName,
  };
}

function toStructuredAuthorEntry(row: ResearchAuthorEntryRow): StructuredAuthorEntry {
  return {
    user_id: pickAuthor(row.author)?.id,
    is_primary: row.is_primary ?? false,
    author_order: row.author_order ?? undefined,
    author: toPaperAuthor(row.author),
  };
}

function toWorkflowEntry(row: ResearchWorkflowRow): WorkflowEntry {
  return {
    id: row.id,
    reviewer_role: row.reviewer_role ?? undefined,
    action_type: row.action_type ?? undefined,
    status: row.status ?? undefined,
    comments: row.comments ?? null,
    previous_status: row.previous_status ?? null,
    new_status: row.new_status ?? null,
    reviewed_at: row.reviewed_at ?? undefined,
    created_at: row.created_at ?? undefined,
    reviewer: toPaperAuthor(row.reviewer),
  };
}

function toResearchPaper(row: ResearchPaperRow): ResearchPaper {
  const primaryAuthor =
    toPaperAuthor(row.author ?? row.users ?? row.structured_authors?.find((entry) => entry?.is_primary)?.author ?? null) ??
    undefined;

  const structuredAuthors = Array.isArray(row.structured_authors)
    ? row.structured_authors.map(toStructuredAuthorEntry)
    : [];

  return {
    id: row.id,
    title: row.title,
    abstract: row.abstract,
    status: row.status,
    category: row.category ?? null,
    keywords: row.keywords ?? null,
    created_at: row.created_at ?? undefined,
    updated_at: row.updated_at ?? undefined,
    submission_date: row.submission_date ?? undefined,
    published_date: row.published_date ?? undefined,
    file_url: row.file_url ?? null,
    revision_notes: row.revision_notes ?? null,
    rejection_reason: row.rejection_reason ?? null,
    view_count: row.view_count ?? undefined,
    download_count: row.download_count ?? undefined,
    users: primaryAuthor ?? null,
    author: primaryAuthor ?? null,
    structured_authors: structuredAuthors,
  };
}

function filterPublishedRows(rows: ResearchPaperRow[], params?: ResearchListParams) {
  const normalizedSearch = params?.search?.trim().toLowerCase() ?? '';
  const normalizedAuthor = params?.author?.trim().toLowerCase() ?? '';
  const normalizedYear = params?.year?.trim() ?? '';
  const normalizedCategory = params?.category?.trim() ?? '';

  return rows.filter((paper) => {
    const paperRecord = toResearchPaper(paper);

    if (normalizedCategory && paper.category !== normalizedCategory) {
      return false;
    }

    if (normalizedYear) {
      const dateValue = paperDate(paperRecord);
      const paperYear = dateValue ? new Date(dateValue).getFullYear().toString() : '';

      if (paperYear !== normalizedYear) {
        return false;
      }
    }

    if (normalizedAuthor) {
      const authorName = getPrimaryAuthorName(paperRecord).toLowerCase();
      const coAuthorNames = (paper.structured_authors || [])
        .map((entry) => buildFullName(pickAuthor(entry.author)))
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (!authorName.includes(normalizedAuthor) && !coAuthorNames.includes(normalizedAuthor)) {
        return false;
      }
    }

    if (normalizedSearch) {
      const keywords = Array.isArray(paper.keywords) ? paper.keywords.join(' ') : '';
      const authorName = getPrimaryAuthorName(paperRecord);
      const target = `${paper.title} ${paper.abstract} ${keywords} ${authorName}`.toLowerCase();
      if (!target.includes(normalizedSearch)) {
        return false;
      }
    }

    return true;
  });
}

async function resolveCurrentStudentProfile() {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message || 'Unable to resolve the current session.');
  }

  if (!userData.user) {
    throw new Error('Sign in required to load research data.');
  }

  const profileResult = await fetchAppUserProfile(userData.user);

  if (!profileResult.user) {
    throw new Error(profileResult.message || 'Your account is not provisioned for research access.');
  }

  if (profileResult.user.role !== 'student') {
    throw new Error('Student access is required to load research data.');
  }

  return profileResult.user;
}

function extractStoragePathFromUrl(fileUrl?: string | null) {
  if (!fileUrl) return null;

  const trimmedValue = fileUrl.trim();
  if (!trimmedValue) return null;

  if (!/^https?:\/\//i.test(trimmedValue)) {
    return trimmedValue.replace(/^\/+/, '') || null;
  }

  try {
    const parsedUrl = new URL(trimmedValue);
    const marker = '/object/public/research-papers/';
    const markerIndex = parsedUrl.pathname.indexOf(marker);

    if (markerIndex >= 0) {
      return parsedUrl.pathname.slice(markerIndex + marker.length).replace(/^\//, '') || null;
    }

    const pathSegments = parsedUrl.pathname.split('/research-papers/');
    if (pathSegments.length > 1) {
      return pathSegments[1].replace(/^\//, '') || null;
    }
  } catch {
    return null;
  }

  return null;
}

async function loadResearchRows(selectQuery: string, filters?: ResearchListParams) {
  const profile = await resolveCurrentStudentProfile();

  const query = supabase
    .from('research_papers')
    .select(selectQuery)
    .eq('author_id', profile.id);

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message || 'Unable to load research data.');
  }

  const rows = Array.isArray(data) ? (data as unknown as ResearchPaperRow[]) : [];
  return filterPublishedRows(rows, filters);
}

export const researchApi = {
  getMyPapers: async () => {
    const rows = await loadResearchRows(PAPER_SELECT);
    return rows.map(toResearchPaper).sort((left, right) => {
      const leftDate = new Date(paperDate(left) || 0).getTime();
      const rightDate = new Date(paperDate(right) || 0).getTime();
      return rightDate - leftDate;
    });
  },

  getPublishedPapers: async (params?: ResearchListParams) => {
    await resolveCurrentStudentProfile();

    const { data, error } = await supabase
      .from('research_papers')
      .select(PAPER_SELECT)
      .in('status', Array.from(PUBLISHED_STATUSES))

    if (error) {
      throw new Error(error.message || 'Unable to load published papers.');
    }

    const rows = Array.isArray(data) ? (data as unknown as ResearchPaperRow[]) : [];
    return filterPublishedRows(rows, params)
      .map(toResearchPaper)
      .sort((left, right) => {
        const leftDate = new Date(paperDate(left) || 0).getTime();
        const rightDate = new Date(paperDate(right) || 0).getTime();
        return rightDate - leftDate;
      });
  },

  getCategories: async () => {
    const { data, error } = await supabase.from('research_categories').select('id, name').order('name', {
      ascending: true,
    });

    if (error) {
      throw new Error(error.message || 'Unable to load categories.');
    }

    return (Array.isArray(data) ? data : []) as Category[];
  },

  getResearchById: async (paperId: string) => {
    await resolveCurrentStudentProfile();

    const { data, error } = await supabase
      .from('research_papers')
      .select(PAPER_DETAIL_SELECT)
      .eq('id', paperId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message || 'Unable to load paper details.');
    }

    if (!data) {
      throw new Error('Paper not found.');
    }

    const row = data as unknown as ResearchPaperRow;
    const workflowHistory = Array.isArray(row.approval_workflow)
      ? row.approval_workflow
          .map(toWorkflowEntry)
          .sort((left, right) => {
            const leftDate = new Date(left.reviewed_at || left.created_at || 0).getTime();
            const rightDate = new Date(right.reviewed_at || right.created_at || 0).getTime();
            return rightDate - leftDate;
          })
      : [];

    return {
      paper: toResearchPaper(row),
      workflowHistory,
    } satisfies ResearchDetailPayload;
  },

  getResearchFile: async (paperId: string) => {
    await resolveCurrentStudentProfile();

    // Load paper metadata to resolve file path.
    const { data: paperRow, error: paperError } = await supabase
      .from('research_papers')
      .select('id, file_url')
      .eq('id', paperId)
      .maybeSingle();

    if (paperError) {
      throw new Error(paperError.message || 'Unable to load paper.');
    }

    if (!paperRow) {
      throw new Error('Paper not found.');
    }

    const storagePath = extractStoragePathFromUrl(paperRow.file_url);

    // If we have a storage path, create a signed URL; otherwise use file_url as fallback.
    if (storagePath) {
      try {
        const signedUrlData = await supabase.storage
          .from('research-papers')
          .createSignedUrl(storagePath, 3600);

        if (signedUrlData.error) {
          throw signedUrlData.error;
        }

        return {
          fileUrl: signedUrlData.data?.signedUrl || '',
          isSigned: true,
          source: 'supabase-storage',
          storagePath,
        } satisfies ResearchFilePayload;
      } catch (error) {
        console.warn('[getResearchFile] Signed URL creation failed:', error);
      }
    }

    if (paperRow.file_url) {
      return {
        fileUrl: paperRow.file_url,
        isSigned: false,
        source: 'public-url',
      } satisfies ResearchFilePayload;
    }

    return {
      fileUrl: '',
      isSigned: false,
      source: 'no-file',
    } satisfies ResearchFilePayload;
  },

  trackView: async (paperId: string) => {
    const profile = await resolveCurrentStudentProfile();

    try {
      const { error: rpcError } = await supabase.rpc('increment_view_count', {
        row_id: paperId,
      });

      if (rpcError) {
        throw new Error(rpcError.message || 'Failed to increment view count.');
      }

      const { error: insertError } = await supabase.from('paper_views').insert({
        paper_id: paperId,
        user_id: profile.id,
        viewed_at: new Date().toISOString(),
      });

      void insertError;
    } catch (error) {
      console.warn('[trackView] Error tracking view:', error);
    }
  },

  trackDownload: async (paperId: string) => {
    const profile = await resolveCurrentStudentProfile();

    try {
      const { data: paperRow, error: paperError } = await supabase
        .from('research_papers')
        .select('allow_download')
        .eq('id', paperId)
        .maybeSingle();

      if (paperError) {
        throw new Error(paperError.message || 'Unable to verify download permissions.');
      }

      if (!paperRow) {
        throw new Error('Paper not found.');
      }

      if (!(paperRow as any).allow_download) {
        throw new Error('Downloads are not allowed for this paper.');
      }

      const { error: rpcError } = await supabase.rpc('increment_download_count', {
        row_id: paperId,
      });

      if (rpcError) {
        throw new Error(rpcError.message || 'Failed to increment download count.');
      }

      const { error: insertError } = await supabase.from('paper_downloads').insert({
        paper_id: paperId,
        user_id: profile.id,
        downloaded_at: new Date().toISOString(),
      });

      void insertError;
    } catch (error) {
      console.warn('[trackDownload] Error tracking download:', error);
      throw error;
    }
  },

  getProfileData: async (_params?: {
    title?: string;
    details?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
  }) => {
    const papers = await researchApi.getMyPapers();

    return {
      profile: {
        userId: (await resolveCurrentStudentProfile()).id,
        role: 'student',
      },
      stats: {
        totalRecords: papers.length,
        uploadedCount: papers.length,
        publishedCount: papers.filter((paper) => PUBLISHED_STATUSES.has(String(paper.status))).length,
      },
      records: papers,
    };
  },
};
