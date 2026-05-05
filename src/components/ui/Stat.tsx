import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme';

interface StatProps {
  label: string;
  value: number | string;
}

export const Stat = ({ label, value }: StatProps) => {
  return (
    <View style={[styles.card, theme.shadows.level1]}>
      <Text style={styles.value}>{value}</Text>
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
  value: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
  },
  label: {
    ...theme.typography.metadata,
    color: theme.colors.text.muted,
  },
});
