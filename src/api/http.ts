import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../config/env';
import { supabase } from '../lib/supabase';

type RetriableConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise: Promise<boolean> | null = null;

const refreshSupabaseSession = async (): Promise<boolean> => {
  const { data, error } = await supabase.auth.refreshSession();
  if (error || !data.session?.access_token) {
    return false;
  }
  return true;
};

api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (token) {
    config.headers = config.headers || {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const requestUrl = String(originalRequest?.url || '');

    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/refresh')
    ) {
      throw error;
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshSupabaseSession().finally(() => {
          refreshPromise = null;
        });
      }

      const refreshed = await refreshPromise;
      if (!refreshed) {
        await supabase.auth.signOut();
        throw error;
      }

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        await supabase.auth.signOut();
        throw error;
      }

      originalRequest.headers = originalRequest.headers || {};
      (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${token}`;

      return api(originalRequest);
    } catch (refreshError) {
      throw refreshError;
    }
  }
);

export default api;
