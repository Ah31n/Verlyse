# Verlyse Media — Component Safari & Ecosystem Research

> **Objective:** Comprehensive visual, architectural, and component research across eleven design/interaction ecosystems, defining how each shortlisted primitive translates into the proprietary editorial identity of Verlyse Media (*Dark Academia · Luxury Cultural Magazine · Archival Typography*).

---

## 1. Executive Summary & Design Principles

Verlyse is an independent cultural publication exploring literature, visual arts, society, and philosophy. It is **not** a generic SaaS landing page, nor a cookie-cutter portfolio. Every interaction, typeface, surface treatment, and transition must reinforce the sensation of turning physical archival plates, touching hand-set letterpress, and stepping through atmospheric architectural chambers.

### Verlyse Palette & Material Language
* **Wine Deep (`#3B0D17`) / Wine (`#5C1224`)**: Deep archival cloth, velour bindings, dark chambers.
* **Ivory (`#F8F6F2`) / Cream (`#EFE8DD`) / Paper (`#F2EADA`)**: Premium unbleached rag paper, tactile reading plane.
* **Gold / Brass (`#B89146`, `#D9B978`)**: Stamped foil, brass rules, registration marks, index indicators.
* **Charcoal (`#1C1C1C`) / Ink (`#100408`)**: Sumi ink, letterpress impression, deep shadow.
* **Grain & Fiber**: Subtle noise textures simulating uncoated paper stock and 35mm film stock.

---

## 2. Component Safari Matrix

| # | Source Ecosystem | Component / Technique | Verlyse Use Case | Why It Fits Verlyse | Implementation Owner | Mobile Behaviour | Reduced-Motion Behaviour |
|---|---|---|---|---|---|---|---|
| **01** | **StringTune** | `StringSplit` + `StringKineticText` | Cover masthead, major section kickers, essay titles | Delivers staggered glyph and word rises tied to viewport scroll without jitter | `@fiddle-digital/string-tune` + CSS masks | Single line-block reveal on scroll | Plain rendered text, 0 delay, 100% opacity |
| **02** | **StringTune** | `StringParallax` (multi-rate) | Layered hall pilasters, background archival geometry, hero plates | Separates background wine halls from foreground folio plates naturally | StringTune DOMBatcher / Parallax | Reduced amplitude (15% of desktop) | Parallax transform = 0; static layout |
| **03** | **StringTune** | `StringCursor` & `StringAttractor` | Contextual editorial pointer (DEFAULT, READ, IMAGE, ARTICLE, DRAG, SEARCH, ROOM) | Provides micro-feedback without intrusive neon halos; adapts cursor glyph by hover target | StringTune Cursor + React state bridge | **Completely disabled** (pointer: coarse) | Static default OS cursor |
| **04** | **StringTune** | `StringSpotlight` | Archive folio matrix & Seven Rooms doorway cards | Casts a warm 2800K brass key-light following pointer over ivory/wine surfaces | StringTune Spotlight + CSS Radial Vars | Center-fixed subtle gradient | Static subtle border hairline |
| **05** | **StringTune** | `StringProgress` & `StringGlide` | Article reading progress line, long-form essay scroll tracking | Renders an unbroken 1px brass thread that glides with smooth interpolation | StringTune Progress / Spring lerp | Attached to top header bar (1px) | Instant width update without spring interpolation |
| **06** | **StringTune** | `StringMagnetic` | Editorial CTAs ("Send your work", "Enter the Room", "Read folio") | Draws button gently toward pointer within 48px bounding field | StringTune Magnetic + quickTo | Disabled on touch | Static button, no offset |
| **07** | **React Bits** | Text Pressure / Variable Font Shift | Cover issue date, creator signature titles | Characters breathe in font-weight & optical width as cursor nears | React Bits technique adapted to Cormorant / IBM Plex | Static font-weight | Fixed medium weight |
| **08** | **React Bits** | Decay / Ink Dispersion Card | Contributor profile hover cards, archival dossiers | Image subtly shifts through ink-wash displacement texture on hover | Adapted SVG displacement filter + React Bits pattern | Static portrait | Static portrait |
| **09** | **React Bits** | Irregular Masonry Stash | Archive exploratory mode, Commons gallery | Non-uniform staggered column layout with editorial pullquotes interwoven | Custom CSS Grid + React Bits stagger orchestration | Single-column linear flow | Single-column linear flow |
| **10** | **Aceternity UI** | 3D Pin & Floating Folio Plate | Feature story showcase, editor's pick | Lifts cover plate into subtle perspective angle with archival mat shadow | Aceternity 3D Card concept adapted to Verlyse brass border tokens | Gentle touch-scroll tilt | 2D flat card with subtle shadow |
| **11** | **Aceternity UI** | Background Beams / Aurora Glow | The Keeping Room & Spatial Entrance backdrop | Replaced neon lasers with subtle atmospheric wine & gold velvet depth fields | SVG Radial / Mesh Gradient + CSS Keyframes | Lightweight CSS radial | Flat `#3B0D17` solid color |
| **12** | **Aceternity UI** | Expandable Editorial Drawer | Saved stories shelf, quick-look folio preview | Slides in a textured ivory folio drawer with bookmarked articles | Radix Dialog primitive + Aceternity fluid layout | Full-screen bottom sheet | Instant popover without slide duration |
| **13** | **Magic UI** | Marquee / Editorial Stream | Masthead ticker, issue ledger, category ticker | Continuous, restrained horizontal tape displaying contributors and quotes | CSS `@keyframes marquee` + pause-on-hover | Slower speed, touch-scrollable | Static wrap with horizontal scroll |
| **14** | **Magic UI** | Shimmer / Brass Hairline Button | Primary "Submit Voice" and "Enter Archive" controls | A delicate 1px brass beam sweeps across the border on hover | Magic UI border-beam adapted to Gold `#B89146` | Subtle solid gold border | Static solid gold border |
| **15** | **Magic UI** | Number Ticker / Ledger Count | Issue ledger (folios count, words published, voices) | Smooth tabular numeral counter from 0 to target value on first inview | Magic UI countup with IBM Plex Mono font | Runs once on screen entry | Instant final numbers |
| **16** | **shadcn / UI** | Command & Search Palette | Global search (`⌘K` / `Ctrl+K`) | Fast search with recent queries, live article matches, author tagging | shadcn Command + Radix Dialog + `cmdk` | Full-screen mobile search modal | Search modal without fade/scale animations |
| **17** | **shadcn / UI** | Tooltip & Popover Primitives | Contributor role tags, glossary notes, archival references | Keyboard accessible, collision-aware popovers styled as ink-stamped notes | Radix Tooltip + shadcn primitives | Tap to toggle | Instant display on focus/tap |
| **18** | **shadcn / UI** | Accessible Tabs & Accordion | Categories / Seven Rooms switcher, Submission Guidelines FAQ | WAI-ARIA compliant tabbed navigation with roving tabindex | Radix Tabs / Accordion + Verlyse hair lines | Standard touch accordion | Instant tab swap |
| **19** | **Radix Primitives** | Dialog, ScrollArea, Dropdown | Filter menus, article share menus, save drawers | Guarantees screen reader announcements, escape dismissal, focus trapping | `@radix-ui/*` primitives | Mobile native sheets | Instant open/close |
| **20** | **Motion (`motion/react`)** | Shared Layout Transitions (`layoutId`) | Category filter switching, article reading mode expansion | Smoothly morphs active indicator and expands article cards | `motion/react` `AnimatePresence` + `layoutId` | CSS standard transition | Instant state swap |
| **21** | **GSAP + ScrollTrigger** | Higgsfield Camera Scrub | Homepage opening crash zoom, push-in ending beats | Camera scrub dolly-through that moves *only* when visitor scrolls | GSAP ScrollTrigger (`scrub: 0.6`) | Reduced scrub range | Scrub disabled; resting transform |
| **22** | **Lenis** | Unified Smooth Scroll | Main scroll flow across lengthy editorial essays | Provides momentum scroll that respects native keyboard, touch, and trackpad | `lenis` / custom smooth lerp coordinator | Native touch-momentum scroll | Native browser scrolling |
| **23** | **Haikei** | Generative Ink Washes & Topographic Curves | Section separators, article colophons, chapter dividers | Custom procedural SVG contours evoking marbled bookbinding & ink trails | Haikei-inspired vector math + SVG paths | Scaled vector paths | Static vector paths |
| **24** | **Three / R3F / drei** | The Keeping Room & 3D Folios | `/room` spatial archive and story-specific closing scenes | 3D parametric arc of archival cover plates with ACES tone-mapping | `@react-three/fiber` + `three` | WebGL canvas with touch orbit | 2D canvas fallback with cover grid |

---

## 3. Translation Strategy: From Showcase Demos to Verlyse Identity

### Why We Reject "Showcase Clones"
Many component libraries cater to modern tech SaaS products with neon cyan/purple glows, glassy floating cards, high-contrast black boxes, and bouncy cartoon easings (`spring(100, 10)`). 

### The Verlyse Transformation Rules:
1. **Easing & Physics**: Replace elastic bounces with **house easings**:
   - `easeInk = [0.22, 1, 0.36, 1]` (velvety letterpress arrival)
   - `easeLeaf = [0.16, 1, 0.3, 1]` (gentle paper turn)
   - `easePress = [0.65, 0.05, 0.36, 1]` (authoritative brass seal stamp)
2. **Lighting**: No neon glows. All spotlighting uses warm incandescence (`rgba(217, 185, 120, 0.12)` over wine; `rgba(92, 18, 36, 0.08)` over ivory).
3. **Typography**: Typographic components strictly honor:
   - **Display / Titling**: *Cormorant Garamond* (light, italic, ligatures enabled).
   - **Interface / Body**: *Inter* (clean, optical kerning, comfortable leading).
   - **Archival / Index / Metadata**: *IBM Plex Mono* (tracked, uppercase, tabular numerals).
4. **Borders & Hairlines**: 1px subtle brass rules (`rgba(184, 145, 70, 0.3)`) and paper rules (`rgba(248, 246, 242, 0.13)`).
5. **Surfaces**: Tactile paper and linen textures (`.grain`, `.grain-paper`) layered over solid colors so digital pixels feel like physical print.
