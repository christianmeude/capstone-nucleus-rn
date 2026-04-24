import { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { notificationsApi } from '../../api/notifications';
import { NotificationItem } from '../../types/domain';
import { formatRelativeTime } from '../../utils/format';

export const NotificationsScreen = () => {
  const navigation = useNavigation<any>();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const rows = await notificationsApi.getMine(100);
      setNotifications(rows);
      setError('');
    } catch (_error) {
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.is_read).length,
    [notifications]
  );

  const openNotification = async (item: NotificationItem) => {
    if (!item.is_read) {
      try {
        await notificationsApi.markRead(item.id);
      } catch {
        // Keep navigation usable if read-state update fails.
      }

      setNotifications((prev) =>
        prev.map((entry) =>
          entry.id === item.id
            ? {
                ...entry,
                is_read: true,
              }
            : entry
        )
      );
    }

    if (item.research_id) {
      navigation.navigate('ResearchDetail', { paperId: item.research_id });
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((entry) => ({ ...entry, is_read: true })));
    } catch {
      setError('Unable to mark all notifications as read.');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} />}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>{unreadCount} unread</Text>
        </View>

        <Pressable
          style={[styles.actionButton, unreadCount === 0 ? styles.actionButtonDisabled : null]}
          disabled={unreadCount === 0}
          onPress={markAllAsRead}
        >
          <Text
            style={[
              styles.actionButtonLabel,
              unreadCount === 0 ? styles.actionButtonLabelDisabled : null,
            ]}
          >
            Mark all read
          </Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <Text style={styles.loadingText}>Loading notifications...</Text>
      ) : notifications.length === 0 ? (
        <Text style={styles.emptyText}>No notifications yet.</Text>
      ) : (
        notifications.map((item) => (
          <Pressable
            key={item.id}
            style={[styles.card, !item.is_read ? styles.unreadCard : null]}
            onPress={() => openNotification(item)}
          >
            <Text style={styles.cardTitle}>{item.title || 'Notification'}</Text>
            <Text style={styles.cardBody}>{item.message || 'No additional details.'}</Text>
            <Text style={styles.cardMeta}>{formatRelativeTime(item.created_at)}</Text>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    marginTop: 2,
    color: '#475569',
    fontSize: 13,
  },
  actionButton: {
    borderWidth: 1,
    borderColor: '#1c4d8d',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: '#ffffff',
  },
  actionButtonDisabled: {
    borderColor: '#cbd5e1',
  },
  actionButtonLabel: {
    color: '#1c4d8d',
    fontSize: 12,
    fontWeight: '700',
  },
  actionButtonLabelDisabled: {
    color: '#94a3b8',
  },
  error: {
    color: '#dc2626',
    fontSize: 13,
  },
  loadingText: {
    color: '#475569',
    fontSize: 14,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    gap: 6,
  },
  unreadCard: {
    borderColor: '#1c4d8d',
  },
  cardTitle: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '700',
  },
  cardBody: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 18,
  },
  cardMeta: {
    color: '#64748b',
    fontSize: 11,
  },
});
