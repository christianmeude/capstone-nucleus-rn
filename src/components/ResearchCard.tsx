import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PressableCard } from './ui/Card';
import { ResearchPaper } from '../types/domain';
import { formatDate, getPrimaryAuthorName, paperDate } from '../utils/format';
import { theme } from '../theme';
import { PaperStatusChip } from './PaperStatusChip';

interface ResearchCardProps {
  paper: ResearchPaper;
  onPress?: () => void;
  showEngagementCounts?: boolean;
  showStatusChip?: boolean;
  categoryLine?: string;
  keywords?: string[];
}

export const ResearchCard = ({
  paper,
  onPress,
  showEngagementCounts = false,
  showStatusChip = true,
  categoryLine,
  keywords,
}: ResearchCardProps) => {
  const authorName = getPrimaryAuthorName(paper);
  const authorInitial = authorName.trim().charAt(0).toUpperCase() || '?';
  const displayKeywords = (Array.isArray(keywords) ? keywords : []).filter(Boolean).slice(0, 4);
  const keywordTint = `${theme.colors.brand.accent}33`;

  const body = (
    <View style={styles.content}>
      {categoryLine && categoryLine.trim() ? (
        <Text style={styles.categoryLine} numberOfLines={1}>
          {categoryLine}
        </Text>
      ) : null}
      <Text style={styles.title} numberOfLines={2}>
        {paper.title}
      </Text>
      <View style={styles.authorRow}>
        <View style={styles.authorAvatar}>
          <Text style={styles.authorAvatarText}>{authorInitial}</Text>
        </View>
        <Text style={styles.meta} numberOfLines={1}>
          {authorName}
        </Text>
      </View>
      <View style={[styles.row, showStatusChip ? styles.rowWithChip : styles.rowWithoutChip]}>
        {showStatusChip ? <PaperStatusChip status={paper.status} /> : null}
        <Text style={styles.meta}>{formatDate(paperDate(paper))}</Text>
      </View>
      {displayKeywords.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.keywordRow}
        >
          {displayKeywords.map((keyword, index) => (
            <View
              key={`${keyword}-${index}`}
              style={[styles.keywordChip, { backgroundColor: keywordTint }]}
            >
              <Text style={styles.keywordText} numberOfLines={1}>
                {keyword}
              </Text>
            </View>
          ))}
        </ScrollView>
      ) : null}
      {showEngagementCounts === true ? (
        <View
          style={[
            styles.engagementRow,
            displayKeywords.length > 0 ? styles.engagementAfterKeywords : null,
          ]}
        >
          <View style={styles.engagementItem}>
            <Ionicons name="eye-outline" size={14} color={theme.colors.text.muted} />
            <Text style={styles.meta}>{paper.view_count || 0}</Text>
          </View>
          <View style={styles.engagementItem}>
            <Ionicons name="download-outline" size={14} color={theme.colors.text.muted} />
            <Text style={styles.meta}>{paper.download_count || 0}</Text>
          </View>
        </View>
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
    gap: theme.spacing.sm,
  },
  categoryLine: {
    ...theme.typography.caption,
    color: theme.colors.text.muted,
  },
  authorRow: {
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  rowWithChip: {
    justifyContent: 'space-between',
  },
  rowWithoutChip: {
    justifyContent: 'flex-start',
  },
  keywordRow: {
    gap: theme.spacing.xs,
    paddingRight: theme.spacing.xs,
  },
  keywordChip: {
    borderRadius: theme.radii.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
  },
  keywordText: {
    ...theme.typography.caption,
    color: theme.colors.text.primary,
  },
  engagementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  engagementAfterKeywords: {
    marginTop: -theme.spacing.xs,
  },
  engagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
