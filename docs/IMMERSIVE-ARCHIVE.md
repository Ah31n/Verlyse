# Phase 3 — archive immersion (`/articles`)

Records what changed, why, and the measured before/after. Written so this phase
can be reviewed on its own before any further protected file is unlocked.

## Scope actually taken

| File | Status |
| --- | --- |
| `src/pages/Articles.tsx` | **modified**, +42 / −3 (303 → 342 lines) |
| `docs/IMMERSIVE-ARCHIVE.md` | new (this file) |
| `docs/IMMERSIVE-HOMEPAGE.md` | terminology correction only |
| `audit/PROTECTED-BASELINE-PROVENANCE.md` | re-baseline record |

Verified unchanged against `HEAD`: `Home.tsx`, `Categories.tsx`,
`ArticleDetail.tsx`, `App.tsx`, `index.css`, `src/components/room/*`,
`src/components/spatial/*`, `src/lib/three/*`, `src/lib/room/*` — **0 changed
files in each**.

No new module was needed; the existing `src/components/immersive/` layer was
sufficient, so nothing was added under it.

## Changes made

Three, all additive. Nothing existing was removed or re-timed.

### 1. The archive adopts the shared shell

`Archive` returned a bare `div`; it now returns `<ImmersiveShell>` around that
same `div`. The shell renders a plain classless `div`, so the page's stacking,
overflow clipping and layout are untouched — `scrollHeight` is identical at
every viewport (2252 / 3239 / 4970).

**Why.** The archive previously had no shared scroll model. The shell supplies
progress and phase so the brass thread below needs no listener of its own, and
so a later section cannot invent a second scroll system.

### 2. The brass index thread (desktop)

A vertical hairline in the left margin, `top-[7rem]` to `bottom-[6rem]`, drawn
by the shell's progress across band `0 → 0.55`, in `#D9B978`.

**Why.** The mobile layout already carries a static brass thread in the right
margin. This gives the desktop shelf the same index logic — the archive reads as
one indexed object with a spine, not a loose grid. It is the "brass-thread
index" of the target experience, using a measure and colour the page already
owns.

Decorative only: `aria-hidden`, `pointer-events-none`, no focusable descendants.

### 3. Depth — the focused folio comes forward, its neighbours step back

- The shelf grid gains `xl:[perspective:1500px]` — desktop only.
- The selected plate gains `z-[2]`, `xl:-translate-y-3`, `xl:scale-[1.045]` and a
  longer shadow `xl:shadow-[0_26px_54px_rgba(0,0,0,0.52)]`.
- Plates within two positions of the selection gain `xl:scale-[0.982]`.

**Why this shape.** Hierarchy was already carried by opacity and the brass
border; depth makes the selection read spatially as well, which is the
difference between "a card grid with a highlight" and "a shelf where one plate
is pulled forward".

**Two deliberate limits.**

- **Desktop only (`xl`).** On tablet and mobile the plates stay square, so
  nothing collides and no card is pushed outside its own box. Measured: the
  selected plate's box is unchanged at `228x133` (tablet) and `350x106`
  (mobile), with `selTransform` identical to the baseline.
- **Neighbours recede by scale, never by opacity.** The archive already uses
  opacity to carry search/filter state, so adding opacity to the depth cue would
  overload one channel with two meanings and risk conveying information by
  transparency alone.

### What was deliberately not changed

| Candidate | Decision |
| --- | --- |
| The `contents` class on the grid child | **load-bearing** for the CSS grid. Depth transforms went on the plate `<a>`, not the wrapper, because a `display:contents` element generates no box and cannot be transformed. |
| Roving tabindex, `onKeyDown`, `aria-current`, `aria-label` | untouched — the keyboard contract is unchanged |
| Search input, category rail, `visibleIdx` logic | untouched |
| The `motion.div` presence animation | untouched; motion keeps it |
| The mobile brass thread | untouched |

## Animation ownership

```
native CSS/React   the archive's behaviour: grid, transitions, roving tabindex,
                   plate lift and neighbour recede
motion/react       the presence animation the folios already had
immersive shell    supplies scroll progress only; animates nothing itself
```

**No new animation engine was introduced.** GSAP was not added. Anime.js was not
used — the one candidate surface (an SVG ornament) was already served by the
brass thread, and a second engine on the archive would have had no measurable
justification. No engine shares a transform with another: `motion` animates the
grid wrapper's opacity/y, CSS transitions animate the individual plates, and the
thread animates only its own `stroke-dashoffset`/`stroke-dasharray`.

## UI-kit usage

**None.** No component was taken from Watermelon UI, OriginKit, 21st.dev or any
other source. The depth cue is three Tailwind transform utilities and one
perspective declaration; the thread is the existing `BrassThread` from this
repository's immersive layer. Nothing here would have been simpler to import.

## Verification

The same canonical audit was run twice — once with `Articles.tsx` reverted to
`HEAD`, once with the change — so the comparison is apples-to-apples rather than
against a stale artifact.

### Preserved identically at all three viewports

| field | desk | tab | mob |
| --- | --- | --- | --- |
| `h1` | "The folio shelf" | same | same |
| h1 count | 1 | 1 | 1 |
| folios (`role="listitem"`) | 19 | 19 | 19 |
| folio labels and order | identical | identical | identical |
| folio hrefs | identical | identical | identical |
| images / missing alt | 0 / 0 | 0 / 0 | 0 / 0 |
| links / article links | 44 / 19 | 44 / 19 | 44 / 19 |
| category controls | 8 | 8 | 8 |
| search has a `<label for>` | true | true | true |
| `role="list"` | yes | yes | yes |
| scrollHeight | 2252 | 3239 | 4970 |
| horizontal overflow | none | none | none |
| console / page errors | 0 / 0 | 0 / 0 | 0 / 0 |
| failed requests | 0 | 0 | 0 |

### Interaction, preserved

| behaviour | before | after |
| --- | --- | --- |
| focus a plate | ok | ok |
| ArrowRight moves `aria-current` | 0 → 1 | 0 → 1 |
| focus stays on a plate | true | true |
| focus ring | `solid 2px rgb(184,145,70)` | identical |
| Enter opens | `/article/3-13` | `/article/3-13` |
| bright plates at rest | 19 | 19 |
| bright during search "Their Voices" | **1** | **1** |
| bright after Escape | 19 | 19 |
| bright under category "Social Issues" | **4** | **4** |
| focus through Escape | `art-search` | `art-search` |

### Depth, the intended change

| viewport | selected plate box | selected transform |
| --- | --- | --- |
| desk before | `139x154@y291` | `matrix(1,0,0,1,0,-6)` |
| desk after | **`146x161@y281`** | **`matrix(1.045,0,0,1.045,0,-12)`** |
| tab before / after | `228x133@y422` / unchanged | unchanged |
| mob before / after | `350x106@y456` / unchanged | unchanged |

Brass thread: absent before; present after, `stroke-dashoffset` `1px` at the top
of the page under animation and `0px` (fully drawn) under reduced motion.

### Reduced motion

Everything above holds. The selected plate keeps a **static** depth offset
(`matrix(1.045,0,0,1.045,0,-12)`) — a composed final frame, not movement — the
thread renders fully drawn, no plate is zero-sized, no plate is unreachable,
content order and search/category behaviour are unchanged, and there is no
overflow.

## Protected-file re-baseline

`src/pages/Articles.tsx` is in the 27-entry protected manifest and was modified
under explicit authorization for this phase only.

| | |
| --- | --- |
| before | `b221b693babed676e142321131f08c45a06eb18ca6c6332a59c72b1b67a9e876` |
| after | `27fb01d957bb2f0f7ce0b54d62f94950b496d4ed75c6c9a3d769858f26320a8a` |
| delta | +42 / −3 lines (303 → 342) |

The other 26 entries are unchanged and still verify. This re-baseline authorizes
`Articles.tsx` only.

## Note on `audit/route-matrix-desktop.json`

Two runs of `scripts/full-matrix-audit.mjs` — with and without this change —
produce identical route keys (51 = 51) and differ on exactly **one** route,
`article-failure|desktop`, where two console **warnings** about preloaded fonts
"not used within a few seconds from the window's load event" landed inside that
route's recording window in one run and not the other. `recordStart` is a global
cursor (`box.length`), so it moved by exactly 2 to match. Error count is 0 in
both runs.

Classification: **TIMING BUG**, pre-existing and harness-side, on a route this
change does not touch. The generated file was reverted to `HEAD` so the commit
carries no run-dependent noise.
