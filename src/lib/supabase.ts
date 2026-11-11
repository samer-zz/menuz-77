import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const SUPABASE_URL = url ?? 'https://mtwyvqnagpnotrkixzni.supabase.co';
export const SUPABASE_ANON = anon ?? '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

export function sessionId(): string {
  let s = localStorage.getItem('menuz_session');
  if (!s) {
    s = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('menuz_session', s);
  }
  return s;
}
