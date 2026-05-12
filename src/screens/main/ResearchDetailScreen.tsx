import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import { researchApi } from '../../api/research';
import { RootStackParamList } from '../../navigation/types';
import { ResearchPaper, WorkflowEntry } from '../../types/domain';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import { PaperStatusChip } from '../../components/PaperStatusChip';
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

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError('');

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

  const openFile = async (trackDownload: boolean) => {
    if (!paper) return;

    setOpeningFile(true);

    try {
      // Track view only when opening PDF
      try {
        await researchApi.trackView(paperId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to track view.');
      }

      // Track download if requested
      if (trackDownload) {
        try {
          await researchApi.trackDownload(paperId);
        } catch (error) {
          // If download tracking fails (e.g., downloads disabled), show error and stop
          setError(error instanceof Error ? error.message : 'Unable to track download.');
          return;
        }
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{paper.title}</Text>
      <PaperStatusChip status={paper.status} />
      <Text style={styles.meta}>Author: {getPrimaryAuthorName(paper)}</Text>
      <Text style={styles.meta}>Co-authors: {listCoAuthorNames(paper)}</Text>
      {paper.department ? <Text style={styles.meta}>Department: {paper.department}</Text> : null}
      <Text style={styles.meta}>Published: {formatDate(paper.published_date || paper.created_at)}</Text>
      <Text style={styles.meta}>Views: {paper.view_count || 0}</Text>
      <Text style={styles.meta}>Downloads: {paper.download_count || 0}</Text>

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
        <Button
          label="Open PDF"
          variant="primary"
          onPress={() => openFile(false)}
          loading={openingFile}
          disabled={openingFile}
        />
        <Button
          label="Download"
          variant="secondary"
          onPress={() => openFile(true)}
          loading={false}
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
  meta: {
    ...theme.typography.metadata,
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
