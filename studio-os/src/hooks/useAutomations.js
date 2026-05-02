import { useCallback, useEffect, useState } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { useAuth } from './useAuth';

export function useIgAccounts() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const refresh = useCallback(async () => {
    if (!supabaseConfigured || !user) { setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('ig_accounts')
      .select('id, label, ig_user_id, page_id, created_at')
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    setAccounts(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  async function addAccount({ label, ig_user_id, page_id, access_token }) {
    if (!user) throw new Error('Non autenticato');
    const { data, error } = await supabase
      .from('ig_accounts')
      .insert({ user_id: user.id, label, ig_user_id, page_id, access_token })
      .select()
      .single();
    if (error) throw error;
    await refresh();
    return data;
  }

  async function deleteAccount(id) {
    const { error } = await supabase.from('ig_accounts').delete().eq('id', id);
    if (error) throw error;
    await refresh();
  }

  return { accounts, loading, error, refresh, addAccount, deleteAccount };
}

export function useAutomationRules(igAccountId) {
  const { user } = useAuth();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!supabaseConfigured || !user) { setLoading(false); return; }
    setLoading(true);
    let query = supabase
      .from('automation_rules')
      .select('*')
      .order('created_at', { ascending: false });
    if (igAccountId) query = query.eq('ig_account_id', igAccountId);
    const { data, error } = await query;
    if (error) setError(error.message);
    setRules(data ?? []);
    setLoading(false);
  }, [igAccountId, user]);

  useEffect(() => { refresh(); }, [refresh]);

  async function addRule(payload) {
    if (!user) throw new Error('Non autenticato');
    const { data, error } = await supabase
      .from('automation_rules')
      .insert({ ...payload, user_id: user.id })
      .select()
      .single();
    if (error) throw error;
    await refresh();
    return data;
  }

  async function updateRule(id, patch) {
    const { error } = await supabase
      .from('automation_rules')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    await refresh();
  }

  async function deleteRule(id) {
    const { error } = await supabase.from('automation_rules').delete().eq('id', id);
    if (error) throw error;
    await refresh();
  }

  function toggleRule(id, active) {
    return updateRule(id, { active });
  }

  return { rules, loading, error, refresh, addRule, updateRule, deleteRule, toggleRule };
}

export function useAutomationLogs({ limit = 50 } = {}) {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabaseConfigured || !user) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from('automation_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    setLogs(data ?? []);
    setLoading(false);
  }, [limit, user]);

  useEffect(() => { refresh(); }, [refresh]);

  return { logs, loading, refresh };
}
