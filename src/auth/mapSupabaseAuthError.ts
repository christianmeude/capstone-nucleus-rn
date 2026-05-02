import { AuthError } from '@supabase/supabase-js';

export function mapSupabaseAuthError(error: AuthError): string {
  const msg = error.message?.trim() || '';

  if (/invalid login credentials|invalid credentials/i.test(msg)) {
    return 'Invalid email or password.';
  }
  if (/email not confirmed/i.test(msg)) {
    return 'Please confirm your email before signing in.';
  }

  return msg || 'Unable to sign in.';
}
