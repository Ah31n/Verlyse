# Verlyse Motion Ownership

## Core Rule

**One engine owns one animated property on one DOM element.** Never combine `motion/react`, StringTune (`@fiddle-digital/string-tune`), GSAP, Anime.js, and Three.js on the same element's `transform` or `opacity`.

## Installed Engine Roles & Boundaries

| Engine | Assigned Responsibility | Explicit Exclusions |
|---|---|---|
| **CSS & Tailwind Transitions** | Focus rings, hairline expansion, color shifts, hover states, and `@media (prefers-reduced-motion: reduce)` overrides (`src/index.css`) | Complex physics or scroll scrubbing |
| **`motion/react` (`<MotionConfig reducedMotion="user">`)** | Route transitions (`src/App.tsx`), `Cover` entrance choreography (`src/pages/Home.tsx`), project-native botanical-typographic `<FloralWord>` (`src/components/ui/EditorialCraftSystem.tsx`), modal/drawer transitions (`Header.tsx`, `WriterProfile.tsx`, `ArtGallery.tsx`, `Ambassadors.tsx`), `ArticleClosing.tsx`, and `Magnetic` CTA wrappers (`src/components/ui/Magnetic.tsx`, applying `will-change-transform` only while actively engaged on fine pointers) | Must not share `transform` on elements carrying `string="parallax[]"` or `string="glide[]"` |
| **StringTune (`@fiddle-digital/string-tune@1.2.5`)** | Declarative scroll progress (`StringProgress`), parallax (`StringParallax`), scroll lag (`StringGlide`), and pointer spotlight (`StringSpotlight`) registered exclusively in `src/lib/stringTune/boot.ts` (`dist/assets/boot-CfrjN6Gu.js`, `199.82 kB` / `51.65 kB` gzip; 4 modules registered & active). `StringTuneProvider.tsx` automatically suspends StringTune on `/room`, when the document tab is hidden, or when zero `[string]` elements exist | `StringLerp`, `StringMagnetic`, `StringSplit`, `StringImpulse`, `StringScrollbar`, and `StringTurbulence` are excluded. Native browser scrolling (`scrollDesktopMode = 'default'`, `scrollMobileMode = 'default'`) is preserved |
| **GSAP (`gsap@3.15.0`)** | Isolated in its own lazy chunk (`dist/assets/gsap-a3sj5zmn.js`, `114.01 kB` / `45.16 kB` gzip via `vite.config.ts`) for outer `ScrollTrigger` camera wrappers in `src/components/cinematic/primitives.tsx` (`CrashZoom`, `DepthStage`, `DepthLayer`, `OrbitalDrift`, `PushIn`, `MaskReveal`, `Tilt3D`, `Rise3D`) | Do not attach to `Header.tsx`, global window scroll hijackers, or elements owned by `motion/react` |
| **Anime.js (`animejs@4.5.0`)** | Dynamically imported inside `src/components/ui/BrassRule.tsx` (`dist/assets/anime-CcJk6tc-.js`, `32.40 kB` / `13.15 kB` gzip) only when `!reduce && near` for discrete SVG `strokeDashoffset` draw | Not eagerly imported on `/` or `/about`; never conflicts with `motion/react` |
| **Three.js (`three@0.185.1` + `@react-three/fiber@8.18.0`)** | Dedicated WebGL contexts inside `/room` (`src/components/room/Room.tsx`), bidirectionally viewport-paused `SpatialArchive` (`src/components/spatial/SpatialArchive.tsx` on `src/pages/Home.tsx`, capped to a curated 9-plate cover shelf), and bidirectionally viewport-paused `StoryEnding3D` (`src/components/spatial/StoryEnding3D.tsx` via `EndingSpatialStage` on `src/pages/ArticleDetail.tsx`), wrapped in local React Error Boundaries (`RouteErrorBoundary`, `SpatialBoundary`, `EndingSpatialBoundary`) | Never mount a `<canvas>` when `canUseWebGL()` is false or `prefers-reduced-motion: reduce` is active (`canvases === 0` fallback invariant); switch `frameloop` to `'demand'` when scrolled offscreen or when the tab is hidden |

## Cover Folio № 21 Wrapper Separation Rule

Inside `Cover` (`src/pages/Home.tsx`), the outer plate frame carries `style={{ y: pFolio }}` (`motion/react`), the inner `<span className="block h-full w-full scale-[1.08]">` holds the static scale bleed so StringTune's direct `el.style.transform = translate3d(...)` on the child `<img {...drift('restrained')}>` never overwrites scale or collides with `motion/react`.

## Botanical Typography & Fixed Footer Specimen Ownership

The decorative `<FloralWord>` inside headings and the fixed `<VerlyseBackCoverSpecimen>` inside `Footer.tsx` (`src/components/ui/EditorialCraftSystem.tsx`) are owned by CSS + `motion/react`:
- `<FloralWord>` is purely decorative inline typography inside headings (`pointer-events-none` on SVG layers, no click/button semantics inside `<h1..h3>`).
- `<VerlyseBackCoverSpecimen>` (`data-footer-specimen="verlyse"`, `aria-hidden="true"`, `pointer-events-none`) renders the fixed `"Verlyse"` wordmark with static botanical SVG ornament behind/around Cormorant Garamond glyphs (`0` interactive or focusable descendants).
- Uses zero `<canvas>` elements and collapses cleanly under `useReducedMotion()`.
