import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import { Button } from '../../components/ui';

export const UnsupportedRoleScreen = () => {
  const { user, signOut } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Student Access Only</Text>
        <Text style={styles.description}>
          This mobile app currently supports student workflows only. Signed in role: {user?.role}
        </Text>
        <Button label="Sign out" onPress={signOut} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.surface.base,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text.primary,
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
});
