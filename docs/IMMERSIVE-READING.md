# Phase 5 — reading room (`/article/:id`)

Records what changed, why, and the measured before/after, so this phase can be
reviewed on its own before any global file is unlocked.

## Scope actually taken

| File | Status |
| --- | --- |
| `src/pages/ArticleDetail.tsx` | **modified** — the authorized route |
| `src/components/immersive/ReadingMeasure.tsx` | **new**, non-protected helper (37 lines) |
| `src/components/immersive/index.ts` | +2 lines — barrel export for the new helper |
| `docs/IMMERSIVE-READING.md` | new (this file) |
| `audit/PROTECTED-BASELINE-PROVENANCE.md` | re-baseline record |
| `audit/protected-checksums-milestone-final.sha256` | `ArticleDetail.tsx` entry only |

Verified **UNCHANGED** against `HEAD`: `Home.tsx`, `Articles.tsx`,
`Categories.tsx`, `App.tsx`, `index.css`, `components/room/*`,
`components/spatial/*`, `lib/three/*`, `lib/room/*`, and the three protected
child components `ui/ArticleWorld.tsx`, `ui/StoryEnding3D.tsx`,
`ui/ArticleClosing.tsx` — 0 changed files in each.

## Changes made

Four, all additive and all **outside the reading column**.

### 1. The reading room adopts the shared shell

`ArticleDetail` returned a bare fragment; it now returns `<ImmersiveShell
className="relative">` around that same fragment. `position: relative` is needed
only to give the margin thread a positioned ancestor, and it cannot affect the
`fixed` reading-mode button — only a `transform`/`filter`/`perspective` ancestor
would.

**Why.** The route had no shared scroll model. The shell supplies progress, so
the two elements below need no listener of their own and the route still has
exactly one scroll system.

### 2. The reading measure (new helper)

`ReadingMeasure` — a **1px** brass hairline pinned to the top edge of the
viewport, drawn left to right as the feature is read.

**Why.** A long feature gives no sense of how much remains, and a numeric or
chunky bar would compete with the writing. This is the quietest form of the
affordance.

It is deliberately subordinate:

- it sits outside the reading column and covers no text
- `aria-hidden`, `pointer-events-none`, takes no part in layout
- the only property it changes is its own `scaleX`
- it opens no scroll listener — it reads the shell's smoothed progress

Stacking: header is `z-[1100]`, the layout reading bar `z-[1110]`, the
reading-mode button `z-[1200]`, the dock `z-[1030]`. The measure sits at
`z-[1105]`, so it reads as a hairline on the header's top edge and never covers
a control.

### 3. The folio thread (desktop)

A brass hairline down the left margin, `top-[14rem]` to `bottom-[12rem]`, drawn
across band `0.04 → 0.9` in `#D9B978` — the same brass as the cover frames and
the marginalia. `xl` only, where the measure is wide enough for it to read as the
spine of the feature rather than a stray line.

Decorative: `aria-hidden`, `pointer-events-none`, no focusable descendants.

### 4. The page turn, set as a plate

The next-feature card gains `xl:shadow-[0_26px_60px_rgba(0,0,0,0.5)]` and a
static inner brass hairline (`absolute inset-3`, `xl` only), so the handoff reads
as a real folio rather than a banner.

**No transform was added here.** The card's cover already breathes with
`animate-vm-kenburns`; the new frame is a different element and a different
property, so the two never write to the same transform.

## Deliberately NOT added

**An opaque entrance veil.** A "wine threshold" that starts solid would put the
title and the first paragraph behind a transition, and the reading body must
never have to wait to become readable. The entry was left exactly as it was.

**Any scroll-linked movement on the reading text.** See the measurement below.

**Any change to the ending.** `StoryEnding3D`, `ArticleEnding` and
`WritersNoteClosing` were not opened, re-timed, re-propped or re-composed. The
`#ending` section measures 1849px before and after.

## Strict reading-body rule — measured

Paragraph geometry was sampled inside the 720px measure at seven scroll
positions (0, 15, 30, 45, 60, 75, 90% of page height), `/article/3-13`:

| check | result |
| --- | --- |
| distinct paragraph X across all scroll positions | **436** — one value |
| paragraph `transform` at every position | **`none`** |
| reading column width | **720px**, constant |
| measure hairline `scaleX` | varies `0.015 → 0.944` — progress is live |
| folio thread `stroke-dashoffset` | varies `0.885px → 0px` — draws |
| console/page errors | 0 |

So the scroll-linked elements move and the reading text does not.

One honest observation: paragraph **doc-Y** takes 6 distinct values across the
samples. That was measured with the change **stashed** as well and is identical
there (6 normal, 4 reduced) — it is the pre-existing `loading="lazy"` cover
images decoding as they enter the viewport, not something this phase introduced.
It is worth a future look as a layout-shift source, but it is out of scope here.

## Animation ownership

```
native CSS/React   reading surfaces, focus states, the plate frame
motion/react       the reveals and presence the route already had
immersive shell    supplies scroll progress only; animates nothing itself
```

**No new engine.** GSAP not added. Anime.js not added — no isolated SVG/DOM need
was proven; the two ornaments added are served by the shell's progress and the
existing `BrassThread`. R3F/Three.js untouched.

No two engines write to the same element or property: `motion` owns the reveals,
the measure owns its own `scaleX`, the thread owns its own stroke-dash pair, and
the next-feature cover keeps its ken-burns alone.

## UI-kit usage

**None.** The measure is 37 lines of native React + `motion/react`. The frame is
one Tailwind shadow and one absolutely positioned span.

## Verification

### Before/after, 7 representative articles × 3 viewports + reduced motion

28 page states × 27 fields = **756 comparisons, 0 differences.**

Representative set: `their-voices-matter`, `3-13`, `the-garden-beyond-my-tower`,
`mir-raza-ali`, `intellect-lost-to-code`, `water-cat` (shortest body, 132
chars), `the-empty-waltz` (longest, 5767 chars).

**The requested "one article with multiple inner images" is not satisfiable:
`images` is `[]` for all 19 articles in the registry.** Reported rather than
invented; `intellect-lost-to-code` substituted as the structurally richest
long-form feature.

Identical before/after on every state: `h1count` 1, h1 text, h2/h3 counts, image
count, missing-alt 0, empty-alt count, cover count, canvas count, `#ending`
present and its height, save label and `aria-pressed`, reading-mode label, 3
share buttons, comment count, next-feature href and title, link counts, reading
column width, scroll height, overflow, and console/page/failed-request counts.

### All 19 article routes

**19/19 PASS.** Each returns 200 with exactly one H1, a populated `<title>`, a
canonical link, a decoded cover image (`complete && naturalWidth > 0`), no
overflow and 0 console/page errors.

### Invalid route

`/article/definitely-not-an-article` returns 200 with its own H1 — *"This
feature isn't on the shelf"* — `h1count` 1, no overflow, 0 page errors.

### Interaction, both motion modes

| flow | result |
| --- | --- |
| save, keyboard | `Save 3:13` / `false` → Enter → `Remove 3:13 from saved` / `true` → Enter → back to `false` |
| reading mode | Enter → `Leave reading mode`, focus stays on a `BUTTON`, no overflow |
| Escape | → `Enter reading mode`, focus retained |
| next feature | present, visible, `tabIndex >= 0`, `/article/their-voices-matter` |
| next → Back | navigates, then Back restores `/article/3-13` with the correct H1 |
| ending | present, height 1849, semantic text present (not canvas-only) |

Under reduced motion the ending renders **0 canvases** — that is
`StoryEnding3D`'s own pre-existing behaviour, unmodified, and the semantic
closing copy is still present on top of it.

### Reduced motion

Measure `scaleX` reports `none` at every scroll position and the thread renders
fully drawn (`0px`) — both static. All content, controls and links remain.

## Protected-file re-baseline

`src/pages/ArticleDetail.tsx` is in the 27-entry protected manifest and was
modified under explicit authorization for this phase only.

| | |
| --- | --- |
| before | `5d318c49a07b48b78cd74ac086137550c5578972f80fe2750f277f3ebb02ef8f` |
| after | `025e01e9347218bf01af1024c2a3ac68b174216ee68b63909616d875f7771123` |
| delta | +37 / −1 lines (747 → 783) |

Every other protected file was independently re-hashed against the manifest **as
committed at `HEAD`**, not against the edited copy.
