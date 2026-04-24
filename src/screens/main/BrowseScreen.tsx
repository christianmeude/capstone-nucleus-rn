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
import { Category, ResearchPaper } from '../../types/domain';
import { formatDate, getPrimaryAuthorName, paperDate } from '../../utils/format';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const BrowseScreen = () => {
  const navigation = useNavigation<any>();
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
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
      const [publishedRows, categoryRows] = await Promise.all([
        researchApi.getPublishedPapers(),
        researchApi.getCategories(),
      ]);

      setPapers(publishedRows);
      setCategories(categoryRows);
      setError('');
    } catch (_error) {
      setError('Unable to load published papers.');
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

  const categoryNameById = useMemo(() => {
    return new Map(categories.map((item) => [item.id, item.name]));
  }, [categories]);

  const resolveCategoryName = useCallback(
    (value?: string | null) => {
      if (!value) return 'General';
      if (categoryNameById.has(value)) return categoryNameById.get(value) || 'General';
      if (!UUID_PATTERN.test(value)) return value;
      return 'General';
    },
    [categoryNameById]
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return [...papers]
      .filter((paper) => {
        if (!categoryFilter) return true;
        return paper.category === categoryFilter;
      })
      .filter((paper) => {
        if (!normalized) return true;
        const keywords = Array.isArray(paper.keywords) ? paper.keywords.join(' ') : '';
        const authorName = getPrimaryAuthorName(paper);
        const target = `${paper.title} ${paper.abstract} ${keywords} ${authorName}`.toLowerCase();
        return target.includes(normalized);
      })
      .sort((left, right) => {
        const leftDate = new Date(paperDate(left) || 0).getTime();
        const rightDate = new Date(paperDate(right) || 0).getTime();
        return rightDate - leftDate;
      });
  }, [categoryFilter, papers, query]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} />}
    >
      <Text style={styles.title}>Repository</Text>
      <Text style={styles.subtitle}>Published papers from the same backend as the web app.</Text>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search title, author, abstract, or keywords"
        placeholderTextColor="#94a3b8"
        style={styles.search}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        <FilterChip
          label="All categories"
          active={categoryFilter === ''}
          onPress={() => setCategoryFilter('')}
        />
        {categories.map((category) => (
          <FilterChip
            key={category.id}
            label={category.name}
            active={categoryFilter === category.id}
            onPress={() => setCategoryFilter(category.id)}
          />
        ))}
      </ScrollView>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <Text style={styles.loadingText}>Loading published papers...</Text>
      ) : filtered.length === 0 ? (
        <Text style={styles.emptyText}>No papers match your filters.</Text>
      ) : (
        filtered.map((paper) => (
          <Pressable
            key={paper.id}
            style={styles.paperCard}
            onPress={() => navigation.navigate('ResearchDetail', { paperId: paper.id })}
          >
            <Text style={styles.paperTitle}>{paper.title}</Text>
            <Text style={styles.paperMeta}>Author: {getPrimaryAuthorName(paper)}</Text>
            <Text style={styles.paperMeta}>Category: {resolveCategoryName(paper.category)}</Text>
            <Text style={styles.paperMeta}>Published: {formatDate(paperDate(paper))}</Text>
            <Text style={styles.paperMeta}>
              Views {paper.view_count || 0} • Downloads {paper.download_count || 0}
            </Text>
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
  subtitle: {
    color: '#475569',
    fontSize: 13,
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
    gap: 8,
    paddingRight: 12,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
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
