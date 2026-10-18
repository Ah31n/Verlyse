# Verlyse QA & Verification Protocol

## Reporting Vocabulary

Every check reported in `docs/CHANGE_BRIEF.md` or turn summaries must use one of:
- `PASS` — executed in the active `arena/741ed410-verlyse` worktree during the current verification pass and succeeded.
- `FAIL` — executed and failed.
- `BLOCKED` — could not run due to a concrete environment or external credential/deployment constraint (state exact blocker and admin action required).
- `NOT TESTED` — not executed in the current pass.

Never treat earlier reports as proof of current state without re-running the relevant checks after code edits.

## Active Verification Suite (Exact `package.json` Commands & Denominators)

1. **Build & Prerender (`npm run build`)**:
   - Runs `tsc -b && vite build && node scripts/prerender-metadata.mjs && node scripts/generate-sitemap.mjs`.
   - Verifies TypeScript compilation (`0` errors), Rollup chunk isolation (`dist/assets/index-B4mHalN7.js` `177.64 kB` / `57.97 kB` gzip; `dist/assets/boot-CfrjN6Gu.js` `199.82 kB` / `51.65 kB` gzip; `dist/assets/gsap-a3sj5zmn.js` `114.01 kB` / `45.16 kB` gzip; `dist/assets/anime-CcJk6tc-.js` `32.40 kB` / `13.15 kB` gzip; `dist/assets/StoryEnding3D-C6ccyV-p.js` `10.93 kB` / `3.20 kB` gzip; `dist/assets/three-DF4bklDy.js` `770.49 kB` / `203.48 kB` gzip), `53` prerendered route shells, and `53` sitemap URLs.
2. **Serverless Typecheck (`npm run typecheck:api`)**:
   - Runs `tsc -p tsconfig.api.json` (`0` errors).
3. **Secrets & Hygiene (`npm run check:secrets`)**:
   - Runs `node scripts/check-secrets.mjs` (`0` findings).
4. **Canonical Metadata & Counts (`npm run test:metadata`)**:
   - Runs `node scripts/metadata-audit.mjs` against `dist/` (`53` HTML shells, `53` sitemap URLs).
5. **SSR Smoke Suite (`npm run test:smoke`)**:
   - Runs `node scripts/ssr-smoke.mjs` (`20/20` SSR route render cases: `18` valid routes across all `11` `<Route>` patterns in `src/App.tsx` + `2` missing-slug 404 fallbacks).
6. **Newsletter API Suite (`npm run test:newsletter`)**:
   - Runs `node scripts/newsletter-smoke.mjs` (`15/15` synthetic checks covering `resolveNewsletterEndpoint()` for `verlysemedia.kesug.com` vs Vercel/local dev, `PRODUCTION_ALLOWED_ORIGINS`, `VERCEL_ENV=production` rejection of `localhost`, method validation, honeypot, email validation, and upstream `201`/`409`/`502` handling). Live end-to-end production POST verification is **BLOCKED / NOT VERIFIED** in the sandbox until deployed to Vercel/InfinityFree.
7. **Interactive User Flows (`npm run test:flows`)**:
   - Runs `node scripts/interaction-jsdom.mjs` (`14/14` jsdom flows including dialog semantics, search keyboard navigation, focus restoration, save persistence + single-item removal sync, `ArtGallery` layout & transform classes, `Creators.tsx` `19` published + `1` provisional = `20` catalogued features, `Footer.tsx` newsletter label/placeholder, fixed non-editable `[data-footer-specimen="verlyse"]` with `0` interactive/focusable descendants and `0` `TG`/demo labels, and `StringTune` pending-boot reduced-motion race safety).
8. **Asset Integrity Audit (`node scripts/asset-audit.mjs`)**:
   - Scrolls all lazy images into view across `/`, `/article/their-voices-matter`, and `/article/the-quiet-grief` and verifies both the **`45/45` sampled role subset** (`covers: 24, inner: 7, signature: 1, portrait: 5, fonts: 4, logo: 1, poster: 3`, including `/img/poster-3-13-3.webp`) and the **`104/104` full `public/` static media + font inventory** (`100` image/SVG files + `4` `.woff2` font files, `missing: 0`, `unreferencedPublicMediaCount: 0`).
9. **Headless Chromium Interaction & Computed-Style Audit (`node scripts/interaction-audit.mjs`)**:
   - Verifies **`18/18` browser checks** (`search-open-focus`, `search-query-results`, `search-escape-close`, `shelf-open`, `shelf-saved-item`, `mobile-menu-open`, `ending-voices`, `ending-wait`, `ending-quiet-grief`, `quiet-grief-gallery-and-caption`, `quiet-grief-gallery-computed-layout` across `375×812`/`768×1024`/`1440×900`, `forms-and-profile-a11y`, `hiring-marquee-and-roster-removal`, `footer-static-specimen-and-no-tg-residue`, `mobile-375px-no-overflow`, `reduced-motion-preserves` including zero heavy animation/3D chunk fetches, and `no-webgl-fallback` with `canvases === 0` and zero heavy 3D chunk fetches), with `0` console errors.
10. **Canonical 8-Viewport × 11-Route Responsive & Single-Footer Matrix (`88/88`)**:
    - **8 Viewports**: `320×568`, `360×740`, `375×812`, `390×844` (mobile), `768×1024`, `1024×768` (tablet), and `1280×800`, `1440×900` (desktop).
    - **11 Routes**: `10` standard-layout publication routes (`/`, `/articles`, `/categories`, `/creators`, `/community`, `/about`, `/ambassadors`, `/submit`, `/contact`, `/article/the-quiet-grief`) + `1` spatial route (`/room`).
    - **Arithmetic**: `11 routes × 8 viewports = 88` viewport-route checks (`88/88 PASS` for `scrollWidth <= innerWidth`), with `document.querySelectorAll('footer[aria-label="Footer"]').length === 1` verified on all `10/10` standard-layout routes (`80/80` standard-route viewport renders) and `0` on `/room` (`8/8` spatial HUD renders).
