import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme';

interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accessibilityLabel: string;
  color?: string;
  style?: ViewStyle;
}

export const IconButton = ({
  icon,
  onPress,
  accessibilityLabel,
  color = theme.colors.brand.primary,
  style,
}: IconButtonProps) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        style,
        pressed ? styles.pressed : null,
        pressed ? styles.pressedScale : null,
      ]}
    >
      <Ionicons name={icon} size={20} color={color} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    minWidth: 44,
    borderRadius: theme.radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface.raised,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  pressed: {
    backgroundColor: theme.colors.surface.sunken,
  },
  pressedScale: {
    transform: [{ scale: 0.98 }],
  },
});
