# Implementation Plan — Verlyse Media Skill Pack Execution

**Template Source:** `templates/IMPLEMENTATION_PLAN_TEMPLATE.md` (`skills/architecture-planning/SKILL.md`)  
**Date:** `2026-10-16`

## Outcome and acceptance criteria
- **Outcome:** Execute a complete UI and Motion Stack assessment and improvement pass across `Ah31n/Verlyse` governed by the Arena AI Development Skill Pack, resolving open UI/layout, accessibility, state-sync, StringTune, reduced-motion, bundle-splitting, security/CORS, and `.md` documentation gaps.
- [x] Fix `ArtGallery.tsx` orphaned `+256px` right-gutter reserve, restore `lg:grid-cols-3` desktop plate grid, and enforce single-owner transform transitions (`transition-[border-color,box-shadow]`).
- [x] Fix `SpatialReading` (`Home.tsx`) WCAG 4.1.2 `aria-hidden-focus` violation on `Previous plate` / `Next plate` buttons and add `focus-visible` outlines.
- [x] Dispatch `verlyse:saved-updated` on single-item removal in `SavedDrawer.tsx`.
- [x] Preserve canonical StringTune module allowlist in `src/lib/stringTune/boot.ts`, pair `progress|parallax[]` in `drift()`, add live `prefers-reduced-motion: reduce` listener teardown/restart in `StringTuneProvider.tsx`, and extend StringTune `spotlight()` / `spotlitGlide('restrained')` to `/`, `/articles`, `/creators`, `/categories`, `/community`, `/about`, and `/creator/:authorId`.
- [x] Wrap `<App />` in `<MotionConfig reducedMotion="user">`, add `useReducedMotion()` guards throughout `src/components/ui/ArticleClosing.tsx` (`D3`), pre-gate `<SpatialArchive>` on `Home.tsx` (`B1`), and wrap `StoryEnding3D` in `EndingSpatialBoundary` (`ArticleDetail.tsx`, `E1`).
- [x] Migrate `Magnetic` to `src/components/ui/Magnetic.tsx` (`motion/react`) and isolate `gsap` and `animejs` in `vite.config.ts` `manualChunks` (`B2`).
- [x] Add `useBodyScrollLock(!!selected)` to `Ambassadors.tsx` (`D4`) and add `https://verlysemedia.kesug.com` to `DEFAULT_ALLOWED_ORIGINS` in `api/newsletter.ts` (`A4`).
- [x] Polish `Footer.tsx` colophon balance, external-only `target="_blank"`, and reduced-motion scroll-to-top.
- [x] Create and synchronize all required Skill Pack and repository `.md` files.

## Current state / baseline
- **Relevant architecture and existing behavior:** Vite 7.3.6 + React 18.3.1 + TypeScript 5.6.3 + Tailwind CSS 3.4.15 SPA with 53 build-time prerendered HTML shells, serverless `/api/newsletter`, `motion@13.2.0`, `@fiddle-digital/string-tune@1.2.5`, `three@0.185.1` + `@react-three/fiber@8.18.0`, `gsap@3.15.0`, and `animejs@4.5.0`.
- **Baseline checks and known failures:** Open audit items in `audit/CODEBASE-AND-SITE-ASSESSMENT.md` and `docs/MOTION.md` (`A4`, `B1`, `B2`, `D3`, `D4`, `E1`), `ArtGallery.tsx` `+256px` right-padding asymmetry after marginalia removal, `Home.tsx` `SpatialReading` `aria-hidden-focus`, `SavedDrawer.tsx` missing event dispatch on `remove(id)`, and outdated/contradictory claims across `docs/*.md`.

## Plan
1. `src/components/ui/ArtGallery.tsx` — Remove `lg:pr-[calc(clamp(1.75rem,5.5vw,4.75rem)+256px)]`, restore `lg:grid-cols-3`, replace `transition-all` with `transition-[border-color,box-shadow]` — `@fiddle-digital/string-tune`
2. `src/pages/Home.tsx` — Remove `aria-hidden="true"` from `SpatialReading` button wrapper, scope to decorative spans, add `role="group"` and `focus-visible:outline`, and gate `<SpatialArchive>` on `glSupported && !reduce` — native HTML/a11y & R3F gating
3. `src/components/layout/SavedDrawer.tsx` — Dispatch `verlyse:saved-updated` in `remove(id)` — browser `CustomEvent`
4. `src/lib/stringTune/boot.ts`, `src/lib/stringTune/attrs.ts`, `src/lib/stringTune/StringTuneProvider.tsx`, `src/pages/{Home,Articles,Creators,Categories,Community,About}.tsx`, `src/components/ui/WriterProfile.tsx` — Preserve canonical `boot.ts` allowlist, pair `progress|parallax[]` in `drift()`, add live reduced-motion listener, wire `spotlight()` / `spotlitGlide('restrained')` — `@fiddle-digital/string-tune@1.2.5`
5. `src/App.tsx`, `src/components/ui/ArticleClosing.tsx`, `src/pages/ArticleDetail.tsx`, `src/pages/Ambassadors.tsx` — Add `<MotionConfig reducedMotion="user">`, guard all `ArticleClosing` animations with `useReducedMotion()`, wrap `StoryEnding3D` in `EndingSpatialBoundary`, add `useBodyScrollLock(!!selected)` — `motion@13.2.0`
6. `src/components/ui/Magnetic.tsx`, `src/components/cinematic/primitives.tsx`, `src/components/layout/Header.tsx`, `vite.config.ts` — Move `Magnetic` to `motion/react` and split `gsap` & `animejs` into dedicated chunks — `motion@13.2.0`, `vite@7.3.6`
7. `src/components/layout/Footer.tsx`, `api/newsletter.ts` — Fix `mailto:` `target="_blank"`, balance 4-column colophon, respect reduced motion on scroll-to-top, add canonical origin to `DEFAULT_ALLOWED_ORIGINS` — native/serverless API
8. `scripts/interaction-jsdom.tsx` & `docs/*.md` — Add regression assertions and create/synchronize all required `.md` files (`PROJECT_BRIEF.md`, `STACK_DECISION_MATRIX.md`, `TOOL_DECISION_RECORD.md`, `IMPLEMENTATION_PLAN.md`, `BUG_REPORT.md`, `RELEASE_CHECKLIST.md`, `COMPLETION_REPORT.md`, `SKILLPACK-STACK-ASSESSMENT.md`, `MOTION.md`, `ARCHITECTURE.md`, `ANIMATION-DECISIONS.md`, `VERLYSE-INTERACTION-SYSTEM.md`, `VERLYSE-VISUAL-REFINEMENT-LOG.md`, `EDITORIAL-RECORD.md`, `verlyse/animation-ownership.md`, `audit/CODEBASE-AND-SITE-ASSESSMENT.md`, `README.md`).

## Risks and safeguards
- **Risk:** Splitting `gsap` and migrating `Magnetic` could break existing import sites in pages that import `{ Magnetic } from '../cinematic'`.
- **Safeguard:** Re-export `Magnetic` from `src/components/cinematic/primitives.tsx` and `src/components/cinematic/index.ts` so every existing import site continues to work seamlessly.
- **Backup/rollback:** All changes are tracked on git branch `arena/741ed410-verlyse` and can be reverted per file via `git checkout -- <path>`.

## Verification
- `npm run build` — `tsc -b` 0 errors, Vite bundle emitted, 54 prerendered shells, 54 sitemap URLs
- `npm run typecheck:api && npm run check:secrets` — 0 API type errors, 0 secret leaks
- `npm run test:metadata && npm run test:smoke && npm run test:newsletter && npm run test:flows` — 54 shells verified, 21/21 SSR route cases rendered, 15/15 synthetic newsletter checks, 14/14 JSDOM flows
- `node scripts/asset-audit.mjs && node scripts/interaction-audit.mjs && node scripts/verify-flags.mjs` — 45/45 role-subset assets & 104/104 full public media/font inventory, 17/17 Chromium interaction checks, 0 console errors
