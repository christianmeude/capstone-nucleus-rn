/**
 * NUcleus corner radius scale.
 *
 * Added in Phase 2 when component primitives become the first consumers.
 */
export const radii = {
  sm: 8,
  md: 10,
  lg: 14,
  pill: 999,
} as const;

export type Radii = typeof radii;
export type RadiiKey = keyof Radii;
