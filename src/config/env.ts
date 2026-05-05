/** Supabase project URL — only source for the Supabase client (Phase 1+). */
export const EXPO_PUBLIC_SUPABASE_URL = (process.env.EXPO_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');

/** Supabase anonymous key — only source for the Supabase client (Phase 1+). */
export const EXPO_PUBLIC_SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
