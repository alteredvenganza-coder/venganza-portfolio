# Menu overlay release — 26 October 2026

**Production URL:** https://altered-venganza.com  
**Vercel project:** `venganza-portfolio` (`prj_GfLRNaXDZEVVi8Y2vywc29CKFHRb`)  
**Active deployed build:** `dpl_FhyqpeohhpQYfRs8WxXaqz6nU1c1` (Next.js, production, READY)  
**Verified preview:** `dpl_6kEGEJWLZV1QpYthcpGxrW9Ap667`

## UX
- Home (fine pointer): moving the mouse over the persistent left menu opens the immersive overlay.
- Home (touch): tapping the MENU button or a left-dock item opens the same overlay; in-overlay links navigate.
- Other pages (mobile): opening MENU shows the same overlay, with center motion video.
- Near-full-screen modal with CLOSE, Escape and backdrop dismissal; scroll locked while open.
- In-overlay links retained for Home, About, Projects, Services, Software and Inquiries.
- Reduced-motion users see the poster after the video is loaded and paused.

## Source
- `recovery/nextjs-2026-10-26-production/patch/components/Header.tsx`
- `recovery/nextjs-2026-10-26-production/patch/app/software-menu.css`
- `recovery/nextjs-2026-10-26-production/reconstructed/` preserves deep page wrappers.
- `recovery/nextjs-2026-10-26-production/media/menu-motion.mp4` is a 6-second silent, original typographic studio ident (480×600, H.264, 20 fps); it is **not** an approved portfolio showreel.
- `recovery/nextjs-2026-10-26-production/media/menu-motion-poster.png` supplies the browser poster.
- Deploy media source file paths are `venganza-portfolio/public/media/menu-motion.mp4` and `.../menu-motion-poster.png`.

## Validation
- Preview Next.js build READY, TypeScript and static generation successful.
- Preview HTTP 200 for Home, Services, Software, Projects, About, Inquiries, service detail, MP4 and PNG. Production deployment tests returned HTTP 200 on the same core pages and assets.
- Production Vercel alias verified to `dpl_FhyqpeohhpQYfRs8WxXaqz6nU1c1`.
- Runtime logs query failed on the provider (not a clean scan). No live pointer/mobile E2E test was executed.

## Important safety
GitHub `main/venganza-portfolio` is still an older Vite application, so **do not reactivate automatic Git builds** until the released Next.js source is synchronized as a standalone app. The Vercel project remains configured to ignore Git builds with `exit 0`. Only the Vercel project `venganza-portfolio` owns `altered-venganza.com`; `venganza-portfolio-studio` remains untouched.

## Content follow-up
Replace the temporary motion ident with the approved studio showreel when the video is available. A stable /public/media file path is already wired in Header.tsx, so replacing it does not require a new interaction design.
