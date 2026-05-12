import { ReactNode } from 'react';
import { Pressable, PressableProps, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme';
import { Surface } from './Surface';

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: keyof typeof theme.spacing;
}

type PressableCardProps = CardProps & {
  onPress: NonNullable<PressableProps['onPress']>;
  disabled?: boolean;
  accessibilityLabel?: string;
};

export const Card = ({ children, style, padding = 'lg' }: CardProps) => {
  return (
    <Surface style={[styles.card, { padding: theme.spacing[padding] }, style]}>
      {children}
    </Surface>
  );
};

export const PressableCard = ({
  children,
  style,
  padding = 'lg',
  onPress,
  disabled,
  accessibilityLabel,
}: PressableCardProps) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.pressable,
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
      ]}
    >
      <Surface style={[styles.card, { padding: theme.spacing[padding] }, style]}>
        {children}
      </Surface>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  pressable: {
    borderRadius: theme.radii.lg,
  },
  pressed: {
    opacity: 0.96,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.6,
  },
});
