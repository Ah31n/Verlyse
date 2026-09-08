# Phase 4 — wings immersion (`/categories`)

Records what changed, why, and the measured before/after, so this phase can be
reviewed on its own before any further protected file is unlocked.

## Scope actually taken

| File | Status |
| --- | --- |
| `src/pages/Categories.tsx` | **modified** — the only source file touched |
| `docs/IMMERSIVE-WINGS.md` | new (this file) |
| `audit/PROTECTED-BASELINE-PROVENANCE.md` | re-baseline record |
| `audit/protected-checksums-milestone-final.sha256` | `Categories.tsx` entry only |

No new immersive helper module was needed — the existing layer was sufficient.

Verified **UNCHANGED** against `HEAD`: `Home.tsx`, `Articles.tsx`,
`ArticleDetail.tsx`, `App.tsx`, `index.css`, `components/room/*`,
`components/spatial/*`, `lib/three/*`, `lib/room/*` — 0 changed files in each.

## Changes made

Three, all additive. Nothing existing was removed, re-timed or re-ordered.

### 1. The wings adopt the shared shell

`Categories` returned a bare `div`; it now returns `<ImmersiveShell>` around that
same `div`. The shell renders a plain classless `div`, so stacking, overflow
clipping and layout are untouched — `scrollHeight` is identical at every
viewport (2759 / 3737 / 4763 desktop / tablet / mobile).

**Why.** The page previously had no shared scroll model. The shell supplies
progress and phase, so the brass measure below needs no listener of its own and
no later section can invent a second scroll system.

### 2. The brass measure (desktop)

A single hairline down the left edge of the hall, `top-[7rem]` to
`bottom-[7rem]`, drawn by the shell's progress across band `0 → 0.6`, in
`#D9B978` — the same brass the door arches already use.

**Why.** Seven doors in a row read as tiles on a grid. A shared spine down the
left of the hall makes them read as rooms off a corridor, which is the intended
metaphor. It is the same device the archive uses, so the two pages belong to one
building.

Decorative only: `aria-hidden`, `pointer-events-none`, no focusable descendants.

### 3. Depth — the standing wing steps forward, the others stay in the wall

- The door grid gains `xl:[perspective:1500px]` (verified computed `1500px`).
- The ivory plate door gains `z-[2]`, `md:-translate-y-1.5 md:scale-[1.02]`,
  `xl:-translate-y-3 xl:scale-[1.045]` and `xl:shadow-[0_28px_60px_rgba(0,0,0,0.55)]`.
- Non-plate doors gain `xl:scale-[0.985]`.

Measured, desktop: plate `matrix(1.045, 0, 0, 1.045, 0, -12)`, other doors
`matrix(0.985, 0, 0, 0.985, 0, 0)`.

**Depth is graded by viewport**, per the responsive requirement to reduce depth
on tablet and avoid forced perspective on mobile:

| viewport | plate transform |
| --- | --- |
| desktop 1440 | `matrix(1.045,0,0,1.045,0,-12)` |
| tablet 768 | `matrix(1.02,0,0,1.02,0,-6)` |
| mobile 390 | `none` — composition untouched |

**Non-plate doors recede by scale, never by extra opacity.** The page already
uses opacity for the filtered-archive recede (`opacity-25 md:opacity-30`), and
that recede is asserted by the project's own validator. Adding opacity to the
depth cue would overload one channel with two meanings and risk conveying
information by transparency alone.

### Mobile

**Untouched, deliberately.** No perspective, no transform, no forced depth. The
measured mobile composition is identical before and after (`350x186`, transform
`none`, scrollHeight 4763).

## The unresolved mobile ivory measurement

The recorded `18.99% measured vs 6.5% board target` was **not** optimised
toward. Treated as **UNRESOLVED VISUAL MEASUREMENT**: no authoritative Penpot
MCP or official board export was available, so there is no basis for deciding
whether that figure is an implementation defect or intentional composition. No
mobile category surface was darkened, hidden, shrunk or removed. The measured
value is unchanged by this phase.

## Animation ownership

```
native CSS/React   selection, depth, transforms, accessible controls
motion/react       the door presence animation the page already had
immersive shell    supplies scroll progress only; animates nothing itself
```

**No new animation engine.** GSAP not added. Anime.js not added — no isolated
SVG/DOM need was proven; the one ornamental element required (the brass measure)
is already served by the repository's existing `BrassThread`. Three.js/R3F
untouched; `/categories` renders **0 canvases** before and after.

No two libraries mutate the same transform or state: `motion` animates each door
wrapper's opacity/y, CSS transitions animate the door buttons, and the thread
animates only its own `stroke-dashoffset`/`stroke-dasharray`.

## UI-kit usage

**None.** No component from OriginKit, Watermelon UI, 21st.dev, shadcn, Radix or
any other source. The depth cue is Tailwind transform utilities plus one
perspective declaration; the measure is this repository's existing `BrassThread`.

## Verification

### Content and structure, identical at all three viewports

| field | before | after |
| --- | --- | --- |
| h1 | `"WINGSThe wings"` (ghost span + real text), count 1 | identical |
| h2 count / `aria-live` | 1 / true | identical |
| doors (`button[aria-pressed]`) | 7 | 7 |
| door names | Wing I Stories 1 · II Poetry 7 · III Essays 2 · IV Art 3 · V Social Issues 4 · VI Lifestyle 1 · VII Horror 1 | identical |
| wing folio lists | 7 | 7 |
| folio links / reachable / ghosted | 19 / 19 / 0 | identical |
| article links | 19 | 19 |
| images / missing alt | 0 / 0 | 0 / 0 |
| canvases | 0 | 0 |
| scrollHeight desk / tab / mob | 2759 / 3737 / 4763 | **identical** |
| horizontal overflow | none | none |
| console / page errors, failed requests | 0 / 0 / 0 | 0 / 0 / 0 |

### Interaction, preserved

| behaviour | before | after |
| --- | --- | --- |
| plate at rest | door 0 (ivory, `aria-pressed=false`) | door 0 |
| click a door | selects (`aria-pressed=true`) | identical |
| Enter on a focused door | selects; `aria-live` h2 announces | identical |
| Escape | restores rest | identical |
| Arrow keys | move the visual ring; DOM focus moves to the hall | identical |

Note on the arrow keys: `useEffect(() => hallRef.current?.focus(), [focusIdx])`
relocates DOM focus to the hall container, so after an arrow press the active
element is the hall rather than a door. This is **pre-existing intentional
design**, unchanged by this phase — Tab still reaches every door as a real
button, and Enter/Space activate natively.

### Focus visibility

The door buttons carry `outline-none` and signal focus through the arch instead.
Measured on a non-plate door, where the plate's own brass border cannot confuse
the reading:

| | arch border | arch background |
| --- | --- | --- |
| before focus | `rgba(255, 255, 255, 0.2)` | `rgba(0, 0, 0, 0)` |
| after focus | **`rgba(184, 145, 70, 0.7)`** | **`rgba(184, 145, 70, 0.04)`** |

### Reduced motion

Every value above holds. The plate keeps a **static** depth offset
(`matrix(1.045,0,0,1.045,0,-12)`) — a composed final frame, not movement — the
measure renders fully drawn, no door or folio is zero-sized, content order and
selection behaviour are unchanged, and there is no overflow.

## Protected-file re-baseline

`src/pages/Categories.tsx` is in the 27-entry protected manifest and was modified
under explicit authorization for this phase only.

| | |
| --- | --- |
| before | `ccd50f1e6007f58a287bb861f8c486ba0ec8f36c724d24b234fd9d6812dde824` |
| after | `11781f5c963275a8e01175f411d6567afab458ad86c93d6894159480f6d9b54e` |

The other 26 entries are unchanged and still verify. This re-baseline authorizes
`Categories.tsx` only — `ArticleDetail.tsx`, `index.css` and `App.tsx` remain
frozen at their original hashes.
