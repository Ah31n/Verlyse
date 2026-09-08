# PHASE 18 — 02 · THE CONCEPT: "THE KEEPING ROOM"
**Spatial Publication Reimagination — design, interaction model, camera model, tool allocation**
**Status:** DESIGN PROPOSAL — no production code written yet (per Phase 18 rule 3)

**The visual prototype (this concept, made visible):** `phase18-lab/index.html` — the **Design Lab**. Open it in the Arena preview: a 15-state frame inspector (01 Arrival … 15 Mobile article, real covers, real registry copy, the site's own fonts) plus a **Journey mode** that plays the whole performance — arrival → discovery → focus → select → entry → reading → ending → next → return — on a working CSS-3D model of the shelf with the camera/lamp/desk/marginalia states. Screenshots of every state: `phase18-lab/shots/`. It is a standalone experiment file — it does not touch `src/`, and nothing is deployed.

---

## 1. THE SPATIAL METAPHOR

### **The Keeping Room.**
A hushed archive room inside the wine-dark, where all 19 features stand as **plates** — the actual covers — on a receding shelf. A single **brass thread** runs through them (the catalogue line; the archive's memory). The reader carries a **lamp**: attention is light. Nothing in the room moves except what the reader causes to move.

This is not a new metaphor invented in a vacuum — it is the baseline's existing language, **promoted from background to medium**. The plates, the brass thread, the wine fog, the lean, the "the archive leans in" interaction already exist. The concept completes the idea:

> The magazine keeps everything it has ever published. The room is the keeping. The reader is the one who walks in, pulls a plate off the shelf, reads it, puts it back — and is led to the next.

### Why this metaphor (scored against the spec's five criteria)

| Criterion | Why the Keeping Room wins |
|---|---|
| **Editorial clarity** | A plate *is* a cover. There is zero abstraction between the spatial object and the publication object. "19 plates, 19 features" is a fact, not a decoration. |
| **Navigation** | Shelf position = issue order (deterministic, already seeded). Moving along the shelf = browsing. The thread = the path. No menus required inside the room; the existing dock remains outside it. |
| **Emotional impact** | A student magazine that *keeps* every voice — a kept page — is the brand's own words ("Every story in this magazine began as a kept page"). The room makes the colophon literal. |
| **Interaction potential** | Walk · focus · pull · read · return · next. Pulling a plate is a physical, consequential gesture — it is the reader doing something, not watching something happen. |
| **Brand fit** | Wine-deep, brass, ivory, ghost masthead, marginalia type — every material already exists in the production palette. No new visual vocabulary. |

Rejected alternatives (and why): *constellation of stories* (pretty, but stories aren't stars — no editorial structure); *spatial newspaper* (conflicts with the per-article worlds that already define each story's room); *suspended pages* (pages belong to the article's interior — ArticleWorld owns them); *gallery* (the `gallery` world already uses this for artwork pieces — keeping it distinct is better); *editorial table* (the reading desk appears in the SELECT state — it's part of the room, not the metaphor).

---

## 2. ANSWERS TO THE 16 DESIGN QUESTIONS (§18)

1. **What is Verlyse's spatial metaphor?** The Keeping Room — an archive room of standing plates threaded by brass, lit by the reader's attention.
2. **Why does the archive exist in space?** Because a magazine is a *record*. The room is the record made walkable: every feature has a place, in order, forever.
3. **What does the reader actually DO?** Walk the shelf (discover), pull a plate (select), read it, put it back, take the next. One verb family: **pull, read, return.**
4. **Primary interaction?** Choosing a plate — pointer, tap, or keyboard — which focuses it, then entering it.
5. **Secondary interaction?** (a) The catalogue cards — filter the shelf by department (category); (b) the thread — move attention along the shelf (scroll wheel / arrow keys / swipe); (c) the marginalia — every focus reveals the plate's caption (title, creator, category, reading time) and, for creators, their dossier.
6. **What happens when an article gains focus?** The lamp light moves to it (≈900ms, ink easing). Its plate brightens to 1.0, neighbours fall to ≈0.45, the thread glows toward it, the camera eases to frame it (depth −2.2, matching the existing `selected` state), marginalia sets itself in type below. One dominant element: the plate.
7. **What happens when an article is selected?** The plate **steps off the shelf onto the reading desk**: it recentres, uprights (rotateY → 0), scales to desk size, the room falls away (blur + dim, intensity → 0.4 as in the existing `reading` state), a gold rule draws and "Read the feature" sets in type. Stillness: ≥1.2s.
8. **How does the camera communicate selection?** It never follows the pointer. It **commits**: anticipation (120ms ease-in), travel (ink curve), settle, stillness. Focus = a directed 900ms reframe; select = the camera stops entirely — the plate comes to it. The difference between "the camera moves" (focus) and "the world stills" (select) *is* the meaning.
9. **How does the reader enter the story?** The plate's cover comes until it fills the field of view; the article's own **world texture** (newsprint halftone for MRA, laid paper for TVM-adjacent, etc.) bleeds in from the edges as an **ink spread**; a wine curtain passes — and the canonical article page (untouched `ArticleDetail`) is there. Entry is a crossing, not a page change.
10. **How does the reader leave the story?** The article's ending is its own room (existing `StoryEnding3D` + signature — untouched). Leaving = the canonical return paths already on the page (related / dock / back) — plus: the room **remembers**. Re-entering `/room` restores exactly where you left it (last plate, last focus, in state — a session-scoped `sessionStorage` note, nothing more).
11. **How does the reader discover another story?** Two authored mechanisms: (a) after an ending, the room shows **the next plate lit** ("The next feature — …"), the thread pulsing once; (b) inside the room, moving along the thread walks plates one by one, each with its marginalia. Related stories (existing `relatedArticles()`) become *the plates nearest to the one just read* — the shelf order does the recommendation, no algorithm theatre.
12. **How do creators exist in the world?** As **dossiers at the foot of their plates**: focus a plate and, after the marginalia, a small brass card offers the creator (monogram or portrait, name, handle, one line of their own philosophy, "N features in the room"). Choosing it opens the existing `/creator/:id` page; the room preserves its state. Creators are not floating avatars — they are the handwriting at the foot of the work.
13. **How do categories exist in the world?** As **catalogue cards** — the seven departments as brass index cards in a shallow tray in front of the shelf (they already exist as "Departments — the rooms" on Home). Selecting a card doesn't hide the others: the non-matching plates **sink and dim** (still present — the archive keeps everything), the matching plates stand bright, and the thread shortens to their span. Counts are real (from the registry).
14. **What does mobile do differently?** A **reduced-depth room** (see §6): the shelf becomes a single plane — a plate rail. No arc, no depth of field, one lamp light, touch is the whole interface. Meaning preserved: walk (swipe) · pull (tap, plate rises to desk size) · read · return (auto, on navigate). No 3D required — CSS transforms only; WebGL optional, never mandatory.
15. **WebGL unavailable?** The room renders in **DOM**: the shelf becomes a 2D editorial gallery of the same plates (real images, same order, same thread line as a drawn SVG), focus/select/entry keep working with CSS transforms. This follows the baseline's established fallback doctrine (CSS gradients/2D where 3D is removed). Content is never gated.
16. **Reduced motion?** The room is still: no drift, no lamp travel (the light is simply *on* the focused plate), no entry curtain (a hard, gentle crossfade ≤200ms or instant), the plate simply *is* at the desk. Every state is reachable, every fact readable, in stillness. `prefers-reduced-motion` honored at the room level, independent of the existing global handling.

---

## 3. THE READER JOURNEY (the one continuous performance)

```
ARRIVAL ──► DISCOVERY ──► FOCUS ──► SELECT ──► ENTRY ──► READING ──► ENDING ──► NEXT ──► RETURN ──► (DISCOVERY again)
  the room       the shelf     the lamp      the desk    the crossing  the page    the close   the next     the plate
  wakes up       is seen       finds a plate steps to    into the      (canonical  (existing   plate lit    settles back
                 quietly       and leans     the desk    world         page,        ending,                 · thread
                 around it                                        untouched)     untouched)   once        pulses
```

- **ARRIVAL** — dark room, ghost wordmark, one lamp light on the current feature (TVM). Slow push-in (≈2.4s). *Dominant: the room itself. Silent: everything else.*
- **DISCOVERY** — the shelf resolves; the thread draws itself in (ink-spread, one pass). Drift = the baseline's damped sway, amplitude 0.28. *Dominant: the archive. Silent: UI chrome (dock only).*
- **FOCUS** — reader chooses (or the thread-walk arrives at) a plate. §2.6. *Dominant: one plate.*
- **SELECT** — §2.7. *Dominant: the plate on the desk. Silent: the room.*
- **ENTRY** — §2.9. The only full-screen moment of the journey; it earns its scale.
- **READING / ENDING** — the canonical article, untouched. The room is out of frame; the world texture *is* the room's continuity (same wine, same brass, the plate's cover is the hero).
- **NEXT** — after the ending: the room reappears, the just-read plate dimmed at its slot, the **next feature lit**, one pulse on the thread.
- **RETURN** — the plate settles back onto the shelf (a 3° tilt straightening, 1.3s, leaf easing); the room returns to quiet discovery. **The loop is the design.**

## 4. CAMERA MODEL (explicit states — the camera never follows the pointer)

All positions in the existing scene graph (fov 42, baseline rig reference). Easing: `ink` for arrivals, `leaf` for ambient. Every transition: **anticipation → travel → settle → stillness.**

| State | Position (x, y, z) | Look-at / target | Travel | Settle | Stillness |
|---|---|---|---|---|---|
| ARRIVAL | (0, 0.6, 17.5) → (0, 0.2, 13.5) | (0, 0.1, −4) | 2400ms, ink, from dark | damped 1500ms | — (breathing only) |
| DISCOVERY | baseline rig (damped sway ±0.28) | (0, 0.1, −4) | continuous micro | — | 5s breathe cycles |
| FOCUS | ease to plate frame: x = sin(θ)·1.9, z = 11.3, y = plate.y+0.1 | plate centre | 900ms ink (anticipation 120ms) | 400ms | **1.2s minimum** |
| SELECT | **locked** (camera stops; plate moves) | desk centre (0, 0, −3.4) | 0 | — | **≥1.2s** |
| ENTRY | push z → plate surface (11.3 → 8.9) as cover fills view | plate face | 1100ms ink | 300ms | — (crossing) |
| RETURN | ease back to DISCOVERY frame | (0, 0.1, −4) | 1300ms leaf | 600ms | breathing |

Rules: (1) one camera owner at a time (GSAP timeline; the R3F rig only *reads* targets — no second system animates the same property); (2) transitions are interruptible — a new focus retargets from the current pose, never restarts; (3) no idle travel after settle (the baseline's drift is the only perpetual motion, and it stops under `reading`/`desk` states); (4) every state is reachable by keyboard (←/→ walk, Enter pull, Esc return).

## 5. MOTION MODEL (house language, no new vocabulary)

- **Pulling a plate:** anticipation (plate settles 2° toward the reader, 120ms) → travel (off the shelf to the desk, 1050ms `settle`, ink) → settle (150ms overshoot-free) → still.
- **Returning:** paper-unfold in reverse — the plate folds back onto the shelf, 1300ms `unfold`, leaf.
- **The lamp:** a single radial light source that **moves** (900ms, ink) — never flickers, never pulses (a lamp is steady).
- **The thread:** draws once on arrival (ink-spread, 1800ms); pulses **once** on `NEXT` (a 600ms brighten-and-fade, not a loop).
- **Marginalia:** sets in type (mask reveal, 1050ms) — the way captions already arrive on Home.
- **Ink spread (entry):** the world texture blooms from the plate's centre to the frame edges (1100ms), then the curtain.
- **Silence:** DISCOVERY drift is the only ambient motion in the room; during FOCUS/SELECT/READING everything non-dominant is at rest. *Silence is a design element — enforced, not incidental.*

## 6. MOBILE — THE REDUCED-DEPTH ROOM (390×844)

- The arc collapses to a **single plane**: plates stand in a horizontal rail (real covers, 4:5, 220px wide, 56px gutters). Depth is implied by a **single lamp gradient** on the centred plate and 8% darkening on the off-centre ones — no z-axis, no perspective distortion.
- **Walk:** swipe (inertia, CSS scroll-snap — native feel). **Pull:** tap → the plate rises to desk size (scale 1.65, centered, upright), the rail dims, marginalia + "Read the feature" appear. **Return:** tap-out / back → the plate settles, the rail is where you left it.
- Catalogue: a single line of department chips above the rail (real counts). Creators: the dossier card slides up from the plate's foot.
- **No 3D by default on mobile** (CSS only; GPU budget preserved). WebGL room is an opt-in under "Spatial reading" for devices that want it — same as the baseline's doctrine.
- The journey, the attention hierarchy, and the copy are identical to desktop. Only the geometry reduces.

## 7. ACCESSIBILITY & FALLBACKS (content is fundamental)

- The room is **decorative layer + real DOM underneath**: the full 19-plate shelf exists in the DOM as an ordered list (semantic, screen-reader complete: "Plate 7 of 19 — Forgiving…, by …, Poetry, 2 min read"), `aria-hidden` only on the 3D mirror. Keyboard: ←/→ focus-walk, Enter pulls, Esc returns; focus is always a real `:focus-visible` brass ring.
- **Reduced motion:** §2.16 — every state still, every fact present.
- **No WebGL:** the DOM room is the experience, not the consolation — it is the same plates, order, thread (drawn), and interactions on CSS transforms.
- **Slow device / mobile battery:** one canvas, dpr ≤ 1.5, viewport + visibility gated (baseline doctrine), no particles, textures are the 19 existing covers (already optimized webp), nothing new is downloaded.

## 8. PERFORMANCE BUDGET

- Zero new dependencies. Zero new image assets (the 19 covers + 7 worlds + 4 fonts already exist in `public/`).
- New chunk: the room (three + scene) — lazy-loaded behind the route, same size class as the existing SpatialArchive chunk; the publication shell stays under the current budget.
- Draw calls: flat vs baseline (19 planes + thread + lights; the lamp is a light, not geometry). No post-processing.
- Frame budget: 60fps desktop / 30fps-acceptable mobile-CSS (no 3D on mobile by default).
- The room unmounts off-route (no background rAF, baseline doctrine).

## 9. INTERACTION → TOOL ALLOCATION MATRIX (§19)

| Interaction | PRIMARY tool | SECONDARY | WHY | ANIMATION OWNER | PERF RISK | FALLBACK |
|---|---|---|---|---|---|---|
| The room (shelf, plates, thread, fog, lamp) | **Three.js / R3F** (new scene in `src/components/room/`) | — | existing infra, one canvas, proven pattern | R3F `useFrame` (render only) | low | DOM room (CSS transforms) |
| Camera choreography (all 8 states) | **GSAP** timeline (new `src/lib/roomCamera.ts`) | — | explicit, interruptible, retargeting from current pose; single owner | **GSAP exclusively** (rig reads targets) | negligible (CPU) | instant state jump |
| Plate pull / return transforms | **GSAP** (same timeline as camera) | — | same scene → one owner, no fights | **GSAP** | low | CSS transition |
| Lamp light travel | **GSAP** (tween of a light position) | — | it is scene state | **GSAP** | negligible | light snaps to plate |
| Marginalia, catalogue cards, dossier (DOM UI) | **Framer Motion** | — | existing house pattern for DOM transitions | Framer (DOM only — never the camera, never plate transforms) | low | plain CSS |
| Entry crossing (plate → world → page) | **Framer Motion** overlay (DOM) | CSS ink-spread | it is a DOM-level transition into the existing route | Framer | low | 200ms crossfade |
| Micro-interactions (hover, underlines, chips) | **CSS transitions** | — | cheapest; existing `.btn`/link system | CSS | none | n/a |
| Route/page transitions | existing `PageTransition` (Framer) | — | untouched | Framer | none | n/a |
| Article worlds / endings / signatures | existing protected systems | — | untouched | as-is | none | as-is |

**Library verdicts (researched, not assumed):** Skiper UI & Vengeance UI — premium ShadCN/Radix component shops; would import a foreign visual language (rounded SaaS aesthetics) into a bespoke editorial system → **not adopted**. "Coconut UI" — no verifiable library by that name found → **noted, N/A**. Anime.js — every slot in the matrix is already owned by GSAP/Framer/CSS; a third system would create ownership fights (§11) → **not adopted**. Motion Primitives — Verlyse's own `lib/motion.ts` is its motion-primitives library → **kept, extended only by new named moves in a new file**. **Result: zero new dependencies.**

## 10. ARCHITECTURE OF REVERSIBILITY (change control)

**New files only** (deleting them + one route line restores the baseline exactly):
```
src/components/room/RoomPage.tsx        — the /room route: state machine + composition
src/components/room/RoomScene.tsx       — R3F scene (plates, thread, lamp) [lazy]
src/components/room/RoomDomShelf.tsx    — DOM room (no-WebGL / reduced / mobile default)
src/components/room/Marginalia.tsx      — plate caption + creator dossier
src/components/room/Catalogue.tsx       — the seven department cards
src/components/room/EntryCrossing.tsx   — the entry transition overlay
src/lib/room.ts                         — room state machine + session memory (sessionStorage)
src/lib/roomCamera.ts                   — the GSAP camera timeline (single owner)
```
**Modified (additive, documented):** `App.tsx` (+1 route, +1 lazy import) · `Header.tsx`/`Dock.tsx` (one new link, "The Room" — additive) · `Home.tsx` (one invited section at the colophon: "Every feature kept — enter the room").
**Untouched (verified by hash at audit time):** every protected file, the registry, `index.css`, `package*.json`, `vite.config.ts`.
**No deployment.** Preview-server only. Production is read-only.

## 11. VERTICAL SLICE (§21)

**In scope for the implementation gate:** the journey ARRIVAL → DISCOVERY → FOCUS → SELECT → ENTRY → READING → ENDING → NEXT → RETURN, using the two real test stories — **Their Voices Matter** (arrival's lit plate; newsprint/solemn; closing `voices`) and **Mir Raza Ali** (the focused/pulled plate; newsprint/urgent; closing `voices`), plus the full 19-plate shelf, the 7 catalogue cards, one creator dossier (Alina Javed — real portrait, 2 features), keyboard + reduced-motion + no-WebGL paths, and the mobile room.

**Out of scope (later phases):** per-creator full room views, search inside the room, multi-plate comparison, any new content.

## 12. THE VISUAL CRITICAL TEST — SELF-ANSWERED FOR THIS CONCEPT (to be re-tested after the slice)

1. Feels like Verlyse? — Yes: wine/brass/ivory, ghost masthead, marginalia, kept-page copy.
2. Feels like a publication? — Yes: plates are covers; the room is a record.
3. Spatial medium improves the experience? — Yes: browsing a magazine becomes walking its archive; "what's here" is visible at a glance.
4. Interaction meaningful? — Yes: pull/read/return is consequential (the shelf reorders around the read plate).
5. Cinematic pacing? — Yes: one directed performance, authored durations, enforced stillness.
6. Intentional stillness? — Yes: ≥1.2s stills at FOCUS/SELECT; drift stops under reading states.
7. One dominant element per moment? — Yes: state table assigns exactly one.
8. **Could this be mistaken for an AI-generated 3D landing page?** — **No.** No blob, no particles, no glass, no cursor-chasing camera; the "3D" is a shelf of *the actual covers* in a palette that predates the experiment; the moving parts stop; the typography leads. The room would be boring without the 19 real plates — which is the point: it only exists because the publication does.

## 13. FINAL PRINCIPLE CHECK (§31.5)

> Would removing the spatial system make the publication meaningfully worse?

Yes — the *discovery* experience specifically: the shelf is the magazine's table of contents made physical, and "the room remembers where you left it" is a reading-mechanic no scroll page can offer. The publication's content, SEO, accessibility and canonical routes are identical with or without it (that's the reversibility guarantee) — the room is the way in, not the way to understand.

---
*Next step (only after this concept + the Design Lab are approved): implementation of the vertical slice in `src/components/room/`, per §10, then the §26 validation matrix and the PHASE 18 FINAL REPORT. Still no deployment.*
