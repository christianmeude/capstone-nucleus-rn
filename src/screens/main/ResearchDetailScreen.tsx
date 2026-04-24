import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import { researchApi } from '../../api/research';
import { RootStackParamList } from '../../navigation/types';
import { ResearchPaper, WorkflowEntry } from '../../types/domain';
import {
  countCoAuthors,
  formatDate,
  formatRelativeTime,
  getPrimaryAuthorName,
  statusToLabel,
} from '../../utils/format';

type DetailRouteProp = RouteProp<RootStackParamList, 'ResearchDetail'>;

export const ResearchDetailScreen = () => {
  const route = useRoute<DetailRouteProp>();
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

        try {
          await researchApi.trackView(paperId);
        } catch {
          // Ignore tracking errors so detail page still loads.
        }
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
      if (trackDownload) {
        try {
          await researchApi.trackDownload(paperId);
        } catch {
          // Download tracking failure should not block opening the file.
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
        <ActivityIndicator size="large" color="#1c4d8d" />
        <Text style={styles.loaderText}>Loading paper...</Text>
      </View>
    );
  }

  if (!paper) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.error}>{error || 'Paper not found.'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{paper.title}</Text>
      <Text style={styles.meta}>Status: {statusToLabel(paper.status)}</Text>
      <Text style={styles.meta}>Author: {getPrimaryAuthorName(paper)}</Text>
      <Text style={styles.meta}>Co-authors: {countCoAuthors(paper)}</Text>
      <Text style={styles.meta}>Published: {formatDate(paper.published_date || paper.created_at)}</Text>
      <Text style={styles.meta}>Views: {paper.view_count || 0} • Downloads: {paper.download_count || 0}</Text>

      <View style={styles.actionsRow}>
        <Pressable
          style={[styles.actionButton, styles.openButton, openingFile ? styles.disabledButton : null]}
          onPress={() => openFile(false)}
          disabled={openingFile}
        >
          <Text style={styles.actionButtonLabel}>Open PDF</Text>
        </Pressable>
        <Pressable
          style={[styles.actionButton, styles.downloadButton, openingFile ? styles.disabledButton : null]}
          onPress={() => openFile(true)}
          disabled={openingFile}
        >
          <Text style={styles.actionButtonLabel}>Open + Track Download</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Abstract</Text>
        <Text style={styles.body}>{paper.abstract || 'No abstract available.'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Workflow History</Text>
        {workflow.length === 0 ? (
          <Text style={styles.body}>No workflow history available.</Text>
        ) : (
          workflow.map((entry) => (
            <View key={entry.id} style={styles.workflowCard}>
              <Text style={styles.workflowTitle}>{entry.action_type || entry.status || 'Updated'}</Text>
              <Text style={styles.workflowMeta}>Reviewer role: {entry.reviewer_role || 'N/A'}</Text>
              <Text style={styles.workflowMeta}>
                {formatRelativeTime(entry.reviewed_at || entry.created_at)}
              </Text>
              {entry.comments ? <Text style={styles.workflowComment}>{entry.comments}</Text> : null}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    gap: 10,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8fafc',
    gap: 8,
  },
  loaderText: {
    color: '#475569',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  meta: {
    fontSize: 13,
    color: '#475569',
  },
  actionsRow: {
    marginTop: 8,
    gap: 8,
  },
  actionButton: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },
  openButton: {
    backgroundColor: '#1c4d8d',
  },
  downloadButton: {
    backgroundColor: '#0f766e',
  },
  disabledButton: {
    opacity: 0.6,
  },
  actionButtonLabel: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  error: {
    color: '#dc2626',
    fontSize: 13,
  },
  section: {
    marginTop: 10,
    gap: 6,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  body: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 21,
  },
  workflowCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  workflowTitle: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '700',
  },
  workflowMeta: {
    color: '#64748b',
    fontSize: 12,
  },
  workflowComment: {
    color: '#334155',
    fontSize: 13,
  },
});
