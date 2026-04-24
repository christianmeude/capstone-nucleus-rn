import { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { researchApi } from '../../api/research';
import { PaperStatus, ResearchPaper } from '../../types/domain';
import { formatDate, paperDate, statusToLabel } from '../../utils/format';

type FilterKey = 'all' | 'active' | 'published' | 'action';

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
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} />}
    >
      <Text style={styles.title}>My Papers</Text>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search title, abstract, or keywords"
        placeholderTextColor="#94a3b8"
        style={styles.search}
      />

      <View style={styles.filters}>
        <FilterChip label="All" active={activeFilter === 'all'} onPress={() => setActiveFilter('all')} />
        <FilterChip
          label="In Review"
          active={activeFilter === 'active'}
          onPress={() => setActiveFilter('active')}
        />
        <FilterChip
          label="Published"
          active={activeFilter === 'published'}
          onPress={() => setActiveFilter('published')}
        />
        <FilterChip
          label="Needs Action"
          active={activeFilter === 'action'}
          onPress={() => setActiveFilter('action')}
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <Text style={styles.loadingText}>Loading papers...</Text>
      ) : filtered.length === 0 ? (
        <Text style={styles.emptyText}>No papers match your current filter.</Text>
      ) : (
        filtered.map((paper) => (
          <Pressable
            key={paper.id}
            style={styles.paperCard}
            onPress={() => navigation.navigate('ResearchDetail', { paperId: paper.id })}
          >
            <Text style={styles.paperTitle}>{paper.title}</Text>
            <Text style={styles.paperMeta}>{statusToLabel(paper.status)}</Text>
            <Text style={styles.paperMeta}>{formatDate(paperDate(paper))}</Text>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
};

const FilterChip = ({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) => (
  <Pressable onPress={onPress} style={[styles.filterChip, active ? styles.filterChipActive : null]}>
    <Text style={[styles.filterLabel, active ? styles.filterLabelActive : null]}>{label}</Text>
  </Pressable>
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
  search: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#0f172a',
    backgroundColor: '#ffffff',
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ffffff',
  },
  filterChipActive: {
    backgroundColor: '#1c4d8d',
    borderColor: '#1c4d8d',
  },
  filterLabel: {
    color: '#334155',
    fontWeight: '600',
    fontSize: 12,
  },
  filterLabelActive: {
    color: '#ffffff',
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
  paperCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    gap: 4,
  },
  paperTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  paperMeta: {
    fontSize: 12,
    color: '#64748b',
  },
});
