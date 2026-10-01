# Verlyse Media — Interaction & Component Ownership Matrix

> **Rule Zero:** No DOM node or layout dimension may be controlled by competing animation or interaction engines. Every engine has a clearly demarcated sphere of ownership with strict boundary contracts.

---

## 1. Engine Sphere of Responsibility

```
                                      ┌─────────────────────────────────────────────────────────────┐
                                      │                        VERLYSE DOM                          │
                                      └──────────────────────────────┬──────────────────────────────┘
                                                                     │
            ┌────────────────────────┬───────────────────────────────┼──────────────────────────────┬────────────────────────┐
            ▼                        ▼                               ▼                              ▼                        ▼
     ┌─────────────┐          ┌─────────────┐                 ┌─────────────┐                ┌─────────────┐          ┌─────────────┐
     │ STRINGTUNE  │          │   MOTION    │                 │    GSAP     │                │ RADIX/SHADCN│          │  R3F/THREE  │
     │  (@fiddle)  │          │(motion/react│                 │(ScrollTrig) │                │ (Primitives)│          │  (Spatial)  │
     └──────┬──────┘          └──────┬──────┘                 └──────┬──────┘                └──────┬──────┘          └──────┬──────┘
            │                        │                               │                              │                        │
  • Editorial scroll hooks  • React lifecycle enter/exit    • Higgsfield camera scrubs     • WAI-ARIA dialogues     • Spatial archive arc
  • Contextual cursor layer • Shared layout (layoutId)      • Multi-axis dolly timelines   • Keyboard roving index  • Story ending 3D scenes
  • Micro-spotlight math    • State-driven sheet expands    • Master narrative sequences   • Search Command overlay • Parametric brass ribbon
  • Magnetic CTA physics    • Touch gesture drag states     • Complex scrubbed zooms       • Popovers & tooltips    • Tone-mapped lighting
  • Text splitting streams  • Modal & drawer presence                                      • Focus trap & a11y      • WebGL fallbacks
```

---

## 2. Detailed Ownership Breakdown

### 1. STRINGTUNE (`@fiddle-digital/string-tune`)
* **Primary Role:** Editorial Scroll & Micro-Interaction Engine.
* **Exact Surfaces Owned:**
  - `StringCursor`: Renders custom contextual cursor ring with role morphing (`read`, `image`, `article`, `drag`, `room`).
  - `StringParallax`: Multi-plane depth lag calculations for section backgrounds and editorial stamps.
  - `StringSpotlight`: Radial key-light coordinates tracking pointer position on archive folios and chamber doors.
  - `StringMagnetic`: Sub-pixel attraction for high-value CTAs ("Enter Archive", "Send your voice", "Read folio").
  - `StringProgress`: Non-blocking scroll progress tracking for reading progress indicators.
  - `StringSplit` & `StringSequence`: Orchestrated typographic reveals where text characters or words rise into view.
* **Non-interference Contract:** Never writes directly to React state per frame; writes to CSS variables (`--st-x`, `--st-y`, `--st-progress`) or transforms on dedicated inner wrapper spans.

### 2. MOTION (`motion/react`)
* **Primary Role:** Declarative React State, UI Transitions, and Layout Morphing.
* **Exact Surfaces Owned:**
  - `AnimatePresence`: Route transitions (`PageTransition`), modal overlays, menu reveals, mobile burger sheet.
  - `layoutId`: Seamless morphological layout shifts between category tabs and filter chips.
  - UI State Transitions: Bookmark saving confirmation animations, drawer opening/closing, reading mode toggles.
  - Drag Gestures: Film-strip touch and horizontal timeline scrubbing.
* **Non-interference Contract:** Operates exclusively on `<motion.*>` nodes. Never animates properties managed by GSAP or Three.js.

### 3. GSAP (`gsap` + `ScrollTrigger`)
* **Primary Role:** Cinematic Camera Moves & Multi-Phase Timeline Choreography.
* **Exact Surfaces Owned:**
  - `CrashZoom`: Full-viewport camera dolly-through on the homepage masthead.
  - `DepthStage` & `DepthLayer`: 3D tilt perspective passes for archival paper stacks.
  - `OrbitalDrift` & `PushIn`: Precise scrubbed camera orientation shifts on key narrative scenes.
* **Non-interference Contract:** Strictly encapsulated via `useCinematic`. Always animates an isolated inner container (`target(root)`), leaving the outer layout container untouched for React/Tailwind.

### 4. RADIX UI & SHADCN/UI
* **Primary Role:** Accessible, Unstyled Interaction Primitives & Owned UI Foundation.
* **Exact Surfaces Owned:**
  - `Command` (`cmdk` + Radix Dialog): The editorial search command layer (`⌘K`).
  - `Dialog` & `Drawer`: The Saved Stories shelf, contributor dossiers, image lightboxes.
  - `Tabs` & `Accordion`: Seven Rooms category selector, Submission guidelines, Colophon FAQ.
  - `Tooltip` & `Popover`: Contributor role badges, glossary annotations, archival citations.
  - `ScrollArea`: High-fidelity customized scrollbars in modals and command lists.
* **Visual Language Contract:** Replaced all generic default styles with Verlyse tokens: Wine (`#3B0D17`), Ivory (`#F8F6F2`), Gold (`#B89146`), 1px hairlines, Cormorant Garamond typography.

### 5. REACT BITS
* **Primary Role:** Creative Interaction Patterns & Tactile Text Effects.
* **Exact Surfaces Owned:**
  - Variable weight text hover reactions (`TextPressure`).
  - Ink-wash portrait displacement maps on contributor cards.
  - Staggered masonry cluster arrangements.

### 6. ACETERNITY UI
* **Primary Role:** Expressive Visual Depth & Layered Surfaces.
* **Exact Surfaces Owned:**
  - 3D Floating Folio plates with archival mat borders.
  - Directional spotlight hover cards on articles.
  - Atmospheric background glow gradients behind spatial moments.

### 7. MAGIC UI
* **Primary Role:** Micro-interactions, Marquees & Precision Accents.
* **Exact Surfaces Owned:**
  - Editorial ticker tape / Marquee streams for issue metadata and contributor credits.
  - Gold hairline border beams on primary CTAs.
  - Tabular numeral animated counters (`NumberTicker`) for platform ledger.

### 8. HAIKEI
* **Primary Role:** Generative Vector Thinking & Architectural Geometry.
* **Exact Surfaces Owned:**
  - Procedural topographic contours between publication sections.
  - Hand-drawn archival ink washes and wax seal vector marks.
  - Curved organic chamber dividers and paper fold silhouettes.

### 9. R3F / THREE.JS / DREI
* **Primary Role:** Pure Spatial Environments.
* **Exact Surfaces Owned:**
  - The Keeping Room (`/room`): 3D parametric helical cylinder of floating archival plates.
  - Story Endings 3D: Article-specific spatial seals and atmospheric particulate scenes.
  - ACES Filmic tone-mapping and deterministic seeded rendering.
* **Non-interference Contract:** Canvas rendered with `pointer-events: none` and `aria-hidden="true"`. Strictly gated behind WebGL capability detection and reduced-motion preferences.

### 10. LENIS
* **Primary Role:** Controlled Smooth Scroll Continuity.
* **Exact Surfaces Owned:**
  - Single master scroll instance coordinating document scroll delta for desktop readers without interfering with keyboard or accessibility tools.

---

## 3. Interaction State Hierarchy & Accessibility Contract

Every interactive element in Verlyse implements the **Octal State Spectrum**:

1. **Default**: Calibrated resting contrast conforming to WCAG 2.1 AA (min 4.5:1 ratio).
2. **Hover**: Smooth elevation or color shift on pointer devices (150ms–300ms `easeInk`).
3. **Focus-Visible**: High-visibility 1px Gold (`#B89146`) outline with 3px offset; never suppressed for keyboard users.
4. **Active / Pressed**: Subtle scale dip (`scale: 0.98`) simulating physical letterpress indentation.
5. **Disabled**: Reduced opacity (`0.4`), `cursor: not-allowed`, `pointer-events: none`, `aria-disabled="true"`.
6. **Loading**: Discrete skeleton pulse or animated hairline; no jarring layout shift.
7. **Success**: Inked checkmark or gold confirmation pulse (e.g. "Saved to shelf").
8. **Error**: Terracotta warning stroke (`#E8A2A2`), descriptive `aria-live="polite"` feedback.

---

## 4. Reduced Motion & Mobile Fallback Rules

* **Reduced Motion (`prefers-reduced-motion: reduce`)**:
  - All parallax translations = 0.
  - GSAP camera scrubs disabled; elements render at identity (`transform: none`, `opacity: 1`).
  - StringTune kinetic split reveals collapse to instant opacity `1`.
  - 3D canvases render static baseline views or graceful 2D fallbacks.
  - Page transitions become instant cross-fades (0.01s).
* **Mobile / Touch Devices (`pointer: coarse`)**:
  - `StringCursor` is completely unmounted.
  - Magnetic CTA attraction is disabled to prevent sticky offset bugs.
  - 3D hover tilts translate into gentle scroll-driven tilts or flat cards.
  - Full-screen accessible bottom sheets replace complex floating drawers.
