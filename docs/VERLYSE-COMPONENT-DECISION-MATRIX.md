# VERLYSE MEDIA — COMPONENT DECISION MATRIX
## System Architecture, Ownership Hierarchy & Technology Allocation
*Creative Director Pass 02 · Version 2.0.0 · Verlyse Editorial Architecture*

---

### Executive Allocation Principles

Verlyse is engineered through a multi-tier interaction stack where **no single library owns everything**, and **no component is implemented without clear design intent**. Each ecosystem is assigned specific domain sovereignty:

1. **StringTune (`@fiddle-digital/string-tune`)**: Owns attribute-driven micro-interactions, scroll physics, spotlight key-lighting, magnetic attraction, kinetic typography, and masonry orchestration.
2. **Motion (`motion/react`)**: Owns React component state animations, enter/exit lifecycle transitions (`AnimatePresence`), FLIP layout reordering, and complex page transitions.
3. **Radix Primitives (`@radix-ui/*`)**: Owns unstyled, accessible UI behaviors (Dialog, DropdownMenu, Accordion, Tooltip, Popover, ScrollArea).
4. **Three.js / React Three Fiber (`three`, `@react-three/fiber`)**: Owns isolated spatial computing moments (The Keeping Room at `/room`, spatial story endings).
5. **CSS / Tailwind CSS**: Owns foundational layout, responsive breakpoints, editorial baseline rhythm, typography hierarchy, and zero-runtime tokens.

---

## The Decision Matrix

---

### 1. The Cover Entrance & Preloader Threshold
* **PROBLEM**: The reader arrives at the publication. We need an atmospheric veil that introduces the issue number, settles the masthead, and reveals the lead folio plate without blocking fast reader interaction or repeating on every visit.
* **BEST TOOL**: **Motion (`AnimatePresence`) + StringTune Sequence (`StringSequence`)**
* **WHY**: Motion handles React mount/unmount and threshold veil opacity transitions cleanly with `sessionStorage` awareness (`introSeen`), while StringTune orchestrates the staggered 60 FPS split-text reveal of the masthead.
* **ALTERNATIVES CONSIDERED**:
  * *Pure CSS keyframes*: Lacks unmount orchestration and fine-grained session memory control.
  * *GSAP Timeline*: Adds unnecessary runtime weight to initial render chunk.
* **IMPLEMENTATION**: `src/components/layout/Preloader.tsx` + `src/components/motion/StringTuneProvider.tsx` (`StringSequence`, `StringSplit`).
* **FALLBACK**: When `prefers-reduced-motion` is active or the reader has already visited in this session, the veil is skipped instantly (0ms) and the cover renders in resting layout state.

---

### 2. Contextual Cursor & Pointer Intelligence
* **PROBLEM**: As the mouse travels across diverse publication surfaces (editorial plates, spatial portals, longform text, archive cards, external links), the pointer must communicate contextual affordances (`READ`, `ENTER`, `VIEW`, `OPEN`, `DRAG`) without visual lag or mobile interference.
* **BEST TOOL**: **StringTune Magnetic + Custom Spring Cursor (`useSpring`)**
* **WHY**: A custom cursor driven by high-frequency mouse coordinates with calibrated spring physics (`stiffness: 350, damping: 28`) ensures zero perceivable latency. Inspecting `data-cursor` attributes allows declarative markup to change cursor modes seamlessly.
* **ALTERNATIVES CONSIDERED**:
  * *Global CSS custom cursor images*: Inflexible, unable to display dynamic text, lacks spring smoothing.
  * *React component state re-rendering on every mousemove*: Causes extreme CPU thrashing; motion value springs avoid React render cycles entirely.
* **IMPLEMENTATION**: `src/components/interaction/EditorialCursor.tsx` (`setCursor`, `resetCursor`, `data-cursor="article|room|image|archive"`).
* **FALLBACK**: Automatically disabled on touch screens (`@media (pointer: coarse)`), mobile devices, and reduced-motion environments.

---

### 3. Radial Spotlight Key-Lighting on Editorial Plates
* **PROBLEM**: In a dark-academia interface (Wine, Charcoal, Ink), cards can feel flat. When a reader hovers over a folio plate or contributor card, we want a warm 2800K brass key-light to subtly track the pointer, highlighting fine archival borders and gold foil typography.
* **BEST TOOL**: **StringTune Spotlight (`StringSpotlight`) / `SpotlightCard`**
* **WHY**: `StringSpotlight` updates CSS custom radial gradients (`--spotlight-x`, `--spotlight-y`) directly via hardware-accelerated paint operations without triggering React reconciliation or layout recalculations.
* **ALTERNATIVES CONSIDERED**:
  * *Aceternity Spotlight drop-in*: Bundles heavy full-page canvas layers and SaaS-style neon gradients inappropriate for Verlyse.
  * *Static box-shadow hover*: Lacks dynamic cursor awareness and tactile physical presence.
* **IMPLEMENTATION**: `src/components/interaction/SpotlightCard.tsx` + declarative `string="spotlight"` attribute.
* **FALLBACK**: In mobile/touch modes, spotlight resolves to a subtle static border highlight (`border-gold/30`) with no pointer tracking.

---

### 4. Archive Matrix Masonry & Layout Paradigm Switcher
* **PROBLEM**: The Archive (`/articles`) must support two reading modes: a tactile physical **Folio Shelf** (sequential horizontal scroll) and an irregular **Editorial Wall** (masonry layout with varying card aspect ratios and pull-quote features), with instant filtering by category and search.
* **BEST TOOL**: **Motion (`layoutId`, `layout="position"`) + StringTune Masonry (`StringMasonry`)**
* **WHY**: Motion's FLIP layout engine animates position and scale transitions smoothly when switching layouts or filtering categories, while `StringMasonry` computes optimal column heights for heterogeneous cards.
* **ALTERNATIVES CONSIDERED**:
  * *CSS Multi-column*: Breaks item order horizontally and creates awkward breaks inside cards.
  * *Isotope.js*: Outdated jQuery-era library with heavy DOM manipulation.
* **IMPLEMENTATION**: `src/components/archive/ArchiveMatrix.tsx`, `ArchiveShelf.tsx`, and `ArchiveFilterBar.tsx`.
* **FALLBACK**: On mobile and reduced motion, the matrix falls back to a clean single-column linear stack with zero layout transitions.

---

### 5. Contributor Portraits & Guild Interactions
* **PROBLEM**: Contributor cards must convey human authorship, warmth, and craft. Hovering a writer or artist portrait should feel like inspecting an archival photographic plate rather than clicking a generic avatar.
* **BEST TOOL**: **Compound Component (`ContributorCard` + `InteractivePortrait`) + StringTune Spotlight**
* **WHY**: Combines subtle sepia-to-duotone CSS filter transitions, a 1px brass corner registration frame, role accreditation badges, and pointer spotlight key-lighting into a unified editorial object.
* **ALTERNATIVES CONSIDERED**:
  * *Raw circular avatar images*: Looks like a SaaS team page, destroying editorial tone.
  * *Heavy 3D card flips*: Distracting and difficult to navigate on mobile.
* **IMPLEMENTATION**: `src/components/contributors/ContributorCard.tsx`, `InteractivePortrait.tsx`, `RoleBadge.tsx`.
* **FALLBACK**: On touch devices, the card activates on tap and provides immediate visual feedback via an active border state.

---

### 6. Reading Room Progress & Longform Pacing
* **PROBLEM**: In deep reading rooms (`/article/:id`), the reader needs continuous awareness of their location in the text without intrusive floating counters or distracting UI clutter.
* **BEST TOOL**: **StringTune Progress (`StringProgress`) + `ReadingProgressLine`**
* **WHY**: Calculates exact scroll progress over the article container element and updates a 1px gold hairline pinned to the top masthead using non-linear easing (`easeInk`).
* **ALTERNATIVES CONSIDERED**:
  * *Window-level scroll listeners with React setState*: Causes frame drops during fast scrolling.
  * *Sticky sidebar progress wheel*: Clutters the reading margin and distracts from the text.
* **IMPLEMENTATION**: `src/components/interaction/ReadingProgressLine.tsx` + `src/components/article/ReadingCanvas.tsx`.
* **FALLBACK**: Native scroll bar provides standard progress indication; the hairline remains a subtle ambient bar.

---

### 7. Spatial 3D Artifacts & The Keeping Room
* **PROBLEM**: The publication requires a spatial dimension (`/room` and interactive article endings) where physical folios float in a dark-academia vault, allowing spatial exploration of artifacts.
* **BEST TOOL**: **Three.js + React Three Fiber (`@react-three/fiber`) + `@react-three/drei`**
* **WHY**: R3F provides declarative scene graph management in React with native WebGL rendering, orbit damping, normal mapping, and raycasting. Isolated into a separate lazy-loaded chunk (`three.js`) so non-spatial routes remain lightweight (~450 KB).
* **ALTERNATIVES CONSIDERED**:
  * *CSS 3D transforms*: Lacks true spatial depth, lighting, procedural shadows, and multi-object raycasting.
  * *Full-site WebGL canvas*: Overwhelms device memory and degrades accessibility and SEO.
* **IMPLEMENTATION**: `src/pages/Room.tsx`, `src/components/room/Room.tsx`, `src/components/spatial/StoryEnding3D.tsx`.
* **FALLBACK**: `SpatialBoundary` error boundary captures any WebGL failure/incompatibility and gracefully displays an archival typographic fallback plate with direct links to all folios.

---

### 8. Generative Dividers & Archival Graphic Accents
* **PROBLEM**: Section breaks and chapter conclusions must avoid generic straight lines or corporate divider widgets. They need to look like hand-drawn ink contours, archival watermarks, and stamped wax seals.
* **BEST TOOL**: **Haikei-inspired Generative SVG + Lucide Icons + Custom Motifs**
* **WHY**: Generative mathematical SVG path curves (`ChapterDivider`, `ArchivalSeal`, `MotifDivider`) provide infinite resolution, zero external network requests, zero bundle weight, and pure CSS stroke/fill styling matching Verlyse color tokens.
* **ALTERNATIVES CONSIDERED**:
  * *PNG/WebP graphic dividers*: Heavy file size, blurry on high-DPI screens, impossible to recolor dynamically.
  * *Lottie animations*: Unnecessary runtime library overhead for static/subtle vector shapes.
* **IMPLEMENTATION**: `src/components/editorial/GenerativeGraphics.tsx`, `src/components/ui/ArticleClosing.tsx`.
* **FALLBACK**: SVGs render statically with identical visual fidelity across all browsers and devices.

---

### 9. Accessible Modals, Drawers & Navigation Menus
* **PROBLEM**: Search overlays, mobile navigation drawers, saved folio drawers, and tooltip footnotes must be fully accessible (focus traps, Escape key to close, ARIA attributes, screen reader announcements) while matching the luxury dark-academia aesthetic.
* **BEST TOOL**: **Radix UI Primitives (`@radix-ui/react-dialog`, `@radix-ui/react-tooltip`, `@radix-ui/react-accordion`)**
* **WHY**: Radix primitives provide unstyled, robust, WAI-ARIA compliant behavior while allowing complete creative freedom over Tailwind/CSS styling, animations, and typography.
* **ALTERNATIVES CONSIDERED**:
  * *Hand-rolled modal state with divs*: Frequently causes accessibility bugs (missing focus locks, broken screen reader semantics).
  * *Bootstrap/Material Dialogs*: Ships opinionated styles that clash with Verlyse's visual identity.
* **IMPLEMENTATION**: `src/components/ui/Dialog.tsx`, `Tooltip.tsx`, `Accordion.tsx`, `src/components/layout/SearchOverlay.tsx`.
* **FALLBACK**: Standard accessible behavior is preserved out-of-the-box across all screen readers, keyboards, and mobile browsers.

---

### 10. Tactile Letter-to-the-Desk Forms
* **PROBLEM**: The submission (`/submit`) and correspondence (`/contact`) pages should evoke writing on archival stationery rather than filling out a generic corporate form.
* **BEST TOOL**: **Custom Controlled React Forms + StringTune Impulse (`StringImpulse`) + Motion Shake Feedback**
* **WHY**: Floating labels in `Inter` and `IBM Plex Mono`, bottom border ink-fill animations on focus, and subtle physical impulse responses provide tactile confirmation without overwhelming the applicant.
* **ALTERNATIVES CONSIDERED**:
  * *Boxed input fields with blue focus rings*: Destroys the editorial aesthetic.
* **IMPLEMENTATION**: `src/pages/Submit.tsx`, `src/pages/Contact.tsx`.
* **FALLBACK**: Standard HTML5 validation and visible high-contrast focus rings when keyboard focus is active.

---

## 3. Technology Matrix Summary

| Layer | Primary Library | Allocation Ratio | Key Use Cases |
|---|---|---|---|
| **Interactions & Key-Lighting** | StringTune (`@fiddle-digital/string-tune`) | 35% | Spotlight, Magnetic, Progress, Split, Sequence, Parallax, Lerp |
| **Component & Page Transitions** | Motion (`motion/react`) | 30% | Route veils, Modal mount/unmount, FLIP layout animations, Stagger |
| **Accessible Primitives** | Radix UI (`@radix-ui/*`) | 15% | Dialogs, Drawers, Accordions, Tooltips, Tabs |
| **Spatial 3D Experiences** | Three.js / React Three Fiber | 10% | The Keeping Room (`/room`), 3D Article endings |
| **Foundational Styles & Tokens** | Tailwind CSS / Pure CSS | 10% | Typography, Baselines, Spacing tokens, Fluid clamp typography |
