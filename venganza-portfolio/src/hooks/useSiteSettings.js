import { useEffect, useState } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';

const DEFAULT = {
  hero_image: null,
  case_study_maali_image: null,
  case_study_04_image: null,
  data: {},
};

let cache = null;
let inflight = null;

async function load() {
  if (!supabaseConfigured) return DEFAULT;
  if (cache) return cache;
  if (inflight) return inflight;

  inflight = supabase
    .from('site_settings')
    .select('hero_image, case_study_maali_image, case_study_04_image, data')
    .eq('id', 1)
    .maybeSingle()
    .then(({ data, error }) => {
      if (error) {
        console.error('site_settings fetch error', error);
        return DEFAULT;
      }
      cache = data || DEFAULT;
      return cache;
    })
    .finally(() => { inflight = null; });

  return inflight;
}

export function useSiteSettings() {
  const [settings, setSettings] = useState(cache || DEFAULT);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    let cancelled = false;
    load().then(s => {
      if (!cancelled) {
        setSettings(s);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  return { settings, loading };
}
