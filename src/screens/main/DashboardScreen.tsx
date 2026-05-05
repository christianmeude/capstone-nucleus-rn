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
import { useAuth } from '../../context/AuthContext';
import { researchApi } from '../../api/research';
import { ResearchPaper } from '../../types/domain';
import { paperDate, statusToLabel } from '../../utils/format';

const LogoutButton = () => {
  const { signOut } = useAuth();
  return (
    <Pressable onPress={signOut} style={styles.logoutButton}>
      <Text style={styles.logoutText}>Logout</Text>
    </Pressable>
  );
};

const ACTIVE_STATUSES = new Set([
  'pending',
  'pending_faculty',
  'pending_dean',
  'pending_program_chair',
  'pending_editor',
  'pending_admin',
]);

const ACTION_STATUSES = new Set(['revision_required', 'rejected']);
const PUBLISHED_STATUSES = new Set(['approved', 'published']);

export const DashboardScreen = () => {
  const navigation = useNavigation<any>();
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} />}
    >
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Student Dashboard</Text>
          <Text style={styles.subtitle}>Same data as web app, mobile-optimized.</Text>
        </View>
        <View style={styles.headerRight}>
          <LogoutButton />
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.statsGrid}>
        <StatCard label="Total" value={stats.total} />
        <StatCard label="In Review" value={stats.active} />
        <StatCard label="Published" value={stats.published} />
        <StatCard label="Needs Action" value={stats.needsAction} tone="warning" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Papers</Text>
        {loading ? (
          <Text style={styles.loadingText}>Loading papers...</Text>
        ) : recentPapers.length === 0 ? (
          <Text style={styles.emptyText}>No papers found yet.</Text>
        ) : (
          recentPapers.map((paper) => (
            <Pressable
              key={paper.id}
              style={styles.paperCard}
              onPress={() => navigation.navigate('ResearchDetail', { paperId: paper.id })}
            >
              <Text style={styles.paperTitle}>{paper.title}</Text>
              <Text style={styles.paperMeta}>{statusToLabel(paper.status)}</Text>
              <Text style={styles.paperMeta}>Views: {paper.view_count || 0}</Text>
            </Pressable>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const StatCard = ({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: number;
  tone?: 'default' | 'warning';
}) => (
  <View style={[styles.statCard, tone === 'warning' ? styles.statCardWarning : null]}>
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
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  headerLeft: {
    gap: 6,
    flex: 1,
  },
  headerRight: {
    marginLeft: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 13,
    color: '#475569',
  },
  error: {
    color: '#dc2626',
    fontSize: 13,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '48%',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    gap: 4,
  },
  statCardWarning: {
    borderColor: '#f59e0b',
  },
  statValue: {
    fontSize: 24,
    color: '#0f172a',
    fontWeight: '700',
  },
  statLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  loadingText: {
    color: '#475569',
    fontSize: 14,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
  },
  paperCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  paperTitle: {
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '600',
  },
  paperMeta: {
    fontSize: 12,
    color: '#64748b',
  },
  logoutButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#ef4444',
    borderRadius: 8,
  },
  logoutText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
