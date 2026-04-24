import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/auth';
import { getApiErrorMessage } from '../api/helpers';
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
} from '../storage/authStorage';
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const bootstrapSession = async () => {
    setLoading(true);

    try {
      const [accessToken, refreshToken] = await Promise.all([
        getAccessToken(),
        getRefreshToken(),
      ]);

      if (!accessToken && !refreshToken) {
        setUser(null);
        return;
      }

      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser || null);
    } catch (_error) {
      await clearAuthTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    bootstrapSession();
  }, []);

  const signIn = async (email: string, password: string): Promise<SignInResult> => {
    try {
      const payload = await authApi.login(email, password);

      if (!payload?.token || !payload?.refreshToken || !payload?.user) {
        return {
          success: false,
          error: 'Login response is incomplete. Please try again.',
        };
      }

      await setAuthTokens(payload.token, payload.refreshToken);
      setUser(payload.user);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: getApiErrorMessage(error, 'Unable to sign in.'),
      };
    }
  };

  const signOut = async () => {
    await clearAuthTokens();
    setUser(null);
  };

  const refreshCurrentUser = async () => {
    try {
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser || null);
    } catch (_error) {
      await clearAuthTokens();
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
