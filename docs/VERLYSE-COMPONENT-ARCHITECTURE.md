# VERLYSE MEDIA — COMPONENT ARCHITECTURE & OWNERSHIP MANUAL
## Creative Component System, Domain Sovereignty & Composition Logic
*Creative Director Pass 02 · Version 2.0.0 · Verlyse Production Architecture*

---

### 1. Architectural Philosophy

Verlyse Media does not treat user interface components as atomic isolated widgets or generic SaaS building blocks. Every component is designed as an **authored publication artifact** reflecting the tactile materiality of a physical literary revue:
* **Wine & Charcoal Grounds** (`#2d080a`, `#1a060c`, `#160408`) representing private reading chambers and dark inkwells.
* **Warm Ivory & Cream Paper** (`#faf6f0`, `#f8f6f2`, `#f5efe6`) representing heavy matte cotton rag stock.
* **Gilded Brass & Aged Gold Hairlines** (`#d9b978`, `#c5a880`, `#b89146`) representing bookbinding foil, registration marks, and liturgical rules.
* **Three Expressive Typographic Registers**:
  1. *Cormorant Garamond* (The Voice of Authority & Emotion)
  2. *Inter* (The Voice of Functional Clarity & Reading Measure)
  3. *IBM Plex Mono* (The Voice of Archival Ledger & Provenance)

---

## 2. Component Hierarchy & Directory Topology

```
src/components/
├── archive/              # Archival Catalog, Shelf & Matrix Systems
│   ├── ArchiveFilterBar.tsx   # Category pills & interactive search triggers
│   ├── ArchiveMatrix.tsx      # Heterogeneous masonry wall with hover recession
│   ├── ArchiveObject.tsx      # Compound archival tile with spotlight & focus
│   ├── ArchiveShelf.tsx       # 3D horizontal spatial scroll shelf
│   ├── FolioPlate.tsx         # Physical ivory plate with ghost numerals
│   ├── IndexLedger.tsx        # Tabular live feature, author, and date counters
│   └── index.ts
│
├── article/              # Longform Editorial Reading Room
│   ├── ReadingCanvas.tsx      # Calibrated 68ch reading measure with typography pacing
│   └── index.ts
│
├── contributors/         # Contributor Guild & Human Authorship
│   ├── ContributorCard.tsx    # Dossier card with duotone portrait & work count
│   ├── InteractivePortrait.tsx# Sepia-to-tone hover transition plate
│   ├── RoleBadge.tsx          # House accreditation badge (Poet, Painter, Essayist)
│   └── index.ts
│
├── editorial/            # Pure Editorial & Compound Publishing Objects
│   ├── ArticleHero.tsx        # Master hero plate with split title & colophon
│   ├── EditorialFolio.tsx     # Folio labels, stamps, and brass fleuron rules
│   ├── FolioCard.tsx          # Universal compound folio object
│   ├── GenerativeGraphics.tsx # Haikei-inspired generative SVGs & seals
│   ├── PullQuotePlate.tsx     # Dual-theme (Wine/Paper) quotation plate
│   ├── SectionIntro.tsx       # Asymmetric chapter & wing entrance headers
│   └── index.ts
│
├── interaction/          # Interaction Intelligence & Pointer Physics
│   ├── EditorialCursor.tsx    # Contextual spring cursor (READ, ENTER, VIEW, OPEN, DRAG)
│   ├── MagneticControl.tsx    # 3-axis spring magnetic attraction wrapper
│   ├── physics.ts             # Authoritative motion tokens, eases & distances
│   ├── ReadingProgressLine.tsx# Pinned 1px brass scroll hairline
│   ├── SmoothScrollProvider.tsx # Non-competing Lenis smooth scroll bridge
│   ├── SpotlightCard.tsx      # Radial key-light pointer tracker (2800K brass)
│   └── index.ts
│
├── layout/               # Publication Chrome & Spatial Shells
│   ├── Dock.tsx               # Minimal floating bottom utility bar
│   ├── Footer.tsx             # Archival colophon & dispatch desk
│   ├── Header.tsx             # Masthead, navigation drawer, & live search trigger
│   ├── Layout.tsx             # Global root wrapper with StringTuneProvider
│   ├── Preloader.tsx          # Lifting threshold veil with session memory
│   ├── SavedDrawer.tsx        # Accessible bookmark drawer with local storage
│   └── SearchOverlay.tsx      # Command-style accessible modal search
│
├── motion/               # Engine Lifecycle & Module Registry
│   ├── StringTuneAdapter.tsx  # Declarative StringTune wrapper
│   ├── StringTuneProvider.tsx # Global StringTune 60 FPS engine initialization
│   └── index.ts
│
├── navigation/           # Structural Wayfinding & Breadcrumbs
│   ├── BreadcrumbFolio.tsx    # Minimalist archival breadcrumb path
│   └── index.ts
│
├── spatial/              # Isolated 3D Computing & WebGL Objects
│   ├── SpatialArchive.tsx     # Ambient 3D background behind cover
│   ├── SpatialLink.tsx        # Magnetic portal node linking to /room
│   └── StoryEnding3D.tsx      # Interactive 3D artifact ending in reading rooms
│
├── room/                 # The Keeping Room (/room) Dedicated Spatial Environment
│   ├── BrassThread.tsx        # Spatial 3D spline ribbons
│   ├── Plate.tsx              # Floating 3D archival planes with raycasting
│   └── Room.tsx               # Full WebGL scene with orbit & momentum damping
│
└── ui/                   # Unstyled Accessible Primitives & Shared Utility Components
    ├── Accordion.tsx          # Accessible Radix accordion
    ├── ArticleClosing.tsx     # Designed slide conclusion blocks & motif dividers
    ├── Badge.tsx              # Small pill badges
    ├── Button.tsx             # Styled button variants with brass focus rings
    ├── Dialog.tsx             # Accessible Radix modal dialog
    ├── EasterEggs.tsx         # Marginalia, library cards, and hidden quotes
    ├── Reveal.tsx             # Scroll-linked mask entrance
    ├── ScrollArea.tsx         # Accessible custom scroll viewport
    ├── Tooltip.tsx            # Accessible footnote hover cards
    └── index.ts
```

---

## 3. Technology Sovereignty & Allocation Matrix

| Technology | Domain Sovereignty | Responsibilities | What It Must NEVER Do |
|---|---|---|---|
| **StringTune** (`@fiddle-digital/string-tune`) | Interaction Choreography & Key-Lighting | `StringSpotlight` on cards, `StringMagnetic` on CTAs, `StringProgress` on reading bar, `StringSplit` on editorial headings, `StringSequence` on cover entrance, `StringLerp` on hover elevations, `StringMasonry` on matrix. | Never block native scrolling; never run competing render loops with React state. |
| **Motion** (`motion/react`) | React Component State & FLIP Layout | Route-level veil transitions (`PageTransition`), Dialog mount/unmount (`AnimatePresence`), FLIP layout animations (`layoutId`) when filtering folios. | Never attach unthrottled global mousemove handlers in component render trees. |
| **Radix UI** (`@radix-ui/*`) | Accessible Behavior Primitives | Keyboard traps, Escape-key dismissal, focus restoration, ARIA attributes for `Dialog`, `Tooltip`, `Accordion`, `DropdownMenu`. | Never ship default un-styled grey SaaS chrome. |
| **Three.js / R3F** | Spatial 3D Computing | Full-screen spatial archive (`/room`), ambient cover depth (`SpatialArchive`), 3D article ending artifacts (`StoryEnding3D`). | Never render 3D on purely textual/editorial reading views. |
| **CSS / Tailwind** | Visual Baseline & Typographic Hierarchy | Fluid font clamp scales, baseline vertical grid, color token declarations, responsive breakpoints, print styles. | Never use complex JS animations for simple 150ms hover state changes. |

---

## 4. Compound Editorial Objects

### 1. The Folio Object (`<FolioCard />`)
- **Composition**: Ghost Numeral + Duotone Photographic Plate + Category Stamp + Cormorant Serif Title + Contributor Accreditation + Tabular Reading Duration + Pointer Spotlight (`string="spotlight"`) + Contextual Cursor Mode (`data-cursor="article"`).
- **Behavior**: Elevated z-index and 2800K brass key-light tracking the pointer coordinate; graceful drop-shadow cast onto neighboring ground.

### 2. The Contributor Plate (`<ContributorCard />` + `<InteractivePortrait />`)
- **Composition**: Duotone author portrait + 1px brass corner registration brackets + House role badge + Written biography excerpt + Total published folio count + Magnetic dossier link.
- **Behavior**: Hover smoothly transitions photograph from warm sepia duotone to rich contrast; cursor displays `"DOSSIER"`.

### 3. The Archive Matrix Object (`<ArchiveObject />`)
- **Composition**: Folio index number + Department taxonomy motif + Cormorant title + Excerpt excerpt + Contributor signature + Live keyboard focus ring.
- **Behavior**: Hovering causes active tile to scale subtly (`scale: 1.01`) while non-focused tiles gently recede (`opacity: 0.4`), maintaining visual hierarchy across dense grids.

### 4. The Pull-Quote Plate (`<PullQuotePlate />`)
- **Composition**: Oversized 120px watermark quotation mark + Cormorant italic text + 1px brass delimiter + Tabular attribution metadata colophon.
- **Variants**: `wine` (deep dark academia ground) and `paper` (creamy archival cotton stock).

---

## 5. Interaction Density System

To prevent visual fatigue, Verlyse divides every surface into three calibrated density levels:

1. **Level 1: Static / Contemplative** (e.g. Longform body text in `/article/:id`, Colophon in `/about`, Institutional FAQ in `/ambassadors`):
   - Zero gratuitous motion. Pure typography, high-contrast legibility, and generous breathing room.
2. **Level 2: Subtle / Reactive** (e.g. Category wing cards, Contributor index, Submission letterpress forms):
   - 150–250ms CSS/Motion transitions, responsive input line ink fills, gentle border illuminates on focus.
3. **Level 3: Expressive / Orchestrated** (e.g. Cover arrival `/`, Archive wall `/articles`, The Keeping Room `/room`):
   - Multi-stage StringTune sequence entrance, 3D spatial raycasting, dynamic spotlight key-lighting, and contextual cursor morphing.

---

## 6. Accessibility & Performance Guardrails

1. **Reduced Motion (`prefers-reduced-motion: reduce`)**:
   - Page transitions collapse to 0ms instant display.
   - Preloader veil is automatically skipped (`introSeen = true`).
   - 3D spatial scenes display static archival plates.
   - Cursor morphing is unmounted; native OS pointer remains active.
2. **Touch / Mobile Art Direction (`pointer: coarse`)**:
   - Custom cursor is strictly unmounted.
   - Magnetic attraction transforms into tactile active-press feedback (`active:scale-[0.98]`).
   - Hover recession is replaced with clean single-column linear touch stacks.
3. **Memory & Lifecycle Hygiene**:
   - All event listeners are passive and bound to element scopes.
   - Three.js WebGL contexts are properly disposed on route unmount.
   - Heavy 3D bundles (`three`, `@react-three/fiber`) are code-split into on-demand chunks.
