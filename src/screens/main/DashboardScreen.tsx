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
import { useAuth } from '../../context/AuthContext';
import { researchApi } from '../../api/research';
import { ResearchPaper } from '../../types/domain';
import { paperDate } from '../../utils/format';
import { theme } from '../../theme';
import { ResearchCard } from '../../components/ResearchCard';
import { ListEntranceItem } from '../../components/ListEntranceItem';
import {
  EmptyState,
  IconButton,
  InlineNotice,
  Skeleton,
  Stat,
} from '../../components/ui';
import {
  ACTION_STATUSES,
  ACTIVE_STATUSES,
  PUBLISHED_STATUSES,
} from '../../components/PaperStatusChip';

export const DashboardScreen = () => {
  const navigation = useNavigation<any>();
  const { signOut, user } = useAuth();
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
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
      const rows = await researchApi.getMyPapers();
      setPapers(rows);
      setError('');
    } catch (_error) {
      setError('Failed to load dashboard data.');
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

  const stats = useMemo(() => {
    const total = papers.length;
    const active = papers.filter((paper) => ACTIVE_STATUSES.has(paper.status)).length;
    const published = papers.filter((paper) => PUBLISHED_STATUSES.has(paper.status)).length;
    const needsAction = papers.filter((paper) => ACTION_STATUSES.has(paper.status)).length;

    return {
      total,
      active,
      published,
      needsAction,
    };
  }, [papers]);

  const recentPapers = useMemo(() => {
    return [...papers]
      .sort((left, right) => {
        const leftDate = new Date(paperDate(left) || 0).getTime();
        const rightDate = new Date(paperDate(right) || 0).getTime();
        return rightDate - leftDate;
      })
      .slice(0, 6);
  }, [papers]);

  const firstName = useMemo(() => {
    const fullName = user?.fullName?.trim();
    if (!fullName) return '';
    return fullName.split(/\s+/)[0] || '';
  }, [user?.fullName]);

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
          <Text style={styles.title}>
            {firstName ? `Welcome back, ${firstName}.` : 'Welcome back.'}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <IconButton
            icon="log-out-outline"
            color={theme.colors.brand.primary}
            onPress={signOut}
            accessibilityLabel="Sign out"
          />
        </View>
      </View>

      {error ? <InlineNotice tone="danger" message={error} /> : null}

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Stat label="Total" value={stats.total} />
        </View>
        <View style={styles.statItem}>
          <Stat label="In Review" value={stats.active} />
        </View>
        <View style={styles.statItem}>
          <Stat label="Approved" value={stats.published} />
        </View>
        <View style={styles.statItem}>
          <Stat label="Revision Required" value={stats.needsAction} tone="warning" />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Papers</Text>
        {loading ? (
          <View style={styles.skeletonList}>
            <Skeleton height={108} />
            <Skeleton height={108} />
            <Skeleton height={108} />
          </View>
        ) : recentPapers.length === 0 ? (
          <EmptyState
            icon={
              <Ionicons
                name="documents-outline"
                size={24}
                color={theme.colors.text.muted}
              />
            }
            title="No papers yet"
            message="Your recent papers will appear here once available."
          />
        ) : (
          recentPapers.map((paper, index) => (
            <ListEntranceItem key={paper.id} index={index}>
              <ResearchCard
                paper={paper}
                onPress={() => navigation.navigate('ResearchDetail', { paperId: paper.id })}
              />
            </ListEntranceItem>
          ))
        )}
      </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    marginLeft: theme.spacing.sm,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  statItem: {
    width: '48%',
  },
  section: {
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
  },
  skeletonList: {
    gap: theme.spacing.sm,
  },
});
