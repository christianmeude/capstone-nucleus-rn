import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import { researchApi } from '../../api/research';
import { RootStackParamList } from '../../navigation/types';
import { ResearchPaper, WorkflowEntry } from '../../types/domain';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import { Button, Card, Chip, EmptyState, InlineNotice } from '../../components/ui';
import {
  formatDate,
  formatRelativeTime,
  getPrimaryAuthorName,
  listCoAuthorNames,
} from '../../utils/format';

type DetailRouteProp = RouteProp<RootStackParamList, 'ResearchDetail'>;

export const ResearchDetailScreen = () => {
  const route = useRoute<DetailRouteProp>();
  const { user } = useAuth();
  const { paperId } = route.params;

  const [paper, setPaper] = useState<ResearchPaper | null>(null);
  const [workflow, setWorkflow] = useState<WorkflowEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [openingFile, setOpeningFile] = useState(false);
  const [error, setError] = useState('');
  const [coAuthorsExpanded, setCoAuthorsExpanded] = useState(false);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError('');
      setCoAuthorsExpanded(false);

      try {
        const detail = await researchApi.getResearchById(paperId);
        setPaper(detail.paper);
        setWorkflow(detail.workflowHistory || []);
      } catch (_error) {
        setError('Unable to load paper details.');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [paperId]);

  const openFile = async () => {
    if (!paper) return;

    setOpeningFile(true);

    try {
      // Track view only when opening PDF
      try {
        await researchApi.trackView(paperId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to track view.');
      }

      const resolved = await researchApi.getResearchFile(paperId);
      const url = resolved.fileUrl || paper.file_url;

      if (!url) {
        setError('File URL is unavailable for this paper.');
        return;
      }

      await WebBrowser.openBrowserAsync(url);
    } catch (_error) {
      setError('Unable to open paper file.');
    } finally {
      setOpeningFile(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.colors.brand.primary} />
        <Text style={styles.loaderText}>Loading paper...</Text>
      </View>
    );
  }

  if (!paper) {
    return (
      <View style={styles.loaderContainer}>
        <EmptyState
          icon={<Ionicons name="document-outline" size={24} color={theme.colors.text.muted} />}
          title="Paper not found"
          message={error || 'Unable to load paper details.'}
        />
      </View>
    );
  }

  const isOwner =
    paper.structured_authors?.some((e) => e.is_primary && e.user_id === user?.id) ?? false;
  const showWorkflow =
    (paper.status !== 'approved' && paper.status !== 'published') || isOwner;
  const keywords = Array.isArray(paper.keywords) ? paper.keywords.filter(Boolean) : [];
  const authorName = getPrimaryAuthorName(paper);
  const authorInitial = authorName.trim().charAt(0).toUpperCase() || '?';
  const displayDate = paper.published_date || paper.created_at;
  const coAuthorNames = listCoAuthorNames(paper);
  const hasCoAuthors = coAuthorNames !== 'None';
  const coAuthorList = hasCoAuthors
    ? coAuthorNames.split(',').map((name) => name.trim()).filter(Boolean)
    : [];
  const coAuthorCount = coAuthorList.length;
  const coAuthorLabel = `+${coAuthorCount} co-author${coAuthorCount === 1 ? '' : 's'}`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.surface.base }} edges={['bottom']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>{paper.title}</Text>

        {paper.department ? (
          <View style={styles.departmentPill}>
            <Text style={styles.departmentPillText}>{paper.department}</Text>
          </View>
        ) : null}

        <View style={styles.metaTopRow}>
          <View style={styles.authorRow}>
            <View style={styles.authorAvatar}>
              <Text style={styles.authorAvatarText}>{authorInitial}</Text>
            </View>
            <Text style={styles.authorName}>{authorName}</Text>
          </View>

          <View style={styles.engagementRow}>
            <View accessible accessibilityLabel={`${paper.view_count || 0} views`} style={styles.engagementItem}>
              <Ionicons name="eye-outline" size={14} color={theme.colors.text.muted} />
              <Text style={styles.meta}>{paper.view_count || 0}</Text>
            </View>
            <View
              accessible
              accessibilityLabel={`${paper.download_count || 0} downloads`}
              style={styles.engagementItem}
            >
              <Ionicons name="download-outline" size={14} color={theme.colors.text.muted} />
              <Text style={styles.meta}>{paper.download_count || 0}</Text>
            </View>
          </View>
        </View>

        <View
          style={styles.dateRow}
          accessible
          accessibilityLabel={displayDate ? formatDate(displayDate) : 'Date unavailable'}
        >
          <Ionicons name="calendar-outline" size={14} color={theme.colors.text.muted} />
          <Text style={styles.meta}>{formatRelativeTime(displayDate)}</Text>
        </View>

        {hasCoAuthors ? (
          <View style={styles.coAuthorsBlock}>
            <Pressable
              onPress={() => setCoAuthorsExpanded((prev) => !prev)}
              accessibilityRole="button"
              accessibilityState={{ expanded: coAuthorsExpanded }}
              accessibilityLabel={coAuthorsExpanded ? 'Hide co-author names' : 'Show co-author names'}
              style={({ pressed }) => [
                styles.coAuthorsChip,
                pressed ? styles.coAuthorsChipPressed : null,
              ]}
            >
              <Text style={styles.coAuthorsChipText}>{coAuthorLabel}</Text>
            </Pressable>
            {coAuthorsExpanded ? (
              <Text style={styles.coAuthorsNames}>{coAuthorList.join(', ')}</Text>
            ) : null}
          </View>
        ) : null}

        {keywords.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Keywords</Text>
            <View style={styles.keywordsWrap}>
              {keywords.map((keyword) => (
                <Chip key={keyword} variant="status" tone="neutral" label={keyword} />
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.actionsRow}>
          {/* Download is intentionally hidden pending backend allow_download support (Issue #8). */}
          <Button
            label="Open PDF"
            variant="primary"
            onPress={openFile}
            loading={openingFile}
            disabled={openingFile}
          />
        </View>

        {error ? <InlineNotice tone="danger" message={error} /> : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Abstract</Text>
          <Text style={styles.body}>{paper.abstract || 'No abstract available.'}</Text>
        </View>

        {showWorkflow ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Workflow History</Text>
            {workflow.length === 0 ? (
              <Text style={styles.workflowEmpty}>No workflow history available.</Text>
            ) : (
              <View style={styles.workflowList}>
                {workflow.map((entry) => (
                  <Card
                    key={entry.id}
                    padding="sm"
                    style={styles.workflowCard}
                  >
                    <Text style={styles.workflowTitle}>
                      {entry.action_type || entry.status || 'Updated'}
                    </Text>
                    <Text style={styles.workflowMeta}>Reviewer role: {entry.reviewer_role || 'N/A'}</Text>
                    <Text style={styles.workflowMeta}>
                      {formatRelativeTime(entry.reviewed_at || entry.created_at)}
                    </Text>
                    {entry.comments ? <Text style={styles.workflowComment}>{entry.comments}</Text> : null}
                  </Card>
                ))}
              </View>
            )}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface.base,
  },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface.base,
    gap: theme.spacing.sm,
  },
  loaderText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
  },
  title: {
    ...theme.typography.display,
    fontFamily: theme.fontFamilies.display.semibold,
    color: theme.colors.text.primary,
  },
  departmentPill: {
    alignSelf: 'flex-start',
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surface.sunken,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.subtle,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
  },
  departmentPillText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  metaTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  authorRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: theme.radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.brand.primary,
  },
  authorAvatarText: {
    ...theme.typography.caption,
    color: theme.colors.text.onBrand,
  },
  authorName: {
    ...theme.typography.bodyStrong,
    color: theme.colors.text.primary,
    flexShrink: 1,
  },
  engagementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  engagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  meta: {
    ...theme.typography.metadata,
    color: theme.colors.text.secondary,
  },
  coAuthorsBlock: {
    gap: theme.spacing.xs,
  },
  coAuthorsChip: {
    alignSelf: 'flex-start',
    minHeight: 32,
    borderRadius: theme.radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.strong,
    backgroundColor: theme.colors.surface.raised,
    paddingHorizontal: theme.spacing.sm,
    justifyContent: 'center',
  },
  coAuthorsChipPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.96,
  },
  coAuthorsChipText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  coAuthorsNames: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
  },
  actionsRow: {
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  section: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
  },
  body: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    lineHeight: 24,
  },
  keywordsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  workflowList: {
    gap: theme.spacing.sm,
  },
  workflowCard: {
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.brand.primary,
    gap: theme.spacing.xs,
  },
  workflowTitle: {
    ...theme.typography.bodyStrong,
    color: theme.colors.text.primary,
  },
  workflowMeta: {
    ...theme.typography.metadata,
    color: theme.colors.text.muted,
  },
  workflowComment: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
  workflowEmpty: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.muted,
  },
});
