import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme';

type ChipTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';
type ChipVariant = 'filter' | 'status';

interface ChipProps {
  label: string;
  variant?: ChipVariant;
  active?: boolean;
  tone?: ChipTone;
  onPress?: () => void;
}

const toneMap = {
  neutral: {
    bg: theme.colors.surface.raised,
    border: theme.colors.border.strong,
    text: theme.colors.text.secondary,
  },
  info: {
    bg: theme.colors.brand.primarySoft,
    border: theme.colors.brand.primary,
    text: theme.colors.brand.primary,
  },
  success: {
    bg: theme.colors.state.successSurface,
    border: theme.colors.state.success,
    text: theme.colors.state.success,
  },
  warning: {
    bg: theme.colors.state.warningSurface,
    border: theme.colors.state.warning,
    text: theme.colors.state.warning,
  },
  danger: {
    bg: theme.colors.state.dangerSurface,
    border: theme.colors.state.danger,
    text: theme.colors.state.danger,
  },
} as const;

export const Chip = ({
  label,
  variant = 'filter',
  active = false,
  tone = 'neutral',
  onPress,
}: ChipProps) => {
  if (variant === 'status') {
    const t = toneMap[tone];
    return (
      <View style={[styles.base, { backgroundColor: t.bg, borderColor: t.border }]}>
        <Text style={[styles.label, { color: t.text }]}>{label}</Text>
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        styles.base,
        active ? styles.filterActive : styles.filterInactive,
        pressed ? styles.pressed : null,
        pressed ? styles.pressedScale : null,
      ]}
    >
      <Text style={[styles.label, active ? styles.filterActiveLabel : styles.filterInactiveLabel]}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterInactive: {
    backgroundColor: theme.colors.surface.raised,
    borderColor: theme.colors.border.strong,
  },
  filterActive: {
    backgroundColor: theme.colors.brand.primary,
    borderColor: theme.colors.brand.primary,
  },
  filterInactiveLabel: {
    color: theme.colors.text.secondary,
  },
  filterActiveLabel: {
    color: theme.colors.text.onBrand,
  },
  label: {
    ...theme.typography.label,
  },
  pressed: {
    opacity: 0.9,
  },
  pressedScale: {
    transform: [{ scale: 0.98 }],
  },
});

export type { ChipTone };
