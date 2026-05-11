import { StyleSheet, Text, View } from 'react-native';
import { CoAuthorInvitation } from '../types/domain';
import { formatDate } from '../utils/format';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { theme } from '../theme';

interface InvitationCardProps {
  invitation: CoAuthorInvitation;
  acting?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
}

const dotColorForStatus = (status: string) => {
  switch (status) {
    case 'pending':
      return theme.colors.brand.accent;
    case 'accepted':
      return theme.colors.state.success;
    case 'declined':
      return theme.colors.state.danger;
    case 'expired':
      return theme.colors.text.muted;
    default:
      return theme.colors.border.subtle;
  }
};

const statusLabelForStatus = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'accepted':
      return 'Accepted';
    case 'declined':
      return 'Declined';
    case 'expired':
      return 'Expired';
    default:
      if (!status) return '';
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

export const InvitationCard = ({
  invitation,
  acting = false,
  onAccept,
  onDecline,
}: InvitationCardProps) => {
  const isPending = invitation.status === 'pending';
  const inviter =
    invitation.inviter?.fullName || invitation.inviter?.name || invitation.inviter?.email || 'Unknown';
  const statusKey = String(invitation.status);
  const dotColor = dotColorForStatus(statusKey);
  const statusLabel = statusLabelForStatus(statusKey);

  const invitedRow =
    invitation.created_at != null && invitation.created_at !== '' ? (
      <Text style={styles.meta}>Invited: {formatDate(invitation.created_at)}</Text>
    ) : null;

  const expiresRow =
    invitation.status === 'pending' ? (
      <Text style={styles.meta}>Expires: {formatDate(invitation.expires_at)}</Text>
    ) : null;

  const expiredRow =
    invitation.status === 'expired' ? (
      <Text style={styles.meta}>Expired: {formatDate(invitation.expires_at)}</Text>
    ) : null;

  return (
    <Card>
      <View style={[styles.cardInner, { opacity: isPending ? 1 : 0.5 }]}>
        <View style={styles.content}>
          <Text style={styles.title}>{invitation.research?.title || 'Untitled Research'}</Text>

          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: dotColor }]} />
            <Text style={styles.statusLabel}>{statusLabel}</Text>
          </View>

          <Text style={styles.meta}>Invited by: {inviter}</Text>
          {invitedRow}
          {expiresRow}
          {expiredRow}
        </View>

        {isPending ? (
          <View style={styles.actions}>
            <Button
              label="Accept"
              variant="primary"
              onPress={onAccept || (() => undefined)}
              loading={acting}
              disabled={acting}
            />
            <Button
              label="Decline"
              variant="secondary"
              onPress={onDecline || (() => undefined)}
              loading={false}
              disabled={acting}
            />
          </View>
        ) : null}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  cardInner: {
    gap: 0,
  },
  content: {
    gap: theme.spacing.xs,
  },
  title: {
    ...theme.typography.bodyStrong,
    color: theme.colors.text.primary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusLabel: {
    ...theme.typography.metadata,
    color: theme.colors.text.secondary,
  },
  meta: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
  },
  actions: {
    marginTop: theme.spacing.md,
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
});
