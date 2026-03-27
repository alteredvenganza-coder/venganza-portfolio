// Converts a Supabase creator row to siteConfig shape
export function creatorToConfig(creator) {
  if (!creator) return null;
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
      heroLeft:    creator.image_hero_left || '',
      heroRight:   creator.image_hero_right || '',
      logo:        creator.image_logo || '/logo.png',
      matRender1:  creator.image_mat_render1 || '',
      matRender2:  creator.image_mat_render2 || '',
      matRender3:  creator.image_mat_render3 || '',
      matRender4:  creator.image_mat_render4 || '',
      matRender5:  creator.image_mat_render5 || '',
      matRender6:  creator.image_mat_render6 || '',
    },
  };
}
