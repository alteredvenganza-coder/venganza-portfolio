# Creator Portfolio Platform

A multi-tenant SaaS platform built on the Altered Venganza portfolio template. Any creator can deploy a fully branded portfolio + shop by supplying environment variables — no code changes required. Phase 1 ships the config-driven template; later phases add auth, a hosted dashboard, and a public marketplace.

---

## Roadmap

| Phase | Name | Description |
|-------|------|-------------|
| 1 | Config-driven template | All content and branding driven by `siteConfig.js` via env vars. One codebase, infinite creator deploys. |
| 2 | Auth + Supabase | `siteConfig` fetched from Supabase by subdomain. Creator login, dashboard to edit config, media uploads. |
| 3 | Creator onboarding | Self-serve signup flow. Automated subdomain provisioning. Stripe Connect for per-creator payouts. |
| 4 | Marketplace | Public directory of creator shops. Discovery, curated drops, platform revenue share. |

---

## Local Setup

```bash
git clone <repo-url>
cd platform
cp .env.example .env        # fill in your values (see table below)
npm install
npm run dev
```

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_DISPLAY_NAME` | Creator's public display name | `Altered Venganza` |
| `VITE_LOGO_TEXT` | Text rendered in the nav logo | `Altered Venganza` |
| `VITE_BIO` | Short bio shown on the hero | `Multi-disciplinary studio...` |
| `VITE_TAGLINE` | Subtitle line under the bio | `Premium branding • Custom designs` |
| `VITE_LOCATION` | Location string | `Trieste, Italy` |
| `VITE_PRIMARY_COLOR` | Primary brand color (hex) | `#7b1f24` |
| `VITE_ACCENT_COLOR` | Accent / highlight color (hex) | `#7b1f24` |
| `VITE_BG_COLOR` | Page background color (hex) | `#f5f0eb` |
| `VITE_TEXT_COLOR` | Body text color (hex) | `#000000` |
| `VITE_INSTAGRAM_HANDLE` | IG handle (no `@`) | `alteredvenganza` |
| `VITE_INSTAGRAM_TOKEN` | Instagram Graph API token | `IGQVJx...` |
| `VITE_PREMADE_HASHTAG` | Hashtag used to tag premade posts | `#premade` |
| `VITE_PREMADE_BASIC_PRICE` | Basic premade listing price (USD) | `200` |
| `VITE_PREMADE_PREMIUM_PRICE` | Premium premade listing price (USD) | `300` |
| `VITE_STRIPE_PAYMENT_LINK` | Stripe Payment Link URL | `https://buy.stripe.com/...` |
| `VITE_PREMADE_SUBTITLE1` | First subtitle line in premades section | `Pre-made clothing renders...` |
| `VITE_PREMADE_SUBTITLE2` | Second subtitle line in premades section | `Fully alterable...` |
| `VITE_ARCHIVE_CUTOFF_DATE` | Posts before this date go to archive | `2024-01-01` |
| `VITE_ARCHIVE_PRICE` | Archive pack price (USD) | `50` |
| `VITE_MAT_PRICE_SINGLE` | MAT render — single view price | `45` |
| `VITE_MAT_PRICE_CUSTOM` | MAT render — custom view price | `60` |
| `VITE_MAT_PRICE_360` | MAT render — full 360 price | `140` |
| `VITE_SERVICE_ECOMMERCE_BASIC` | E-commerce service — basic tier | `45` |
| `VITE_SERVICE_ECOMMERCE_PREMIUM` | E-commerce service — premium tier | `60` |
| `VITE_SERVICE_ECOMMERCE_ULTIMATE` | E-commerce service — ultimate tier | `140` |

---

## Project Structure

```
src/
  config/
    siteConfig.js       # Reads all VITE_* env vars; single source of truth for content
    defaultConfig.js    # Fallback values for a blank new creator
    useSiteConfig.js    # React hook — consumes siteConfig throughout the app
    useTheme.js         # Applies brand colors to CSS custom properties
  hooks/                # Shared data-fetching and utility hooks
  App.jsx
  main.jsx

api/
  instagram-feed.js     # Serverless function — proxies Instagram Graph API
  instagram-reel.js     # Serverless function — fetches reel media

public/                 # Static assets (images, fonts)
```

---

## Key Concept

`src/config/siteConfig.js` is the single source of truth for all creator-specific content — copy, colors, pricing, and social handles. The rest of the app reads from this object; nothing is hardcoded in components.

In **Phase 2**, `siteConfig` will be replaced by a Supabase fetch keyed on the creator's subdomain, making the same runtime bundle serve any creator without a redeploy.
