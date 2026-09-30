# Verlyse Media — motion & interaction governance

Established by **R08**. The goal is not more motion; it is better behaviour.

---

## 1 · Engine hierarchy

Pick the lowest tier that does the job. Moving *up* a tier requires a reason written in the PR.

| Tier | Engine | Use for | Do not use for |
|---|---|---|---|
| 1 | **CSS / Tailwind** | hover, focus-visible, colour, opacity, simple transitions, static states | anything needing presence/exit |
| 2 | **motion (v13)** | React presence (`AnimatePresence`), layout animation, controlled reveals, scroll-linked DOM | raw timelines with many chained steps |
| 3 | **GSAP** | a genuine multi-step timeline or scrubbed system | hover effects, single-property tweens |
| 4 | **Anime.js** | an isolated SVG/DOM *draw* | anything a CSS transition can do |
| 5 | **R3F / three** | true spatial rendering | 2D decoration |

---

## 2 · Ownership table

**Every animated surface has exactly one owner.** No two systems may write the same `transform`, `opacity`, scroll position or timeline.

| Surface | Owner | Notes |
|---|---|---|
| Hover / focus / active states, colour + opacity | **CSS** | sitewide; the reduced-motion clamp in `index.css` covers these |
| Route transitions (`PageTransition`, archival veil) | **motion** | `AnimatePresence`, keyed on pathname |
| Search overlay, saved drawer, mobile menu | **motion** | presence + focus trap |
| Reveals (`Reveal`, `RevealImage`, `SplitText`) | **motion** | `useInView`, `once: true` |
| Scroll progress bar, header condense | **CSS**, driven by a passive listener in `Layout` | reads `window.scrollY`; writes class names only |
| Home scroll transforms, `ImmersiveShell`, `DossierRoom`, `ScrollBeat` | **motion** `useScroll` | read-only on scroll |
| `components/cinematic/*` (`CrashZoom`, `MaskReveal`, `Slate`, `Magnetic`, `Tilt3D`, …) | **GSAP** | 10 `gsap.fromTo`, most ScrollTrigger-scrubbed. 40 call sites. Scheduled for retirement — see §6 |
| `BrassRule` SVG draw | **Anime.js** | one component, one page (`/about`) |
| `SpatialArchive` (Home), `StoryEnding3D` (articles), `components/room/*` | **R3F** | lazy; gated on WebGL + reduced motion + tab visibility |

### Scroll ownership

**The browser owns scroll.** There is no smooth-scroll engine and none may be added. GSAP ScrollTrigger and motion's `useScroll` both *read* native scroll; neither drives it. `ScrollToTop` in `App.tsx` is the only code that sets scroll position, and only on navigation.

Four scroll readers exist today (`Layout`, `Header`, `Room`, plus motion's `useScroll` in five components). All are passive and cleaned up on unmount. They are *readers*, not owners, so they do not conflict — consolidation is possible but is not a correctness issue and is not scheduled.

---

## 3 · Motion tokens

Defined in `tailwind.config.js`. New motion uses a token; a raw duration in a class is a review comment.

| Token | Duration | For |
|---|---|---|
| `instant` | 90ms | state flips, pressed, checkbox |
| `quick` | 240ms | hover, focus ring, small reveals |
| `settle` | 520ms | panels, drawers, page furniture |
| `unfold` | 900ms | editorial reveals, plates entering |
| `ink` | 1400ms | slow image/scale moves, the archival veil |
| `breathe` | 4000ms | ambient only, never attention-seeking |

| Easing | Curve | For |
|---|---|---|
| `editorial` | `cubic-bezier(0.22, 1, 0.36, 1)` | the house curve — everything decelerates into place |
| `press` | `cubic-bezier(0.65, 0.05, 0.36, 1)` | entrances that must feel pressed, not floated |
| `drift` | `cubic-bezier(0.37, 0, 0.63, 1)` | ambient only |

Usage: `transition-[colors] duration-quick ease-editorial`.

Existing call sites are migrated opportunistically. A single sweeping rewrite of ~200 duration classes would be unreviewable and would risk visual regressions across 52 routes for no user-visible gain.

---

## 4 · Reduced motion

Reduced mode must produce a **deliberate static composition**, never a broken animation.

Two mechanisms, and they do different things:

1. **CSS clamp** (`index.css:69-76`) — sets `animation-duration` and `transition-duration` to `0.001s`. Covers tier 1 only.
2. **`useReducedMotion()`** — the JS engines (motion, GSAP, R3F) are *not* covered by the CSS clamp, because they drive transforms via JS/WAAPI. Each must check explicitly.

**Current coverage: 28 of 32 animated components guard explicitly.** The known gap is `components/ui/ArticleClosing.tsx` — 61 `motion.*` elements, 34 with entrance animations, no guard — rendered on all 19 article pages. Recorded in `audit/CODEBASE-AND-SITE-ASSESSMENT.md` as **D3**; still open.

3D is fully gated: `useWebGLSupport()` + `useReducedMotion()` + tab visibility.

---

## 5 · Interaction rules

- **No interaction may require hover.** Every hover affordance has a focus and a touch equivalent.
- **No mobile behaviour may depend on cursor mechanics.** Cursor, magnetic, spotlight and parallax effects are desktop-only.
- **Dialogs** (search, saved drawer, mobile menu) have focus traps, Escape, and focus restoration to the opening control — verified present.
- **Known gap:** none of the three dialogs locks body scroll, so the page scrolls behind them. Recorded as **D4**; still open.
- **Keyboard contract** for search: Escape closes, ArrowUp/ArrowDown move the active result, Enter opens, Tab leaves. Implemented in `SearchOverlay`.

---

## 6 · Scheduled consolidation (not yet done)

Per the decision recorded in `docs/3D-IMMERSIVE-PLAN.md` §3:

- Retire **GSAP** — 40 call sites across 10 cinematic primitives move to motion + scroll-progress. Removes a non-OSS dependency and takes GSAP out of the 92 KB gzip main chunk, where it currently ships on every route because `Header` imports `Magnetic`.
- Retire **Anime.js** — one SVG draw, replaceable with CSS `stroke-dashoffset`.

This is a large, entirely invisible refactor. It belongs in its own PR and has not been started.
