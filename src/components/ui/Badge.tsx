import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme';

interface BadgeProps {
  value?: string | number;
}

export const Badge = ({ value }: BadgeProps) => {
  return (
    <View style={styles.badge}>
      {value !== undefined ? <Text style={styles.text}>{String(value)}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    minWidth: 10,
    height: 10,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.brand.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xs,
  },
  text: {
    ...theme.typography.caption,
    color: theme.colors.text.onAccent,
  },
});
