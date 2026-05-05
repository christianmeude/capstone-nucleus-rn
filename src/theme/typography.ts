/**
 * NUcleus typography tokens.
 *
 * Two families per docs/plans/UI_OVERHAUL.md §2.2:
 *   - `families.ui = Outfit`     — every UI surface (default).
 *   - `families.display = Lora`  — sparingly, for premium reading-view titles
 *                                  (e.g. ResearchDetail paper title). NEVER for UI chrome.
 *
 * React Native does not select a weight from a single family name + numeric weight;
 * each weight must reference its own registered font name. Both families ship via
 * `@expo-google-fonts/outfit` and `@expo-google-fonts/lora` and are loaded in App.tsx.
 */

import type { TextStyle } from 'react-native';

export const families = {
  ui: {
    regular: 'Outfit_400Regular',
    medium: 'Outfit_500Medium',
    semibold: 'Outfit_600SemiBold',
    bold: 'Outfit_700Bold',
  },
  display: {
    regular: 'Lora_400Regular',
    medium: 'Lora_500Medium',
    semibold: 'Lora_600SemiBold',
    bold: 'Lora_700Bold',
  },
} as const;

export type FontFamilyKey = 'ui' | 'display';
export type FontWeightKey = 'regular' | 'medium' | 'semibold' | 'bold';

type FontWeightValue = NonNullable<TextStyle['fontWeight']>;

export const fontWeightToKey: Record<FontWeightKey, FontWeightValue> = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

type TypographyStyle = Required<
  Pick<TextStyle, 'fontFamily' | 'fontSize' | 'lineHeight' | 'fontWeight'>
> & {
  letterSpacing?: number;
};

const make = (
  family: FontFamilyKey,
  weight: FontWeightKey,
  fontSize: number,
  lineHeight: number,
  letterSpacing?: number
): TypographyStyle => ({
  fontFamily: families[family][weight],
  fontWeight: fontWeightToKey[weight],
  fontSize,
  lineHeight,
  ...(letterSpacing !== undefined ? { letterSpacing } : {}),
});

/**
 * Type scale tuned for mobile reading per roadmap §2 ("strong scale between
 * headings, subheads, body, and metadata; line lengths and sizes tuned for
 * mobile reading").
 *
 * `display` is the only style that uses the Lora serif by default.
 */
export const typography = {
  display: make('display', 'semibold', 30, 38, 0.2),
  h1: make('ui', 'bold', 26, 34, 0),
  h2: make('ui', 'bold', 20, 28, 0),
  h3: make('ui', 'semibold', 17, 24, 0),
  bodyStrong: make('ui', 'semibold', 15, 22, 0),
  body: make('ui', 'regular', 15, 22, 0),
  bodySmall: make('ui', 'regular', 13, 20, 0),
  label: make('ui', 'semibold', 13, 18, 0.1),
  metadata: make('ui', 'medium', 12, 18, 0.1),
  caption: make('ui', 'regular', 11, 16, 0.2),
  button: make('ui', 'semibold', 15, 20, 0.2),
} as const;

export type TypographyScale = typeof typography;
export type TypographyKey = keyof TypographyScale;
