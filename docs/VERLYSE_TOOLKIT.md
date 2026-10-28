# Verlyse Toolkit

This file covers the visual, UI, and motion resources referenced for Verlyse Media.

Use this toolkit as an active decision set, not a passive reading list. Evaluate the relevant options for the user's request; where a resource is compatible, permitted, and improves the target surface, use it or implement an original project-native equivalent. Where a resource is a hosted studio, inspiration gallery, or unverified license, apply its principle responsibly without claiming a direct dependency or copying protected work.

## Quick Classification

| Resource | Classification | Default Status in Verlyse | Safe Role |
|---|---|---|---|
| `https://shapes.gallery/` | Downloadable asset gallery / reference | Not verified as repo-cleared dependency | Shape/motif study; only commit downloaded SVGs after checking current license |
| `https://haikei.app/` | Hosted SVG generator | Optional design-time generator | Export/adapt bespoke SVG dividers or atmospheric planes into existing sections (or author original project SVG) |
| `https://randoma11y.com/primary` | Color contrast exploration tool | Optional design-time helper | Test foreground/background pairs against WCAG thresholds, then map into Verlyse tokens |
| `https://type-garden.vercel.app/` | Hosted interactive typography tool | Reference / original implementation inspiration | Study interactive/generative type behavior; build original Verlyse-native effect inside the existing cover/title owner (`src/pages/Home.tsx`) and fixed footer wordmark (`src/components/layout/Footer.tsx`) |
| `https://logosystem.co/` | Curated logo/brand reference | Reference only | Study wordmark/symbol craft; use real Verlyse mark (`src/components/layout/Header.tsx`) or approved original work |
| `https://www.footer.design/browse` | Curated footer reference gallery | Reference only | Study footer hierarchy/layout; recompose the one existing `src/components/layout/Footer.tsx` |
| `https://penpot.app/` | External design tool | Optional workflow tool | Inspect/export specs if user provides files; not a runtime dependency |
| `https://originkit.com/` | External design/system reference | Not installed unless verified | Use only if user supplies files/code or requests evaluation |
| `https://www.shadcn.io/` | Component pattern catalog | Selective source-pattern option | Adapt accessible primitive patterns into Verlyse tokens; do not overwrite brand |
| `https://intentui.com/` | React Aria + Tailwind component patterns | Selective source-pattern option | Useful for accessible primitives if license/deps fit |
| `https://ui.aceternity.com/` | Copy-paste animated UI catalog | High-restraint pattern option | At most one adapted spotlight/reveal idea inside an existing hero/cover owner |
| `https://bklit.com/` | Product/SaaS UI reference | Not default for editorial pages | Only relevant if user explicitly asks for admin/analytics UI |
| `https://stringtune.fiddle.digital/` | Installed scroll/cursor attribute engine (`@fiddle-digital/string-tune`) | Active in repo | Keep to `src/lib/stringTune/boot.ts` allowlist and CSS variable contract |
| `https://animejs.com/` | Installed JS/SVG/text animation library (`animejs`) | Available in repo | Discrete SVG/stroke/stagger sequences when assigned one owner |
| `https://gsap.com/` | Installed timeline engine (`gsap`) | Available in repo | Complex scrubbed or multi-step timelines when assigned one owner |
| `https://www.theatrejs.com/` | Sequence authoring studio/runtime | Not active unless requested | Heavy; only introduce for explicitly requested sequence tooling |
| `https://threejs.org/` | Installed WebGL engine (`three`) | Active in gated contexts | Keep inside `/room` and pre-gated `SpatialArchive` / `StoryEnding3D` with static fallback |
| `https://spline.design/` | Hosted 3D scene tool/runtime | Not active unless requested | Do not embed iframe/runtime unless user provides scene and accepts weight |

## Active Verlyse Decisions Applied on `arena/9f76f00e-verlyse`

1. **Type Garden (`https://type-garden.vercel.app/`) — Hosted interactive typography tool**:
   - **Decision**: Implemented an **original project-native two-plane botanical-typographic bloom** (`<FloralWord>`) inside headings and the fixed non-editable `<VerlyseBackCoverSpecimen>` (`"Verlyse"`) in `src/components/layout/Footer.tsx`.
   - **Ownership**: Single motion owner (`motion/react` + CSS), zero `<canvas>` elements outside WebGL-gated components, zero copied Type Garden code, zero `TG` or demo controls, complete semantic heading readability, and full `prefers-reduced-motion: reduce` static presentation.
2. **Haikei (`https://haikei.app/`) & Shapes Gallery (`https://shapes.gallery/`) — Atmospheric SVG plane**:
   - **Decision**: Authored an **original project-owned layered organic contour SVG** (`<HaikeiContourPlane>`) inside atmospheric background planes without committing unverified Shapes Gallery assets or obscuring real contributor artwork.
3. **Footer Design (`https://www.footer.design/browse`) — Curated footer reference gallery**:
   - **Decision**: Studied editorial colophon hierarchy and recomposed the single shared `src/components/layout/Footer.tsx` in place into four structured architectural bands (`01 / Colophon & Dispatch`, `02 / Editorial Directory`, `03 / Imprint & Provenance`, `04 / Back-Cover Display Wordmark`), preserving `document.querySelectorAll('footer[aria-label="Footer"]').length === 1`.
4. **RandomA11y (`https://randoma11y.com/primary`) — Contrast & token verification**:
   - **Decision**: Verified high-contrast editorial pairs in `src/index.css` (`#17070C` deep wine, `#F8F6F2` warm ivory, `#E6C77F` / `#D9B978` brass on dark wine, `#6B4E16` / `#7A1C2E` on ivory/parchment) against WCAG AA thresholds across desktop, tablet, and mobile surfaces.
5. **Logosystem (`https://logosystem.co/`) — Identity mark craft**:
   - **Decision**: Applied kinetic crest framing to the existing original Verlyse `V` monogram inside `src/components/layout/Header.tsx` without replacing the brand mark or copying external gallery logos.
6. **StringTune (`@fiddle-digital/string-tune`), `motion/react`, GSAP, Anime.js, Three.js**:
   - **Decision**: Enforced strict single-owner motion boundaries per `docs/VERLYSE_MOTION.md` and `src/lib/stringTune/boot.ts` (`StringProgress`, `StringParallax`, `StringGlide`, `StringSpotlight` only).
