# Altered Venganza — Next.js release candidate (25 October 2026)

This contains the recovered source patch from the conversation "Menu home sempre aperto", developed against Vercel deployment dpl_LGzGXV1TVBDSL9BsMCExJ8Tq5J5A (Next.js). Do NOT deploy this directory directly: it is not the full Next.js site. GitHub's current venganza-portfolio folder is a separate Vite app.

## Included
- Home desktop/mobile permanently visible index menu, fullscreen menu and SOFTWARE
- Services page and service details, Add to Inquiry, persistent count
- /inquire, receipt, Next.js /api/inquiries endpoint
- Client projects as Instagram-like profiles, galleries, carousels and reels

## Missing from this recovery
- The original full Next.js source that produced the October 24 production deployment.
- The later "Proposta Inquiries Frutiger Aero" patch code itself (its ZIP exists in the user's Library but raw source is not available to this tool context). The approved direction is a liquid-glass, Windows Live Messenger-inspired Inquiries page with original portfolio background; "Sign in to your next idea" is purely visual and should never request authentication.
- A verified email provider sender and RESEND_API_KEY / INQUIRY_FROM_EMAIL for real email delivery.

## Deployment safety
Production domain altered-venganza.com currently points to the verified 24 October Next.js Vercel deployment. GitHub main is still the older Vite app. Automatic Git builds were disabled for venganza-portfolio and venganza-portfolio-studio to prevent overwriting the live Next.js site. Do not re-enable or merge this partial patch into the runtime until its base source is recovered, applied, built and browser-tested.
