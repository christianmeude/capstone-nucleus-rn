import { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { invitationsApi } from '../../api/invitations';
import { CoAuthorInvitation } from '../../types/domain';
import { formatDate } from '../../utils/format';

export const InvitationsScreen = () => {
  const [invitations, setInvitations] = useState<CoAuthorInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actingToken, setActingToken] = useState('');
  const [error, setError] = useState('');

  const loadData = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const payload = await invitationsApi.getMine();
      setInvitations(payload.invitations || []);
      setError('');
    } catch (_error) {
      setError('Failed to load invitations.');
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

  const counts = useMemo(() => {
    return invitations.reduce(
      (acc, invitation) => {
        const status = invitation.status;
        if (status === 'pending') acc.pending += 1;
        if (status === 'accepted') acc.accepted += 1;
        if (status === 'declined' || status === 'expired') acc.closed += 1;
        return acc;
      },
      { pending: 0, accepted: 0, closed: 0 }
    );
  }, [invitations]);

  const isExpired = (invitation: CoAuthorInvitation) => {
    if (!invitation.expires_at) return false;
    return new Date(invitation.expires_at).getTime() < Date.now();
  };

  const runAction = async (token: string, action: 'accept' | 'decline') => {
    setActingToken(token);
    setError('');

    try {
      if (action === 'accept') {
        await invitationsApi.accept(token);
      } else {
        await invitationsApi.decline(token);
      }

      await loadData(true);
    } catch (_error) {
      setError(`Failed to ${action} invitation.`);
    } finally {
      setActingToken('');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} />}
    >
      <Text style={styles.title}>Co-author Invites</Text>

      <View style={styles.statsRow}>
        <StatCard label="Pending" value={counts.pending} />
        <StatCard label="Accepted" value={counts.accepted} />
        <StatCard label="Closed" value={counts.closed} />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <Text style={styles.loadingText}>Loading invitations...</Text>
      ) : invitations.length === 0 ? (
        <Text style={styles.emptyText}>No invitations available.</Text>
      ) : (
        invitations.map((invitation) => {
          const expired = invitation.status === 'pending' && isExpired(invitation);

          return (
            <View key={invitation.id} style={styles.card}>
              <Text style={styles.cardTitle}>{invitation.research?.title || 'Untitled Research'}</Text>
              <Text style={styles.cardMeta}>Status: {expired ? 'expired' : invitation.status}</Text>
              <Text style={styles.cardMeta}>Invited by: {invitation.inviter?.fullName || invitation.inviter?.name || invitation.inviter?.email || 'Unknown'}</Text>
              <Text style={styles.cardMeta}>Expires: {formatDate(invitation.expires_at)}</Text>

              {invitation.status === 'pending' && !expired ? (
                <View style={styles.actionsRow}>
                  <Pressable
                    style={[styles.actionButton, styles.acceptButton]}
                    disabled={actingToken === invitation.token}
                    onPress={() => runAction(invitation.token, 'accept')}
                  >
                    <Text style={styles.actionButtonLabel}>Accept</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.actionButton, styles.declineButton]}
                    disabled={actingToken === invitation.token}
                    onPress={() => runAction(invitation.token, 'decline')}
                  >
                    <Text style={styles.actionButtonLabel}>Decline</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          );
        })
      )}
    </ScrollView>
  );
};

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <View style={styles.statCard}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    padding: 10,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
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
    gap: 5,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  cardMeta: {
    color: '#475569',
    fontSize: 12,
  },
  actionsRow: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    minHeight: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButton: {
    backgroundColor: '#059669',
  },
  declineButton: {
    backgroundColor: '#dc2626',
  },
  actionButtonLabel: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
});
