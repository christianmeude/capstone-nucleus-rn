import api from './http';
import { NotificationItem } from '../types/domain';

export const notificationsApi = {
  getMine: async (limit = 100) => {
    const response = await api.get('/auth/notifications', {
      params: { limit },
    });

    const notifications = (response.data?.notifications || []) as NotificationItem[];
    return notifications;
  },

  getUnreadCount: async () => {
    const response = await api.get('/auth/notifications/unread-count');
    return Number(response.data?.unreadCount || 0);
  },

  markRead: async (notificationId: string) => {
    await api.patch(`/auth/notifications/${notificationId}/read`);
  },

  markAllRead: async () => {
    await api.patch('/auth/notifications/read-all');
  },
};
