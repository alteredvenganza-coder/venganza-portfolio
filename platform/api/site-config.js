// GET /api/site-config?slug=alteredvenganza
// PLATFORM LAYER: Fetches creator config from Supabase by slug.
// Falls back to env vars if Supabase not configured (Phase 1 compatibility).
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

function creatorToConfig(creator) {
  return {
    displayName:    creator.display_name,
    logoText:       creator.logo_text || creator.display_name,
    bio:            creator.bio || '',
    tagline:        creator.tagline || '',
    location:       creator.location || '',
    primaryColor:   creator.primary_color || '#000000',
    accentColor:    creator.accent_color || '#000000',
    bgColor:        creator.bg_color || '#f9f9f7',
    textColor:      creator.text_color || '#111111',
    instagramHandle: creator.instagram_handle || '',
    instagramToken:  creator.instagram_token || '',
    premadeHashtag:  creator.premade_hashtag || '#premade',
    stripePaymentLink: creator.stripe_payment_link || '',
    premadeBasicPrice:   creator.premade_basic_price || 150,
    premadePremiumPrice: creator.premade_premium_price || 250,
    premadeSubtitle1: creator.premade_subtitle1 || '',
    premadeSubtitle2: creator.premade_subtitle2 || '',
    archiveCutoffDate: creator.archive_cutoff_date || '2024-01-01',
    archivePrice:    creator.archive_price || 50,
    matRenderPrices: {
      single:  creator.mat_price_single || 45,
      custom:  creator.mat_price_custom || 60,
      full360: creator.mat_price_360 || 140,
    },
    images: {
      heroLeft:   creator.image_hero_left || '',
      heroRight:  creator.image_hero_right || '',
      logo:       creator.image_logo || '/logo.png',
      matRender1: creator.image_mat_render1 || '',
      matRender2: creator.image_mat_render2 || '',
      matRender3: creator.image_mat_render3 || '',
      matRender4: creator.image_mat_render4 || '',
      matRender5: creator.image_mat_render5 || '',
      matRender6: creator.image_mat_render6 || '',
    },
  };
}

function envFallback() {
  return {
    displayName: process.env.DISPLAY_NAME || 'Altered Venganza',
    logoText: process.env.LOGO_TEXT || 'Altered Venganza',
    bio: process.env.BIO || '',
    tagline: process.env.TAGLINE || '',
    location: process.env.LOCATION || '',
    primaryColor: process.env.PRIMARY_COLOR || '#7b1f24',
    accentColor: process.env.ACCENT_COLOR || '#7b1f24',
    bgColor: process.env.BG_COLOR || '#f5f0eb',
    textColor: process.env.TEXT_COLOR || '#000000',
    instagramHandle: process.env.INSTAGRAM_HANDLE || '',
    instagramToken: process.env.INSTAGRAM_TOKEN || '',
    premadeHashtag: process.env.PREMADE_HASHTAG || '#premade',
    stripePaymentLink: process.env.STRIPE_PAYMENT_LINK || '',
    premadeBasicPrice: Number(process.env.PREMADE_BASIC_PRICE) || 200,
    premadePremiumPrice: Number(process.env.PREMADE_PREMIUM_PRICE) || 300,
    premadeSubtitle1: process.env.PREMADE_SUBTITLE1 || '',
    premadeSubtitle2: process.env.PREMADE_SUBTITLE2 || '',
    archiveCutoffDate: process.env.ARCHIVE_CUTOFF_DATE || '2024-01-01',
    archivePrice: Number(process.env.ARCHIVE_PRICE) || 50,
    matRenderPrices: {
      single: Number(process.env.MAT_PRICE_SINGLE) || 45,
      custom: Number(process.env.MAT_PRICE_CUSTOM) || 60,
      full360: Number(process.env.MAT_PRICE_360) || 140,
    },
    images: { heroLeft: '', heroRight: '', logo: '/logo.png', matRender1: '', matRender2: '', matRender3: '', matRender4: '', matRender5: '', matRender6: '' },
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');

  // If Supabase not configured, fall back to env vars (Phase 1 mode)
  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(200).json(envFallback());
  }

  const slug = req.query.slug;
  if (!slug) return res.status(400).json({ error: 'slug required' });

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabase
      .from('creators')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Creator not found' });
    return res.status(200).json(creatorToConfig(data));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
