import { fetchAppUserProfile } from '../auth/fetchAppUserProfile';
import { supabase } from '../lib/supabase';
import { CoAuthorInvitation, PaperAuthor } from '../types/domain';

interface InvitationPayload {
  invitations: CoAuthorInvitation[];
  pendingCount: number;
}

interface InvitationUserRow {
  id: string;
  email?: string | null;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
}

type InvitationUserRelation = InvitationUserRow | InvitationUserRow[] | null | undefined;

interface InvitationResearchRow {
  id: string;
  title?: string | null;
}

type InvitationResearchRelation = InvitationResearchRow | InvitationResearchRow[] | null | undefined;

interface InvitationRow {
  id: string;
  research_id: string;
  inviter_id: string;
  invitee_id: string;
  invitee_email?: string | null;
  token: string;
  status: string;
  expires_at?: string | null;
  created_at?: string | null;
  responded_at?: string | null;
  updated_at?: string | null;
  research?: InvitationResearchRelation;
  inviter?: InvitationUserRelation;
}

const INVITATION_SELECT = `
  id,
  research_id,
  inviter_id,
  invitee_id,
  invitee_email,
  token,
  status,
  expires_at,
  created_at,
  responded_at,
  updated_at
`;

async function resolveCurrentStudentProfile() {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message || 'Unable to resolve the current session.');
  }

  if (!userData.user) {
    throw new Error('Sign in required to load invitations.');
  }

  const profileResult = await fetchAppUserProfile(userData.user);

  if (!profileResult.user) {
    throw new Error(profileResult.message || 'Your account is not provisioned for invitations.');
  }

  if (profileResult.user.role !== 'student') {
    throw new Error('Student access is required to load invitations.');
  }

  return profileResult.user;
}

function pickUser(row?: InvitationUserRelation): InvitationUserRow | null {
  if (!row) return null;
  if (Array.isArray(row)) return row[0] ?? null;
  return row;
}

function pickResearch(row?: InvitationResearchRelation): InvitationResearchRow | null {
  if (!row) return null;
  if (Array.isArray(row)) return row[0] ?? null;
  return row;
}

function buildFullName(row?: InvitationUserRow | null) {
  if (!row) return '';

  const parts = [row.first_name, row.middle_name, row.last_name].filter(Boolean) as string[];
  const joined = parts.join(' ').replace(/\s+/g, ' ').trim();
  return joined || String(row.email || '').trim();
}

function toPaperAuthor(row?: InvitationUserRelation): PaperAuthor | null {
  const normalized = pickUser(row);
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

function toInvitation(row: InvitationRow): CoAuthorInvitation {
  const research = pickResearch(row.research);

  return {
    id: row.id,
    research_id: row.research_id,
    inviter_id: row.inviter_id,
    invitee_id: row.invitee_id,
    token: row.token,
    status: row.status,
    expires_at: row.expires_at ?? undefined,
    created_at: row.created_at ?? undefined,
    responded_at: row.responded_at ?? null,
    research: research
      ? {
          id: research.id,
          title: research.title ?? 'Untitled Research',
        }
      : null,
    inviter: toPaperAuthor(row.inviter),
  };
}

async function loadPendingCount(inviteeId: string) {
  const { count, error } = await supabase
    .from('co_author_invitations')
    .select('id', { count: 'exact', head: true })
    .eq('invitee_id', inviteeId)
    .eq('status', 'pending');

  if (error) {
    throw new Error(error.message || 'Unable to load invitation count.');
  }

  return count ?? 0;
}

async function loadInvitations(status?: string): Promise<InvitationPayload> {
  const profile = await resolveCurrentStudentProfile();

  let query = supabase
    .from('co_author_invitations')
    .select(INVITATION_SELECT)
    .eq('invitee_id', profile.id)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message || 'Unable to load invitations.');
  }

  const rows = Array.isArray(data) ? (data as unknown as InvitationRow[]) : [];
  const invitations = rows.map(toInvitation);
  const pendingCount = await loadPendingCount(profile.id);

  return { invitations, pendingCount };
}

async function respondToInvitation(token: string, status: 'accepted' | 'declined') {
  const profile = await resolveCurrentStudentProfile();
  const respondedAt = new Date().toISOString();

  const { error } = await supabase
    .from('co_author_invitations')
    .update({ status, responded_at: respondedAt })
    .eq('token', token)
    .eq('invitee_id', profile.id)
    .eq('status', 'pending');

  if (error) {
    const actionLabel = status === 'accepted' ? 'accept' : 'decline';
    throw new Error(error.message || `Unable to ${actionLabel} invitation.`);
  }
}

async function acceptInvitation(token: string) {
  await respondToInvitation(token, 'accepted');
}

async function declineInvitation(token: string) {
  await respondToInvitation(token, 'declined');
}

export const invitationsApi = {
  getInvitations: loadInvitations,
  getMine: loadInvitations,
  acceptInvitation,
  accept: acceptInvitation,
  declineInvitation,
  decline: declineInvitation,
};
