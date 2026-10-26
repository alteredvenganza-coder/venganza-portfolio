# Altered Venganza — released Next.js UI (26 October 2026)

- Public domain: https://altered-venganza.com
- Vercel project ID: `prj_GfLRNaXDZEVVi8Y2vywc29CKFHRb` (`venganza-portfolio` **only**)
- Verified production deployment ID: `dpl_346wv2SGTtLfs1AhLcrx29WbrC5K`
- Preview deployment ID: `dpl_GBWS6ZeNuepH3ZmVZtb35Rhu1cag`
- Original Next.js production deployment source base: `dpl_LGzGXV1TVBDSL9BsMCExJ8Tq5J5A`
- Never promote GitHub `venganza-portfolio/` unchanged: it is a DIFFERENT (older) Vite app.
- Vercel Git build auto-trigger is explicitly disabled via `commandForIgnoringBuildStep = exit 0` to prevent overwrite.
- Source files: original Vercel source SHAs (see `vercel-source-references.json`), plus patches under `recovery/nextjs-2026-10-25/patch`, plus the Messenger Aero preview under `recovery/nextjs-2026-10-25/previews`.
- Additional deployed code not yet imported into GitHub canonical app: About and Projects route wrappers, integrated Aero inquiry JSX and CSS. The full compiled deployment is preserved on Vercel under the production ID above. Future changes should start by extracting the COMPLETE original Next.js project and syncing it to GitHub in an independent directory with Next.js framework, then migrate.
- Verified HTTP 200 on preview before release: /, /inquire, /ser-vices, all 6 /ser-vices/:slug routes, /software, /pro-jectz, five project detail slugs and /altered-venganza.
- This release does NOT make email delivery active; /api/inquiries needs Resend verified sender, RESEND_API_KEY and INQUIRY_FROM_EMAIL.
- Due to Google image source HTTP 403, a small number of original images may not download during rebuild.

IMPORTANT: The ZIP from "Proposta Inquiries Frutiger Aero" could not be mounted. The full HTML Messenger preview was used as design source to implement the responsive React Inquiries screen in this production release.
