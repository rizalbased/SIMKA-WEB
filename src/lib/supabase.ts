import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;

/**
 * Checks if Supabase is properly configured in environment variables.
 */
export const isSupabaseConfigured = () => {
  return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
};

/**
 * Recursive proxy to handle nested properties without crashing
 * and only throw when a method is actually called.
 */
function createProxyFallback(path: string): any {
  const fallback = (...args: any[]) => {
    throw new Error(`Supabase is not configured. Accessing "${path}" failed. Please provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Settings.`);
  };

  return new Proxy(fallback, {
    get(_, prop) {
      if (typeof prop === 'string') {
        return createProxyFallback(`${path}.${prop}`);
      }
      return undefined;
    }
  });
}

/**
 * Lazy getter for Supabase client.
 * This prevents the app from crashing on startup if VITE_SUPABASE_URL is missing.
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    if (!_supabase) {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        if (typeof prop === 'string') {
          return createProxyFallback(`supabase.${prop}`);
        }
        return undefined;
      }
      _supabase = createClient(supabaseUrl, supabaseAnonKey);
    }
    return (_supabase as any)[prop];
  }
});

export const BUCKET_NAME = 'galeri-emka';

/**
 * Helper to get public URL for a file in the galeri-emka bucket
 */
export function getPublicUrl(filePath: string): string {
  if (!filePath) return '';
  // Handle absolute URLs that might already be stored
  if (filePath.startsWith('http')) return filePath;
  
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
  return data.publicUrl;
}

export async function testSupabaseConnection() {
  console.log('--- Supabase Diagnostic Test ---');
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url) console.error('FAIL: VITE_SUPABASE_URL is missing');
  else console.log('PASS: VITE_SUPABASE_URL is present');
  
  if (!key) console.error('FAIL: VITE_SUPABASE_ANON_KEY is missing');
  else console.log('PASS: VITE_SUPABASE_ANON_KEY is present');

  if (url && key) {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      console.log('PASS: Supabase auth handshake successful');
    } catch (err) {
      console.error('FAIL: Supabase auth handshake failed', err);
    }
  }
  console.log('--- End Diagnostic Test ---');
}
