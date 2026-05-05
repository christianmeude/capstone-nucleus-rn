import { StyleSheet, Text, View } from 'react-native';
import { PressableCard } from './ui/Card';
import { ResearchPaper } from '../types/domain';
import { formatDate, getPrimaryAuthorName, paperDate } from '../utils/format';
import { theme } from '../theme';
import { PaperStatusChip, PUBLISHED_STATUSES } from './PaperStatusChip';

interface ResearchCardProps {
  paper: ResearchPaper;
  onPress?: () => void;
}

export const ResearchCard = ({ paper, onPress }: ResearchCardProps) => {
  const showEngagementCounts = PUBLISHED_STATUSES.has(paper.status);

  const body = (
    <View style={styles.content}>
      <Text style={styles.title} numberOfLines={2}>
        {paper.title}
      </Text>
      <Text style={styles.meta} numberOfLines={1}>
        {getPrimaryAuthorName(paper)}
      </Text>
      <View style={styles.row}>
        <PaperStatusChip status={paper.status} />
        <Text style={styles.meta}>{formatDate(paperDate(paper))}</Text>
      </View>
      {showEngagementCounts ? (
        <Text style={styles.meta}>
          Views {paper.view_count || 0} • Downloads {paper.download_count || 0}
        </Text>
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <PressableCard onPress={onPress} accessibilityLabel={`Open paper: ${paper.title}`}>
        {body}
      </PressableCard>
    );
  }
  return <View style={styles.readOnly}>{body}</View>;
};

const styles = StyleSheet.create({
  readOnly: {
    backgroundColor: theme.colors.surface.raised,
    borderRadius: theme.radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.subtle,
    padding: theme.spacing.lg,
  },
  content: {
    gap: theme.spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  title: {
    ...theme.typography.bodyStrong,
    color: theme.colors.text.primary,
  },
  meta: {
    ...theme.typography.metadata,
    color: theme.colors.text.muted,
  },
});
