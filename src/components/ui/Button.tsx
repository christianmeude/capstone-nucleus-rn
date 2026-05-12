import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { theme } from '../../theme';

type ButtonVariant = 'primary' | 'secondary' | 'subtle';
type ButtonSize = 'md' | 'sm';

interface ButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  accessibilityLabel?: string;
}

export const Button = ({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  accessibilityLabel,
}: ButtonProps) => {
  const isBlocked = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isBlocked}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      style={({ pressed }) => [
        styles.base,
        styles[size],
        styles[`${variant}Base`],
        isBlocked ? styles.blocked : null,
        pressed && !isBlocked ? styles[`${variant}Pressed`] : null,
        pressed && !isBlocked ? styles.pressedScale : null,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? theme.colors.text.onBrand : theme.colors.brand.primary}
        />
      ) : (
        <Text style={[styles.label, styles[`${variant}Label`]]}>{label}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  md: {
    minHeight: 44,
    paddingVertical: theme.spacing.sm,
  },
  sm: {
    minHeight: 44,
    paddingVertical: theme.spacing.xs,
  },
  primaryBase: {
    backgroundColor: theme.colors.brand.primary,
  },
  primaryPressed: {
    backgroundColor: theme.colors.brand.primaryPressed,
  },
  primaryLabel: {
    color: theme.colors.text.onBrand,
  },
  secondaryBase: {
    backgroundColor: theme.colors.surface.raised,
    borderWidth: 1,
    borderColor: theme.colors.brand.primary,
  },
  secondaryPressed: {
    backgroundColor: theme.colors.brand.primarySoft,
  },
  secondaryLabel: {
    color: theme.colors.brand.primary,
  },
  subtleBase: {
    backgroundColor: 'transparent',
  },
  subtlePressed: {
    backgroundColor: theme.colors.surface.sunken,
  },
  subtleLabel: {
    color: theme.colors.brand.primary,
  },
  blocked: {
    opacity: 0.6,
  },
  pressedScale: {
    transform: [{ scale: 0.98 }],
  },
  label: {
    ...theme.typography.button,
  },
});
