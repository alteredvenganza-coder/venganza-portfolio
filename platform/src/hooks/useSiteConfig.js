// PLATFORM LAYER: In production, this hook fetches creator config from /api/site-config
// which reads from Supabase based on the creator's subdomain.
// For now it uses static import of siteConfig.js as the data source.

import { useState, useEffect } from 'react';
import siteConfig from '../config/siteConfig';

let cachedConfig = null;

export function useSiteConfig() {
  const [config, setConfig] = useState(cachedConfig || siteConfig);

  useEffect(() => {
    if (cachedConfig) return;
    // Try to fetch dynamic config from API (for production multi-tenant use)
    fetch('/api/site-config')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          const merged = { ...siteConfig, ...data };
          cachedConfig = merged;
          setConfig(merged);
        }
      })
      .catch(() => {}); // Fall back to static siteConfig if API not available
  }, []);

  return config;
}
