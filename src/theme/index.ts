/**
 * NUcleus theme — single source of truth for design tokens.
 *
 * Phase 1 deliverable per docs/plans/UI_OVERHAUL.md §5. Consumers import
 * `theme` directly:
 *
 *   import { theme } from '../theme';
 *   const styles = StyleSheet.create({
 *     card: { backgroundColor: theme.colors.surface.raised, padding: theme.spacing.lg },
 *   });
 *
 * A React context provider and `useTheme()` hook are intentionally NOT
 * shipped in Phase 1; they are deferred until they are actually needed
 * (e.g. for runtime theme switching such as dark mode).
 */

import { colors, palette } from './colors';
import { families, fontWeightToKey, typography } from './typography';
import { spacing } from './spacing';
import { shadows } from './shadows';
import { radii } from './radii';
import { motion } from './motion';

export const theme = {
  colors,
  palette,
  typography,
  fontFamilies: families,
  fontWeights: fontWeightToKey,
  spacing,
  radii,
  shadows,
  motion,
} as const;

export type Theme = typeof theme;

export { colors, palette } from './colors';
export type { Colors, Palette } from './colors';
export {
  families as fontFamilies,
  fontWeightToKey as fontWeights,
  typography,
} from './typography';
export type {
  FontFamilyKey,
  FontWeightKey,
  TypographyKey,
  TypographyScale,
} from './typography';
export { spacing } from './spacing';
export type { Spacing, SpacingKey } from './spacing';
export { radii } from './radii';
export type { Radii, RadiiKey } from './radii';
export { shadows } from './shadows';
export type { Shadows, ShadowsKey } from './shadows';
export { motion } from './motion';
export type { Motion } from './motion';
