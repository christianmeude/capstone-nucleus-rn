import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

export const UnsupportedRoleScreen = () => {
  const { user, signOut } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Student Access Only</Text>
        <Text style={styles.description}>
          This mobile app currently supports student workflows only. Signed in role: {user?.role}
        </Text>
        <Pressable onPress={signOut} style={styles.button}>
          <Text style={styles.buttonLabel}>Sign out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f172a',
  },
  description: {
    color: '#475569',
    fontSize: 15,
    lineHeight: 22,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#1c4d8d',
    borderRadius: 10,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  buttonLabel: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
});
