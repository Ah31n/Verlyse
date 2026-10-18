# Project Brief — Verlyse Media (`@verlyse.media`)

**Template Source:** `templates/PROJECT_BRIEF_TEMPLATE.md` (`skills/product-discovery/SKILL.md`)  
**Date:** `2026-10-16`  
**Repository:** `Ah31n/Verlyse` (`arena/741ed410-verlyse`)

## Product and audience
- **Product:** Verlyse Media — *"Where Vision Becomes A Voice."* An online literary and visual arts publication and curated digital gallery presenting Issue № 01.
- **Primary user/context:** Readers, poets, essayists, visual artists, and student contributors exploring published works, contributor dossiers, and open editorial/recruitment calls across desktop, tablet, and mobile browsers.
- **Problem or job:** Give emerging writers and visual artists an authored, museum-grade publication where every poem, essay, story, social-issue dispatch, and multi-plate artwork is presented with full credit, verbatim source integrity, keyboard/screen-reader accessibility, and restrained editorial motion.
- **Desired outcome:** Complete assessment and alignment of Verlyse Media's UI stack, motion/3D stack, StringTune runtime, accessibility/reduced-motion compliance, bundle architecture, and required `.md` engineering documentation under the Arena AI Development Skill Pack.

## Core journey
1. **Entrance & Issue Discovery (`/`, `/articles`, `/categories/:slug`):** Visitor arrives at the Issue № 01 cover, explores the 20 folios or steps through the 7 department wings (`Essays`, `Art`, `Poetry`, `Social Issues`, `Horror`, `Lifestyle`, `Stories`), and filters or searches via `⌘K` / `Ctrl+K` (`SearchOverlay`) or saves folios to `The reading list` (`SavedDrawer`).
2. **Feature Reading & Exhibition Inspection (`/article/:id`, `/creator/:authorId`, `/room`):** Reader reads full-text works in vibe-adaptive reading rooms (`ReadingRoom`), inspects multi-plate visual features in the keyboard-accessible lightbox (`ArtGallery`), explores contributor dossiers (`WriterProfile`), or walks the 3D spatial archive (`/room`).
3. **Participation & Desk Correspondence (`/submit`, `/ambassadors`, `/contact`, Newsletter):** Reader subscribes to *The Verlyse Letter* (`POST /api/newsletter` with honest `mailto:` fallback), applies to official open roles (**Researcher**, **Palette Designer**, **Content Writer**) via the canonical Google Form, or submits original writing/art to the editorial desk.

## Scope
- **Must-have:**
  - Complete evaluation of all installed UI and motion packages (`react`, `react-router-dom`, `tailwindcss`, `motion`, `@fiddle-digital/string-tune`, `three`, `@react-three/fiber`, `gsap`, `animejs`) and all cataloged external UI/design resources (`Footer Design`, `Type Garden`, `Logosystem`, `RandomA11y`, `Dot Matrix`, `Shapes Gallery`, `Haikei`, `Penpot`, `OriginKit`, `Watermelon UI`, `KokonutUI`, `Bklit UI`, `Radix/shadcn`, `React Spring`, `Lenis`).
  - Strict single-owner animation governance so no two engines write to the same DOM property or scroll container.
  - 100% `prefers-reduced-motion: reduce` compliance across all 32 animated components (`<MotionConfig reducedMotion="user">` in `src/App.tsx` + explicit `useReducedMotion()` guards in `src/components/ui/ArticleClosing.tsx` + live media-query listener in `StringTuneProvider.tsx`).
  - Eviction of `gsap` (`114.01 kB`) from the blocking initial entry bundle (`index-*.js`) by migrating `Magnetic` to `motion/react` (`src/components/ui/Magnetic.tsx`) and isolating `gsap` and `animejs` in `vite.config.ts`.
  - Pre-import gating of `<SpatialArchive>` on `Home.tsx` so non-WebGL and reduced-motion visitors do not download `three-*.js` (`770.49 kB`) on `/`.
  - Complete synchronization of all required `.md` files (`docs/PROJECT_BRIEF.md`, `docs/STACK_DECISION_MATRIX.md`, `docs/TOOL_DECISION_RECORD.md`, `docs/IMPLEMENTATION_PLAN.md`, `docs/BUG_REPORT.md`, `docs/RELEASE_CHECKLIST.md`, `docs/COMPLETION_REPORT.md`, `docs/SKILLPACK-STACK-ASSESSMENT.md`, `docs/MOTION.md`, `docs/ARCHITECTURE.md`, `docs/ANIMATION-DECISIONS.md`, `docs/VERLYSE-INTERACTION-SYSTEM.md`, `docs/VERLYSE-VISUAL-REFINEMENT-LOG.md`, `docs/EDITORIAL-RECORD.md`, `docs/verlyse/animation-ownership.md`, `audit/CODEBASE-AND-SITE-ASSESSMENT.md`, and `README.md`).
- **Non-goals:**
  - Rebuilding the application in Next.js or migrating Tailwind CSS v3.4 to v4 (`docs/STACK_DECISION_MATRIX.md`).
  - Fabricating articles, contributor biographies, comments, metrics, or unavailable MCP tool results (`ARENA_RULES.md`).
  - Committing the raw uploaded skill-pack source archive into the repository.
- **Constraints (platform, stack, hosting, budget, privacy, timeline):**
  - Dual-deployment topology: `verlysemedia.kesug.com` (canonical static Apache/InfinityFree host) and `verlyse-react.vercel.app` (Vercel mirror + `/api/newsletter` serverless runtime).
  - Penpot MCP and OriginKit MCP return `status: unsupported` in this sandbox; Figma MCP is prohibited by project directive.
- **Existing assets/approved copy:**
  - `104` self-hosted static media and font assets in `public/` (`100` image/SVG files + `4` `.woff2` font files), `20` catalogued features (`LEDGER.features = 20`: `LEDGER.publishedFeatures = 19` published folios + `LEDGER.provisionalFeatures = 1` provisional record), `16` contributor wall records (`15` bylined creators + co-credited Mochi), `7` categories, `14` regional ambassadors across `6` chapters (`10` active `BRAND.team` records; `Haiqa Nafees` and `Manha` removed from `/ambassadors` and `BRAND.team` only while preserving Haiqa's author dossier and features `khageena` and `jaldi`), and verbatim source caption + 5 original plates for *"The Quiet Grief"* (`DeUZFPTCjPU`, `publicationStatus: 'provisional'`).

## Acceptance criteria
- [x] Every installed UI/motion library and every cataloged external UI/design tool is assessed with an explicit decision (`USE`, `OPTIONAL`, `RESEARCH FURTHER`, `DO NOT USE`).
- [x] `index-*.js` entry bundle no longer includes `gsap` (`252.87 kB / 89.38 kB gzip` before `gsap` eviction; `dist/assets/index-Br7b5VOr.js` at `180.42 kB / 58.04 kB gzip` in the current build with `EditorialCraftSystem` included).
- [x] `dist/assets/boot-CfrjN6Gu.js` StringTune chunk registers only the 4 active modules in `src/lib/stringTune/boot.ts` (`199.82 kB / 51.65 kB gzip`), pairs `progress|parallax[]` in `drift()`, and stops/restarts safely on `prefers-reduced-motion: reduce`.
- [x] All 32 animated components respect `prefers-reduced-motion: reduce`, and all 5 modal/drawer surfaces lock body scroll via `useBodyScrollLock`.
- [x] All required `.md` files exist in `docs/` and agree with the actual codebase and build output.
- [x] All build, typecheck, secret scan, metadata (`53` shells), SSR smoke (`20/20` route cases), newsletter (`15/15` synthetic checks), JSDOM (`14/14` flows), and headless Chromium (`45/45` role subset + `104/104` full public media/font inventory, `17/17` interaction checks) gates pass.

## Open questions / reversible assumptions
- **Question (material only):** Whether InfinityFree proxies `POST /api/newsletter` to the Vercel serverless origin in live production (`docs/ARCHITECTURE.md` §4).
- **Assumption:** `api/newsletter.ts` includes `https://verlysemedia.kesug.com` in `DEFAULT_ALLOWED_ORIGINS`, and `Footer.tsx` preserves its `mailto:` fallback if `POST /api/newsletter` is unreachable on static hosting.
