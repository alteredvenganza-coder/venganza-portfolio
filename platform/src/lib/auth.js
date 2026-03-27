import { supabase, isSupabaseEnabled } from './supabase';

export async function signUp({ email, password, displayName }) {
  if (!isSupabaseEnabled) throw new Error('Auth not configured');
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) throw error;
  return data;
}

export async function signIn({ email, password }) {
  if (!isSupabaseEnabled) throw new Error('Auth not configured');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!isSupabaseEnabled) return;
  await supabase.auth.signOut();
}

export async function getSession() {
  if (!isSupabaseEnabled) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getCreatorProfile(userId) {
  if (!isSupabaseEnabled) return null;
  const { data, error } = await supabase
    .from('creators')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function updateCreatorProfile(userId, updates) {
  if (!isSupabaseEnabled) throw new Error('DB not configured');
  const { data, error } = await supabase
    .from('creators')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getCreatorBySlug(slug) {
  if (!isSupabaseEnabled) return null;
  const { data, error } = await supabase
    .from('creators')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();
  if (error) return null;
  return data;
}
