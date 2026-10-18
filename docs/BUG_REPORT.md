# Defect & Audit Resolution Report — Verlyse Media

**Template Source:** `templates/BUG_REPORT_TEMPLATE.md` (`skills/debugging-root-cause/SKILL.md`)  
**Date:** `2026-10-16`

---

## Defect 1 — `ArtGallery.tsx` Orphaned `+256px` Right-Gutter Padding & `transition-all` Transform Conflict
- **Summary:** After removing the floating right-margin `Up Next` card on article pages in PR #7, `ArtGallery.tsx` still reserved `+256px` of right padding on `lg+` viewports (`lg:pr-[calc(clamp(1.75rem,5.5vw,4.75rem)+256px)]`), shifting the 5-plate exhibition gallery of *"The Quiet Grief"* off-center (`76px` left padding vs `332px` right padding at `1440px`) and delaying the 3-column grid until `1400px`. Additionally, plate trigger buttons combined `spotlitGlide('restrained')` with `transition-all duration-700`, violating `STRING_TUNE_PLAYBOOK.md` §6.
- **Environment / version:** Desktop `1024px–1920px`, Chromium `153.0.8010.0`.
- **Route / feature:** `/article/the-quiet-grief` (and any multi-plate `ArtGallery` surface).
- **Steps to reproduce:** Open `/article/the-quiet-grief` at `1440×900` and inspect the computed padding and grid template columns of `section[aria-label="Exhibition plates"] > div`.
- **Expected:** Symmetrical `76px` left/right padding at `1440px`, 3-column grid from `lg` (`1024px+`), and CSS transitions scoped to `border-color, box-shadow`.
- **Actual (before fix):** `paddingLeft: 76px`, `paddingRight: 332px`, 2 columns at `1024px–1399px`, `transition-all` competing with `--string-glide`.
- **Evidence (logs, screenshots, traces, failing tests):** Verified via Chromium DOM measurement and `scripts/interaction-jsdom.tsx`.
- **Suspected / confirmed root cause:** `ArtGallery.tsx` lines 97 and 126 retained legacy right-rail margin compensation after `ReadingRoom.tsx` marginalia were removed.
- **Fix / verification:** Standardized section padding to `px-[clamp(1.75rem,5.5vw,4.75rem)] py-12`, grid to `lg:grid-cols-3`, and button transition to `transition-[border-color,box-shadow] duration-700`. Verified in Chromium (`paddingLeft: 76px, paddingRight: 76px, colsCount: 3`) and `npm run test:flows`.

---

## Defect 2 — `Home.tsx` (`SpatialReading`) Focusable Buttons Inside `aria-hidden="true"` Container
- **Summary:** In `SpatialReading` (`src/pages/Home.tsx`), the `<div className="flex items-center gap-4" aria-hidden="true">` wrapper enclosed the interactive `Previous plate` and `Next plate` `<button>` controls, violating WCAG 4.1.2 (`aria-hidden-focus`).
- **Environment / version:** All viewports, keyboard + screen-reader navigation.
- **Route / feature:** `/` (`Home.tsx`, `"Read a plate. Shift the atmosphere."` section).
- **Steps to reproduce:** Inspect `button[aria-label="Previous plate"].closest('[aria-hidden="true"]')` on `/`.
- **Expected:** Focusable `<button>` elements must never have an `aria-hidden="true"` ancestor; decorative index numerals and progress bars should carry `aria-hidden="true"` individually.
- **Actual (before fix):** Parent `<div aria-hidden="true">` hid both focusable buttons from the accessibility tree while leaving them in the Tab order.
- **Evidence:** Chromium DOM query `prevBtn.closest('[aria-hidden="true"]') !== null`.
- **Confirmed root cause:** `aria-hidden="true"` was placed on the flex wrapper instead of on the two decorative `<span>` siblings.
- **Fix / verification:** Removed `aria-hidden="true"` from the parent wrapper, added `role="group" aria-label="Turn the selected plate"` on the button pair, moved `aria-hidden="true"` to the decorative `<span>` elements, and added `focus-visible:outline` styles. Verified in Chromium (`prevHiddenAncestor: false, nextHiddenAncestor: false`).

---

## Defect 3 — `SavedDrawer.tsx` Single-Item Removal Not Syncing Header Badge or `SaveButton`
- **Summary:** Clicking `Remove` on a single saved folio inside `SavedDrawer.tsx` updated `localStorage` and local drawer state, but unlike `clearAll()` and `SaveButton.tsx`, did not dispatch `window.dispatchEvent(new CustomEvent('verlyse:saved-updated'))`.
- **Environment / version:** All browsers/viewports.
- **Route / feature:** Global `SavedDrawer` (`The reading list`) + `Header` count badge + `SaveButton`.
- **Steps to reproduce:** Save two folios, open `SavedDrawer`, click `Remove` on one item, and observe `SaveButton` `aria-pressed` or `Header` saved count.
- **Expected:** Removing a single saved item immediately updates `Header` `useSavedCount()` and flips any mounted `SaveButton` `aria-pressed` from `"true"` to `"false"`.
- **Actual (before fix):** Header badge and `SaveButton` stayed stale until page reload or next save action.
- **Confirmed root cause:** `remove(id)` in `src/components/layout/SavedDrawer.tsx` omitted `window.dispatchEvent(new CustomEvent('verlyse:saved-updated'))`.
- **Fix / verification:** Added event dispatch in `remove(id)` and added a JSDOM regression assertion in `scripts/interaction-jsdom.tsx` (`14/14` passed).

---

## Defect 4 — `ArticleClosing.tsx` Missing `useReducedMotion()` Guards (`D3`) & Missing Root `<MotionConfig>`
- **Summary:** `src/components/ui/ArticleClosing.tsx` (rendered on all 20 `/article/:id` pages) contained 34 `motion.*` entrance and SVG path-draw animations without checking `useReducedMotion()`, leaving content initially hidden (`opacity: 0`, `pathLength: 0`, `scaleX: 0`) under `prefers-reduced-motion: reduce`.
- **Environment / version:** All viewports with `prefers-reduced-motion: reduce`.
- **Route / feature:** All 20 `/article/:id` routes and `/creator/:authorId` (`Signature`).
- **Expected:** Under `prefers-reduced-motion: reduce`, all closing blocks, rules, ornaments, and signatures render immediately in their final readable state (`initial={false}`, `duration: 0`).
- **Actual (before fix):** Recorded as open defect **D3** in `audit/CODEBASE-AND-SITE-ASSESSMENT.md` and `docs/MOTION.md` §4 (`28 of 32 animated components guard explicitly`).
- **Confirmed root cause:** `ArticleClosing.tsx` did not import or check `useReducedMotion()`, and `src/App.tsx` did not wrap the tree in `<MotionConfig reducedMotion="user">`.
- **Fix / verification:** Wrapped `<App />` in `<MotionConfig reducedMotion="user">` (`src/App.tsx`) and added explicit `useReducedMotion()` guards to all 13 components in `src/components/ui/ArticleClosing.tsx` (`32 of 32` animated components now guarded).

---

## Defect 5 — `Header.tsx` Pulling `gsap` (`114 kB`) into the Blocking Entry Chunk (`B2`) & Pre-Import 3D Gating (`B1`)
- **Summary:** (1) `Header.tsx` imported `Magnetic` from `../cinematic`, which re-exported `src/components/cinematic/primitives.tsx` (`import gsap from 'gsap'` + `ScrollTrigger`), forcing all 53 routes to download `gsap` inside the initial `index-*.js` entry bundle (`252.87 kB` raw / `89.38 kB` gzip). (2) `Home.tsx` mounted `<SpatialArchive>` before checking `useWebGLSupport()` and `useReducedMotion()`, downloading `three-*.js` (`770.49 kB`) on `/` even when WebGL was disabled or reduced motion was active.
- **Environment / version:** Production Vite build across all 53 routes.
- **Route / feature:** Global `Header` / initial bundle load (`B2`) and `Home.tsx` `Cover` (`B1`).
- **Expected:** `gsap` should only load on routes that mount `ScrollTrigger` camera primitives, and `SpatialArchive` should only lazy-import when `glSupported && !reduce`.
- **Confirmed root cause:** `Magnetic` lived inside `src/components/cinematic/primitives.tsx` alongside `gsap` and `ScrollTrigger`; `Home.tsx` checked `useWebGLSupport()` inside `SpatialArchive` rather than before mounting the lazy component.
- **Fix / verification:** Implemented `Magnetic` in `src/components/ui/Magnetic.tsx` using `motion/react` (`useMotionValue` + `useSpring`), re-exported it from `src/components/cinematic/primitives.tsx`, updated `Header.tsx` to import from `../ui/Magnetic`, added dedicated `gsap` and `anime` chunk rules in `vite.config.ts`, lazy-gated `animejs` (`dist/assets/anime-CcJk6tc-.js`, `32.40 kB` / `13.15 kB` gzip) inside `BrassRule.tsx` on `!reduce && near`, gated `<SpatialArchive>` on `glSupported && !reduce` in `src/pages/Home.tsx`, and gated `<StoryEnding3D>` (`dist/assets/StoryEnding3D-CDvXr6Hv.js`, `10.93 kB` / `3.21 kB` gzip) on `glSupported && !reduce && near && tabVisible` via `EndingSpatialStage` in `src/pages/ArticleDetail.tsx`. `gsap` (`dist/assets/gsap-a3sj5zmn.js`, `114.01 kB` / `45.16 kB` gzip) is completely evicted from `index-*.js` (`252.87 kB` / `89.38 kB` gzip before `gsap` eviction; `dist/assets/index-BdTMAPn7.js` at `172.89 kB` / `56.54 kB` gzip in the current build including `EditorialCraftSystem`).

---

## Defect 6 — `Ambassadors.tsx` Modal Scroll Lock (`D4`), `ArticleDetail.tsx` `EndingSpatialBoundary` (`E1`), and `api/newsletter.ts` + `Footer.tsx` Canonical Origin & Endpoint (`A4`)
- **Summary:** (1) Opening a team member's record dialog on `/ambassadors` did not lock body scroll (`useBodyScrollLock`); (2) `<StoryEnding3D>` on `/article/:id` lacked a local React Error Boundary around `<Suspense>`; (3) `Footer.tsx` posted to relative `/api/newsletter` on static canonical host `verlysemedia.kesug.com` and `api/newsletter.ts` included `localhost` in production default origins.
- **Fix / verification:** Added `useBodyScrollLock(!!selected)` in `src/pages/Ambassadors.tsx`, wrapped `<StoryEnding3D>` in `<EndingSpatialBoundary>` inside `EndingSpatialStage` in `src/pages/ArticleDetail.tsx`, added `resolveNewsletterEndpoint()` in `src/components/layout/Footer.tsx` (`https://verlyse-react.vercel.app/api/newsletter` on `verlysemedia.kesug.com`, `/api/newsletter` on Vercel/local dev), and separated `PRODUCTION_ALLOWED_ORIGINS` (`https://verlysemedia.kesug.com`, `https://verlyse-react.vercel.app`) from `DEV_ALLOWED_ORIGINS` in `api/newsletter.ts`. Verified via `npm run build`, `npm run test:newsletter` (`15/15`), and `npm run test:flows` (`14/14`). Live production verification is **BLOCKED / NOT VERIFIED** in the sandbox pending Vercel env var and InfinityFree deployment verification.
