import { Session } from '@supabase/supabase-js';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { fetchAppUserProfile } from '../auth/fetchAppUserProfile';
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

async function loadProfileFromSession(session: Session | null): Promise<User | null> {
  if (!session?.user) {
    return null;
  }

  const { user } = await fetchAppUserProfile(session.user, { allowFallback: false });

  if (user) {
    return user;
  }

  await supabase.auth.signOut();
  return null;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const finishApply = async (session: Session | null) => {
      const nextUser = await loadProfileFromSession(session);
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
        const profileResult = await fetchAppUserProfile(data.session.user);
        console.log('[AuthContext.signIn] Profile result:', profileResult);
        
        const profile = profileResult.user;
        if (!profile) {
          await supabase.auth.signOut();
          const errorMsg = profileResult.message || 'Unable to load your profile. Verify your account is provisioned in the system.';
          console.error('[AuthContext.signIn] Profile load failed:', errorMsg);
          return {
            success: false,
            error: errorMsg,
          };
        }
        setUser(profile);
        return { success: true };
      } catch (profileError) {
        await supabase.auth.signOut();
        const message = profileError instanceof Error ? profileError.message : 'Unable to complete sign in.';
        console.error('[AuthContext.signIn] Caught profile error:', message);
        return {
          success: false,
          error: message,
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
      const { data: { session } } = await supabase.auth.getSession();
      const profile = await loadProfileFromSession(session);
      setUser(profile);
    } catch (_error) {
      await supabase.auth.signOut();
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
