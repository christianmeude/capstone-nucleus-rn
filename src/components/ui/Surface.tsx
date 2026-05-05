import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { theme } from '../../theme';

type SurfaceTone = 'base' | 'raised' | 'sunken';
type SurfaceElevation = 'level0' | 'level1' | 'level2';

interface SurfaceProps {
  children: ReactNode;
  tone?: SurfaceTone;
  elevation?: SurfaceElevation;
  style?: StyleProp<ViewStyle>;
}

export const Surface = ({
  children,
  tone = 'raised',
  elevation = 'level0',
  style,
}: SurfaceProps) => {
  return (
    <View style={[styles.shell, styles[tone], theme.shadows[elevation], style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  shell: {
    borderColor: theme.colors.border.subtle,
  },
  base: {
    backgroundColor: theme.colors.surface.base,
  },
  raised: {
    backgroundColor: theme.colors.surface.raised,
  },
  sunken: {
    backgroundColor: theme.colors.surface.sunken,
  },
});
