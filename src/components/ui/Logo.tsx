import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme';
import { OrbitalAccent } from './OrbitalAccent';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
}

const sizeMap = {
  sm: { mark: 44, n: 34, wordmark: 16, tracking: 3 },
  md: { mark: 56, n: 42, wordmark: 20, tracking: 4 },
  lg: { mark: 72, n: 54, wordmark: 24, tracking: 5 },
} as const;

export const Logo = ({ size = 'md', showWordmark = true }: LogoProps) => {
  const token = sizeMap[size];

  return (
    <View style={styles.container}>
      <View style={[styles.mark, { width: token.mark, height: token.mark }]}>
        <Text style={[styles.nGlyph, { fontSize: token.n }]}>N</Text>
        <View style={styles.orbit}>
          <OrbitalAccent size={token.mark} />
        </View>
      </View>
      {showWordmark ? (
        <Text style={[styles.wordmark, { fontSize: token.wordmark, letterSpacing: token.tracking }]}>
          NUCLEUS
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  mark: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nGlyph: {
    ...theme.typography.h1,
    color: theme.colors.brand.primary,
    fontFamily: theme.fontFamilies.ui.bold,
    includeFontPadding: false,
  },
  orbit: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    color: theme.colors.brand.primary,
    fontFamily: theme.fontFamilies.ui.bold,
    includeFontPadding: false,
  },
});
