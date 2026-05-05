import { DimensionValue, StyleSheet, View } from 'react-native';
import { theme } from '../../theme';

interface SkeletonProps {
  height?: number;
  width?: DimensionValue;
  radius?: keyof typeof theme.radii;
}

export const Skeleton = ({
  height = 14,
  width = '100%',
  radius = 'sm',
}: SkeletonProps) => {
  return <View style={[styles.block, { height, width, borderRadius: theme.radii[radius] }]} />;
};

const styles = StyleSheet.create({
  block: {
    backgroundColor: theme.colors.surface.sunken,
  },
});
