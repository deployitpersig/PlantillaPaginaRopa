import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing Supabase environment variables. Please create a .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: { 'x-app-version': '1.0' },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    timeout: 10000, // 10s timeout para evitar conexiones colgadas
  },
});

export const safeQuery = async (queryFn) => {
  try {
    const result = await queryFn();
    if (result.error) {
      console.error('Supabase query error:', result.error.message);
      return { data: null, error: result.error };
    }
    return { data: result.data, error: null };
  } catch (error) {
    console.error('Supabase query exception:', error.message);
    return { data: null, error };
  }
};
