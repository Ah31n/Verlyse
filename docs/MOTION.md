# Verlyse Media — motion & interaction governance

Established by **R08**. The goal is not more motion; it is better behaviour.

---

## 1 · Engine hierarchy

Pick the lowest tier that does the job. Moving *up* a tier requires a reason written in the PR.

| Tier | Engine | Use for | Do not use for |
|---|---|---|---|
| 1 | **CSS / Tailwind** | hover, focus-visible, colour, opacity, simple transitions, static states, `@property` custom-property interpolation | anything needing presence/exit |
| 2 | **StringTune (`@fiddle-digital/string-tune`)** | declarative scroll progress (`--progress`), gentle scroll-lag glide (`string="glide[]"`), shallow desktop parallax (`string="parallax[]"`), fine-pointer brass spotlight (`--spotlight-angle` / `--spotlight-distance`) | scroll-jacking (`scrollDesktopMode` and `scrollMobileMode` stay `'default'`) |
| 3 | **motion (v13)** | `<MotionConfig reducedMotion="user">`, React presence (`AnimatePresence`), layout animation, controlled reveals (`Reveal`, `SplitText`, `ArticleClosing`), `Magnetic` (`useSpring`), scroll-linked DOM (`useScroll`) | continuous unthrottled decorative loops |
| 4 | **GSAP 3.15 + Anime.js 4.5 (isolated lazy chunks)** | Established ScrollTrigger camera wrappers (`src/components/cinematic/primitives.tsx`) and SVG stroke draw (`src/components/ui/BrassRule.tsx`) | main entry chunk (`index-*.js`), scroll pinning, or new surfaces |
| 5 | **R3F / three** | true spatial rendering (`SpatialArchive`, `StoryEnding3D`, `/room`) wrapped in local React Error Boundaries (`SpatialBoundary`, `EndingSpatialBoundary`, `RouteErrorBoundary`) | 2D decoration |

> **Bundle isolation note (`B2` closed):** `Magnetic` (`src/components/ui/Magnetic.tsx`) now runs on `motion/react` (`useMotionValue` + `useSpring`), and `vite.config.ts` isolates `gsap` (`dist/assets/gsap-a3sj5zmn.js`, `114.01 kB` / `45.16 kB` gzip) and `animejs` (`dist/assets/anime-CcJk6tc-.js`, `32.40 kB` / `13.15 kB` gzip, dynamically imported by `BrassRule` only when `!reduce && near`) into lazy chunks. The blocking `index-*.js` entry bundle evicted `gsap` completely (`252.87 kB` / `89.38 kB` gzip before `gsap` eviction; `154.45 kB` / `51.49 kB` gzip immediately after `gsap` eviction prior to `EditorialCraftSystem`; `dist/assets/index-B4mHalN7.js` at `177.64 kB` / `57.97 kB` gzip in the current build with `EditorialCraftSystem` included).

---

## 2 · Ownership table

**Every animated surface has exactly one owner.** No two systems may write the same `transform`, `opacity`, scroll position or timeline.

| Surface | Owner | Notes |
|---|---|---|
| Hover / focus / active states, colour + opacity | **CSS** | sitewide; the reduced-motion clamp in `index.css` covers these |
| Route transitions (`PageTransition`, archival veil) | **motion** | `<MotionConfig reducedMotion="user">` + `AnimatePresence`, keyed on pathname |
| Search overlay, saved drawer, mobile menu, lightbox, ambassador dialog | **motion** | presence + focus trap + `useBodyScrollLock` |
| Reveals (`Reveal`, `RevealImage`, `SplitText`, `ArticleClosing`) | **motion** | `useInView`, `once: true`, `useReducedMotion()` |
| `Magnetic` (`src/components/ui/Magnetic.tsx`) | **motion** | `useMotionValue` + `useSpring` (re-exported by `src/components/cinematic` for backward compatibility) |
| Scroll progress bar, header condense | **CSS**, driven by a passive listener in `Layout` | reads `window.scrollY`; writes class names only |
| Home scroll transforms, `ImmersiveShell`, `DossierRoom`, `ScrollBeat` | **motion** `useScroll` | read-only on scroll |
| `components/cinematic/*` (`CrashZoom`, `MaskReveal`, `Slate`, `Tilt3D`, …) | **GSAP (`ScrollTrigger`)** | outer camera wrappers on secondary routes only (`dist/assets/gsap-a3sj5zmn.js` lazy chunk); reverts via `gsap.context()` |
| `BrassRule` SVG draw (`src/components/ui/BrassRule.tsx`) | **Anime.js (`animejs/svg`)** | SVG stroke draw (`dist/assets/anime-CcJk6tc-.js` lazy chunk, dynamically imported only when `!reduce && near`) |
| Reading measure (`.st-measure`), archive/gallery plate spotlight & glide (`.st-spotlit`), cover drift | **StringTune** | lazy-loaded via `src/lib/stringTune/boot.ts` (`dist/assets/boot-CfrjN6Gu.js`: `199.82 kB` / `51.65 kB` gzip; 4 registered & active modules); skipped & torn down under `prefers-reduced-motion: reduce` |
| `SpatialArchive` (Home), `StoryEnding3D` (articles via `EndingSpatialStage`), `components/room/*` | **R3F / motion** | lazy; gated on WebGL + reduced motion + near-viewport + tab visibility; wrapped in local React Error Boundaries (`SpatialBoundary`, `EndingSpatialBoundary`, `RouteErrorBoundary`) |

### Scroll ownership

**The browser owns scroll.** There is no smooth-scroll engine and none may be added. GSAP ScrollTrigger and motion's `useScroll` both *read* native scroll; neither drives it. `ScrollToTop` in `App.tsx` is the only code that sets scroll position, and only on navigation.

Four scroll readers exist today (`Layout`, `Header`, `Room`, plus motion's `useScroll` in five components). All are passive and cleaned up on unmount. They are *readers*, not owners, so they do not conflict — consolidation is possible but is not a correctness issue and is not scheduled.

---

## 3 · Motion tokens

Defined in `tailwind.config.js`. New motion uses a token; a raw duration in a class is a review comment.

| Token | Duration | For |
|---|---|---|
| `instant` | 90ms | state flips, pressed, checkbox |
| `quick` | 240ms | hover, focus ring, small reveals |
| `settle` | 520ms | panels, drawers, page furniture |
| `unfold` | 900ms | editorial reveals, plates entering |
| `ink` | 1400ms | slow image/scale moves, the archival veil |
| `breathe` | 4000ms | ambient only, never attention-seeking |

| Easing | Curve | For |
|---|---|---|
| `editorial` | `cubic-bezier(0.22, 1, 0.36, 1)` | the house curve — everything decelerates into place |
| `press` | `cubic-bezier(0.65, 0.05, 0.36, 1)` | entrances that must feel pressed, not floated |
| `drift` | `cubic-bezier(0.37, 0, 0.63, 1)` | ambient only |

Usage: `transition-[colors] duration-quick ease-editorial`.

Existing call sites are migrated opportunistically. A single sweeping rewrite of ~200 duration classes would be unreviewable and would risk visual regressions across 52 routes for no user-visible gain.

---

## 4 · Reduced motion (**D3 — Closed**)

Reduced mode must produce a **deliberate static composition**, never a broken animation.

Three mechanisms work together:

1. **CSS clamp** (`index.css:69-76`) — sets `animation-duration` and `transition-duration` to `0.001s`. Covers tier 1.
2. **Root `<MotionConfig reducedMotion="user">`** (`src/App.tsx`) — instructs `motion/react` globally to respect the operating system's reduced-motion setting.
3. **Explicit `useReducedMotion()` / `matchMedia` guards** — **32 of 32 animated components guard explicitly**, including all 13 closing components in `src/components/ui/ArticleClosing.tsx` (**D3 closed**) and the live `prefers-reduced-motion: reduce` media-query listener in `src/lib/stringTune/StringTuneProvider.tsx`.

3D is fully gated: `useWebGLSupport()` + `useReducedMotion()` + tab visibility + local Error Boundaries (`SpatialBoundary` and `EndingSpatialBoundary`).

---

## 5 · Interaction rules (**D4 — Closed**)

- **No interaction may require hover.** Every hover affordance has a focus and a touch equivalent.
- **No mobile behaviour may depend on cursor mechanics.** Cursor, magnetic, spotlight and parallax effects are desktop-only.
- **Dialogs** (`Header` mobile menu, `SearchOverlay`, `SavedDrawer`, `ArtGallery` lightbox, and `Ambassadors` record dialog) all have focus traps, Escape dismissal, focus restoration to the opening control, and reference-counted body scroll lock via `useBodyScrollLock` (**D4 closed**).
- **Keyboard contract** for search: Escape closes, ArrowUp/ArrowDown move the active result, Enter opens, Tab leaves. Implemented in `SearchOverlay`.

---

## 6 · Completed bundle & motion consolidation (**B1 & B2 — Closed**)

- **`Magnetic` migrated to `motion/react` (`src/components/ui/Magnetic.tsx`)**: Replaced `gsap.quickTo` with `useMotionValue` + `useSpring` + `useReducedMotion`, removing `gsap` from `Header.tsx` and the blocking `index-*.js` entry bundle (`252.87 kB` / `89.38 kB` gzip → `154.45 kB` / `51.49 kB` gzip prior to `EditorialCraftSystem`; `dist/assets/index-B4mHalN7.js` at `177.64 kB` / `57.97 kB` gzip in the current build).
- **Dedicated chunk isolation (`vite.config.ts`, `BrassRule.tsx`, `ArticleDetail.tsx`)**: `gsap` (`dist/assets/gsap-a3sj5zmn.js`, `114.01 kB` / `45.16 kB` gzip) is isolated into a secondary-route chunk; `BrassRule.tsx` dynamically imports `animejs` (`dist/assets/anime-CcJk6tc-.js`, `32.40 kB` / `13.15 kB` gzip) only when `!reduce && near`; and `EndingSpatialStage` dynamically loads `StoryEnding3D` (`dist/assets/StoryEnding3D-C6ccyV-p.js`, `10.93 kB` / `3.20 kB` gzip) only when `glSupported && !reduce && near && tabVisible`.
- **StringTune 4-module allowlist & native-scroll parallax (`src/lib/stringTune/boot.ts`, `src/lib/stringTune/attrs.ts`)**: Trimmed `boot.ts` to the exact 4 modules used by active surfaces (`UNIVERSAL_MODULES = [StringProgress, StringGlide]`, `POINTER_MODULES = [StringParallax, StringSpotlight]`, emitted as `dist/assets/boot-CfrjN6Gu.js` at `199.82 kB` / `51.65 kB` gzip) and updated `drift()` to `string: 'progress|parallax[]'` so `StringParallax` receives `progress-value` in native scroll mode.
