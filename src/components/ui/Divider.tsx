import { StyleSheet, View } from 'react-native';
import { theme } from '../../theme';

export const Divider = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.border.subtle,
    width: '100%',
  },
});
