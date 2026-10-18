# Release Checklist — Verlyse Media

**Template Source:** `templates/RELEASE_CHECKLIST.md` (`skills/deployment-readiness/SKILL.md`)  
**Date:** `2026-10-18`

## Scope and state
- [x] Diff reviewed; unrelated user changes preserved.
- [x] Version (`1.0.0`), artifact (`dist/`), target host/runtime (`verlysemedia.kesug.com` static + `verlyse-react.vercel.app` serverless), and release scope (`53` prerendered routes, `104` static media/font assets in `public/`) identified.
- [x] Production data/config/schema impacts reviewed (no breaking schema changes; all editorial records in `src/data/content.ts` preserved intact, with `LEDGER.publishedFeatures = 19` and `LEDGER.provisionalFeatures = 1` derived from `publicationStatus`).

## Verification
- [x] Actual project typecheck/lint/tests run; results recorded:
  - `npm run build` (`tsc -b && vite build && node scripts/prerender-metadata.mjs && node scripts/generate-sitemap.mjs`) — `PASS`
  - `npm run typecheck:api` — `PASS`
  - `npm run check:secrets` — `PASS`
  - `npm run test:metadata` — `PASS` (`53` shells, `53` sitemap URLs)
  - `npm run test:smoke` — `PASS` (`20/20` SSR route cases: `18` valid routes across all `11` `<Route>` patterns + `2` missing-slug 404 fallbacks)
  - `npm run test:newsletter` — `PASS` (`15/15` synthetic checks)
  - `npm run test:flows` — `PASS` (`14/14` JSDOM flows)
- [x] Production build/artifact inspected (`npm run build` on `arena/741ed410-verlyse`, branched from `ea6392572d2481ef3f197799ac0ac2917e9e135a`):
  - `dist/index.html`: `3.98 kB` (`1.55 kB` gzip)
  - `dist/assets/index-Bj8BQarF.css`: `142.98 kB` (`25.00 kB` gzip)
  - `dist/assets/index-B4mHalN7.js`: `177.64 kB` (`57.97 kB` gzip — `gsap` evicted; includes shared `EditorialCraftSystem`; was `252.87 kB` / `89.38 kB` gzip prior to `gsap` eviction and `154.45 kB` / `51.49 kB` gzip before `EditorialCraftSystem`)
  - `dist/assets/boot-CfrjN6Gu.js`: `199.82 kB` (`51.65 kB` gzip — 4 active modules in `boot.ts`)
  - `dist/assets/gsap-a3sj5zmn.js`: `114.01 kB` (`45.16 kB` gzip — isolated lazy chunk)
  - `dist/assets/anime-CcJk6tc-.js`: `32.40 kB` (`13.15 kB` gzip — dynamically imported inside `BrassRule-C2IYON7Q.js` only when `!reduce && near`)
  - `dist/assets/StoryEnding3D-C6ccyV-p.js`: `10.93 kB` (`3.20 kB` gzip — dynamically imported inside `EndingSpatialStage` only when `glSupported && !reduce && near && tabVisible`)
  - `dist/assets/motion-Bx_UBRF8.js`: `137.25 kB` (`45.39 kB` gzip)
  - `dist/assets/react-bCe7H_Od.js`: `279.15 kB` (`90.10 kB` gzip)
  - `dist/assets/three-DF4bklDy.js`: `770.49 kB` (`203.48 kB` gzip — lazy and pre-gated on `/` and `/article/:id`)
- [x] Critical routes/forms/API flows smoke-tested in headless Chromium (`153.0.8010.0`):
  - `node scripts/asset-audit.mjs` — `PASS` (`45/45` sampled role-subset assets and `104/104` total static media/font assets resolved, `0` missing)
  - `node scripts/interaction-audit.mjs` — `PASS` (`17/17` interaction & computed-layout checks, `0` console errors)
  - `node scripts/verify-flags.mjs` — `PASS`
- [x] Accessibility, responsive behavior, security and secret checks run (`88/88` across 8 viewports × 11 routes, `0` horizontal overflow, `10/10` standard routes render `footer[aria-label="Footer"] === 1`, `0` on `/room`).
- [x] Environment variables and headers/redirects match target host (`public/.htaccess` and `vercel.json` synchronized; `Footer.tsx` `resolveNewsletterEndpoint()` targets `https://verlyse-react.vercel.app/api/newsletter` on `verlysemedia.kesug.com`; `api/newsletter.ts` `PRODUCTION_ALLOWED_ORIGINS` includes `https://verlysemedia.kesug.com` and `https://verlyse-react.vercel.app`).

## Recovery
- [x] Backup/rollback path exists and is usable (`git revert` or per-file checkout on branch `arena/741ed410-verlyse`).
- [x] Migration is backward-compatible (all route patterns, data exports, and component props preserved).
- [x] Monitoring/rollback trigger and owner identified (CI/Vercel build & `npm test` browser suite).

## Release record & Live Deployment Blockers (**BLOCKED / NOT VERIFIED** in Sandbox)
- **Artifact/commit:** Working tree on `arena/741ed410-verlyse` (branched from `ea6392572d2481ef3f197799ac0ac2917e9e135a`)
- **Deployment target:** Local workspace build & live preview (`0.0.0.0:5173`); no external deployment performed
- **Date/time:** `2026-10-18`
- **Checks/statuses:** All local build, Node, JSDOM (`14/14`), newsletter synthetic (`15/15`), and headless Chromium (`45/45` role subset, `104/104` full inventory, `17/17` interactions, `88/88` responsive matrix) suites `PASS`
- **Live Deployment Verification Status (`A1`, `A2`, `A4`):** **BLOCKED / NOT VERIFIED IN SANDBOX**
  1. **Vercel Production Serverless API (`verlyse-react.vercel.app/api/newsletter`)**: Requires project admin to deploy `api/newsletter.ts` to Vercel and verify that `BUTTONDOWN_API_KEY` and `ALLOWED_ORIGINS=https://verlysemedia.kesug.com,https://verlyse-react.vercel.app` are set in the Vercel dashboard.
  2. **InfinityFree Static Host (`verlysemedia.kesug.com`)**: Requires project admin to deploy `dist/` (including `dist/.htaccess`) and verify live HTTP→HTTPS `301` redirect, `Content-Security-Policy` (`connect-src 'self' https://verlyse-react.vercel.app`), and end-to-end cross-origin `POST https://verlyse-react.vercel.app/api/newsletter` from `https://verlysemedia.kesug.com`.
