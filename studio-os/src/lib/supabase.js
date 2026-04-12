import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error(
    '[Venganza OS] Env vars mancanti: aggiungi VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY su Vercel → Settings → Environment Variables, poi rideploya.'
  );
}

export const supabase = createClient(url, key);
