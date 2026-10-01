# VERLYSE MEDIA — INTERACTION MAP
## Publication Interaction Intelligence & Route Choreography System
*Creative Director Pass 02 · Version 2.0.0 · Verlyse Editorial Architecture*

---

### Executive Architectural Thesis

Verlyse is an authored literary and visual arts publication. Its interaction language is not an aggregate of unrelated animations or library drop-ins, but an **authored digital physicalization of archival materials, ink, paper, brass, and light**. 

Interaction serves three distinct registers:
1. **The Liturgical / Archival Register** (`IBM Plex Mono`, static ledger rules, tabular numerals, catalog indexing): Communicates institutional permanence, provenance, and structured taxonomy.
2. **The Editorial / Literary Register** (`Cormorant Garamond`, variable line heights, optical ligatures, reading measures): Communicates lyricism, gravity, pacing, and human voice.
3. **The Utility / Navigation Register** (`Inter`, directional carats, crisp interactive targets): Communicates effortless clarity, access, and orientation.

Below is the comprehensive interaction map for every major and child route across the publication.

---

## 1. Route Interaction Manifest

### Route: `/` (The Cover / Arrival & Continuous Manifesto)
* **ROUTE**: `/`
* **PRIMARY EXPERIENCE**: Continuous narrative arrival — transition from the atmospheric preloader veil into the living masthead, the lead folio plate, the real ledger count, the curated voice carousel, and the spatial gateway.
* **SECONDARY EXPERIENCE**: Serendipitous discovery through easter-egg marginalia (Library Card, Hidden Quote, reflection lines) and live issue metadata.
* **KEY INTERACTION**: 
  * Lead Folio Plate cursor-linked spotlight with subtle card tilt (`string="spotlight"`, `string="tilt"`).
  * Staggered masthead reveal synchronizing with the lifting archival curtain.
  * Spatial Gateway entry node (`SpatialLink`) with directional magnetic pull (`string="magnetic"`).
* **MOTION SYSTEM**: StringTune Sequence (`StringSequence`) for cover choreography, StringSpotlight for key-light tracking, Motion spring transitions (`easeInk = [0.22, 1, 0.36, 1]`) on interactive cards.
* **COMPONENT SYSTEM**: `Cover`, `EditorialFolio`, `SpotlightCard`, `IndexLedger`, `VoiceCarousel`, `SpatialLink`, `ArchivalSeal`, `BrassThread`.
* **IMAGE BEHAVIOUR**: Warm sepia/grain filter on initial paint; smooth desaturation-to-clarity transition on hover/focus; scale transition capped at 1.03 to avoid zoom distortion.
* **TYPOGRAPHY BEHAVIOUR**: 
  * `Cormorant Garamond` on masthead and lead title reveals via split masked translation (`StringSplit`).
  * `IBM Plex Mono` on issue ledger and date stamps transitions with stepped count-up (`CountUp`).
  * `Inter` on UI commands remains rock-solid without layout shift.
* **DESKTOP BEHAVIOUR**: Custom `EditorialCursor` morphing into `READ` over feature plates and `ENTER` over spatial portals; 3-axis magnetic pull on primary CTAs; smooth Lenis lerp.
* **MOBILE BEHAVIOUR**: Cursor disabled (`pointer: coarse`); magnetic attraction transformed to tactile scale press (`active:scale-[0.98]`); vertical single-column narrative stack with touch momentum scroll.
* **REDUCED-MOTION FALLBACK**: Preloader instant-bypassed (`introSeen`); motion transforms collapsed to pure opacity fades (150ms); 3D spatial scenes rendered as static ambient canvas or suppressed.

---

### Route: `/articles` (The Folio Archive & Ledger Matrix)
* **ROUTE**: `/articles`
* **PRIMARY EXPERIENCE**: Deep archival exploration through dual viewing paradigms: the tactile physical **Folio Shelf** (sequential horizontal depth) and the dense **Editorial Wall** (orchestrated masonry matrix).
* **SECONDARY EXPERIENCE**: Instant real-time filtering across 7 departments, full-text live search query with highlighted fragments, and sort order manipulation (chronological, appreciation, reading time).
* **KEY INTERACTION**: 
  * Layout paradigm toggle (Shelf vs Matrix) with FLIP layout animation.
  * Active hover card recession: hovering a folio elevates it while neighboring cards quietly drop opacity to 0.45.
  * Live filter pill magnetic response and tabular count updates.
* **MOTION SYSTEM**: StringMasonry (`StringMasonry`) for dynamic matrix layout recalculations, StringSpotlight (`StringSpotlight`) on active tiles, Motion `layoutId` for filter indicator transitions.
* **COMPONENT SYSTEM**: `ArchiveShelf`, `ArchiveMatrix`, `FolioPlate`, `ArchiveFilterBar`, `IndexLedger`, `SearchOverlay`.
* **IMAGE BEHAVIOUR**: 4:5 and 16:9 archival plates with subtle inset shadow; image preloaded on search focus; progressive dual-stage blur-up for photography and art plates.
* **TYPOGRAPHY BEHAVIOUR**: 
  * Department tags formatted in `IBM Plex Mono` 10px uppercase tracking `0.22em`.
  * Article titles rendered in `Cormorant Garamond` with clamp sizing to prevent multi-line collision.
* **DESKTOP BEHAVIOUR**: Cursor transforms to `OPEN` (72px gold ring) when hovering folios; keyboard arrow navigation across the matrix; mousewheel horizontal panning on the Shelf view.
* **MOBILE BEHAVIOUR**: View toggles to stacked responsive list with sticky department bar; swipe gesture for department carousel; tap expands quick preview drawer.
* **REDUCED-MOTION FALLBACK**: Grid items render immediately without stagger; filter transitions snap instantaneously without spring overshoot.

---

### Route: `/categories` (The Seven Wings / Taxonomic Portal)
* **ROUTE**: `/categories`
* **PRIMARY EXPERIENCE**: Navigating the seven architectural chambers of Verlyse (Stories, Poetry, Essays, Art, Social Issues, Lifestyle, Horror).
* **SECONDARY EXPERIENCE**: Deep thematic previews, total piece counts, distinct department color accents, and archival motifs (`❦`, `✧`, `¶`, `◈`, `✱`, `◍`, `✕`).
* **KEY INTERACTION**: 
  * Wing card hover expands the department's ambient hue across its border and reveals the chamber's founding manifesto.
  * Interactive department selector with keyboard traversal (`ArrowDown`, `ArrowUp`, `Enter`).
* **MOTION SYSTEM**: StringTune Lerp (`StringLerp`) for smooth hover elevation; CSS custom property transitions on accent illumination.
* **COMPONENT SYSTEM**: `Categories`, `SectionIntro`, `GenerativeGraphics`, `MotifDivider`, `Badge`.
* **IMAGE BEHAVIOUR**: Department cover art dynamically crops into an arched architectural plate; opacity shifts from 0.75 to 1.0 on focus.
* **TYPOGRAPHY BEHAVIOUR**: Large Roman numerals (`I` through `VII`) in `IBM Plex Mono` anchored to the top-right corner; category titles in 3.5rem `Cormorant Garamond`.
* **DESKTOP BEHAVIOUR**: Staggered 2-column asymmetric layout with alternating vertical offsets; cursor reflects department icon.
* **MOBILE BEHAVIOUR**: Single-column vertical accordion cards with full-width tap targets (min 56px height).
* **REDUCED-MOTION FALLBACK**: Cards render in their static resting state with full opacity; background transitions disabled.

---

### Routes: `/categories/:slug` (Individual Category Wings)
* **ROUTE**: `/categories/stories`, `/categories/poetry`, `/categories/essays`, `/categories/art`, `/categories/social-issues`, `/categories/lifestyle`, `/categories/horror`
* **PRIMARY EXPERIENCE**: Focused immersion inside a single editorial wing, presenting its dedicated manifesto, curators, and complete catalog of folios.
* **SECONDARY EXPERIENCE**: Cross-navigation to adjacent wings via tactile footer pagination rules.
* **KEY INTERACTION**: 
  * Wing header split-text reveal.
  * Curated folio filter with real-time reading time accumulator.
* **MOTION SYSTEM**: StringGlide (`StringGlide`) on category folio list; Motion stagger on article tiles.
* **COMPONENT SYSTEM**: `Categories` (slug active view), `FolioPlate`, `BreadcrumbFolio`, `RoleBadge`.
* **IMAGE BEHAVIOUR**: Dedicated department hero artwork with subtle vertical parallax (`string="parallax" string-speed="0.15"`).
* **TYPOGRAPHY BEHAVIOUR**: Department accent color applied strictly to kickers, motifs, and active borders; body remains high-contrast Ivory on Charcoal.
* **DESKTOP BEHAVIOUR**: Large asymmetric split header (Left: Manifesto & Stats; Right: Featured Folio Plate).
* **MOBILE BEHAVIOUR**: Stacked layout with compact breadcrumb navigation and sticky category switcher pill.
* **REDUCED-MOTION FALLBACK**: Parallax disabled; static visual layout with instant content render.

---

### Route: `/creators` (The Contributors Wall & Guild Index)
* **ROUTE**: `/creators`
* **PRIMARY EXPERIENCE**: Humanizing the publication through its 16 writers, poets, essayists, painters, and calligraphers.
* **SECONDARY EXPERIENCE**: Filtering contributors by discipline (Poetry, Essays, Visual Art, Prose) and exploring their cumulative corpus of work.
* **KEY INTERACTION**: 
  * `InteractivePortrait` hover triggers subtle organic focus, revealing the creator's philosophy and piece count.
  * Clicking a contributor card smoothly transitions into their detailed dossier (`/creator/:authorId`).
* **MOTION SYSTEM**: Motion layout transitions, StringSpotlight for portrait key-lighting, spring hover physics.
* **COMPONENT SYSTEM**: `ContributorCard`, `InteractivePortrait`, `RoleBadge`, `SectionIntro`.
* **IMAGE BEHAVIOUR**: Real creator photographs and illustrated monograms presented with subtle duotone tint, resolving to natural warm tone on hover.
* **TYPOGRAPHY BEHAVIOUR**: Contributor names set in `Cormorant Garamond Medium`; roles and handles formatted in `IBM Plex Mono` with gold badges.
* **DESKTOP BEHAVIOUR**: 3-column masonry grid; cursor shifts to `VIEW` over portraits; keyboard focus outlines with 2px gold hairline.
* **MOBILE BEHAVIOUR**: 1-to-2 column responsive grid; tap anywhere on the card opens the profile; portrait maintain 1:1 aspect ratio.
* **REDUCED-MOTION FALLBACK**: Hover zoom and tilt suppressed; borders highlight with static CSS transition.

---

### Route: `/creator/:authorId` (Writer Dossier & Creative Monograph)
* **ROUTE**: `/creator/:authorId` (e.g. `/creator/alina-javed`, `/creator/anshujit-singh`, etc.)
* **PRIMARY EXPERIENCE**: Deep monograph of an individual author: their biography, verified accreditation, writing philosophy, favorite quote, and complete shelf of published works.
* **SECONDARY EXPERIENCE**: Direct link to their external social handle and house role accreditation.
* **KEY INTERACTION**: 
  * Floating quote plate with ink-bleed border.
  * Direct one-click navigation into any of their authored folios.
* **MOTION SYSTEM**: StringProgress for reading scroll track; Motion stagger on personal folio list.
* **COMPONENT SYSTEM**: `WriterProfilePage`, `InteractivePortrait`, `FolioPlate`, `BreadcrumbFolio`, `RoleBadge`.
* **IMAGE BEHAVIOUR**: High-resolution author portrait framed with archival brass corners and subtle vignette.
* **TYPOGRAPHY BEHAVIOUR**: Personal quote set in large italicized `Cormorant Garamond` (2.2rem) with custom opening and closing glyphs.
* **DESKTOP BEHAVIOUR**: Two-column layout (Left: Sticky Dossier & Philosophy; Right: Scrollable Archive of Works).
* **MOBILE BEHAVIOUR**: Single-column vertical flow with portrait centered at top followed by bio, quote, and works.
* **REDUCED-MOTION FALLBACK**: Sticky positioning preserved without transition delays.

---

### Route: `/article/:id` (The Reading Room & Article Detail)
* **ROUTE**: `/article/:id` (e.g. `/article/their-voices-matter`, `/article/3-13`, `/article/hope-becomes-mythology`, etc.)
* **PRIMARY EXPERIENCE**: Contemplative, distraction-free longform reading experience with typography calibrated to 65–70 characters per line.
* **SECONDARY EXPERIENCE**: Interactive article closing (voices, mission, note, artwork, final-verse) and interactive 3D spatial artifact ending (`StoryEnding3D`).
* **KEY INTERACTION**: 
  * Pinned top reading progress bar (`ReadingProgressLine`) calculating exact scroll percentage.
  * In-line bookmark toggle (`SaveButton`) with local storage persistence.
  * Contextual font sizing toggle and reading mode contrast adjustments.
  * Interactive 3D scene at the article conclusion reacting to pointer/touch rotation.
* **MOTION SYSTEM**: StringProgress (`StringProgress`) driving the top brass hairline; StringSplit on hero title; Three.js / R3F for `StoryEnding3D`.
* **COMPONENT SYSTEM**: `ReadingRoom`, `ArticleDetail`, `ReadingProgressLine`, `BreadcrumbFolio`, `AuthorFrame`, `ChapterDivider`, `StoryEnding3D`, `ShareButtons`, `SaveButton`.
* **IMAGE BEHAVIOUR**: Full-bleed hero banner with subtle parallax on scroll; editorial figures with expand-to-lightbox capability; generative SVG chapter dividers (`ChapterDivider`).
* **TYPOGRAPHY BEHAVIOUR**: 
  * Lead paragraph in 1.35rem Cormorant with drop cap.
  * Body copy in high-legibility Inter or Cormorant depending on genre (Poetry vs Essay).
  * Pull quotes styled with 1px gold left rule and italicized Cormorant.
* **DESKTOP BEHAVIOUR**: Fixed reading column centered with wide margins; floating side dock for bookmarks, sharing, and table of contents; cursor displays reading progress dot.
* **MOBILE BEHAVIOUR**: Minimalist top reading bar (2px height); floating dock collapses to sticky bottom pill; touch-optimized tap targets.
* **REDUCED-MOTION FALLBACK**: 3D spatial scene renders as a designed static typographic ending plate; scroll parallax disabled.

---

### Route: `/room` (The Keeping Room — Spatial 3D Experience)
* **ROUTE**: `/room`
* **PRIMARY EXPERIENCE**: Full-canvas spatial environment representing the physical vault of Verlyse — floating archival plates in 3D space with candlelight ambiance and depth sorting.
* **SECONDARY EXPERIENCE**: Spatial raycasting to select, examine, and enter any of the 19 folios directly from 3D space.
* **KEY INTERACTION**: 
  * 3D Orbit / Pan / Dolly controls with momentum damping.
  * Hovering a floating 3D plate causes it to rotate face-on and cast a golden aura.
  * Clicking a plate transitions the camera smoothly before handing off to `/article/:id`.
* **MOTION SYSTEM**: Three.js / React Three Fiber rendering loop at 60 FPS; GSAP / custom lerp camera tweens; StringTune Impulse on pointer move.
* **COMPONENT SYSTEM**: `RoomPage`, `Room`, `Plate`, `BrassThread`.
* **IMAGE BEHAVIOUR**: Dynamic 3D textures mapped onto double-sided archival planes with procedural normal maps for paper grain.
* **TYPOGRAPHY BEHAVIOUR**: Spatial 3D text billboards (`@react-three/drei` Text) rendering issue numbers and dates in 3D coordinate space.
* **DESKTOP BEHAVIOUR**: Full mouse-drag camera orbit, wheel zoom, click-to-focus; cursor displays `ENTER` or `DRAG`.
* **MOBILE BEHAVIOUR**: Single-finger drag for orbit, pinch-to-zoom, tap-to-select; gyroscopic orientation tilt if device permits.
* **REDUCED-MOTION FALLBACK**: Automatic fallback button offering direct jump to standard `/articles` archive; camera damping maxed for gentle movement.

---

### Route: `/community` (The Commons & Reader Letters)
* **ROUTE**: `/community`
* **PRIMARY EXPERIENCE**: Celebrating the reader community, published letters to the editor, reading circle stats, and reader dialogues.
* **SECONDARY EXPERIENCE**: Interactive submission of reader responses and live community metrics.
* **KEY INTERACTION**: 
  * Letter card flip/expand to read extended correspondence.
  * Live appreciation counter ticker.
* **MOTION SYSTEM**: Motion spring reveals, StringTune Lerp for letter card hover.
* **COMPONENT SYSTEM**: `Community`, `SectionIntro`, `VoiceCarousel`, `CountUp`, `MotifDivider`.
* **IMAGE BEHAVIOUR**: Reader submission excerpts presented on textured ivory paper cards with hand-stamped seal motifs.
* **TYPOGRAPHY BEHAVIOUR**: Reader letters set in typewriter-styled monospaced script or expressive italic serif.
* **DESKTOP BEHAVIOUR**: 3-column letterpress card wall with interactive hover tilts.
* **MOBILE BEHAVIOUR**: Single-column vertical scroll with swipeable letter cards.
* **REDUCED-MOTION FALLBACK**: Static card grid with instant text display.

---

### Route: `/ambassadors` (The Fellowship & Institutional Patrons)
* **ROUTE**: `/ambassadors`
* **PRIMARY EXPERIENCE**: Presenting the global student ambassadors and institutional advocates championing Verlyse across universities and literary circles.
* **SECONDARY EXPERIENCE**: Application protocol to join the ambassador fellowship.
* **KEY INTERACTION**: 
  * Interactive world node map / regional directory.
  * Accordion FAQ with smooth height transitions (`@radix-ui/react-accordion`).
* **MOTION SYSTEM**: Motion layout animations, Radix primitive spring state transitions.
* **COMPONENT SYSTEM**: `Ambassadors`, `SectionIntro`, `Accordion`, `Button`, `RoleBadge`.
* **IMAGE BEHAVIOUR**: Clean round profile frames with gold boundary rings and status indicators.
* **TYPOGRAPHY BEHAVIOUR**: Institutional titles and university affiliations rendered in `IBM Plex Mono`.
* **DESKTOP BEHAVIOUR**: Regional directory with split view (Left: Charter & Program Details; Right: Ambassador Roster).
* **MOBILE BEHAVIOUR**: Vertical list with collapsible regional groups.
* **REDUCED-MOTION FALLBACK**: Accordions toggle state without height animation.

---

### Route: `/about` (The Colophon & Institutional Charter)
* **ROUTE**: `/about`
* **PRIMARY EXPERIENCE**: The founding manifesto, editorial ethics, aesthetic philosophy, and physical colophon of Verlyse Media.
* **SECONDARY EXPERIENCE**: Breakdown of editorial standards, type choices, and technology architecture.
* **KEY INTERACTION**: 
  * Interactive Colophon revealing font specimens, color swatches, and publication timestamps on hover.
  * Scroll-linked section indicator.
* **MOTION SYSTEM**: StringProgress for section tracking, Motion text stagger.
* **COMPONENT SYSTEM**: `About`, `SectionIntro`, `ArchivalSeal`, `BrassRule`, `GenerativeGraphics`.
* **IMAGE BEHAVIOUR**: Archival documents, ink sketches, and masthead seals rendered as crisp SVGs.
* **TYPOGRAPHY BEHAVIOUR**: Manifesto formatted in grand editorial scale (`clamp(1.5rem, 3vw, 2.5rem)`) with wide line-height (1.6).
* **DESKTOP BEHAVIOUR**: Generous whitespace with 80ch reading width and asymmetrical side notes.
* **MOBILE BEHAVIOUR**: Reflowed linear layout with margin notes inline.
* **REDUCED-MOTION FALLBACK**: Static layout with immediate text render.

---

### Route: `/submit` (Send a Voice / Submissions Protocol)
* **ROUTE**: `/submit`
* **PRIMARY EXPERIENCE**: An inviting, dignified manuscript submission portal outlining open themes, submission guidelines, and formatting requirements.
* **SECONDARY EXPERIENCE**: Step-by-step submission checklist and interactive manuscript dispatch form.
* **KEY INTERACTION**: 
  * Tactile letterform inputs with animated underline ink transitions.
  * Interactive genre selection chips with active brass glow.
  * Client-side validation feedback with gentle shake physics on error.
* **MOTION SYSTEM**: Motion error shake, StringTune Split on instructions, Radix accessible form states.
* **COMPONENT SYSTEM**: `Submit`, `SectionIntro`, `Button`, `BrassRule`, `Tooltip`.
* **IMAGE BEHAVIOUR**: Archival stationery accents and inkwell motifs.
* **TYPOGRAPHY BEHAVIOUR**: Guidelines styled in `IBM Plex Mono` numbered protocols (01, 02, 03); form labels in `Inter` Medium.
* **DESKTOP BEHAVIOUR**: Split-screen desk layout (Left: Submission Charter & Deadlines; Right: Dispatch Form).
* **MOBILE BEHAVIOUR**: Linear form stack with sticky submit button bar.
* **REDUCED-MOTION FALLBACK**: Error states indicate via color and text without shake animation.

---

### Route: `/contact` (The Desk / Telegram & Inquiries)
* **ROUTE**: `/contact`
* **PRIMARY EXPERIENCE**: Direct postal and digital dispatch to the editorial team, press office, and founding editor.
* **SECONDARY EXPERIENCE**: Direct PGP / editorial email links, office hours, and response time expectations.
* **KEY INTERACTION**: 
  * Magnetic contact action buttons.
  * One-click clipboard copy for editorial emails with tactile "Copied to Ledger" toast notification.
* **MOTION SYSTEM**: StringMagnetic on action triggers, Motion toast notification exit/enter.
* **COMPONENT SYSTEM**: `Contact`, `SectionIntro`, `MagneticControl`, `Button`, `Tooltip`.
* **IMAGE BEHAVIOUR**: Minimalist letterhead watermark behind contact coordinates.
* **TYPOGRAPHY BEHAVIOUR**: Direct email addresses displayed in large monospace (`1.25rem`) with copy trigger.
* **DESKTOP BEHAVIOUR**: Centered editorial letter layout with generous gold borders.
* **MOBILE BEHAVIOUR**: Compact touch cards with native `mailto:` triggers.
* **REDUCED-MOTION FALLBACK**: Toast notification fades in/out with standard CSS transition.

---

## 2. Interaction Density Matrix by Route

| Route | Primary Voice | Interaction Density | Primary Skill / System | Key Fallback |
|---|---|---|---|---|
| `/` | Grand Editorial & Manifesto | **Level 3 (Expressive)** | StringSequence + StringSpotlight + Motion | Instant veil bypass |
| `/articles` | Archival Catalog & Index | **Level 3 (Expressive)** | StringMasonry + StringSpotlight + FLIP | Static grid |
| `/categories` | Chamber Architecture | **Level 2 (Subtle)** | StringLerp + Radix | Static color borders |
| `/categories/:slug` | Focused Wing Archive | **Level 2 (Subtle)** | StringGlide + Motion | Linear card stack |
| `/creators` | Contributor Guild | **Level 3 (Expressive)** | InteractivePortrait + Spotlight | Duotone tint toggle |
| `/creator/:id` | Monograph Dossier | **Level 2 (Subtle)** | StringProgress + Motion | Static bio column |
| `/article/:id` | Deep Longform Reading | **Level 2 (Subtle) → Level 3 (Ending)** | StringProgress + Three.js | Typographic closing plate |
| `/room` | Spatial 3D Archive | **Level 3 (Expressive / 3D)** | Three.js / R3F + GSAP Lerp | Redirect to `/articles` |
| `/community` | Reader Commons | **Level 2 (Subtle)** | StringLerp + CountUp | Static letter cards |
| `/ambassadors` | Institutional Network | **Level 1 (Static/Subtle)** | Radix Accordion + Motion | Flat disclosure list |
| `/about` | Colophon & Charter | **Level 1 (Static/Subtle)** | StringProgress + Static SVG | Pure typographic read |
| `/submit` | Manuscript Protocol | **Level 2 (Subtle)** | Tactile Forms + Validation | Native form controls |
| `/contact` | Postal Desk | **Level 2 (Subtle)** | StringMagnetic + Clipboard API | Standard mail links |
