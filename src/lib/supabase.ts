import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('VITE_SUPABASE_URL belum dikonfigurasi.');
}

if (!supabaseKey) {
  console.error('Supabase publishable/anon key belum dikonfigurasi.');
}

export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseKey);
};

export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key'
);

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
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url) console.error('FAIL: VITE_SUPABASE_URL is missing');
  else console.log('PASS: VITE_SUPABASE_URL is present');
  
  if (!key) console.error('FAIL: Supabase publishable/anon key is missing');
  else console.log('PASS: Supabase publishable/anon key is present');

  if (url && key) {
    try {
      const { data, error } = await supabase.auth.getSession();
      console.log('SUPABASE CONNECTION TEST:', {
        url,
        hasKey: Boolean(key),
        error
      });
      if (error) throw error;
      console.log('PASS: Supabase auth handshake successful');
    } catch (err) {
      console.error('SUPABASE CONNECTION FAILED:', err);
    }
  }
  console.log('--- End Diagnostic Test ---');
}

