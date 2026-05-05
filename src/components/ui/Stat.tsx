import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme';

interface StatProps {
  label: string;
  value: number | string;
  tone?: 'default' | 'warning';
}

export const Stat = ({ label, value, tone = 'default' }: StatProps) => {
  return (
    <View
      style={[
        styles.card,
        tone === 'warning' ? styles.cardWarning : null,
        theme.shadows.level1,
      ]}
    >
      <Text style={[styles.value, tone === 'warning' ? styles.valueWarning : null]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface.raised,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  cardWarning: {
    borderColor: theme.colors.state.warning,
    backgroundColor: theme.colors.state.warningSurface,
  },
  value: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
  },
  valueWarning: {
    color: theme.colors.state.warning,
  },
  label: {
    ...theme.typography.metadata,
    color: theme.colors.text.muted,
  },
});
