/**
 * NUcleus elevation tokens.
 *
 * Soft elevation per docs/PRODUCT_ROADMAP.md §2 ("Soft elevation: use gentle
 * shadows to establish depth without heavy skeumorphism") and §5 ("clean card
 * surfaces with clear affordances; avoid heavy borders — prefer soft shadows
 * and spacing").
 *
 * Each level packages the iOS shadow* properties and the Android `elevation`
 * value as a `ViewStyle` fragment, so consumers can spread it directly:
 *
 *   <View style={[styles.card, theme.shadows.level1]} />
 */

import type { ViewStyle } from 'react-native';

const black = '#000000';

const level0: ViewStyle = {
  shadowColor: black,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0,
  shadowRadius: 0,
  elevation: 0,
};

const level1: ViewStyle = {
  shadowColor: black,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 3,
  elevation: 1,
};

const level2: ViewStyle = {
  shadowColor: black,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 12,
  elevation: 4,
};

export const shadows = {
  level0,
  level1,
  level2,
} as const;

export type Shadows = typeof shadows;
export type ShadowsKey = keyof Shadows;
