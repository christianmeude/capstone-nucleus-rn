import { AxiosError, AxiosResponse } from 'axios';
import { API_BASE_URL } from '../config/env';

export const unwrapApiData = <T>(response: AxiosResponse<any>): T => {
  return (response?.data?.data ?? response?.data ?? {}) as T;
};

const readMessageFromErrorList = (errors: unknown): string | null => {
  if (!Array.isArray(errors)) return null;

  for (const item of errors) {
    if (typeof item === 'string' && item.trim()) {
      return item;
    }

    if (item && typeof item === 'object') {
      const candidate = (item as Record<string, unknown>).message ?? (item as Record<string, unknown>).msg;
      if (typeof candidate === 'string' && candidate.trim()) {
        return candidate;
      }
    }
  }

  return null;
};

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  const axiosError = error as AxiosError<any>;
  const payload = axiosError?.response?.data;

  if (typeof payload === 'string' && payload.trim()) return payload;
  if (typeof payload?.error === 'string') return payload.error;
  if (payload?.error?.message) return payload.error.message;
  if (payload?.message) return payload.message;
  if (payload?.data?.message) return payload.data.message;

  const listErrorMessage =
    readMessageFromErrorList(payload?.errors) ?? readMessageFromErrorList(payload?.error?.errors);
  if (listErrorMessage) return listErrorMessage;

  if (axiosError?.code === 'ERR_NETWORK') {
    return `Cannot connect to API at ${API_BASE_URL}. Check backend status and CORS settings.`;
  }

  if (axiosError?.code === 'ECONNABORTED') {
    return 'Request timed out while contacting the server. Please try again.';
  }

  if (axiosError?.response?.status) {
    return `${fallback} (HTTP ${axiosError.response.status})`;
  }

  if (typeof axiosError?.message === 'string' && axiosError.message.trim()) {
    return axiosError.message;
  }

  return fallback;
};
