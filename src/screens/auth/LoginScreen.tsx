import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import { Button, Logo } from '../../components/ui';

export const LoginScreen = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }

    setSubmitting(true);
    setError('');

    const result = await signIn(email.trim(), password);
    setSubmitting(false);

    if (!result.success) {
      setError(result.error || 'Unable to sign in.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
      >
        <View style={styles.card}>
          <Logo size="sm" />
          <Text style={styles.title}>NUcleus Mobile</Text>
          <Text style={styles.subtitle}>
            Student workflow access (submission excluded)
          </Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="student@example.com"
              placeholderTextColor={theme.colors.text.disabled}
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              secureTextEntry
              placeholder="Enter your password"
              placeholderTextColor={theme.colors.text.disabled}
              style={styles.input}
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button label="Sign in" onPress={onSubmit} loading={submitting} disabled={submitting} />

          <Text style={styles.note}>
            This app is student-only and supports viewing workflow progress, notifications, and
            co-author invitations.
          </Text>
        </View>
      </KeyboardAvoidingView>
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
  },
  card: {
    backgroundColor: theme.colors.surface.raised,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  formGroup: {
    gap: theme.spacing.xs,
  },
  label: {
    ...theme.typography.label,
    color: theme.colors.text.secondary,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border.strong,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    ...theme.typography.body,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.surface.raised,
  },
  error: {
    ...theme.typography.bodySmall,
    color: theme.colors.state.danger,
  },
  note: {
    ...theme.typography.caption,
    color: theme.colors.text.muted,
    textAlign: 'center',
  },
});
