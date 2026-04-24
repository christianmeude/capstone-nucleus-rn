import api from './http';
import { unwrapApiData } from './helpers';
import { SubmissionPolicy, User } from '../types/domain';

interface AuthPayload {
  token: string;
  refreshToken: string;
  user: User;
}

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  programId: string;
}

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return unwrapApiData<AuthPayload>(response);
  },

  register: async ({
    email,
    password,
    firstName,
    middleName,
    lastName,
    programId,
  }: RegisterInput) => {
    const fullName = [firstName, middleName, lastName]
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    const response = await api.post('/auth/register', {
      email,
      password,
      firstName,
      middleName,
      lastName,
      fullName,
      role: 'student',
      programId,
    });

    return unwrapApiData<AuthPayload>(response);
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    const payload = unwrapApiData<{ user: User }>(response);
    return payload.user;
  },

  refreshSession: async (refreshToken: string) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return unwrapApiData<AuthPayload>(response);
  },

  getSubmissionPolicy: async () => {
    const response = await api.get('/auth/submission-policy');
    return unwrapApiData<SubmissionPolicy>(response);
  },
};
