# Animation & Motion Ownership Map

Rule in force: one visual property = one animation owner. No two systems animate the same
`transform`, `opacity`, `filter`, `camera target`, or layout measurement at once.

| Motion context | Owner | Animated properties | Notes |
|---|---|---|---|
| Route transitions, page-enter sweep (`App.tsx` `PageTransition`) | Motion (`motion/react`) | `opacity`, `y`, `scaleX` | existing; draft threshold label is explicitly unpublished and unnumbered |
| Hero masthead / headline / ink / ledger reveals (`Home.tsx`) | Motion (`motion/react`) | `opacity`, `y`, `pathLength`, `clipPath` | existing; unchanged |
| Scroll-linked reveals (`ScrollBeat`, `Reveal`, `MotionMoves`, `ArtGallery`, `CountUp`) | Motion (`useScroll`, `useInView`, `useTransform`) | `opacity`, `y`, `scale`, `rotate`, `pathLength` | existing; reduced-motion supported |
| Editorial gallery modal (`ArtGallery.tsx`) | Motion (`motion/react`) + native DOM focus/portal behavior | `opacity`, `scale`; focus, keyboard and scroll lock | Lazy gallery; source-ratio plates; Escape/arrows; inert app root; focus restore |
| Overlays/sheets (Search, Shelf, mobile menu) | Motion (`motion/react`) | `opacity`, `x`, `y`, `filter` | existing; untouched |
| Signature scenes (`ArticleSignature.tsx`) | CSS keyframes + Motion | `transform`, `opacity` | existing semantic endings; unchanged |
| **Spatial archive scene (HELP hero)** | **three / react-three-fiber** (inside the Canvas only) | **camera position, mesh transforms, material light** | NEW. Only ever inside the `<Canvas>`; it never touches DOM `transform`/`opacity`. |
| **Story-ending atmosphere (article)** | **three / react-three-fiber** | **camera, points rotation, orbit rotation, fog** | NEW. Behind the semantic signature; DOM untouched. |
| CSS (static layout, hover/focus, ken-burns, breathing) | CSS | layout, static transforms, fallback states | unchanged |

## Ownership of the spatial layer
- `three + @react-three/fiber` own **only** the WebGL scene graph (camera, meshes, materials,
  points, fog). It never drives DOM-animated properties.
- `motion/react` owns React/DOM choreography; GSAP ScrollTrigger and Anime.js each retain their
  separately documented, isolated surfaces, and Three/R3F owns only its Canvas scenes. The
  editorial feature adds no competing runtime. StringTune was evaluated but not installed because
  its shared scroll/runtime layer is unnecessary for the existing Motion-based reveal and gallery.

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
