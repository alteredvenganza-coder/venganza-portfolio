import { useEffect, useState } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';

const caches = { case_studies: null, services: null };
const inflight = { case_studies: null, services: null };

async function loadList(table) {
  if (!supabaseConfigured) return [];
  if (caches[table]) return caches[table];
  if (inflight[table]) return inflight[table];

  inflight[table] = supabase
    .from(table === 'case_studies' ? 'site_case_studies' : 'site_services')
    .select('*')
    .eq('status', 'published')
    .order('position', { ascending: true })
    .then(({ data, error }) => {
      if (error) {
        console.error(`${table} fetch error`, error);
        return [];
      }
      caches[table] = data || [];
      return caches[table];
    })
    .finally(() => { inflight[table] = null; });

  return inflight[table];
}

export function useSiteCaseStudies() {
  const [items, setItems] = useState(caches.case_studies || []);
  const [loading, setLoading] = useState(!caches.case_studies);

  useEffect(() => {
    let cancelled = false;
    loadList('case_studies').then(d => {
      if (!cancelled) { setItems(d); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, []);

  return { items, loading };
}

export function useSiteServices() {
  const [items, setItems] = useState(caches.services || []);
  const [loading, setLoading] = useState(!caches.services);

  useEffect(() => {
    let cancelled = false;
    loadList('services').then(d => {
      if (!cancelled) { setItems(d); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, []);

  return { items, loading };
}
