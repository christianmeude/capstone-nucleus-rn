import api from './http';
import { unwrapApiData } from './helpers';
import { CoAuthorInvitation } from '../types/domain';

interface InvitationPayload {
  invitations: CoAuthorInvitation[];
  pendingCount: number;
}

export const invitationsApi = {
  getMine: async (status?: string) => {
    const response = await api.get('/auth/co-author-invitations', {
      params: status ? { status } : undefined,
    });

    const payload = unwrapApiData<InvitationPayload>(response);
    return payload;
  },

  accept: async (token: string) => {
    await api.post(`/auth/co-author-invitations/${token}/accept`);
  },

  decline: async (token: string) => {
    await api.post(`/auth/co-author-invitations/${token}/decline`);
  },
};
