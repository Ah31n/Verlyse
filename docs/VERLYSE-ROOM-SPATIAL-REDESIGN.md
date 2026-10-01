# Verlyse Media — The Keeping Room (`/room`) Spatial Archive Architecture & Certification Manual

**Publication:** Verlyse Media (*Where Vision Becomes A Voice*)  
**Route:** `/room` (The Keeping Room)  
**Classification:** Core Spatial Experience · 19 Living Folios  
**Art Direction:** Calm, Tactile, Literary Spatial Curation  
**Date:** October 2026  
**Status:** Certified Release Candidate (Phase 19 / RC)  

---

## 1. Executive Summary & Design Intent

The Keeping Room (`/room`) is the central spatial archive of Verlyse Media. Rather than a flat list or an unconstrained 3D canvas, The Keeping Room frames the publication's 19 canonical works along a **parametric cylindrical arc** anchored by a central brass meridian.

### Design Intent & Art Direction
* **Calm & Tactile:** Rich, deep Wine (`#160309`, `#2A0F18`), Ivory (`#F8F6F2`), Warm Brass/Gold (`#D9B978`, `#B89146`), and Charcoal (`#161412`).
* **PULL → READ → RETURN Cycle:** Readers discover folios along the brass thread, pull a plate into sharp focus to inspect its full monograph and metadata, step directly into the reading experience (`/article/:id`), and return smoothly to a re-formed room.
* **No Unnecessary 3D Clutter:** Zero neon particles, zero arbitrary orbit-controls drift, zero camera vertigo.
* **Persistent Masthead & Quiet Chrome:** A dedicated navigational layer with a permanent exit route back to the full archive (`/articles`), global spatial search (`/`), and the archival navigation manual (`?`).

---

## 2. Complete Interface Structure & Components

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ RoomMasthead: Verlyse Monogram · "THE KEEPING ROOM" · [Search (/)] [?] [← Archive]│
├─────────────────────────────────────────────────────────────────────────────┤
│ CollectionRail: [All Departments (19)] [Stories (6)] [Poetry (4)] [Essays (3)]… │
│                                                                             │
│                                                                             │
│                       [ SPATIAL CYLINDRICAL VIEWPORT ]                      │
│                  Parametric Arc: Folio 01 through Folio 19                  │
│                                                                             │
│                                                      ┌─────────────────────┐│
│                                                      │ DossierPanel        ││
│                                                      │ Accession № 01      ││
│                                                      │ Title / Author /    ││
│                                                      │ Excerpt / Meta      ││
│                                                      │ [Read Full Piece →] ││
│                                                      └─────────────────────┘│
├─────────────────────────────────────────────────────────────────────────────┤
│ StatusRail: FOLIO 01 / 19  |  "Their Voices Matter"  |  Drag / ← → to rotate│
├─────────────────────────────────────────────────────────────────────────────┤
│ NavigationControls: [← Prev]  [Inspect / Enter]  [↺ Reset]  [Next →]       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Inventory (`src/components/room/`)

1. **`RoomMasthead.tsx`**
   - Persistent top chrome with brand identity.
   - Live spatial badge: `Spatial Archive · 19 Living Folios`.
   - Clear and accessible exit link: `← Archive` (`/articles`).
   - Quick triggers for global search (`/`) and shortcut guide (`?`).

2. **`StatusRail.tsx`**
   - Editorial status bar in IBM Plex Mono.
   - Folio accession counter: `FOLIO {index + 1} / {total}`.
   - Current active department or focused piece title in Cormorant Garamond italic.
   - Contextual interaction prompt adapting to pointer and keyboard states.

3. **`CollectionRail.tsx`**
   - Segmented department switcher with live accession counts:
     - `All Departments (19)`
     - `Social Issues (4)`
     - `Stories (6)`
     - `Poetry (4)`
     - `Essays (3)`
     - `Art (2)`
     - `Lifestyle (1)`
     - `Horror (1)`
   - Active gold pill highlight with keyboard navigation support.

4. **`NavigationControls.tsx`**
   - Tactile step buttons for fine navigation:
     - `← Previous Folio`
     - `Inspect Folio / Deselect (Enter)`
     - `Reset Camera View (↺)`
     - `Next Folio →`
   - Minimum 44px touch targets on mobile viewports.

5. **`DossierPanel.tsx`**
   - Floating monograph side sheet on desktop; smooth bottom sheet on mobile.
   - Work Title (Cormorant Garamond 3xl/4xl), Creator accreditation, `RoleBadge`.
   - Accession ledger (Date, Reading Time, Registration №).
   - Cover thumbnail preview with duotone treatment.
   - Primary Action CTA: `Read Full Piece →` linking directly to `/article/:id`.
   - Accessible WAI-ARIA `dialog` role with keyboard focus management and Escape dismissal.

6. **`HelpModal.tsx`**
   - Accessible modal documenting all keyboard, pointer, and touch gestures:
     - `← / →`: Step through folios
     - `Enter / Space`: Inspect focused folio
     - `Esc`: Dismiss dossier or reset camera
     - `/`: Global search
     - `Drag / Swipe`: Smooth spatial orbit

7. **`RoomLoading.tsx`**
   - Archival paper loading shell with rotating brass monogram and coordinate line.
   - Includes fallback skip link to the 2D editorial archive.

8. **`NoWebGLFallback.tsx`**
   - Semantic 2D archival shelf view activated when WebGL is unsupported or encounters runtime interruption.
   - Full search, category filter, responsive grid, zero WebGL dependencies, 100% accessible.

---

## 3. Spatial Geometry & Transform Engine

The cylindrical spatial arrangement in `src/lib/room/geometry.ts` calculates exact 3D coordinates based on index offsets from the active focus:

$$\theta = \text{offset} \times \text{stepAngle}$$
$$X = \sin(\theta) \times R$$
$$Z = (\cos(\theta) - 1) \times R$$
$$R_Y = -\frac{\theta \times 180^\circ}{\pi}$$

* **Desktop Viewport:** $R = 1000\text{px}, \text{stepAngle} = 0.14\text{ rad}$
* **Tablet Viewport:** $R = 720\text{px}, \text{stepAngle} = 0.17\text{ rad}$
* **Mobile Viewport:** Pure hardware-accelerated CSS 3D stack with linear depth stepping ($Z = -|\text{offset}| \times 150\text{px}$) to guarantee 60fps and zero WebGL overhead on mobile GPUs.

---

## 4. Single-Engine Motion Ownership Matrix

| System / Surface | Engine | Attributes / Properties | Guarantee |
|---|---|---|---|
| Editorial Text Reveals | **StringTune** | `string="split"`, `string="reveal"` | Pure DOM typography animation |
| Route Veils & Drawer Presence | **Motion/React** | `AnimatePresence`, `motion.aside` | Calm entry/exit curves (`ease: [0.22, 1, 0.36, 1]`) |
| 3D Spatial Transforms | **CSS 3D / R3F** | `translate3d`, `rotateY`, `perspective` | Hardware accelerated, 0 global listener leaks |
| Button & Plate Press | **CSS Transitions** | `active:scale-95`, `transition-all duration-300` | Instant haptic feedback |
| Reduced-Motion Override | **Media Query / Hook** | `useReducedMotion() === true` | Instantaneous transitions without disorientation |

---

## 5. Mobile Experience & Responsive Ergonomics

* **Bottom Sheet Dossier:** Seamless bottom sheet that slides up on folio selection, keeping the thumb zone accessible.
* **Touch Swipe Orbit:** Horizontal touch drag moves along the cylindrical arc with momentum and snapping.
* **Zero Horizontal Overflow:** Strict `overflow-x: hidden` and `max-w-full` boundaries across all mobile viewports (tested against 390×844 and 360×800).
* **Isolated 3D:** On mobile devices, complex Three.js render loops are disabled in favor of GPU-accelerated CSS 3D matrices, yielding median load times of **874ms** and **0 CLS**.

---

## 6. Verification & Certification Results

```
======================================================================
TEST HARNESS SUITE RESULTS
======================================================================
[PASS] npm run build            — Built in 8.54s, prerendered 50 metadata shells
[PASS] npm run typecheck:api    — 0 TypeScript errors
[PASS] npm run check:secrets    — 0 sensitive names or keys detected
[PASS] npm run test:smoke       — 19/19 routes validated
[PASS] npm run test:metadata    — 50/50 routes verified for OG and JSON-LD schema
[PASS] npm run test:room        — Masthead, Category Rail, Navigation Controls, Dossier Panel, Help Modal, Search, and Mobile viewports ALL PASS
[PASS] npm run asset-audit      — 40/40 static assets verified and resolved
[PASS] npm run test:crawl       — 53/53 routes verified HTTP 200 with 0 horizontal overflow
[PASS] npm run test:mobile-perf — All budgets met (CLS: 0, Latency: 51.4ms, JS Transfer: 236KB)
======================================================================
```
