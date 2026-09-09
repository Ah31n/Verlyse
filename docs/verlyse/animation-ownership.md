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

> **Currency note.** The sentence above describes the *spatial layer*, and it still holds there.
> Repo-wide it is now out of date: `motion/react` is the DOM choreography engine (44 files),
> anime.js drives one isolated SVG (`ui/BrassRule.tsx` on `/about`), and GSAP ScrollTrigger drives
> the cinematic camera layer on `/about` only. The live per-engine ownership table is in
> `docs/ANIMATION-DECISIONS.md`. The invariant that has *not* changed is the one that matters:
> **no property on any element is written by two engines.**

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
