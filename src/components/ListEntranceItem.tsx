import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { useReduceMotion } from '../hooks/useReduceMotion';

interface ListEntranceItemProps {
  index: number;
  children: ReactNode;
}

const ListEntranceContext = createContext(false);

export const useListEntranceActive = () => useContext(ListEntranceContext);

export const ListEntranceItem = ({ index, children }: ListEntranceItemProps) => {
  const reduceMotion = useReduceMotion();
  const opacity = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const translateY = useRef(new Animated.Value(reduceMotion ? 0 : 8)).current;
  const [entering, setEntering] = useState(!reduceMotion);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(1);
      translateY.setValue(0);
      setEntering(false);
      return;
    }

    setEntering(true);

    const animation = Animated.sequence([
      Animated.delay(index * theme.motion.listStaggerDelay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: theme.motion.listItemDuration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: theme.motion.listItemDuration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]);

    animation.start(({ finished }) => {
      if (finished && isMountedRef.current) {
        setEntering(false);
      }
    });
    return () => {
      animation.stop();
    };
  }, [index, opacity, reduceMotion, translateY]);

  return (
    <ListEntranceContext.Provider value={entering}>
      <Animated.View style={[styles.wrap, { opacity, transform: [{ translateY }] }]}>
        {children}
      </Animated.View>
    </ListEntranceContext.Provider>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'stretch',
  },
});
