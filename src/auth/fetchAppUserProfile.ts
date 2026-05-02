/**
 * Direct `public.users` fetch via the Supabase anon client.
 *
 * **Note:** Production DB often has RLS on `users` without a policy allowing anon reads, so this
 * returns no row even for valid accounts. Auth profile loading should use Express `GET /auth/me`
 * (see AuthContext) until RLS allows authenticated self-read or a secure RPC exists.
 */
import { supabase } from '../lib/supabase';
import { User, UserRole } from '../types/domain';

export type FetchAppUserProfileError = 'not_provisioned' | 'suspended' | 'query_failed';

export interface FetchAppUserProfileResult {
  user: User | null;
  error?: FetchAppUserProfileError;
  message?: string;
}

function buildFullName(row: {
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  email?: string | null;
}): string {
  const parts = [row.first_name, row.middle_name, row.last_name].filter(Boolean) as string[];
  const joined = parts.join(' ').replace(/\s+/g, ' ').trim();
  return joined || String(row.email || '').trim();
}

/**
 * Loads `public.users` for the signed-in Supabase Auth user.
 * Primary match: `users.id` === Supabase `auth.users.id` (backend middleware uses the same join).
 * Fallback: match by email if id lookup returns no row (same fallback pattern as Express `loadCurrentUser`).
 */
export async function fetchAppUserProfile(
  authUserId: string,
  authEmail: string | undefined
): Promise<FetchAppUserProfileResult> {
  const selectColumns =
    'id, email, first_name, middle_name, last_name, role, department, department_id, program, program_id, created_at, is_active, suspended_at';

  const { data: byId, error: idError } = await supabase
    .from('users')
    .select(selectColumns)
    .eq('id', authUserId)
    .maybeSingle();

  if (idError) {
    return {
      user: null,
      error: 'query_failed',
      message: idError.message,
    };
  }

  let row = byId;

  if (!row && authEmail) {
    const normalized = authEmail.trim().toLowerCase();
    const { data: byEmail, error: emailError } = await supabase
      .from('users')
      .select(selectColumns)
      .ilike('email', normalized)
      .maybeSingle();

    if (emailError) {
      return {
        user: null,
        error: 'query_failed',
        message: emailError.message,
      };
    }
    row = byEmail;
  }

  if (!row) {
    return { user: null, error: 'not_provisioned' };
  }

  if (row.is_active === false || row.suspended_at) {
    return { user: null, error: 'suspended' };
  }

  const user: User = {
    id: row.id,
    email: row.email,
    fullName: buildFullName(row),
    role: row.role as UserRole,
    department: row.department ?? null,
    departmentId: row.department_id ?? null,
    program: row.program ?? null,
    programId: row.program_id ?? null,
    createdAt: row.created_at ?? undefined,
  };

  return { user };
}
