export type UserRole =
  | 'student'
  | 'faculty'
  | 'dean'
  | 'program_chair'
  | 'staff'
  | 'admin';

export type PaperStatus =
  | 'pending'
  | 'pending_faculty'
  | 'pending_dean'
  | 'pending_program_chair'
  | 'pending_editor'
  | 'pending_admin'
  | 'approved'
  | 'published'
  | 'rejected'
  | 'revision_required'
  | string;

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  department?: string | null;
  departmentId?: string | null;
  program?: string | null;
  programId?: string | null;
  createdAt?: string;
}

export interface PaperAuthor {
  id?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  fullName?: string;
  name?: string;
  email?: string;
}

export interface StructuredAuthorEntry {
  user_id?: string;
  is_primary?: boolean;
  author_order?: number;
  author?: PaperAuthor | null;
}

export interface ResearchPaper {
  id: string;
  title: string;
  abstract: string;
  status: PaperStatus;
  category?: string | null;
  keywords?: string[] | null;
  created_at?: string;
  updated_at?: string;
  submission_date?: string;
  published_date?: string;
  file_url?: string | null;
  file_name?: string | null;
  department?: string | null;
  department_id?: string | null;
  program_id?: string | null;
  revision_notes?: string | null;
  rejection_reason?: string | null;
  view_count?: number;
  download_count?: number;
  users?: PaperAuthor | null;
  author?: PaperAuthor | null;
  structured_authors?: StructuredAuthorEntry[];
  external_author_notes?: string | string[] | null;
}

export interface WorkflowEntry {
  id: string;
  reviewer_role?: string;
  action_type?: string;
  status?: string;
  comments?: string | null;
  previous_status?: string | null;
  new_status?: string | null;
  reviewed_at?: string;
  created_at?: string;
  reviewer?: PaperAuthor | null;
}

export interface Category {
  id: string;
  name: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  research_id?: string | null;
  type?: string;
  title?: string;
  message?: string;
  is_read: boolean;
  created_at: string;
}

export interface CoAuthorInvitation {
  id: string;
  research_id: string;
  inviter_id: string;
  invitee_id: string;
  token: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired' | string;
  expires_at?: string;
  created_at?: string;
  responded_at?: string | null;
  accepted_at?: string | null;
  declined_at?: string | null;
  research?: {
    id: string;
    title: string;
  } | null;
  inviter?: PaperAuthor | null;
}

export interface SubmissionPolicy {
  maxFileSizeMb: number;
  allowedFileTypes: string[];
}
