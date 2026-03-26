// Default config for a new creator who hasn't customized yet.
// Used as fallback when no siteConfig values are provided.

const defaultConfig = {
  displayName:    'My Studio',
  logoText:       'My Studio',
  bio:            'Creative studio specializing in fashion & brand design.',
  tagline:        'Premium branding • Custom designs • Ready-to-wear templates',
  location:       'Your City',

  primaryColor:   '#000000',
  accentColor:    '#000000',
  bgColor:        '#f9f9f7',
  textColor:      '#111111',

  instagramHandle:  '',
  instagramToken:   '',
  premadeHashtag:   '#premade',

  premadeBasicPrice:    150,
  premadePremiumPrice:  250,
  stripePaymentLink:    '',

  premadeSubtitle1: 'Pre-made clothing renders • Production ready files',
  premadeSubtitle2: 'Fully alterable & customizable to your brand',

  archiveCutoffDate:  '2024-01-01',
  archivePrice:       50,

  matRenderPrices: {
    single:  45,
    custom:  60,
    full360: 140,
  },

  services: {
    ecommerceBasic:    45,
    ecommercePremium:  60,
    ecommerceUltimate: 140,
  },
};

export default defaultConfig;
