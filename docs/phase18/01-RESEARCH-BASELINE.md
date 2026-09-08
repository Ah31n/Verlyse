# PHASE 18 — 01 · RESEARCH BASELINE
**Date:** 2026-08-29 · **Mode:** read-only study of the Phase 17 production baseline
**Scope:** what exists, how it works, what is protected, and where the Phase 18 vision diverges.

## 1. WHAT THE CURRENT IMPLEMENTATION ACTUALLY IS

The Phase 17 site is **not** a "website with 3D in it" — it is an editorial publication with a bounded, state-driven spatial layer. Inventory of the systems that matter for Phase 18:

### 1.1 The spatial state machine (`src/lib/three/spatialState.ts`)
```
threshold → archive → selected → reading → desk → quiet
```
- **React owns the state; the Three.js renderer reads it.** Never sourced from mousemove (explicitly documented in the renderer).
- Intensity mapping: threshold 0.85 · archive 0.7 · selected 1.0 · reading 0.4 · desk 0.45 · quiet 0.2 — the scene dims when the DOM must win.

### 1.2 The Spatial Archive (`src/components/spatial/SpatialArchive.tsx`) — PROTECTED
- 19 standing **plates** (one per article), each textured with its **real canonical cover** (lazy-loaded textures), arranged on a **receding arc**: base ray 7.2–10.4, angle span ≈ ±77°, seeded per article id (`hash01`) — deterministic, stable across mounts.
- A **brass signal thread** — one continuous gold line threading the archive (editorial annotation line).
- Camera = damped drift (sin/cos, frame-rate independent), state-driven depth (selected → −2.2), tiny rotational **lean (0.06)** toward the focused work. Settles to stillness.
- Atmosphere: wine-deep fog `#3B0D17` (10–26), warm key light, brass rim, cool counter-fill.
- Lifecycle discipline: **one shared canvas**, viewport + tab-visibility gated, `dpr [1,1.5]`, `powerPreference: low-power`, lazy chunk (three never ships with the shell), removed under reduced-motion / no-WebGL, `pointer-events: none` + `aria-hidden` — it never intercepts reading.

### 1.3 Story Ending 3D (`src/components/spatial/StoryEnding3D.tsx`) — PROTECTED
- Per-article **different** scene compositions chosen by the article's `sceneKind` (not one scene for all).
- Its own state machine: `RESTING → ENTERING → ALIVE → REDUCED → FALLBACK`.
- Sits **behind** the semantic `ArticleSignature` (always-rendering HTML). Fully reduced-motion / no-WebGL safe.

### 1.4 The Worlds (`src/components/ui/ArticleWorld.tsx`) — PROTECTED
Seven per-article atmospheric worlds, **drawn** (CSS/SVG), never noise: `paper` (laid lines) · `letter` (ruled) · `newsprint` (halftone) · `night` (deep light) · `linen` (woven) · `gallery` (hushed) · `document` (ledger grid). Each article in the registry carries its own `world` + `vibe` (14 temperaments) + optional `motif`, `heroMode` (cinematic/documentary/gallery/quiet), `finale`, `reflection`.

### 1.5 The motion language (`src/lib/motion.ts`) — PROTECTED
- Easing: **ink** `[0.16, 1, 0.3, 1]` (fast to arrive, long to land) · **leaf** `[0.22, 1, 0.36, 1]` (ambient).
- Durations: settle 1050ms · unfold 1300ms · ink 1800ms+ · breathe 5000ms+.
- Named moves: **ink-spread** (content blooms from a point) · **paper-unfold** (plate folds down) · **editorial-wipe** (gold hairline sweeps a section open).
- "Ink on paper, slowly" — the house rule.

### 1.6 The editorial closing system (`src/components/ui/ArticleClosing.tsx`) — PROTECTED
Eight designed closing kinds (voices / mission / note / artwork / about-work / final-verse / passage / story-end), hand-drawn SVG **Signature**, motif dividers. All semantic HTML, always on top of atmosphere.

### 1.7 Home & journey (`src/pages/Home.tsx`, `ArticleDetail.tsx`)
- Home = the magazine cover: preloader (press start, 1.5s + 1s curtain, synced to a 1.6–3.35s entrance timeline) → masthead over the 3D archive → feature plate (clip-path print reveal) → ledger → works strip (magazine spread) → feature → **Spatial Reading** (4 accessible tablist plates that drive the archive: "the archive leans in to meet it") → pulse → departments (7 rooms) → invitation → colophon.
- ArticleDetail: per-`heroMode` hero (with WorldTexture) → reading section (world + vibe) → **ending** (StoryEnding3D behind the signature) → related.
- 11 routes behind a `PageTransition` wrapper (Framer Motion).

### 1.8 Brand tokens (`src/index.css`)
`--wine #5C1224 · --wine-deep #3B0D17 · --ivory #F8F6F2 · --cream #EFE8DD · --gold #B89146 · --charcoal #1C1C1C`. Fonts: **Cormorant Garamond** (serif), **Inter** (sans), **IBM Plex Mono** (marginalia). All self-hosted woff2.

### 1.9 The registry (`src/data/content.ts`) — content source of truth
- **19 articles**, each with: id, title, authorId, category, cover (+ optional thumbnail), slides, body (word-for-word), voices, closing (8 kinds), **vibe** (14), **world** (7), heroMode, motif, gallery, figures, reflection, **finale**, credit.
- **16 author records** (15 credited creators + Verlyse Media), portraits where the posts carried them, philosophy + favoriteQuote in the creator's own words.
- **7 categories** (Stories 1 · Poetry 7 · Essays 2 · Art 3 · Social Issues 4 · Lifestyle 1 · Horror 1).
- Featured: **Their Voices Matter** (TVM) — newsprint/solemn, closing `voices` ("Their stories matter. Their voices matter. Their future matters.") · Newest: **Mir Raza Ali** (MRA) — newsprint/urgent, closing `voices` ("A life was lost. A family was left with questions. A country is watching.") · Zainab Khan present exactly once (Head of Research Department).
- Community ledger: 19 features · 1281 appreciations · 585 conversations · 15 creators.

### 1.10 Dependency & tooling reality
- Installed: `three` + `@react-three/fiber` · `gsap` · `framer-motion` · `react-router-dom` · `tailwindcss` · TypeScript. **No anime.js. No external UI component libraries.**
- The spec's named resources — research outcome: **Skiper UI** (real; premium $129, ShadCN-based animated components) and **Vengeance UI** (real; premium, Radix+Tailwind) are component *shops* for a different visual language; **Coconut UI** — no verifiable library of that name exists; **Motion Primitives** — Verlyse already *has* its own (the house motion language in `lib/motion.ts`). Verdict: all evaluated, none adopted (see Concept doc §9).
- Tooling: Playwright + Puppeteer for validation, vite 7, deterministic builds (reproducible ×2 verified in P17).

## 2. WHAT THE BASELINE ALREADY DELIVERS (do not "improve" this)

| Phase 18 demand | Baseline status |
|---|---|
| Explicit camera states, no mousemove | ✅ Already true — state machine drives the rig |
| One dominant element / silence | ✅ Intensity system + "DOM wins" states |
| Purposeful motion, named moves | ✅ ink/leaf easing + 4 durations + 3 named moves |
| Deterministic, authored scenes | ✅ seeded by article id, no Math.random |
| Reduced-motion + WebGL fallback | ✅ Both first-class, content never gated |
| Lazy spatial loading, bounded rAF | ✅ viewport/tab gated, one canvas, dpr capped |
| Real content, no placeholders | ✅ registry is source of truth, word-for-word bodies |
| SEO / a11y / semantic endings | ✅ P15–P17 audited green |

## 3. THE GAP — WHERE PHASE 18 ACTUALLY ADDS MEANING

The baseline's spatial layer is **ambient and bounded**: it decorates the masthead and the endings, and a small "Spatial Reading" tablist below the fold lets the reader make the room lean in. Discovery itself still happens by **scrolling an editorial page**.

The Phase 18 delta, precisely:

1. **The archive becomes the primary discovery surface** — the reader walks the shelf, pulls a plate, and enters it. (Currently: scroll → card → click.)
2. **Camera states communicate the whole journey** — arrival, discovery, focus, select, entry, return — as one continuous, directed performance. (Currently: threshold/archive/selected/reading inside the home page only.)
3. **Entry and return are first-class transitions** — passing *through* a plate into its world, and the plate settling back with the thread leading to the next. (Currently: route change behind a page transition.)
4. **Categories and creators live in the room** — the catalog and the people, as part of the space. (Currently: separate list pages.)
5. **A mobile room** — reduced depth, same meaning. (Currently: same scroll page, spatial removed.)

Everything else — the worlds, the closings, the motion language, the registry, the fallbacks — is **inherited, not redesigned**.

## 4. CHANGE-CONTROL GROUND RULES FOR PHASE 18 (from the protected list)

**Never modified:** `SpatialArchive.tsx`, `StoryEnding3D.tsx`, `ArticleWorld.tsx`, `ArticleClosing.tsx`, `Motifs.tsx`, `VibeAmbient.tsx`, `pages/ArticleDetail.tsx`, `src/components/spatial/*` (existing files), `src/lib/three/*`, `src/lib/motion.ts`, `src/index.css`, `package.json`, `package-lock.json`, `vite.config.ts`.

**Consequence (architectural):** Phase 18 is built **additively** — new files only (new directory `src/components/room/`, new lib `src/lib/room.ts`, new route in `App.tsx`, optional additive composition in non-protected `Home.tsx`). The baseline keeps working, bit-for-bit, on every existing route. The experiment lives behind a **new route** and is reversible by deleting the new files + the route line.

*No deployment of any kind in this phase. Production (Vercel + InfinityFree) is read-only.*
