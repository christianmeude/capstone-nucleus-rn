import { useEffect, useRef } from 'react';
import { Animated, DimensionValue, StyleSheet, View } from 'react-native';
import { theme } from '../../theme';
import { useReduceMotion } from '../../hooks/useReduceMotion';

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
  const reduceMotion = useReduceMotion();
  const opacity = useRef(new Animated.Value(1)).current;
  const baseStyle = [styles.block, { height, width, borderRadius: theme.radii[radius] }];

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    const half = theme.motion.skeletonCycleDuration / 2;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: half,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: half,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity, reduceMotion]);

  if (reduceMotion) {
    return <View style={[...baseStyle, { opacity: 0.6 }]} />;
  }

  return <Animated.View style={[...baseStyle, { opacity }]} />;
};

const styles = StyleSheet.create({
  block: {
    backgroundColor: theme.colors.surface.sunken,
  },
});
