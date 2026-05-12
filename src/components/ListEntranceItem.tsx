import { ReactNode, useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { useReduceMotion } from '../hooks/useReduceMotion';

interface ListEntranceItemProps {
  index: number;
  children: ReactNode;
}

export const ListEntranceItem = ({ index, children }: ListEntranceItemProps) => {
  const reduceMotion = useReduceMotion();
  const opacity = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const translateY = useRef(new Animated.Value(reduceMotion ? 0 : 8)).current;

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(1);
      translateY.setValue(0);
      return;
    }

    const animation = Animated.sequence([
      Animated.delay(index * theme.motion.listStaggerDelay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: theme.motion.listItemDuration,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: theme.motion.listItemDuration,
          useNativeDriver: true,
        }),
      ]),
    ]);

    animation.start();
    return () => {
      animation.stop();
    };
  }, [index, opacity, reduceMotion, translateY]);

  return (
    <Animated.View style={[styles.wrap, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'stretch',
  },
});
