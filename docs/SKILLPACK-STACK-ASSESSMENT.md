# Verlyse Media — Arena AI Skill Pack Assessment & Required Records

**Snapshot / Execution Date:** `2026-10-16`  
**Repository:** `Ah31n/Verlyse`  
**Branch:** `arena/741ed410-verlyse`  
**Governing Policy:** `ARENA_RULES.md`, `SKILL_INDEX.md`, `docs/STACK_DECISION_MATRIX.md`, `docs/TOOL_SELECTION_ENGINE.md`, `docs/TOOL_EVALUATION_WORKFLOW.md`, `docs/TOOL_CATALOG.md`, `docs/UI_RESOURCE_PLAYBOOK.md`, `docs/UI_ART_DIRECTION_PLAYBOOK.md`, `docs/MOTION_PLAYBOOK.md`, `docs/STRING_TUNE_PLAYBOOK.md`

This document consolidates the complete UI and Motion Stack Assessment for Verlyse Media alongside all six required Markdown deliverables from `templates/` (`PROJECT_BRIEF_TEMPLATE.md`, `TOOL_DECISION_RECORD.md`, `IMPLEMENTATION_PLAN_TEMPLATE.md`, `BUG_REPORT_TEMPLATE.md`, `RELEASE_CHECKLIST.md`, and `COMPLETION_REPORT_TEMPLATE.md`).

---

## 1 · Project Brief (`templates/PROJECT_BRIEF_TEMPLATE.md`)

### Product and audience
- **Product:** Verlyse Media (`@verlyse.media` — *"Where Vision Becomes A Voice."*)
- **Primary user/context:** Readers, poets, essayists, visual artists, and student contributors exploring Issue № 01 (`20` published/provisional folios across `7` departments by `15` human contributors plus the masthead record) on desktop and mobile web browsers.
- **Problem or job:** Present every contributor's writing and artwork as an authored editorial gallery and magazine issue with full credit, verbatim source integrity, accessible interactions, restrained motion, and dual-host deployment parity (`verlysemedia.kesug.com` static Apache/InfinityFree canonical + `verlyse-react.vercel.app` Vercel mirror/serverless origin).
- **Desired outcome:** Complete assessment and alignment of the repository's UI stack, motion/3D stack, StringTune integration, accessibility/reduced-motion compliance, bundle architecture, and documentation records against the Arena AI Development Skill Pack.

### Core journey
1. **Entrance & Editorial Discovery (`/`, `/articles`, `/categories/:slug`):** Reader enters the magazine cover, browses the 20 folios or steps through the 7 department wings, and uses global search (`⌘K` / `Ctrl+K`) or the local reading list (`SavedDrawer`).
2. **Feature Reading & Exhibition Inspection (`/article/:id`, `/creator/:authorId`, `/room`):** Reader reads full-text poetry, essays, stories, and social-issue dispatches, inspects multi-plate artwork in the keyboard-accessible lightbox (`ArtGallery`), or walks the spatial archive (`/room`).
3. **Participation & Desk Correspondence (`/submit`, `/ambassadors`, `/contact`, Newsletter):** Reader subscribes to *The Verlyse Letter*, applies to official open recruitment roles (**Researcher**, **Palette Designer**, **Content Writer**) via the canonical Google Form, or submits original work to the editorial desk.

### Scope
- **Must-have:**
  - Full assessment of all installed UI and motion packages and all cataloged external resources (`TOOL_CATALOG.md`).
  - Single-owner animation governance across CSS, StringTune (`@fiddle-digital/string-tune@1.2.5`), Motion (`motion@13.2.0`), GSAP (`gsap@3.15.0`), Anime.js (`animejs@4.5.0`), and React Three Fiber (`three@0.185.1` + `@react-three/fiber@8.18.0`).
  - Complete `prefers-reduced-motion: reduce` coverage across all 32 animated components (closing **D3** in `ArticleClosing.tsx` and wrapping the app in `<MotionConfig reducedMotion="user">`).
  - Eviction of `gsap` from the blocking main entry chunk (`B2`) by migrating `Magnetic` to `motion/react` and isolating `gsap` and `animejs` in `vite.config.ts`.
  - Synchronization of all repository `.md` documentation with measured build and browser-audit reality.
- **Non-goals:**
  - Replacing the Vite + React 18 + Tailwind CSS 3.4 architecture or migrating to Next.js / Tailwind v4 without need (`STACK_DECISION_MATRIX.md`).
  - Fabricating editorial content, metrics, comments, or MCP outputs (`ARENA_RULES.md`).
  - Adding the external skill-pack source files themselves into the repository.
- **Constraints (platform, stack, hosting, budget, privacy, timeline):**
  - Canonical host (`verlysemedia.kesug.com`) is static Apache/LiteSpeed; serverless `/api/newsletter` runs on Vercel (`verlyse-react.vercel.app`).
  - Penpot MCP and OriginKit MCP return `status: unsupported` in this sandbox; Figma MCP is prohibited by project directive.
- **Existing assets/approved copy:**
  - `104` self-hosted static media and font assets in `public/` (`100` image/SVG files + `4` `.woff2` font files), `20` catalogued features (`LEDGER.features = 20`: `LEDGER.publishedFeatures = 19` published folios + `LEDGER.provisionalFeatures = 1` provisional record), `16` contributor wall records (`15` bylined creators + co-credited Mochi), `7` categories, `14` regional ambassadors across `6` chapters (`10` active `BRAND.team` records; `Haiqa Nafees` and `Manha` excluded from `/ambassadors` and `BRAND.team` only), and verbatim source caption + 5 original plates for *"The Quiet Grief"* (`DeUZFPTCjPU`, `publicationStatus: 'provisional'`).

### Acceptance criteria
- [x] Every installed UI/motion package and every cataloged external UI/design resource is evaluated with explicit status (`USE`, `OPTIONAL`, `RESEARCH FURTHER`, `DO NOT USE`).
- [x] No two animation engines write to the same DOM property or scroll container.
- [x] `index-*.js` initial entry bundle no longer ships `gsap` (`252.87 kB / 89.38 kB gzip` before `gsap` eviction; `dist/assets/index-BdTMAPn7.js` at `172.89 kB / 56.54 kB gzip` in the current build with `EditorialCraftSystem` included).
- [x] `dist/assets/boot-CfrjN6Gu.js` StringTune bundle registers only the 4 active modules in `src/lib/stringTune/boot.ts` (`199.82 kB / 51.65 kB gzip`), pairs `progress|parallax[]` in `drift()`, and stops/restarts safely on `prefers-reduced-motion: reduce` changes.
- [x] All 32 animated components respect `prefers-reduced-motion: reduce` (`<MotionConfig reducedMotion="user">` + `ArticleClosing.tsx` explicit guards).
- [x] All build, metadata (`53` shells), SSR smoke (`20/20` route cases), newsletter (`15/15` synthetic checks), JSDOM (`14/14` flows), and headless Chromium (`asset-audit` `45/45` role subset + `104/104` full inventory, `interaction-audit` `17/17`, `verify-flags`) checks pass with `0` errors.

### Open questions / reversible assumptions
- **Question (material only):** Whether InfinityFree proxies `POST /api/newsletter` to the Vercel serverless origin in live production (`docs/ARCHITECTURE.md` §4).
- **Assumption:** Until verified from an external network against `https://verlysemedia.kesug.com/api/newsletter`, `api/newsletter.ts` includes `https://verlysemedia.kesug.com` in `DEFAULT_ALLOWED_ORIGINS` and `Footer.tsx` preserves its honest `mailto:` fallback whenever the serverless endpoint is unreachable.

---

## 2 · Complete UI & Motion Stack Assessment (`skills/ui-stack`, `skills/motion-stack`, `docs/STACK_DECISION_MATRIX.md`)

### 2.1 Installed Production UI & Motion Stack (`package.json`)

| Layer | Installed Package & Version | License | Bundle Chunk & Size (raw / gzip) | Assigned Responsibility (Single-Owner Rule) | Skill Pack Verdict |
|---|---|---|---|---|---|
| **UI Runtime & SSR Prerender** | `react@18.3.1`, `react-dom@18.3.1` | MIT | `react-*.js` (`279.15 kB` / `90.10 kB`) | Component tree, hooks, Error Boundaries (`RouteErrorBoundary`, `SpatialBoundary`, `EndingSpatialBoundary`), build-time `renderToString` smoke/prerender | **USE (KEEP)** — Matches R3F v8 peer range (`react@^18`). Do not upgrade to React 19 while `@react-three/fiber@8.18.0` is pinned. |
| **Routing & Canonical Registry** | `react-router-dom@7.18.2` | MIT | `react-*.js` (shared vendor chunk) | 53-route client/SSR routing driven by `src/data/routes.ts` (`ROUTE_PATTERNS`, `buildRouteRegistry()`) | **USE (KEEP)** — Explicitly matched before `node_modules/react` in `vite.config.ts`. |
| **Styling & Design Tokens** | `tailwindcss@3.4.15`, `postcss@8.4.49`, `autoprefixer@10.4.20` | MIT | `dist/assets/index-ciNLODvz.css` (`142.46 kB` / `24.88 kB`) | Editorial color tokens (`wine`, `ivory`, `gold`, `charcoal`), typography (`Cormorant Garamond`, `Inter`, `IBM Plex Mono`), motion duration/easing tokens, `@property` CSS custom property contracts | **USE (KEEP)** — Per `skills/ui-stack`, do not migrate an established Tailwind v3 project to Tailwind v4 without a concrete requirement. |
| **Primary React Motion Engine** | `motion@13.2.0` (`motion/react`) | MIT | `dist/assets/motion-Bx_UBRF8.js` (`137.25 kB` / `45.39 kB`) | `<MotionConfig reducedMotion="user">`, route `AnimatePresence` (`PageTransition`), modal/drawer presence (`SearchOverlay`, `SavedDrawer`, `ArtGallery`, `Ambassadors`), `Reveal`, `SplitText`, `ArticleClosing`, `useScroll` read-only transforms, and `Magnetic` (`useMotionValue` + `useSpring`) | **USE (KEEP)** — Primary declarative React animation engine. Single copy resolved (no duplicate `framer-motion@11`). |
| **Attribute-Driven Scroll & Pointer Engine** | `@fiddle-digital/string-tune@^1.2.5` (`1.2.5`) | MIT | `dist/assets/boot-CfrjN6Gu.js` (`199.82 kB` / `51.65 kB`, lazy on `requestIdleCallback`) | `StringProgress` (`--progress` reading hairline on `/article/:id`), `StringGlide` (`spotlitGlide` on `/`, `/articles`, `ArtGallery`, `WriterProfile`), `StringParallax` (`drift` on `/` cover plate), `StringSpotlight` (`--spotlight-angle`/`--spotlight-distance` on `/`, `/articles`, `/creators`, `/categories`, `/community`, `/about`, `WriterProfile`, `ArtGallery`, `Footer`) | **USE (4-MODULE `boot.ts` ALLOWLIST)** — Native scroll preserved (`scrollDesktopMode = 'default'`, `scrollMobileMode = 'default'`). `drift()` pairs `progress|parallax[]`. Generation-checked reduced-motion and unmount race protection in `runtime.ts` + `StringTuneProvider.tsx`. |
| **Spatial 3D Engine** | `three@0.185.1`, `@react-three/fiber@8.18.0` | MIT | `dist/assets/three-DF4bklDy.js` (`770.49 kB` / `203.48 kB`, lazy on `/` and `/article/:id`) | WebGL scene graph inside `<Canvas>` (`SpatialArchive` on `/`, `StoryEnding3D` via `EndingSpatialStage` on `/article/:id`). Never writes DOM styles. Gated by `useWebGLSupport()`, `useReducedMotion()`, near-viewport, tab visibility, and wrapped in `SpatialBoundary` / `EndingSpatialBoundary`. | **USE (KEEP, ISOLATED)** — Subordinate Tier-4 atmosphere; semantic HTML and CSS gradients always carry the primary editorial meaning. |
| **Cinematic Scroll-Scrub Camera Layer** | `gsap@3.15.0` (`gsap/ScrollTrigger`) | Standard "no charge" license (non-OSI) | `dist/assets/gsap-a3sj5zmn.js` (`114.01 kB` / `45.16 kB`, lazy chunk) | Scrub-only camera wrappers (`CrashZoom`, `DepthStage`, `DepthLayer`, `OrbitalDrift`, `PushIn`, `MaskReveal`, `Tilt3D`, `Rise3D`) in `src/components/cinematic/primitives.tsx` on secondary pages. Never pins or hijacks scroll; `gsap.context().revert()` on unmount; skipped under reduced motion. | **USE WITH BOUNDARY (ISOLATED)** — Evicted from `Header.tsx` and the main `index-*.js` entry chunk; isolated in `gsap-a3sj5zmn.js` so 46 of 53 routes never download it. No new GSAP surfaces permitted without explicit review of GreenSock license terms. |
| **SVG Path-Length Draw** | `animejs@4.5.0` (`animejs`) | MIT | `dist/assets/anime-CcJk6tc-.js` (`32.40 kB` / `13.15 kB`, lazy chunk) | `strokeDashoffset` on `src/components/ui/BrassRule.tsx` dynamically imported only when `!reduce && near`. | **USE WITH BOUNDARY (ISOLATED)** — Dynamically imported inside `BrassRule-BG91pKcx.js` only when `!reduce && near`. |

### 2.2 Evaluation of External Cataloged UI, Design & Motion Stacks (`docs/TOOL_CATALOG.md` & `docs/TOOL_EVALUATION_WORKFLOW.md`)

| Resource / Tool | Classification & Catalog Status | Compatibility & License Findings | Decision for Verlyse Media | How Applied / Why Rejected |
|---|---|---|---|---|
| **Footer Design (`footer.design`)** | Inspiration / reference gallery (`PARTIALLY VERIFIED`) | Curated gallery (`Editorial`, `Magazine`, `Grid`, `Large Type`, `Interactive`). Not an npm package or licensed code template. | **OPTIONAL (USED AS REFERENCE)** | Reinterpreted principles in `src/components/layout/Footer.tsx`: balanced 4-column colophon (`The archive`, `The magazine`, `The desk` + Issue № 01/02 ledger note), full-width horizontal newsletter dispatch band, external-only `target="_blank"`, reduced-motion scroll-to-top, and monumental back-cover wordmark. |
| **Type Garden (`type-garden.vercel.app`)** | Hosted interactive typography/art tool (`PARTIALLY VERIFIED`) | Interactive canvas/SVG tool by Akshat Agarwal; no verified commercial/redistribution license on the hosted app. Exercised locally in headless Chromium (`153.0.8010.0`) to inspect its 2-pass over/under z-layered botanical SVG export (`367` paths around `Cormorant Garamond` `"Verlyse"`). | **OPTIONAL (RESEARCHED & TESTED IN CHROMIUM; NOT ADDED AS RUNTIME DEPENDENCY)** | Per `TOOL_EVALUATION_WORKFLOW.md` §6, treated as a creative reference and tested in Chromium without adding unverified third-party runtime code or replacing the canonical Verlyse back-cover wordmark. |
| **Logosystem (`logosystem.co`)** | Inspiration / reference library (`PARTIALLY VERIFIED`) | Terms explicitly state marks belong to their respective owners and are for reference only, not licensed for reuse. | **OPTIONAL (REFERENCE ONLY)** | Consulted for wordmark/symbol hierarchy; Verlyse retains its own house monogram and typography. |
| **RandomA11y (`randoma11y.com/primary`)** | Hosted contrast reference / separate MIT npm package (`PARTIALLY VERIFIED`) | Hosted page lists WCAG 2.1 ≥ 4.5 contrast pairs. Verlyse's palette (`#F8F6F2` ivory and `#D9B978` / `#B89146` gold on `#1C1C1C` charcoal / `#3B0D17` deep wine) is already audited at ≥ 5.71:1 AA contrast in Chromium. | **OPTIONAL (DESIGN-TIME REFERENCE ONLY)** | No runtime dependency needed; contrast verified directly against rendered DOM in headless Chromium. |
| **Dot Matrix (`dotmatrix.zzzzshawn.cloud`)** | Copy-source shadcn loader registry (`PARTIALLY VERIFIED`) | Requires shadcn `components.json` and `dotmatrix-loader.css`; uses a Custom Proprietary License restricting standalone redistribution. | **DO NOT USE** | Per `UI_ART_DIRECTION_PLAYBOOK.md` and `TOOL_EVALUATION_WORKFLOW.md` §4, decorative dot-matrix loaders do not fit a literary/art magazine and must not displace stable editorial layouts. |
| **Shapes Gallery (`shapes.gallery`)** | Downloadable SVG collection (`PARTIALLY VERIFIED` / `RESEARCH FURTHER`) | 72 standalone SVGs by Monika Michalczyk, but no explicit commercial/modification license text in the site or ZIP archive. | **DO NOT USE UNLICENSED ASSETS** | Verlyse already authors its own bespoke inline SVG motifs (`src/components/ui/Motifs.tsx`, `BrassRule.tsx`, `ArticleSignature.tsx`) with full first-party ownership. |
| **Haikei (`haikei.app`)** | Hosted parameterized SVG generator (`PARTIALLY VERIFIED`) | Browser generator for waves/blobs; no API/package integration. | **DO NOT USE** | Generic SaaS blobs/waves conflict with Verlyse's museum-grade architectural hairline and classical plate aesthetic. |
| **Penpot (`penpot.app` / Penpot MCP)** | Open-source design & prototyping platform (`PARTIALLY VERIFIED`, MPL-2.0) | `list_connector_tools("penpot")` returned `status: unsupported` in this Arena sandbox. | **BLOCKED IN SANDBOX (REPORTED HONESTLY)** | Per `ARENA_RULES.md`, no Penpot MCP calls or live board comparisons were fabricated; existing repository Penpot specs (`docs/IMMERSIVE-*.md`) were honored. |
| **OriginKit (`originkit.dev` / OriginKit MCP)** | Hosted animated UI catalog & MCP (`PARTIALLY VERIFIED` / `RESEARCH FURTHER`) | `list_connector_tools("originkit")` returned `status: unsupported`; hosted component license unverified and free tier capped. | **DO NOT USE / UNSUPPORTED IN SANDBOX** | Reported honestly per `ARENA_RULES.md`; patterns implemented natively with `motion/react` and `@fiddle-digital/string-tune`. |
| **Watermelon UI (`ui.watermelon.sh`)** | React 19 + Tailwind v4 shadcn source registry (`PARTIALLY VERIFIED`, MIT) | Requires React 19, Tailwind CSS v4, and `components.json`; Verlyse runs React 18.3.1 + Tailwind v3.4.15 + Vite. | **DO NOT USE** | Incompatible React/Tailwind major prerequisites (`docs/ANIMATION-DECISIONS.md`). |
| **KokonutUI (`kokonutui.com`)** | React/Next.js + Tailwind v4 shadcn source registry (`PARTIALLY VERIFIED`, MIT) | Requires Tailwind CSS v4 and `components.json`. | **DO NOT USE** | Incompatible Tailwind v4 prerequisite; Verlyse owns its 25+ bespoke editorial components natively. |
| **Bklit UI (`bklit.com`)** | React chart & data-vis shadcn registry (`PARTIALLY VERIFIED`, MIT) | Brings Visx/D3 chart dependencies for SaaS dashboards. | **DO NOT USE** | Verlyse is a literary and visual arts publication (`UI_ART_DIRECTION_PLAYBOOK.md` explicitly forbids turning editorial archives into SaaS KPI dashboards). |
| **Radix UI / shadcn/ui (`radix-ui.com`, `ui.shadcn.com`)** | Accessible headless primitives / source registry (`VERIFIED`, MIT) | Verlyse already implements and tests accessible dialogs (`role="dialog"`, `aria-modal="true"`, `trapFocus`, `useBodyScrollLock`, Escape dismissal, focus restoration) across all 5 modal surfaces in `14/14` JSDOM and `17/17` Chromium checks. | **OPTIONAL (NATIVE EQUIVALENT VERIFIED)** | Per `STACK_DECISION_MATRIX.md`, do not add a primitive kit when native semantic controls and tested focus management already pass all accessibility checks. |
| **React Spring (`@react-spring/web`) & Lenis (`lenis`)** | Spring animation / smooth-scroll libraries (`VERIFIED`, MIT) | `motion@13.2.0` (`useSpring`) and `@fiddle-digital/string-tune@1.2.5` already cover springs and scroll-linked DOM motion; native scrolling is a hard project rule (`docs/MOTION.md` §2). | **DO NOT USE** | Adding React Spring or Lenis would create competing animation/scroll owners (`MOTION_PLAYBOOK.md`). |

---

## 3 · Tool Decision Records (`templates/TOOL_DECISION_RECORD.md`)

### Record 1 — `@fiddle-digital/string-tune@1.2.5` (Trimmed & Hardened)
- **Tool/resource and version checked:** `@fiddle-digital/string-tune@1.2.5` (installed in `node_modules/@fiddle-digital/string-tune`, types verified against `dist/index.d.ts`).
- **Date and official source URLs:** Checked `2026-10-16` — `https://tune.fiddle.digital/docs/api/string-tune`, `https://tune.fiddle.digital/docs/modules/overview`, `docs/STRING_TUNE_PLAYBOOK.md`.
- **Catalog status:** `PARTIALLY VERIFIED` (in `TOOL_CATALOG.md`; verified directly against installed `1.2.5` package types in this repo).
- **Task/problem being solved:** Declarative scroll-progress mapping (`--progress`), scroll-velocity plate lag (`StringGlide`), subtle desktop cover drift (`StringParallax`), and fine-pointer cursor light (`StringSpotlight`) without hijacking native browser scroll or competing with `motion/react` transforms.
- **Intended use category:** `installed dependency`
- **Existing project capabilities/alternatives:** `motion/react` `useScroll` handles component-scoped transforms; StringTune handles CSS-custom-property publication (`--progress`, `--spotlight-angle`, `--spotlight-distance`) and inner-plate glide across archive shelves.
- **Evidence reviewed:** Installed `node_modules/@fiddle-digital/string-tune/dist/index.d.ts`, `src/lib/stringTune/{boot,runtime,StringTuneProvider,attrs,tokens}.ts(x)`, and Vite production bundle output.
- **Compatibility checks:** React `18.3.1`, Vite `7.3.6`, Tailwind `3.4.15`, SSR smoke test (`npm run test:smoke` — client-only idle boot does not run in Node SSR), fine-pointer gating (`(hover: hover) and (pointer: fine)` and `innerWidth >= 1024`), and live `prefers-reduced-motion: reduce` listener teardown.
- **License, attribution, privacy, pricing/cost, and account limits:** MIT license; free; dev-tracker modules (`StringFPSTracker`, `StringPositionTracker`) that beacon to `access.fiddle.digital` are excluded so zero external network requests occur.
- **Decision:** `USE` (4 verified modules only: `StringProgress`, `StringGlide`, `StringParallax`, `StringSpotlight`).
- **Reason / rejected options:** Trimmed the module allowlist in `src/lib/stringTune/boot.ts` to the 4 active modules (`dist/assets/boot-CfrjN6Gu.js`: `199.82 kB` / `51.65 kB` gzip) and updated `drift()` in `attrs.ts` to `string: 'progress|parallax[]'` so `StringParallax` receives `progress-value` in native scroll mode. Rejected `StringTilt` (competes with `StringGlide` on `transform`), `StringLazy` (breaks prerendered SEO `src`), and smooth scroll (`scrollDesktopMode = 'default'`).
- **Integration scope and risks:** Mounted once in `src/App.tsx` via `<StringTuneProvider />`. Single-owner rule enforced: `ArtGallery.tsx` plate buttons use `transition-[border-color,box-shadow]` rather than `transition-all` so CSS never fights `StringGlide` transforms.
- **Validation performed and results:** `PASS` — `npm run build`, `npm run test:smoke` (20/20), `npm run test:flows` (14/14), Chromium `interaction-audit.mjs` (17/17).
- **Known limitations / unknowns:** Pointer modules (`StringParallax`, `StringSpotlight`) are intentionally inert on coarse/touch viewports (`< 1024px`).
- **Revisit criteria / next review trigger:** Revisit only if upgrading `@fiddle-digital/string-tune` past `1.2.5` or adding a new documented attribute module.

### Record 2 — `motion@13.2.0` (`motion/react`) + `Magnetic.tsx` Consolidation
- **Tool/resource and version checked:** `motion@13.2.0` (`motion/react`) and `gsap@3.15.0`.
- **Date and official source URLs:** Checked `2026-10-16` — `https://motion.dev/docs/react`, `https://motion.dev/docs/react-motion-config`, `docs/MOTION_PLAYBOOK.md`.
- **Catalog status:** `VERIFIED`
- **Task/problem being solved:** (1) Enforce global and component-level `prefers-reduced-motion: reduce` compliance across all 32 animated components (`D3`), and (2) evict `gsap` (`114.01 kB` raw / `45.16 kB` gzip) from the blocking initial entry chunk (`B2`) caused by `Header.tsx` importing `Magnetic` from `src/components/cinematic`.
- **Intended use category:** `installed dependency`
- **Existing project capabilities/alternatives:** `motion@13.2.0` is already loaded in the initial shell for `App`, `Header`, `SearchOverlay`, and `SavedDrawer`.
- **Evidence reviewed:** `vite build` chunk graph before and after migrating `Magnetic` to `src/components/ui/Magnetic.tsx` (`useMotionValue` + `useSpring`) and adding `manualChunks` isolation for `gsap` and `animejs` in `vite.config.ts`.
- **Compatibility checks:** React `18.3.1`, TypeScript `5.6.3` (`tsc -b` 0 errors), SSR `renderToString` (`20/20` routes), JSDOM (`14/14`), headless Chromium (`17/17`).
- **License, attribution, privacy, pricing/cost, and account limits:** `motion@13.2.0` is MIT. `gsap@3.15.0` uses GreenSock's Standard "no charge" license and remains isolated to lazy route chunks.
- **Decision:** `USE` `motion/react` for `Magnetic` (`src/components/ui/Magnetic.tsx`), `<MotionConfig reducedMotion="user">` in `src/App.tsx`, and explicit `useReducedMotion()` guards in `src/components/ui/ArticleClosing.tsx`; isolate `gsap` and `animejs` into dedicated Rollup chunks.
- **Reason / rejected options:** Keeping `Magnetic` on `gsap.quickTo` forced every visitor on `/articles`, `/article/:id` (20 routes), `/categories/:slug` (8 routes), `/creator/:id` (16 routes), and `/room` to download `gsap` + `ScrollTrigger` in `index-*.js`. Moving `Magnetic` to `motion/react` evicted `gsap` from `index-*.js` (`252.87 kB` / `89.38 kB` gzip before `gsap` eviction; `dist/assets/index-BdTMAPn7.js` at `172.89 kB` / `56.54 kB` gzip in the current build with `EditorialCraftSystem` included).
- **Integration scope and risks:** `src/components/cinematic/primitives.tsx` re-exports `Magnetic` from `../ui/Magnetic`, preserving backward compatibility for all existing import sites.
- **Validation performed and results:** `PASS` — `npm run build`, `npm run test:smoke`, `npm run test:flows`, Chromium `interaction-audit.mjs` & `verify-flags.mjs`.
- **Known limitations / unknowns:** Secondary routes (`/about`, `/ambassadors`, `/community`, `/creators`, `/submit`, `/contact`, `/`) still lazy-load `gsap-*.js` for their established `ScrollTrigger` camera wrappers.
- **Revisit criteria / next review trigger:** If the project owner decides to retire `gsap` and `animejs` completely from `/about` and secondary pages, replace the remaining `src/components/cinematic/primitives.tsx` wrappers with `motion/react` `useScroll` + `useTransform`.

---

## 4 · Implementation Plan (`templates/IMPLEMENTATION_PLAN_TEMPLATE.md`)

### Outcome and acceptance criteria
- **Outcome:** Apply the Arena AI Development Skill Pack across `Ah31n/Verlyse` to resolve open UI, layout, accessibility, state-synchronization, StringTune, motion/reduced-motion, bundle-splitting, security/CORS, and documentation gaps while preserving all editorial content and guardrails.
- [x] Fix `ArtGallery.tsx` orphaned `+256px` right-gutter reserve, restore `lg:grid-cols-3` desktop plate grid, and enforce single-owner transform transitions (`transition-[border-color,box-shadow]`).
- [x] Fix `SpatialReading` (`Home.tsx`) WCAG 4.1.2 `aria-hidden-focus` violation on `Previous plate` / `Next plate` buttons and add `focus-visible` outlines.
- [x] Dispatch `verlyse:saved-updated` on single-item removal in `SavedDrawer.tsx`.
- [x] Preserve canonical StringTune module allowlist in `src/lib/stringTune/boot.ts`, pair `progress|parallax[]` in `drift()`, add live `prefers-reduced-motion: reduce` listener teardown/restart in `StringTuneProvider.tsx`, and extend StringTune spotlight/glide to `/`, `/articles`, `/creators`, `/categories`, `/community`, `/about`, and `/creator/:authorId`.
- [x] Wrap `<App />` in `<MotionConfig reducedMotion="user">`, add `useReducedMotion()` guards throughout `src/components/ui/ArticleClosing.tsx` (`D3`), and wrap `StoryEnding3D` in `EndingSpatialBoundary` (`ArticleDetail.tsx`).
- [x] Migrate `Magnetic` to `src/components/ui/Magnetic.tsx` (`motion/react`) and isolate `gsap` and `animejs` in `vite.config.ts` `manualChunks` (`B2`).
- [x] Add `useBodyScrollLock(!!selected)` to `Ambassadors.tsx` (`D4`) and add `https://verlysemedia.kesug.com` to `DEFAULT_ALLOWED_ORIGINS` in `api/newsletter.ts` (`A4`).
- [x] Polish `Footer.tsx` colophon balance, external-only `target="_blank"`, and reduced-motion scroll-to-top.
- [x] Synchronize all repository `.md` files and create `docs/SKILLPACK-STACK-ASSESSMENT.md`.

### Current state / baseline
- **Relevant architecture and existing behavior:** Vite 7.3.6 + React 18.3.1 + TypeScript 5.6.3 + Tailwind CSS 3.4.15 SPA with 53 build-time prerendered HTML shells, serverless `/api/newsletter`, `motion@13.2.0`, `@fiddle-digital/string-tune@1.2.5`, `three@0.185.1` + `@react-three/fiber@8.18.0`, `gsap@3.15.0`, and `animejs@4.5.0`.
- **Baseline checks and known failures:** Open audit items in `audit/CODEBASE-AND-SITE-ASSESSMENT.md` and `docs/MOTION.md` (`A4`, `B2`, `D3`, `D4`, `E1`), `ArtGallery.tsx` `+256px` right-padding asymmetry after marginalia removal, `Home.tsx` `SpatialReading` `aria-hidden-focus`, `SavedDrawer.tsx` missing event dispatch on `remove(id)`, and outdated/contradictory claims in `docs/MOTION.md` and `docs/ARCHITECTURE.md`.

### Plan
1. `src/components/ui/ArtGallery.tsx` — Remove `lg:pr-[calc(clamp(1.75rem,5.5vw,4.75rem)+256px)]`, restore `lg:grid-cols-3`, replace `transition-all` with `transition-[border-color,box-shadow]` — `@fiddle-digital/string-tune`
2. `src/pages/Home.tsx` — Remove `aria-hidden="true"` from `SpatialReading` button wrapper, scope to decorative spans, add `role="group"` and `focus-visible:outline` — native HTML/a11y
3. `src/components/layout/SavedDrawer.tsx` — Dispatch `verlyse:saved-updated` in `remove(id)` — browser `CustomEvent`
4. `src/lib/stringTune/boot.ts`, `src/lib/stringTune/attrs.ts`, `src/lib/stringTune/StringTuneProvider.tsx`, `src/pages/{Home,Articles,Creators,Categories,Community,About}.tsx`, `src/components/ui/WriterProfile.tsx` — Preserve canonical `boot.ts` allowlist, pair `progress|parallax[]` in `drift()`, add live reduced-motion listener, wire `spotlight()` / `spotlitGlide('restrained')` — `@fiddle-digital/string-tune@1.2.5`
5. `src/App.tsx`, `src/components/ui/ArticleClosing.tsx`, `src/pages/ArticleDetail.tsx`, `src/pages/Ambassadors.tsx` — Add `<MotionConfig reducedMotion="user">`, guard all `ArticleClosing` animations with `useReducedMotion()`, wrap `StoryEnding3D` in `EndingSpatialBoundary`, add `useBodyScrollLock(!!selected)` — `motion@13.2.0`
6. `src/components/ui/Magnetic.tsx`, `src/components/cinematic/primitives.tsx`, `src/components/layout/Header.tsx`, `vite.config.ts` — Move `Magnetic` to `motion/react` and split `gsap` & `animejs` into dedicated chunks — `motion@13.2.0`, `vite@7.3.6`
7. `src/components/layout/Footer.tsx`, `api/newsletter.ts` — Fix `mailto:` `target="_blank"`, balance 4-column colophon, respect reduced motion on scroll-to-top, add canonical origin to `DEFAULT_ALLOWED_ORIGINS` — native/serverless API
8. `scripts/interaction-jsdom.tsx` & `docs/*.md` — Add regression assertions and synchronize documentation — test suite & docs

### Risks and safeguards
- **Risk:** Splitting `gsap` and migrating `Magnetic` could break existing import sites or alter hover feel.
- **Safeguard:** Re-export `Magnetic` from `src/components/cinematic/primitives.tsx` and `src/components/cinematic/index.ts` so every existing import site compiles and functions without modification.
- **Backup/rollback:** All changes are tracked on git branch `arena/741ed410-verlyse` and can be reverted per file via `git checkout -- <path>`.

### Verification
- `npm run build` — `tsc -b` 0 errors, Vite bundle emitted, 53 prerendered shells, 53 sitemap URLs
- `npm run typecheck:api && npm run check:secrets` — 0 API type errors, 0 secret leaks
- `npm run test:metadata && npm run test:smoke && npm run test:newsletter && npm run test:flows` — 53 shells verified, 20/20 SSR route cases rendered, 15/15 synthetic newsletter checks, 14/14 JSDOM flows
- `node scripts/asset-audit.mjs && node scripts/interaction-audit.mjs && node scripts/verify-flags.mjs` — 45/45 role-subset assets & 104/104 full public media/font inventory, 17/17 Chromium interaction checks, 0 console errors

---

## 5 · Defect & Audit Resolution Records (`templates/BUG_REPORT_TEMPLATE.md`)

### Defect 1 — `ArtGallery.tsx` Orphaned `+256px` Right-Gutter Padding & `transition-all` Transform Conflict
- **Summary:** After removing the floating right-margin `Up Next` card on article pages in PR #7, `ArtGallery.tsx` still reserved `+256px` of right padding on `lg+` viewports (`lg:pr-[calc(clamp(1.75rem,5.5vw,4.75rem)+256px)]`), shifting the 5-plate exhibition gallery of *"The Quiet Grief"* off-center (`76px` left padding vs `332px` right padding at `1440px`) and delaying the 3-column grid until `1400px`. Additionally, plate trigger buttons combined `spotlitGlide('restrained')` with `transition-all duration-700`, violating `STRING_TUNE_PLAYBOOK.md` §6.
- **Environment / version:** Desktop `1024px–1920px`, Chromium `153.0.8010.0`.
- **Route / feature:** `/article/the-quiet-grief` (and any multi-plate `ArtGallery` surface).
- **Expected:** Symmetrical `76px` left/right padding at `1440px`, 3-column grid from `lg` (`1024px+`), and CSS transitions scoped to `border-color, box-shadow`.
- **Actual (before fix):** `paddingLeft: 76px`, `paddingRight: 332px`, `transition-all` competing with `--string-glide`.
- **Resolution:** Standardized section padding to `px-[clamp(1.75rem,5.5vw,4.75rem)] py-12`, grid to `lg:grid-cols-3`, and button transition to `transition-[border-color,box-shadow] duration-700`. Verified in Chromium (`quiet-grief-gallery-computed-layout` across `375×812`, `768×1024`, `1440×900`) and `scripts/interaction-jsdom.tsx`.

### Defect 2 — `Home.tsx` (`SpatialReading`) Focusable Buttons Inside `aria-hidden="true"` Container
- **Summary:** In `SpatialReading` (`src/pages/Home.tsx`), the `<div className="flex items-center gap-4" aria-hidden="true">` wrapper enclosed the interactive `Previous plate` and `Next plate` `<button>` controls, violating WCAG 4.1.2 (`aria-hidden-focus`).
- **Environment / version:** All viewports, keyboard + screen-reader navigation.
- **Route / feature:** `/` (`Home.tsx`, `"The hall above is leaning toward this plate"` section).
- **Expected:** Focusable `<button>` elements must never have an `aria-hidden="true"` ancestor; decorative index numerals (`01`, `06`) and progress bars should be `aria-hidden="true"` individually.
- **Actual (before fix):** `button[aria-label="Previous plate"].closest('[aria-hidden="true"]')` was non-null.
- **Resolution:** Removed `aria-hidden="true"` from the parent container, added `role="group" aria-label="Turn the selected plate"`, applied `aria-hidden="true"` only to the decorative `<span>` elements, and added `focus-visible:outline` styles. Verified in Chromium (`prevHiddenAncestor: false, nextHiddenAncestor: false`).

### Defect 3 — `SavedDrawer.tsx` Single-Item Removal Not Syncing Header Badge or `SaveButton`
- **Summary:** Clicking `Remove` on a single saved folio inside `SavedDrawer.tsx` updated `localStorage` and local drawer state, but unlike `clearAll()` and `SaveButton.tsx`, did not dispatch `window.dispatchEvent(new CustomEvent('verlyse:saved-updated'))`.
- **Environment / version:** All browsers/viewports.
- **Route / feature:** Global `SavedDrawer` (`The reading list`) + `Header` count badge + `SaveButton`.
- **Expected:** Removing a single saved item immediately updates `Header` `useSavedCount()` and flips any mounted `SaveButton` `aria-pressed` from `"true"` to `"false"`.
- **Actual (before fix):** Header badge and `SaveButton` stayed stale until page reload or next save action.
- **Resolution:** Added `window.dispatchEvent(new CustomEvent('verlyse:saved-updated'))` to `remove(id)` in `src/components/layout/SavedDrawer.tsx` and added a regression test in `scripts/interaction-jsdom.tsx`.

### Defect 4 — `ArticleClosing.tsx` Missing `useReducedMotion()` Guards (`D3`) & Missing Root `<MotionConfig>`
- **Summary:** `src/components/ui/ArticleClosing.tsx` (rendered on all 20 `/article/:id` pages) contained 34 `motion.*` entrance and SVG path-draw animations without checking `useReducedMotion()`, leaving content initially hidden (`opacity: 0`, `pathLength: 0`, `scaleX: 0`) under `prefers-reduced-motion: reduce`.
- **Environment / version:** All viewports with `prefers-reduced-motion: reduce`.
- **Route / feature:** All 20 `/article/:id` routes and `/creator/:authorId` (`Signature`).
- **Expected:** Under `prefers-reduced-motion: reduce`, all closing blocks, rules, ornaments, and signatures render immediately in their final readable state (`initial={false}`, `duration: 0`).
- **Actual (before fix):** Recorded as open defect **D3** in `audit/CODEBASE-AND-SITE-ASSESSMENT.md` and `docs/MOTION.md` §4 (`28 of 32 animated components guard explicitly`).
- **Resolution:** Wrapped `<App />` in `<MotionConfig reducedMotion="user">` (`src/App.tsx`) and added explicit `useReducedMotion()` guards to all 13 components in `src/components/ui/ArticleClosing.tsx` (`32 of 32` animated components now guarded).

### Defect 5 — `Header.tsx` Pulling `gsap` (`114 kB`) into the Blocking Entry Chunk (`B2`)
- **Summary:** `Header.tsx` imported `Magnetic` from `../cinematic`, which re-exported `src/components/cinematic/primitives.tsx` (`import gsap from 'gsap'` + `ScrollTrigger`), forcing all 53 routes to download `gsap` inside the initial `index-*.js` entry bundle (`252.87 kB` raw / `89.38 kB` gzip).
- **Environment / version:** Production Vite build across all 53 routes.
- **Route / feature:** Global `Header` / initial bundle load.
- **Expected:** `gsap` should only load on routes that mount `ScrollTrigger` camera primitives; the initial `index-*.js` entry chunk should not contain `gsap`.
- **Actual (before fix):** Recorded as High-priority defect **B2** in `audit/CODEBASE-AND-SITE-ASSESSMENT.md`.
- **Resolution:** Implemented `Magnetic` in `src/components/ui/Magnetic.tsx` using `motion/react` (`useMotionValue` + `useSpring`), re-exported it from `src/components/cinematic/primitives.tsx`, updated `Header.tsx` to import from `../ui/Magnetic`, and added dedicated `gsap` and `anime` chunk rules in `vite.config.ts`. `gsap` (`dist/assets/gsap-a3sj5zmn.js`, `114.01 kB` / `45.16 kB` gzip) is completely evicted from `index-*.js` (`252.87 kB` / `89.38 kB` gzip before `gsap` eviction; `dist/assets/index-BdTMAPn7.js` at `172.89 kB` / `56.54 kB` gzip in the current build with `EditorialCraftSystem` included).

### Defect 6 — `Ambassadors.tsx` Modal Record Missing Scroll Lock (`D4`), `ArticleDetail.tsx` Missing `EndingSpatialBoundary` (`E1`), and `api/newsletter.ts` + `Footer.tsx` Canonical Origin & Endpoint (`A4`)
- **Summary:** (1) Opening a team member's record dialog on `/ambassadors` did not lock body scroll (`useBodyScrollLock`); (2) `<StoryEnding3D>` on `/article/:id` lacked a local React Error Boundary around `<Suspense>`, risking whole-page fallback on a WebGL error; (3) `Footer.tsx` posted to relative `/api/newsletter` on static canonical host `verlysemedia.kesug.com` and `api/newsletter.ts` included `localhost` in production default origins.
- **Resolution:** Added `useBodyScrollLock(!!selected)` in `src/pages/Ambassadors.tsx`, wrapped `<StoryEnding3D>` in `<EndingSpatialBoundary>` inside `EndingSpatialStage` in `src/pages/ArticleDetail.tsx`, added `resolveNewsletterEndpoint()` in `src/components/layout/Footer.tsx`, and separated `PRODUCTION_ALLOWED_ORIGINS` (`https://verlysemedia.kesug.com`, `https://verlyse-react.vercel.app`) from `DEV_ALLOWED_ORIGINS` in `api/newsletter.ts`.

---

## 6 · Release Checklist (`templates/RELEASE_CHECKLIST.md`)

### Scope and state
- [x] Diff reviewed; unrelated user changes preserved.
- [x] Version (`1.0.0`), artifact (`dist/`), target host/runtime (`verlysemedia.kesug.com` static + `verlyse-react.vercel.app` serverless), and release scope (`53` prerendered routes, `104` static media/font assets) identified.
- [x] Production data/config/schema impacts reviewed (no schema breaking changes; `src/data/content.ts` editorial records untouched).

### Verification
- [x] Actual project typecheck/lint/tests run; results recorded (`npm run build`, `npm run typecheck:api`, `npm run check:secrets`, `npm run test:metadata`, `npm run test:smoke`, `npm run test:newsletter`, `npm run test:flows`).
- [x] Production build/artifact inspected (`dist/` — `index-BdTMAPn7.js` `172.89 kB / 56.54 kB gzip`, `boot-CfrjN6Gu.js` `199.82 kB / 51.65 kB gzip`, `gsap-a3sj5zmn.js` isolated at `114.01 kB / 45.16 kB gzip`, `anime-CcJk6tc-.js` isolated at `32.40 kB / 13.15 kB gzip`).
- [x] Critical routes/forms/API flows smoke-tested (`node scripts/asset-audit.mjs`, `node scripts/interaction-audit.mjs`, `node scripts/verify-flags.mjs`).
- [x] Accessibility, responsive behavior, security and secret checks run (`0` console errors, `0` horizontal overflow across 8 viewports × 11 routes = `88/88`, `0` secret leaks).
- [x] Environment variables and headers/redirects match target host (`public/.htaccess` and `vercel.json` aligned; `api/newsletter.ts` `PRODUCTION_ALLOWED_ORIGINS` includes `https://verlysemedia.kesug.com` and `https://verlyse-react.vercel.app`; live deployment verification pending / blocked in sandbox).

### Recovery
- [x] Backup/rollback path exists and is usable (`git revert` or per-file checkout on `arena/741ed410-verlyse`).
- [x] Migration is backward-compatible (all route patterns, data exports, and component props preserved).
- [x] Monitoring/rollback trigger and owner identified (CI/Vercel build & `npm test` browser suite).

### Release record
- **Artifact/commit:** Working tree on `arena/741ed410-verlyse` (branched from `ea6392572d2481ef3f197799ac0ac2917e9e135a`)
- **Deployment target:** Local workspace build & preview (`0.0.0.0:5173`); no external deployment performed
- **Date/time:** `2026-10-18`
- **Checks/statuses:** All local build, Node, JSDOM (`14/14`), newsletter synthetic (`15/15`), and headless Chromium (`45/45` role subset, `104/104` full inventory, `17/17` interaction checks, `88/88` responsive matrix) suites `PASS`
- **Known gaps:** Live end-to-end newsletter POST and live security-header verification on `verlysemedia.kesug.com` and `verlyse-react.vercel.app` are **BLOCKED / NOT VERIFIED** in the sandbox pending admin deployment.

---

## 7 · Completion Report (`templates/COMPLETION_REPORT_TEMPLATE.md`)

### Outcome
- **Implemented:**
  - Complete UI & Motion Stack assessment and alignment with the Arena AI Development Skill Pack (`docs/SKILLPACK-STACK-ASSESSMENT.md`).
  - `ArtGallery.tsx` symmetrical full-width container padding (`76px`/`76px` at `1440px`), `lg:grid-cols-3` desktop plate grid, and single-owner transform transition (`transition-[border-color,box-shadow]`).
  - `Home.tsx` (`SpatialReading`) WCAG 4.1.2 `aria-hidden-focus` fix and keyboard `focus-visible` outlines on plate navigation controls.
  - `SavedDrawer.tsx` `verlyse:saved-updated` event dispatch on single-item removal (`remove(id)`).
  - `StringTune` (`@fiddle-digital/string-tune@1.2.5`) hardening: trimmed `boot.ts` allowlist to the 4 active modules (`dist/assets/boot-CfrjN6Gu.js`: `199.82 kB / 51.65 kB gzip`), paired `progress|parallax[]` in `drift()`, added generation-checked reduced-motion and unmount race protection in `runtime.ts` + `StringTuneProvider.tsx`, and wired `spotlight()` / `spotlitGlide('restrained')` onto `/`, `/articles`, `/creators`, `/categories`, `/community`, `/about`, `Footer`, and `/creator/:authorId`.
  - Root `<MotionConfig reducedMotion="user">` in `src/App.tsx` and explicit `useReducedMotion()` guards across all 13 components in `src/components/ui/ArticleClosing.tsx` (closing **D3**).
  - Standalone `motion/react`-powered `src/components/ui/Magnetic.tsx` + `vite.config.ts` `gsap`/`anime` chunk isolation + lazy `BrassRule` `animejs` import + `EndingSpatialStage` `StoryEnding3D` gating, evicting `gsap` from `index-*.js` (closing **B1 & B2**).
  - `EndingSpatialBoundary` around `StoryEnding3D` in `src/pages/ArticleDetail.tsx` (`E1`), `useBodyScrollLock(!!selected)` in `src/pages/Ambassadors.tsx` (`D4`), `resolveNewsletterEndpoint()` in `Footer.tsx` + `PRODUCTION_ALLOWED_ORIGINS` in `api/newsletter.ts` (`A4` code complete; live deployment verification pending), and `Footer.tsx` colophon/link/reduced-motion improvements.
  - Synchronized `docs/MOTION.md`, `docs/ARCHITECTURE.md`, `docs/VERLYSE-INTERACTION-SYSTEM.md`, `docs/VERLYSE-VISUAL-REFINEMENT-LOG.md`, `docs/EDITORIAL-RECORD.md`, and `README.md`.
- **Not implemented / changed scope:**
  - Did not install incompatible external UI registries (`Watermelon UI`, `KokonutUI`, `Bklit UI`, `Dot Matrix`) or unverified third-party assets (`Shapes Gallery`, `Type Garden` runtime) per `STACK_DECISION_MATRIX.md` and `TOOL_EVALUATION_WORKFLOW.md`.
  - Did not deploy externally to InfinityFree or merge a new PR yet, awaiting user review.

### Changed areas
- `api/newsletter.ts` — Separated `PRODUCTION_ALLOWED_ORIGINS` (`https://verlysemedia.kesug.com`, `https://verlyse-react.vercel.app`) from `DEV_ALLOWED_ORIGINS` via `isProductionRuntime()`.
- `vite.config.ts` — Added `gsap` and `anime` `manualChunks` isolation rules.
- `src/App.tsx` — Wrapped application tree in `<MotionConfig reducedMotion="user">`.
- `src/components/ui/Magnetic.tsx` — Created `motion/react`-backed `Magnetic` component (`useMotionValue` + `useSpring`).
- `src/components/cinematic/primitives.tsx` — Re-exported `Magnetic` from `../ui/Magnetic`.
- `src/components/layout/Header.tsx` — Imported `Magnetic` from `../ui/Magnetic` so `Header` no longer pulls `gsap` into `index-*.js`.
- `src/components/layout/Footer.tsx` — Added `resolveNewsletterEndpoint()`, visible `<label htmlFor="nl-email">` + placeholder, scoped `target="_blank"` to external HTTP(S) links, balanced 4-column colophon, and added reduced-motion check to `"Back to the top ↑"`.
- `src/components/layout/SavedDrawer.tsx` — Dispatched `verlyse:saved-updated` inside `remove(id)`.
- `src/components/ui/ArtGallery.tsx` — Removed `+256px` right-gutter padding, restored `lg:grid-cols-3`, and scoped button transition to `transition-[border-color,box-shadow]`.
- `src/components/ui/ArticleClosing.tsx` — Added `useReducedMotion()` guards across all 13 closing components.
- `src/components/ui/WriterProfile.tsx` — Added StringTune `spotlight()` and `spotlitGlide('restrained')` to portrait and related-work frames.
- `src/lib/stringTune/boot.ts`, `src/lib/stringTune/runtime.ts`, `src/lib/stringTune/attrs.ts`, & `src/lib/stringTune/StringTuneProvider.tsx` — Trimmed `boot.ts` to 4 active modules, paired `progress|parallax[]` in `drift()`, and added generation-checked reduced-motion and unmount race protection.
- `src/pages/{Home,ArticleDetail,Categories,Community,About,Ambassadors}.tsx` — Fixed `SpatialReading` `aria-hidden-focus`, added `EndingSpatialStage` + `EndingSpatialBoundary`, added `useBodyScrollLock`, and wired `spotlight()` on `/categories`, `/community`, and `/about`.
- `scripts/interaction-jsdom.tsx` — Added JSDOM regression checks (`14/14` passing).
- `docs/{SKILLPACK-STACK-ASSESSMENT,MOTION,ARCHITECTURE,VERLYSE-INTERACTION-SYSTEM,VERLYSE-VISUAL-REFINEMENT-LOG,EDITORIAL-RECORD}.md` & `README.md` — Updated and synchronized all architecture, motion, interaction, and verification records.

### Verification
- **PASS:** `npm run build` — `tsc -b` 0 errors, Vite build succeeded, `53` metadata shells prerendered, `53` sitemap URLs generated.
- **PASS:** `npm run typecheck:api` — `0` errors.
- **PASS:** `npm run check:secrets` — `0` secret patterns or sensitive files detected.
- **PASS:** `npm run test:metadata` — `53` HTML shells and `53` sitemap URLs verified coherent.
- **PASS:** `npm run test:smoke` — `20/20` SSR route cases rendered cleanly (`18` valid routes across all `11` `<Route>` patterns + `2` missing-slug 404 fallbacks).
- **PASS:** `npm run test:newsletter` — `15/15` synthetic API & endpoint checks passed (live deployment verification **BLOCKED / NOT VERIFIED** in sandbox).
- **PASS:** `npm run test:flows` — `14/14` JSDOM interaction flows passed.
- **PASS:** `node scripts/asset-audit.mjs` — `45/45` sampled role-subset assets and `104/104` total static media/font assets in `public/` resolved in headless Chromium (`0` missing).
- **PASS:** `node scripts/interaction-audit.mjs` — `17/17` headless Chromium interaction, accessibility, lightbox, computed-layout, mobile `375px` no-overflow, reduced-motion, and WebGL-fallback checks passed (`0` console errors).
- **PASS:** `node scripts/verify-flags.mjs` — Search dialog mount/unmount focus restoration and 3D ending fallback verified in headless Chromium.
- **BLOCKED:** Live Penpot MCP / OriginKit MCP inspection (`status: unsupported`) and live production newsletter POST / live response-header inspection on `verlysemedia.kesug.com` and `verlyse-react.vercel.app`.

### Assumptions and limitations
- Penpot visual parity relies on the repository's documented board specifications (`docs/IMMERSIVE-*.md`) and headless Chromium geometric measurements rather than a live Penpot MCP connection.

### Follow-up / user action
- Review the updated live preview (`port 5173`) and `docs/SKILLPACK-STACK-ASSESSMENT.md`; let me know if you would like these changes committed, pushed, and merged via a pull request into `main`.
