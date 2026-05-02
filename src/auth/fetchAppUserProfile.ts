/**
 * Loads `public.users` for the signed-in Supabase Auth user by email.
 * If the profile row is missing, fall back to a minimal profile derived from the
 * authenticated Supabase user metadata so the app can still complete login.
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
  authUser: SupabaseAuthUserSnapshot,
  options?: { allowFallback?: boolean }
): Promise<FetchAppUserProfileResult> {
  const authEmail = authUser.email?.trim().toLowerCase();
  const allowFallback = options?.allowFallback ?? true;

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
      if (!allowFallback) {
        console.warn(`[fetchAppUserProfile] No user found with email: ${normalized}. Not using fallback during bootstrap.`);
        return {
          user: null,
          error: 'not_provisioned',
          message: 'User profile not found in the application database.',
        };
      }

      console.warn(`[fetchAppUserProfile] No user found with email: ${normalized}. Falling back to Supabase auth metadata.`);

      const metadata = authUser.user_metadata ?? {};
      const fallbackUser: User = {
        id: authUser.id,
        email: normalized,
        fullName: buildFullName({
          first_name: typeof metadata.first_name === 'string' ? metadata.first_name : undefined,
          middle_name: typeof metadata.middle_name === 'string' ? metadata.middle_name : undefined,
          last_name: typeof metadata.last_name === 'string' ? metadata.last_name : undefined,
          email: normalized,
        }),
        role: (typeof metadata.role === 'string' ? metadata.role : 'student') as UserRole,
        department: typeof metadata.department === 'string' ? metadata.department : null,
        departmentId: typeof metadata.department_id === 'string' ? metadata.department_id : null,
        program: typeof metadata.program === 'string' ? metadata.program : null,
        programId: typeof metadata.program_id === 'string' ? metadata.program_id : null,
        createdAt: authUser.created_at,
      };

      return {
        user: fallbackUser,
        error: 'not_provisioned',
        message: 'User profile not found in the application database. Using auth session fallback.',
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
