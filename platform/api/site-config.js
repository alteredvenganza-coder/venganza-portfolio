// GET /api/site-config
// PLATFORM LAYER: In production, fetches creator config from Supabase by subdomain.
// For now returns env-var based config.
export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  res.status(200).json({
    displayName: process.env.DISPLAY_NAME || 'Altered Venganza',
    logoText: process.env.LOGO_TEXT || 'Altered Venganza',
    bio: process.env.BIO || 'Multi-disciplinary studio made for brands that builds.',
    tagline: process.env.TAGLINE || 'Premium branding • Custom designs • Pre-mades & softwares for fashion designers and creatives',
    location: process.env.LOCATION || 'Trieste, Italy / by Rare Martinez',
    primaryColor: process.env.PRIMARY_COLOR || '#7b1f24',
    accentColor: process.env.ACCENT_COLOR || '#7b1f24',
    bgColor: process.env.BG_COLOR || '#f5f0eb',
    textColor: process.env.TEXT_COLOR || '#000000',
    instagramHandle: process.env.INSTAGRAM_HANDLE || 'alteredvenganza',
    premadeHashtag: process.env.PREMADE_HASHTAG || '#premade',
    premadeBasicPrice: Number(process.env.PREMADE_BASIC_PRICE) || 200,
    premadePremiumPrice: Number(process.env.PREMADE_PREMIUM_PRICE) || 300,
    stripePaymentLink: process.env.STRIPE_PAYMENT_LINK || '',
    premadeSubtitle1: process.env.PREMADE_SUBTITLE1 || 'Pre-made clothing renders • Production ready files',
    premadeSubtitle2: process.env.PREMADE_SUBTITLE2 || 'Fully alterable & customizable to your brand • Numbered & Ready to purchase',
    archiveCutoffDate: process.env.ARCHIVE_CUTOFF_DATE || '2024-01-01',
    archivePrice: Number(process.env.ARCHIVE_PRICE) || 50,
    matRenderPrices: {
      single: Number(process.env.MAT_PRICE_SINGLE) || 45,
      custom: Number(process.env.MAT_PRICE_CUSTOM) || 60,
      full360: Number(process.env.MAT_PRICE_360) || 140,
    },
  });
}
