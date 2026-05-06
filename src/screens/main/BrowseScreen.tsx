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
import { Category, ResearchPaper } from '../../types/domain';
import { getPrimaryAuthorName, paperDate } from '../../utils/format';
import { theme } from '../../theme';
import { ResearchCard } from '../../components/ResearchCard';
import { Chip, EmptyState, InlineNotice, Skeleton } from '../../components/ui';

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

  /** Display-only: omit category row when nothing resolves to a real name (no "General" placeholder). */
  const categoryLineForDisplay = useCallback(
    (value?: string | null): string | null => {
      if (!value) return null;
      if (categoryNameById.has(value)) {
        const name = categoryNameById.get(value);
        if (!name || !name.trim()) return null;
        return `Category: ${name}`;
      }
      if (!UUID_PATTERN.test(value)) return `Category: ${value}`;
      return null;
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
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => loadData(true)}
          tintColor={theme.colors.brand.primary}
          colors={[theme.colors.brand.primary]}
        />
      }
    >
      <Text style={styles.title}>Browse</Text>

      <View style={styles.searchWrap}>
        <Ionicons
          name="search-outline"
          size={18}
          color={theme.colors.text.muted}
          style={styles.searchIcon}
        />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search by title, author, or keyword"
          placeholderTextColor={theme.colors.text.disabled}
          style={styles.searchInput}
        />
        <View
          pointerEvents={query.trim() ? 'auto' : 'none'}
          style={query.trim() ? styles.clearVisible : styles.clearHidden}
        >
          <Chip label="Clear" active={false} onPress={() => setQuery('')} variant="filter" />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        <Chip
          label="All categories"
          variant="filter"
          active={categoryFilter === ''}
          onPress={() => setCategoryFilter('')}
        />
        {categories.map((category) => (
          <Chip
            key={category.id}
            label={category.name}
            variant="filter"
            active={categoryFilter === category.id}
            onPress={() => setCategoryFilter(category.id)}
          />
        ))}
      </ScrollView>

      {error ? <InlineNotice tone="danger" message={error} /> : null}

      {loading ? (
        <View style={styles.skeletonList}>
          <Skeleton height={108} />
          <Skeleton height={108} />
          <Skeleton height={108} />
        </View>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Ionicons name="library-outline" size={24} color={theme.colors.text.muted} />}
          title="No papers found"
          message="No papers match your filters."
        />
      ) : (
        filtered.map((paper) => {
          const line = categoryLineForDisplay(paper.category);

          return (
            <ResearchCard
              key={paper.id}
              paper={paper}
              {...(line ? { categoryLine: line } : {})}
              showEngagementCounts
              onPress={() => navigation.navigate('ResearchDetail', { paperId: paper.id })}
            />
          );
        })
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
    height: 44,
    borderWidth: 1,
    borderColor: theme.colors.border.strong,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 0,
    backgroundColor: theme.colors.surface.raised,
  },
  searchInput: {
    flex: 1,
    height: 24,
    ...theme.typography.body,
    color: theme.colors.text.primary,
    paddingVertical: 0,
    textAlign: 'left',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  clearVisible: {
    marginLeft: theme.spacing.sm,
    width: 'auto',
    overflow: 'visible',
  },
  clearHidden: {
    width: 0,
    overflow: 'hidden',
  },
  filters: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingRight: theme.spacing.md,
  },
  skeletonList: {
    gap: theme.spacing.sm,
  },
});
