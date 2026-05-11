import { StyleSheet, Text, View } from 'react-native';
import { NotificationItem } from '../types/domain';
import { formatRelativeTime } from '../utils/format';
import { PressableCard } from './ui/Card';
import { theme } from '../theme';
import { Badge } from './ui/Badge';

interface NotificationCardProps {
  notification: NotificationItem;
  onPress: () => void;
}

export const NotificationCard = ({ notification, onPress }: NotificationCardProps) => {
  const unread = !notification.is_read;

  return (
    <PressableCard
      onPress={onPress}
      accessibilityLabel={notification.title || 'Notification'}
      style={unread ? { backgroundColor: theme.colors.brand.primarySurface } : undefined}
    >
      <View style={styles.topRow}>
        <Text style={[styles.title, unread ? styles.unreadTitle : null]}>
          {notification.title || 'Notification'}
        </Text>
        {unread ? <Badge /> : null}
      </View>
      <Text style={styles.body}>{notification.message || 'No additional details.'}</Text>
      <Text style={styles.meta}>{formatRelativeTime(notification.created_at)}</Text>
    </PressableCard>
  );
};

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  title: {
    ...theme.typography.bodyStrong,
    color: theme.colors.text.primary,
    flex: 1,
  },
  unreadTitle: {
    color: theme.colors.brand.primary,
  },
  body: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  meta: {
    ...theme.typography.caption,
    color: theme.colors.text.muted,
    marginTop: theme.spacing.xs,
  },
});
