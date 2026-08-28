import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;

/**
 * Checks if Supabase is properly configured in environment variables.
 */
export const isSupabaseConfigured = () => {
  return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
};

/**
 * Lazy getter for Supabase client.
 * This prevents the app from crashing on startup if VITE_SUPABASE_URL is missing.
 * It will only throw an error when a service actually tries to use the database.
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    if (!_supabase) {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('Supabase credentials missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Settings.');
        // Return a dummy object or throw a descriptive error when a method is called
        return (...args: any[]) => {
          throw new Error('Supabase is not configured. Please provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the app settings.');
        };
      }
      _supabase = createClient(supabaseUrl, supabaseAnonKey);
    }
    return (_supabase as any)[prop];
  }
});

export const BUCKET_MEDIA = 'media';
export const BUCKET_VIDEOS = 'videos';
