// PLATFORM LAYER: useSiteConfig hook
// Phase 1: reads from siteConfig.js (env vars)
// Phase 2: fetches from /api/site-config?slug=X (Supabase-backed)
// The slug is determined from the subdomain or URL param.

import { useState, useEffect } from 'react';
import siteConfig from '../config/siteConfig';

let cachedConfig = null;

function getSlugFromHost() {
  const host = window.location.hostname;
  // e.g. alteredvenganza.folio.app → alteredvenganza
  const parts = host.split('.');
  if (parts.length >= 3) return parts[0];
  // e.g. localhost:5174?slug=alteredvenganza
  const params = new URLSearchParams(window.location.search);
  return params.get('slug') || null;
}

export function useSiteConfig() {
  const [config, setConfig] = useState(cachedConfig || siteConfig);

  useEffect(() => {
    if (cachedConfig) return;

    const slug = getSlugFromHost();
    const url = slug ? `/api/site-config?slug=${slug}` : '/api/site-config';

    fetch(url)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          const merged = { ...siteConfig, ...data };
          cachedConfig = merged;
          setConfig(merged);
        }
      })
      .catch(() => {});
  }, []);

  return config;
}
