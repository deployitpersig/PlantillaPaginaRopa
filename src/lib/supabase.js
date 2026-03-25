import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Base de datos no conectada: Faltan las variables de entorno de Supabase en el archivo .env o en Netlify.');
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
