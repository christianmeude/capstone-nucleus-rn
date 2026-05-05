/**
 * NUcleus spacing scale.
 *
 * Six-step scale per docs/plans/UI_OVERHAUL.md §5 Phase 1, used for paddings,
 * gaps, and margins. Comfortable margins and vertical rhythm per roadmap §2.
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
} as const;

export type Spacing = typeof spacing;
export type SpacingKey = keyof Spacing;
