import { StyleSheet, Text, View } from 'react-native';
import { CoAuthorInvitation } from '../types/domain';
import { formatDate } from '../utils/format';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { theme } from '../theme';
import { PaperStatusChip } from './PaperStatusChip';

interface InvitationCardProps {
  invitation: CoAuthorInvitation;
  acting?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
}

export const InvitationCard = ({
  invitation,
  acting = false,
  onAccept,
  onDecline,
}: InvitationCardProps) => {
  const isPending = invitation.status === 'pending';
  const inviter =
    invitation.inviter?.fullName || invitation.inviter?.name || invitation.inviter?.email || 'Unknown';

  return (
    <Card>
      <View style={styles.content}>
        <Text style={styles.title}>{invitation.research?.title || 'Untitled Research'}</Text>
        <PaperStatusChip status={invitation.status} />
        <Text style={styles.meta}>Invited by: {inviter}</Text>
        <Text style={styles.meta}>Expires: {formatDate(invitation.expires_at)}</Text>
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
    </Card>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.xs,
  },
  title: {
    ...theme.typography.bodyStrong,
    color: theme.colors.text.primary,
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
