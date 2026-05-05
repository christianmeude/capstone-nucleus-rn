/**
 * Loads `public.users` for the signed-in Supabase Auth user by email.
 * The application profile row must exist; no fallback profile generation is supported.
 * This ensures strict provisioning requirements and alignment with the web backend.
 */
import { supabase } from '../lib/supabase';
import { User, UserRole } from '../types/domain';

export type FetchAppUserProfileError = 'not_provisioned' | 'suspended' | 'query_failed' | 'rls_blocked';

type SupabaseAuthUserSnapshot = {
  id: string;
  email?: string | null;
  created_at?: string;
  user_metadata?: Record<string, unknown> | null;
};

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

export async function fetchAppUserProfile(
  authUser: SupabaseAuthUserSnapshot
): Promise<FetchAppUserProfileResult> {
  const authEmail = authUser.email?.trim().toLowerCase();

  if (!authEmail) {
    console.warn('[fetchAppUserProfile] No email provided for profile lookup');
    return {
      user: null,
      error: 'query_failed',
      message: 'No email provided for profile lookup',
    };
  }

  const selectColumns =
    'id, email, first_name, middle_name, last_name, role, department, department_id, program, program_id, created_at, is_active, suspended_at';

  const normalized = authEmail;
  console.log(`[fetchAppUserProfile] Looking up user by email: ${normalized}`);

  try {
    const { data, error } = await supabase
      .from('users')
      .select(selectColumns)
      .ilike('email', normalized)
      .maybeSingle();

    if (error) {
      console.error(`[fetchAppUserProfile] Query error:`, error.code, error.message);
      // Code 42501 = RLS policy violation
      if (error.code === '42501') {
        return {
          user: null,
          error: 'rls_blocked',
          message: 'Profile access blocked by database policy. Contact support if this persists.',
        };
      }
      return {
        user: null,
        error: 'query_failed',
        message: error.message,
      };
    }

    if (!data) {
      console.warn(`[fetchAppUserProfile] No user found with email: ${normalized}. Account is not provisioned in the application database.`);
      return {
        user: null,
        error: 'not_provisioned',
        message: 'Your account has not been provisioned. Please contact your administrator or check that you registered with the correct email address.',
      };
    }

    console.log(`[fetchAppUserProfile] Found user:`, { id: data.id, email: data.email, role: data.role });

    if (data.is_active === false || data.suspended_at) {
      console.warn(`[fetchAppUserProfile] User is suspended`);
      return {
        user: null,
        error: 'suspended',
        message: 'Your account is suspended. Please contact support.',
      };
    }

    const user: User = {
      id: data.id,
      email: data.email,
      fullName: buildFullName(data),
      role: data.role as UserRole,
      department: data.department ?? null,
      departmentId: data.department_id ?? null,
      program: data.program ?? null,
      programId: data.program_id ?? null,
      createdAt: data.created_at ?? undefined,
    };

    console.log(`[fetchAppUserProfile] Profile loaded successfully`);
    return { user };
  } catch (err) {
    console.error(`[fetchAppUserProfile] Caught exception:`, err);
    return {
      user: null,
      error: 'query_failed',
      message: err instanceof Error ? err.message : 'Failed to load profile',
    };
  }
}
