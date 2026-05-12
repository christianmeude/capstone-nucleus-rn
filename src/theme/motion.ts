export const motion = {
  skeletonCycleDuration: 900,
  listItemDuration: 320,
  listStaggerDelay: 60,
} as const;

export type Motion = typeof motion;
