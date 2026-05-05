import { fetchAppUserProfile } from '../auth/fetchAppUserProfile';
import { supabase } from '../lib/supabase';
import { NotificationItem } from '../types/domain';

interface NotificationRow {
  id: string;
  user_id: string;
  research_id?: string | null;
  type?: string | null;
  title?: string | null;
  message?: string | null;
  is_read: boolean;
  created_at: string;
}

async function resolveCurrentStudentProfile() {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message || 'Unable to resolve the current session.');
  }

  if (!userData.user) {
    throw new Error('Sign in required to load notifications.');
  }

  const profileResult = await fetchAppUserProfile(userData.user);

  if (!profileResult.user) {
    throw new Error(profileResult.message || 'Your account is not provisioned for notifications.');
  }

  if (profileResult.user.role !== 'student') {
    throw new Error('Student access is required to load notifications.');
  }

  return profileResult.user;
}

function toNotificationItem(row: NotificationRow): NotificationItem {
  return {
    id: row.id,
    user_id: row.user_id,
    research_id: row.research_id ?? null,
    type: row.type ?? undefined,
    title: row.title ?? undefined,
    message: row.message ?? undefined,
    is_read: row.is_read,
    created_at: row.created_at,
  };
}

async function loadNotifications(limit = 100) {
  const profile = await resolveCurrentStudentProfile();

  const { data, error } = await supabase
    .from('notifications')
    .select('id, user_id, research_id, type, title, message, is_read, created_at')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message || 'Unable to load notifications.');
  }

  return (Array.isArray(data) ? (data as unknown as NotificationRow[]) : []).map(toNotificationItem);
}

async function loadUnreadCount() {
  const profile = await resolveCurrentStudentProfile();

  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', profile.id)
    .eq('is_read', false);

  if (error) {
    throw new Error(error.message || 'Unable to load unread count.');
  }

  return count ?? 0;
}

async function markNotificationRead(notificationId: string) {
  const profile = await resolveCurrentStudentProfile();

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', profile.id);

  if (error) {
    throw new Error(error.message || 'Unable to mark notification as read.');
  }
}

async function markAllNotificationsRead() {
  const profile = await resolveCurrentStudentProfile();

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', profile.id)
    .eq('is_read', false);

  if (error) {
    throw new Error(error.message || 'Unable to mark notifications as read.');
  }
}

export const notificationsApi = {
  getNotifications: loadNotifications,
  getMine: loadNotifications,
  getUnreadCount: loadUnreadCount,
  markAsRead: markNotificationRead,
  markRead: markNotificationRead,
  markAllAsRead: markAllNotificationsRead,
  markAllRead: markAllNotificationsRead,
};