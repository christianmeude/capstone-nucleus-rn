import { StyleSheet, View } from 'react-native';
import { theme } from '../../theme';

interface OrbitalAccentProps {
  size?: number;
}

export const OrbitalAccent = ({ size = 64 }: OrbitalAccentProps) => {
  return (
    <View style={[styles.container, { width: size, height: size * 0.7 }]}>
      <View style={[styles.arc, styles.blueArc]} />
      <View style={[styles.arc, styles.goldArc]} />
      <View style={styles.orb} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  arc: {
    position: 'absolute',
    borderWidth: 3,
    borderRadius: theme.radii.pill,
    width: '100%',
    height: '75%',
    backgroundColor: 'transparent',
  },
  blueArc: {
    borderColor: theme.palette.navy[400],
    transform: [{ rotate: '-24deg' }],
  },
  goldArc: {
    borderColor: theme.palette.gold[500],
    transform: [{ rotate: '24deg' }],
  },
  orb: {
    position: 'absolute',
    right: 4,
    top: 6,
    width: 10,
    height: 10,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.brand.accent,
  },
});
