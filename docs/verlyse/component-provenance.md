# Component Provenance

Every new/changed component in the spatial layer, with source, purpose, Verlyse adaptation,
motion owner, and how it is verified.

| Source / provenance | Original pattern | Local file | Why needed | Changed for Verlyse | Motion owner | Verified by |
|---|---|---|---|---|---|---|
| Built in-house for this project (no external lib) | `three` + `@react-three/fiber` | `src/components/spatial/SpatialArchive.tsx` | The "enter the archive" spatial frame behind the homepage masthead | Restricted to the Verlyse palette (wine, wine-deep, gold, ivory); plates arranged as an editorial spine; deterministic from article IDs; bounded rAF; WebGL/reduced-motion fallback | three / r3f (inside Canvas only) | `npm run build` + preview HTTP 200; chunk split verified |
| Built in-house for this project | `three` + `@react-three/fiber` | `src/components/spatial/StoryEnding3D.tsx` | A quiet story-specific atmosphere behind the canonical signature | Tinted by the per-article ending palette; RESTING→ENTERING→ALIVE→REDUCED→FALLBACK; never replaces the semantic `ArticleSignature` | three / r3f | `npm run build` + preview HTTP 200 |
| Derived from the existing `content.ts` registry | `ArticleEndingDefinition` | `src/data/articleEndings.ts` | Registry mapping article → ending scene/palette/motion | Labels & scene kinds taken from the verified `ArticleSignature` map; unknown → `SOURCE-MISSING` (never invented) | n/a (data) | `tsc` passes |
| `src/lib/three/useWebGLSupport.ts` | — | WebGL detection hook for fallback gating | n/a | — | `tsc` passes |

## Explicitly NOT borrowed (no evidence of real use → not claimed)
- **Watermelon UI, Motion Primitives, Superdesign.dev, Vengeance UI, Skiper UI** — these are
  reference sources. No verified component was imported or copied into the workspace, so they are
  not credited as "used." No fabricated import paths were added.
- **GSAP, anime.js, `motion`** — deliberately omitted (see `animation-ownership.md`): the only
  real production responsibilities (spatial scene, scroll choreography, micro-motion) are already
  owned by three/r3f and Framer Motion. Adding them would violate one-property-one-owner.

## Library state (post-install)
- Added: `three`, `@react-three/fiber`, `@types/three`.
- Added then **removed**: `@react-three/drei` (not imported → removed to honor "no unused deps").
