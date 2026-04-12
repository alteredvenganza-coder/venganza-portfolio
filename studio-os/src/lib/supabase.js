import { createClient } from '@supabase/supabase-js';

const url = (import.meta.env.VITE_SUPABASE_URL  ?? '').trim().replace(/^<|>$/g, '');
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim().replace(/^<|>$/g, '');

export const supabaseConfigured = Boolean(url && key && url.startsWith('http'));

let _client = null;
if (supabaseConfigured) {
  try { _client = createClient(url, key); } catch (e) { console.error('Supabase init failed:', e); }
}
export const supabase = _client;
