/**
 * NUcleus brand color tokens.
 *
 * Working values anchored to the official NUcleus logo. Per
 * docs/plans/UI_OVERHAUL.md §2.1, these are starting points and are
 * subject to fine-tuning during the overhaul; any brand-confirmed
 * swatch lands in this file as a single edit.
 *
 * Usage rules (from docs/PRODUCT_ROADMAP.md §2):
 * - Blue family for primary UI, navigation, and links.
 * - Gold for emphasis and important affordances only — never decoration.
 * - Neutrals for surfaces, dividers, and text.
 */

export const palette = {
  navy: {
    50: '#EAF0FB',
    100: '#D2DEF5',
    200: '#A3BBE9',
    300: '#5F7EC9',
    400: '#2E5BC9',
    500: '#1B3A8C',
    600: '#16307A',
    700: '#102560',
    800: '#0B1B47',
    900: '#06112E',
  },
  gold: {
    50: '#FEF6E7',
    100: '#FCE7BD',
    200: '#FAD588',
    300: '#F8C156',
    400: '#F7B33B',
    500: '#F5A623',
    600: '#D9921F',
    700: '#A86F17',
    800: '#774E10',
    900: '#473008',
  },
  slate: {
    0: '#FFFFFF',
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
  success: {
    100: '#D1FAE5',
    500: '#059669',
    600: '#047857',
  },
  warning: {
    100: '#FEF3C7',
    500: '#D97706',
    600: '#B45309',
  },
  danger: {
    100: '#FEE2E2',
    500: '#DC2626',
    600: '#B91C1C',
  },
} as const;

export const colors = {
  brand: {
    primary: palette.navy[500],
    primaryHover: palette.navy[600],
    primaryPressed: palette.navy[700],
    primarySoft: palette.navy[100],
    primarySurface: palette.navy[50],
    accent: palette.gold[500],
    accentHover: palette.gold[600],
    accentSoft: palette.gold[100],
    accentSurface: palette.gold[50],
  },
  text: {
    primary: palette.slate[900],
    secondary: palette.slate[600],
    muted: palette.slate[500],
    disabled: palette.slate[400],
    onBrand: palette.slate[0],
    onAccent: palette.slate[900],
    link: palette.navy[500],
  },
  surface: {
    base: palette.slate[50],
    raised: palette.slate[0],
    sunken: palette.slate[100],
    overlay: 'rgba(15, 23, 42, 0.45)',
  },
  border: {
    subtle: palette.slate[200],
    strong: palette.slate[300],
    focus: palette.navy[400],
  },
  state: {
    success: palette.success[600],
    successSurface: palette.success[100],
    warning: palette.warning[500],
    warningSurface: palette.warning[100],
    danger: palette.danger[600],
    dangerSurface: palette.danger[100],
  },
} as const;

export type Palette = typeof palette;
export type Colors = typeof colors;
