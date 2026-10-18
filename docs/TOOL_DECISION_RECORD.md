# Verlyse Tool Decision Record

## Primary Evaluations & Active Implementations (`src/components/ui/EditorialCraftSystem.tsx`)

### 1. Type Garden (`https://type-garden.vercel.app/`) — Fixed Botanical Typography & Back-Cover Specimen

- **Resource / Tool**: Type Garden (`https://type-garden.vercel.app/`)
- **Classification**: Hosted creative tool / interactive typography reference (treated strictly as a design reference, not an embedded widget/editor)
- **User Intent**: Adapt the botanical-typography craft principle into fixed, brand-owned Verlyse display typography and the back-cover wordmark specimen without exposing a user-editable generative editor or tool/demo labels.
- **Target Existing Owners**:
  - `src/components/ui/EditorialCraftSystem.tsx` (`<FloralWord>` and `<VerlyseBackCoverSpecimen>`)
  - Route `<h1>` / section display headers across `src/pages/Home.tsx` (`rose`, `magnolia`, `camellia`, `lotus`), `src/pages/Articles.tsx` (`laurel`), `src/pages/Categories.tsx` (`iris`), `src/pages/Creators.tsx` (`lotus`), `src/pages/Community.tsx` (`marigold`), `src/pages/About.tsx` (`camellia`), `src/pages/Ambassadors.tsx` (`astrolabe-bloom`), `src/pages/Submit.tsx` (`magnolia`), and `src/pages/Contact.tsx` (`wax-rose`)
  - Single shared `src/components/layout/Footer.tsx` (Band 04 fixed back-cover `<VerlyseBackCoverSpecimen>`)
- **Compatibility Check**:
  - `<FloralWord>` wraps the italicized accent word of each route's `<h1>` with a decorative baseline bough and outer-terminal botanical sprigs (`aria-hidden="true"`, `pointer-events-none`) without crossing letterforms or adding nested interactive controls inside headings.
  - `<VerlyseBackCoverSpecimen>` inside `Footer.tsx` renders a fixed, non-editable, brand-owned `"Verlyse"` back-cover specimen (`data-footer-specimen="verlyse"`, `aria-hidden="true"`, `pointer-events-none`) with zero inputs, selects, radios, buttons, download links, focusable descendants, `TG`+digit codes, or generic tool-demo labels.
  - Uses 100% inline `<svg>` (zero `<canvas>` elements), preserving the `no-webgl-fallback` (`canvases === 0`) check and `jsdom` compatibility.
- **Rights / License Check**: Zero Type Garden code, controls, sample labels, IDs, or assets copied; 100% original project-authored React + SVG implementation.
- **Accessibility / Reduced Motion Impact**: Full semantic `<h1>` text and footer tagline remain intact on every route; decorative SVG layers are `aria-hidden="true"`.
- **Decision**: Implemented original project-native `<FloralWord>` across routes and fixed `<VerlyseBackCoverSpecimen>` in `src/components/layout/Footer.tsx`.
- **Evidence**: Verified in `src/components/ui/EditorialCraftSystem.tsx`, `npm run build`, `npm run test:flows` (`14/14`), `node scripts/interaction-audit.mjs` (`18/18`), and 8-viewport × 11-route (`88/88`) Chromium verification.

### 2. Dot Matrix System (`<DotMatrixLedger>`)

- **Resource / Tool**: 5×7 Dot-Matrix Punch-Card Counter & Telemetry Strip
- **Classification**: Project-native SVG capability (`src/components/ui/EditorialCraftSystem.tsx`)
- **User Intent**: Integrate intentional dot-matrix counters derived strictly from canonical data (`src/data/content.ts`) across route mastheads without synthetic `TG` or demo codes.
- **Target Existing Owners**: `Home.tsx` (`2007`), `Articles.tsx` (`2007`), `Categories.tsx` (`0720`), `Creators.tsx` (`1516`), `Community.tsx` (`0520`), `About.tsx` (`0420`), `Ambassadors.tsx` (`1003`), `Submit.tsx` (`0704`), and `Contact.tsx` (`0301`).
- **Decision**: Implemented in `src/components/ui/EditorialCraftSystem.tsx` (`DOT_GLYPHS` 5×7 numeric bitmap matrix rendered as inline `<svg aria-hidden="true">` with live counts derived from `src/data/content.ts`).

### 3. Logosystem (`https://logosystem.co/`) & Shapes Gallery (`https://shapes.gallery/`) — `<RouteEmblemSeal>` & Header Monogram

- **Resource / Tool**: Logosystem (`https://logosystem.co/`) & Shapes Gallery (`https://shapes.gallery/`)
- **Classification**: Reference galleries → Original project-native SVG emblem system
- **User Intent**: Apply intentional logo geometry and editorial shapes across the masthead logo and route headers.
- **Target Existing Owners**:
  - `src/components/layout/Header.tsx`: Upgraded the Verlyse `V` monogram with an octagonal registration ring, cardinal compass ticks, split-serif `V`, and crimson-gold botanical calyx node.
  - `src/components/ui/EditorialCraftSystem.tsx` (`<RouteEmblemSeal>`): Route-specific geometric seals (`octagram` on Home, `rosette` on Articles, `prism` on Categories, `vesperal` on Creators, `amphora` on Community, `pillars` on About, `astrolabe` on Ambassadors, `crosshair` on Submit, `wax-seal` on Contact).
- **Rights / License Check**: Zero third-party gallery logos or Shapes Gallery SVGs copied; 100% original project-authored SVG geometry.
- **Decision**: Implemented in `src/components/layout/Header.tsx` and `src/components/ui/EditorialCraftSystem.tsx`.

### 4. Haikei (`https://haikei.app/`) — `<HaikeiContourPlane>`

- **Resource / Tool**: Haikei (`https://haikei.app/`)
- **Classification**: Hosted creative tool → Original project-native SVG contour plane
- **User Intent**: Give every route hero and the back-cover wordmark plate intentional layered organic wave contours without obscuring real artwork.
- **Target Existing Owners**: `src/components/ui/EditorialCraftSystem.tsx` (`<HaikeiContourPlane>`) integrated into `Home.tsx`, `Articles.tsx`, `Categories.tsx`, `Creators.tsx`, `Community.tsx`, `About.tsx`, `Ambassadors.tsx`, `Submit.tsx`, `Contact.tsx`, and `Footer.tsx`.
- **Decision**: Implemented deterministic seed-varied 3-path contour SVGs (`aria-hidden="true"`, `pointer-events-none`).

### 5. RandomA11y (`https://randoma11y.com/primary`) — Contrast-Verified Token Pairings

- **Resource / Tool**: RandomA11y (`https://randoma11y.com/primary`)
- **Classification**: Hosted creative tool / WCAG 2.1 contrast helper (design-time reference only)
- **User Intent**: Verify high-contrast accessible editorial tokens across Verlyse dark-wine, parchment, and brass surfaces without exposing tool/palette picker UI on the public site.
- **Target Existing Owners**: `src/index.css` tokens and `BACK_COVER_PALETTE` in `src/components/ui/EditorialCraftSystem.tsx` (`#17070C` deep oxblood, `#F8F6F2` warm ivory, `#E6C77F` / `#D9B978` antique brass, `#9E243C` crimson rose).
- **Decision**: Applied directly as fixed Verlyse design tokens without public palette-selector controls or demo contrast labels.

### 6. Footer Design (`https://www.footer.design/browse`) — Single Shared `Footer.tsx`

- **Resource / Tool**: Footer Design (`https://www.footer.design/browse`)
- **Classification**: Reference gallery
- **Target Existing Owner**: `src/components/layout/Footer.tsx`
- **Decision**: Recomposed the single shared `<footer aria-label="Footer">` into 4 architectural bands culminating in the fixed, non-editable `<VerlyseBackCoverSpecimen>` wordmark while strictly maintaining `document.querySelectorAll('footer[aria-label="Footer"]').length === 1`.
