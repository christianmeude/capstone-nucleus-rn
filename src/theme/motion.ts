export const motion = {
  skeletonCycleDuration: 900,
  listItemDuration: 220,
  listStaggerDelay: 40,
} as const;

export type Motion = typeof motion;
