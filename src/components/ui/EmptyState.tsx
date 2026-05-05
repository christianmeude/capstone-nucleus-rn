import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme';

interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: ReactNode;
}

export const EmptyState = ({ title, message, icon }: EmptyStateProps) => {
  return (
    <View style={styles.container}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing['2xl'],
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  icon: {
    marginBottom: theme.spacing.xs,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  message: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.muted,
    textAlign: 'center',
  },
});
