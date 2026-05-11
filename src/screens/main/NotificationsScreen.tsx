import { useCallback, useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { notificationsApi } from '../../api/notifications';
import { NotificationItem } from '../../types/domain';
import { NotificationCard } from '../../components/NotificationCard';
import { theme } from '../../theme';
import { Button, EmptyState, InlineNotice, Skeleton } from '../../components/ui';

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
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => loadData(true)}
          tintColor={theme.colors.brand.primary}
          colors={[theme.colors.brand.primary]}
        />
      }
    >
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>
            {unreadCount} unread
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Button
            label="Mark all read"
            variant="subtle"
            size="sm"
            disabled={unreadCount === 0}
            onPress={markAllAsRead}
            accessibilityLabel="Mark all notifications as read"
          />
        </View>
      </View>

      {error ? <InlineNotice tone="danger" message={error} /> : null}

      {loading ? (
        <View style={styles.skeletonList}>
          <Skeleton height={96} />
          <Skeleton height={96} />
          <Skeleton height={96} />
        </View>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={
            <Ionicons
              name="notifications-outline"
              size={24}
              color={theme.colors.text.muted}
            />
          }
          title="No notifications yet"
          message="Updates on your papers and activity will appear here."
        />
      ) : (
        <View style={styles.list}>
          {notifications.map((item) => (
            <NotificationCard
              key={item.id}
              notification={item}
              onPress={() => openNotification(item)}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface.base,
  },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  headerLeft: {
    flex: 1,
    minWidth: 0,
  },
  headerRight: {
    flexShrink: 0,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text.primary,
  },
  subtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  skeletonList: {
    gap: theme.spacing.sm,
  },
  list: {
    gap: theme.spacing.sm,
  },
});
