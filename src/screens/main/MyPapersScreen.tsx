import { useCallback, useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { researchApi } from '../../api/research';
import { PaperStatus, ResearchPaper } from '../../types/domain';
import { paperDate } from '../../utils/format';
import { theme } from '../../theme';
import { ResearchCard } from '../../components/ResearchCard';
import {
  ACTION_STATUSES,
  ACTIVE_STATUSES,
  PUBLISHED_STATUSES,
} from '../../components/PaperStatusChip';
import { Chip, EmptyState, InlineNotice, Skeleton } from '../../components/ui';

type FilterKey = 'all' | 'active' | 'published' | 'action';

const isFilterMatch = (status: PaperStatus, filter: FilterKey) => {
  if (filter === 'all') return true;
  if (filter === 'active') return ACTIVE_STATUSES.has(status);
  if (filter === 'published') return PUBLISHED_STATUSES.has(status);
  return ACTION_STATUSES.has(status);
};

export const MyPapersScreen = () => {
  const navigation = useNavigation<any>();
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
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
      setError('Unable to load your papers.');
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

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return [...papers]
      .filter((paper) => isFilterMatch(paper.status, activeFilter))
      .filter((paper) => {
        if (!normalized) return true;

        const keywords = Array.isArray(paper.keywords) ? paper.keywords.join(' ') : '';
        const target = `${paper.title} ${paper.abstract} ${keywords}`.toLowerCase();
        return target.includes(normalized);
      })
      .sort((left, right) => {
        const leftDate = new Date(paperDate(left) || 0).getTime();
        const rightDate = new Date(paperDate(right) || 0).getTime();
        return rightDate - leftDate;
      });
  }, [activeFilter, papers, query]);

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
      <Text style={styles.title}>My Papers</Text>

      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={theme.colors.text.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search title, abstract, or keywords"
          placeholderTextColor={theme.colors.text.disabled}
          style={styles.searchInput}
        />
        {query ? (
          <Chip label="Clear" active={false} onPress={() => setQuery('')} variant="filter" />
        ) : null}
      </View>

      <View style={styles.filters}>
        <Chip
          label="All"
          variant="filter"
          active={activeFilter === 'all'}
          onPress={() => setActiveFilter('all')}
        />
        <Chip
          label="In Review"
          variant="filter"
          active={activeFilter === 'active'}
          onPress={() => setActiveFilter('active')}
          tone="info"
        />
        <Chip
          label="Published"
          variant="filter"
          active={activeFilter === 'published'}
          onPress={() => setActiveFilter('published')}
          tone="success"
        />
        <Chip
          label="Needs Action"
          variant="filter"
          active={activeFilter === 'action'}
          onPress={() => setActiveFilter('action')}
          tone="danger"
        />
      </View>

      {error ? <InlineNotice tone="danger" message={error} /> : null}

      {loading ? (
        <View style={styles.skeletonList}>
          <Skeleton height={108} />
          <Skeleton height={108} />
          <Skeleton height={108} />
        </View>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Ionicons name="folder-open-outline" size={24} color={theme.colors.text.muted} />}
          title="No papers found"
          message="No papers match your current filter."
        />
      ) : (
        filtered.map((paper) => (
          <ResearchCard
            key={paper.id}
            paper={paper}
            onPress={() => navigation.navigate('ResearchDetail', { paperId: paper.id })}
          />
        ))
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
    gap: theme.spacing.md,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text.primary,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.strong,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface.raised,
  },
  searchInput: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.text.primary,
    paddingVertical: 0,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  skeletonList: {
    gap: theme.spacing.sm,
  },
});
