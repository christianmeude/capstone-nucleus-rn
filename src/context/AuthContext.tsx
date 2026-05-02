import axios from 'axios';
import { Session } from '@supabase/supabase-js';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/auth';
import { getApiErrorMessage } from '../api/helpers';
import { mapSupabaseAuthError } from '../auth/mapSupabaseAuthError';
import { supabase } from '../lib/supabase';
import { clearAuthTokens } from '../storage/authStorage';
import { User } from '../types/domain';

interface SignInResult {
  success: boolean;
  error?: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signOut: () => Promise<void>;
  refreshCurrentUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Load app profile after Supabase Auth via Express GET /auth/me.
 * The backend uses the service role (or equivalent) and bypasses RLS on `public.users`.
 * Direct Supabase `from('users')` reads from the mobile anon key often return no row because RLS
 * policies were tightened (see web migration harden_rls_views_and_functions.sql).
 */
async function loadProfileFromBackend(): Promise<User | null> {
  const user = await authApi.getCurrentUser();
  return user ?? null;
}

async function applySessionToUser(session: Session | null): Promise<User | null> {
  if (!session?.user) {
    return null;
  }

  try {
    return await loadProfileFromBackend();
  } catch (error) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    if (status === 401 || status === 404) {
      await supabase.auth.signOut();
      return null;
    }
    // Network or 5xx: keep Supabase session so the user can retry when the API is reachable again.
    return null;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const finishApply = async (session: Session | null) => {
      const nextUser = await applySessionToUser(session);
      if (cancelled) return;
      setUser(nextUser);
    };

    const bootstrap = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      await finishApply(session);
      if (!cancelled) setLoading(false);
    };

    bootstrap();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'TOKEN_REFRESHED') {
        return;
      }
      if (event === 'INITIAL_SESSION') {
        return;
      }

      if (!session) {
        if (!cancelled) setUser(null);
        return;
      }

      await finishApply(session);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<SignInResult> => {
    try {
      const normalizedEmail = email.trim().toLowerCase();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        return {
          success: false,
          error: mapSupabaseAuthError(error),
        };
      }

      if (!data.session?.user) {
        return {
          success: false,
          error: 'Unable to establish session. Please try again.',
        };
      }

      try {
        const profile = await loadProfileFromBackend();
        if (!profile) {
          await supabase.auth.signOut();
          return {
            success: false,
            error: 'Unable to load your profile. Please try again.',
          };
        }
        setUser(profile);
        return { success: true };
      } catch (profileError) {
        await supabase.auth.signOut();
        const status = axios.isAxiosError(profileError) ? profileError.response?.status : undefined;
        if (status === 404) {
          return {
            success: false,
            error:
              'Your account is not provisioned in the application database. Please contact support.',
          };
        }
        return {
          success: false,
          error: getApiErrorMessage(profileError, 'Unable to complete sign in.'),
        };
      }
    } catch (_error) {
      return {
        success: false,
        error: 'Unable to sign in.',
      };
    }
  };

  const signOut = async () => {
    await clearAuthTokens();
    await supabase.auth.signOut();
    setUser(null);
  };

  const refreshCurrentUser = async () => {
    try {
      const profile = await loadProfileFromBackend();
      setUser(profile);
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      if (status === 401 || status === 404) {
        await supabase.auth.signOut();
      }
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      signIn,
      signOut,
      refreshCurrentUser,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
