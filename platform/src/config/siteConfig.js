// PLATFORM LAYER: In production, this config will be
// fetched from Supabase based on the creator's subdomain.
// For now it reads from environment variables.

const siteConfig = {
  // ── Identity ──────────────────────────────────────────────────────────────
  displayName:    import.meta.env.VITE_DISPLAY_NAME      || 'Altered Venganza',
  logoText:       import.meta.env.VITE_LOGO_TEXT         || 'Altered Venganza',
  bio:            import.meta.env.VITE_BIO               || 'Multi-disciplinary studio made for brands that builds.',
  tagline:        import.meta.env.VITE_TAGLINE           || 'Premium branding • Custom designs • Pre-mades & softwares for fashion designers and creatives',
  location:       import.meta.env.VITE_LOCATION          || 'Trieste, Italy / by Rare Martinez',

  // ── Brand colors ──────────────────────────────────────────────────────────
  primaryColor:   import.meta.env.VITE_PRIMARY_COLOR     || '#7b1f24',
  accentColor:    import.meta.env.VITE_ACCENT_COLOR      || '#7b1f24',
  bgColor:        import.meta.env.VITE_BG_COLOR          || '#f5f0eb',
  textColor:      import.meta.env.VITE_TEXT_COLOR        || '#000000',

  // ── Instagram ─────────────────────────────────────────────────────────────
  instagramHandle:  import.meta.env.VITE_INSTAGRAM_HANDLE  || 'alteredvenganza',
  instagramToken:   import.meta.env.VITE_INSTAGRAM_TOKEN   || '',
  premadeHashtag:   import.meta.env.VITE_PREMADE_HASHTAG   || '#premade',

  // ── Premades shop ─────────────────────────────────────────────────────────
  premadeBasicPrice:    Number(import.meta.env.VITE_PREMADE_BASIC_PRICE)    || 200,
  premadePremiumPrice:  Number(import.meta.env.VITE_PREMADE_PREMIUM_PRICE)  || 300,
  stripePaymentLink:    import.meta.env.VITE_STRIPE_PAYMENT_LINK            || '',

  // ── Premades copy ─────────────────────────────────────────────────────────
  premadeSubtitle1: import.meta.env.VITE_PREMADE_SUBTITLE1 || 'Pre-made clothing renders • Production ready files',
  premadeSubtitle2: import.meta.env.VITE_PREMADE_SUBTITLE2 || 'Fully alterable & customizable to your brand • Numbered & Ready to purchase',

  // ── Archive ───────────────────────────────────────────────────────────────
  archiveCutoffDate:  import.meta.env.VITE_ARCHIVE_CUTOFF_DATE || '2024-01-01',
  archivePrice:       Number(import.meta.env.VITE_ARCHIVE_PRICE) || 50,

  // ── MAT Renders (product/service pricing) ────────────────────────────────
  matRenderPrices: {
    single:  Number(import.meta.env.VITE_MAT_PRICE_SINGLE)  || 45,
    custom:  Number(import.meta.env.VITE_MAT_PRICE_CUSTOM)  || 60,
    full360: Number(import.meta.env.VITE_MAT_PRICE_360)     || 140,
  },

  // ── Services ──────────────────────────────────────────────────────────────
  services: {
    ecommerceBasic:    Number(import.meta.env.VITE_SERVICE_ECOMMERCE_BASIC)    || 45,
    ecommercePremium:  Number(import.meta.env.VITE_SERVICE_ECOMMERCE_PREMIUM)  || 60,
    ecommerceUltimate: Number(import.meta.env.VITE_SERVICE_ECOMMERCE_ULTIMATE) || 140,
  },
};

export default siteConfig;
