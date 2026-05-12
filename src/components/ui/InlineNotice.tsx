import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme';

type NoticeTone = 'info' | 'success' | 'warning' | 'danger';

interface InlineNoticeProps {
  message: string;
  tone?: NoticeTone;
}

const toneStyles = {
  info: {
    backgroundColor: theme.colors.brand.primarySoft,
    borderColor: theme.colors.brand.primary,
    textColor: theme.colors.brand.primary,
  },
  success: {
    backgroundColor: theme.colors.state.successSurface,
    borderColor: theme.colors.state.success,
    textColor: theme.colors.state.success,
  },
  warning: {
    backgroundColor: theme.colors.state.warningSurface,
    borderColor: theme.colors.state.warning,
    textColor: theme.colors.state.warning,
  },
  danger: {
    backgroundColor: theme.colors.state.dangerSurface,
    borderColor: theme.colors.state.danger,
    textColor: theme.colors.state.danger,
  },
} as const;

export const InlineNotice = ({ message, tone = 'info' }: InlineNoticeProps) => {
  const colors = toneStyles[tone];
  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundColor, borderColor: colors.borderColor }]}>
      <Text style={[styles.message, { color: colors.textColor }]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  message: {
    ...theme.typography.bodySmall,
  },
});
