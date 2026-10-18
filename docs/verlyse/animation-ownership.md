# Animation & Motion Ownership Map

Rule in force: one visual property = one animation owner. No two systems animate the same
`transform`, `opacity`, `filter`, `camera target`, or layout measurement at once.

| Motion context | Owner | Animated properties | Notes |
|---|---|---|---|
| Route transitions, page-enter sweep (`App.tsx` `PageTransition`) | Framer Motion | `opacity`, `y`, `scaleX` | existing; unchanged |
| Hero masthead / headline / ink / ledger reveals (`Home.tsx`) | Framer Motion | `opacity`, `y`, `pathLength`, `clipPath` | existing; unchanged |
| Scroll-linked reveals (`ScrollBeat`, `Reveal`, `MotionMoves`, `ArtGallery`, `CountUp`) | Framer Motion (`useScroll`, `useInView`, `useTransform`) | `opacity`, `y`, `scale`, `rotate`, `pathLength` | existing; untouched |
| Overlays/sheets (Search, Shelf, mobile menu) | Framer Motion | `opacity`, `x`, `y`, `filter` | existing; untouched |
| Signature scenes (`ArticleSignature.tsx`) | CSS keyframes + Framer | `transform`, `opacity` | existing semantic endings; unchanged |
| **Spatial archive scene (HELP hero)** | **three / react-three-fiber** (inside the Canvas only) | **camera position, mesh transforms, material light** | NEW. Only ever inside the `<Canvas>`; it never touches DOM `transform`/`opacity`. |
| **Story-ending atmosphere (article)** | **three / react-three-fiber** | **camera, points rotation, orbit rotation, fog** | NEW. Behind the semantic signature; DOM untouched. |
| CSS (static layout, hover/focus, ken-burns, breathing) | CSS | layout, static transforms, fallback states | unchanged |

## Ownership of the spatial layer
- `three + @react-three/fiber` own **only** the WebGL scene graph (camera, meshes, materials,
  points, fog). It never drives DOM-animated properties.
- Framer Motion continues to own all React/DOM choreography. This is why **GSAP, anime.js, and
  `motion` were intentionally NOT added** — the spatial layer is fully served by three/r3f, and
  adding GSAP/anime would create competing owners on the same scroll/micro-motion properties that
  Framer already handles. Per the blueprint's "do not add a package unless there is a real
  production responsibility," they were omitted.

> **Currency note (`2026-10-18` Review & Consolidation update).** The live per-engine ownership table is governed by `docs/MOTION.md` and `docs/STACK_DECISION_MATRIX.md`:
> - **CSS / Tailwind (`src/index.css`)**: Hover, focus-visible, color/opacity transitions, `@property` custom-property defaults, and global `prefers-reduced-motion` clamp.
> - **StringTune (`@fiddle-digital/string-tune@1.2.5`, `dist/assets/boot-CfrjN6Gu.js` lazy chunk, `199.82 kB` / `51.65 kB` gzip)**: `--progress` reading hairline, `StringGlide` plate lag, `StringParallax` desktop cover drift, and `StringSpotlight` cursor rim light (`4` registered & active modules; skipped & torn down under `prefers-reduced-motion: reduce`).
> - **`motion/react` (`motion@13.2.0`, `dist/assets/motion-Bx_UBRF8.js`, `137.25 kB` / `45.39 kB` gzip)**: `<MotionConfig reducedMotion="user">`, route curtains (`PageTransition`), overlays/drawers/lightboxes, reveals (`Reveal`, `SplitText`, `ArticleClosing`), `Magnetic` (`src/components/ui/Magnetic.tsx`), and component-scoped `useScroll` transforms.
> - **GSAP (`gsap@3.15.0`, `dist/assets/gsap-a3sj5zmn.js` lazy chunk, `114.01 kB` / `45.16 kB` gzip) & Anime.js (`animejs@4.5.0`, `dist/assets/anime-CcJk6tc-.js` lazy chunk, `32.40 kB` / `13.15 kB` gzip)**: GSAP is isolated to outer `ScrollTrigger` camera wrappers on secondary routes (`src/components/cinematic/primitives.tsx`), and Anime.js is dynamically imported inside `src/components/ui/BrassRule.tsx` only when `!reduce && near`; both are evicted from `Header.tsx` and the blocking `index-*.js` entry bundle.
> - **Three.js + `@react-three/fiber` (`dist/assets/three-DF4bklDy.js` lazy chunk, `770.49 kB` / `203.48 kB` gzip)**: WebGL `<Canvas>` scene graphs (`SpatialArchive`, `StoryEnding3D` via `EndingSpatialStage`, `/room`), gated on WebGL support, reduced motion, near-viewport, and tab visibility, and wrapped in local React Error Boundaries (`SpatialBoundary`, `EndingSpatialBoundary`, `RouteErrorBoundary`).
> The core invariant holds everywhere: **no property on any element is written by two engines.**

## Spatial scene bounds (all implemented)
- ONE shared Canvas. No canvas per card/section/article.
- Scene mounted only while near viewport + tab visible → bounded `requestAnimationFrame`.
- `pointer-events: none` + `aria-hidden` → never captures interaction or focus.
- Deterministic geometry (seeded from article IDs) → stable layout, no random jitter.
- Yields to reading: offscreen/hidden it unmounts.

## Fallback
- No WebGL → scene renders nothing; the hero's layered CSS gradients and the semantic
  `ArticleSignature` remain the designed static fallback.
- `prefers-reduced-motion` → scene suppressed (static final frame / no motion); DOM & signature intact.
