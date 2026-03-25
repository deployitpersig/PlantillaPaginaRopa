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
  const attempt = async (timeoutMs) => {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Query timeout')), timeoutMs)
    );
    const result = await Promise.race([queryFn(), timeoutPromise]);
    if (result.error) throw result.error;
    return { data: result.data, error: null };
  };

  try {
    return await attempt(20000); // 20s — covers Supabase free-tier cold starts
  } catch (firstError) {
    try {
      console.warn('Supabase query retry after:', firstError.message);
      return await attempt(25000); // retry once with 25s
    } catch (retryError) {
      console.error('Supabase query failed after retry:', retryError.message);
      return { data: null, error: retryError };
    }
  }
};
