import { PaperStatus, ResearchPaper, StructuredAuthorEntry } from '../types/domain';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  pending_faculty: 'With Adviser',
  pending_dean: 'With Dean',
  pending_program_chair: 'With Program Chair',
  pending_editor: 'With Editor',
  pending_admin: 'With Admin',
  approved: 'Approved',
  published: 'Published',
  rejected: 'Rejected',
  revision_required: 'Revision Required',
};

export const statusToLabel = (status?: PaperStatus) => {
  if (!status) return 'Pending';
  return STATUS_LABELS[String(status)] || String(status).replace(/_/g, ' ');
};

export const formatDate = (value?: string | null) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
};

export const formatRelativeTime = (value?: string | null) => {
  if (!value) return 'just now';
  const target = new Date(value).getTime();
  if (Number.isNaN(target)) return 'just now';
  const diff = Math.max(0, Date.now() - target);
  const minutes = Math.floor(diff / (1000 * 60));

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  return formatDate(value);
};

export const paperDate = (paper: ResearchPaper) =>
  paper.published_date || paper.submission_date || paper.created_at || null;

export const getPrimaryAuthorName = (paper: ResearchPaper) => {
  if (paper.users?.fullName) return paper.users.fullName;
  if (paper.users?.name) return paper.users.name;

  const structured = Array.isArray(paper.structured_authors)
    ? paper.structured_authors
    : [];
  const primary = structured.find((entry) => entry?.is_primary);

  if (primary?.author?.fullName) return primary.author.fullName;
  if (primary?.author?.name) return primary.author.name;

  const first = structured[0];
  if (first?.author?.fullName) return first.author.fullName;
  if (first?.author?.name) return first.author.name;

  return 'Unknown Author';
};

export const countCoAuthors = (paper: ResearchPaper) => {
  const structured = Array.isArray(paper.structured_authors)
    ? paper.structured_authors
    : [];

  const coAuthorsFromStructured = structured.filter((entry) => !entry?.is_primary)
    .length;

  const extraNotes = paper.external_author_notes;
  if (!extraNotes) return coAuthorsFromStructured;

  const list = Array.isArray(extraNotes)
    ? extraNotes
    : String(extraNotes)
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean);

  return Math.max(coAuthorsFromStructured, list.length);
};

export const normalizeAuthorEntries = (paper: ResearchPaper): StructuredAuthorEntry[] => {
  if (Array.isArray(paper.structured_authors) && paper.structured_authors.length > 0) {
    return paper.structured_authors;
  }

  if (paper.users) {
    return [
      {
        is_primary: true,
        author_order: 1,
        author: paper.users,
      },
    ];
  }

  return [];
};
