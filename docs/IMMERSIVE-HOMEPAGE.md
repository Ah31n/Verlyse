# Immersive system — Phase 1 layer and the Phase 2 homepage pass

Records what was built, what was changed, and the visual reasoning for each
decision. Written so the homepage change can be reviewed on its own before any
further protected file is unlocked.

## Scope actually taken

| Route / file | Status |
| --- | --- |
| `src/components/immersive/*` | **new**, 11 files |
| `src/pages/Home.tsx` | **modified**, +29 / −2 lines |
| `Articles.tsx`, `Categories.tsx`, `ArticleDetail.tsx`, `App.tsx`, `index.css` | untouched — still frozen |
| `/room`, `src/components/room/*`, `src/lib/room/*` | untouched |
| `src/components/spatial/*`, `src/lib/three/*` | untouched |

## Phase 1 — the shared layer

`src/components/immersive/`. One choreography model so no page invents its own:

```
scroll progress -> scene phase -> visual state -> scene update
```

| File | Role |
| --- | --- |
| `phases.ts` | the eight shared phases, plus pure `phaseAt` / `localProgress` |
| `useScrollProgress.ts` | progress as a MotionValue; phase as state, written only on change |
| `useReducedMotionScene.ts` | one reduced-motion decision for a whole scene |
| `ImmersiveShell.tsx` | the page declares its marks; children read one context |
| `ScrollScene.tsx` | a band of the page owning one part of the timeline |
| `BrassThread.tsx` | the connective line, drawn by scroll |
| `EditorialDepth.tsx` | stacked paper sheets that separate as the page moves |
| `SpatialImage.tsx` | a cover in space; `alt` is a required prop |
| `KineticHeading.tsx` | a title assembling out of depth |
| `SceneTransition.tsx` | the one route hand-off |
| `index.ts` | single barrel; importing past it is how a page would cheat |

Two defects were found by browser verification and fixed before commit: an
unattached ref that left progress pinned at `0.000`, and a reduced-motion path
that froze the phase but still passed live scroll through as `smooth`.

## Phase 2 — the homepage pass

`src/pages/Home.tsx`, +29 / −2. Two changes, both additive.

### 1. The page adopts the shared shell

The default export returned a bare fragment of **thirteen composed children**.
It now returns `<ImmersiveShell>` around the same thirteen, in the same order.

**Terminology, corrected.** Earlier wording in this document and in the
`0008c37` commit message said "thirteen sections", while the browser baseline
records `sections: 10`. Both numbers were correct about different things, and
the loose use of "sections" was the error. The exact relationship, verified
against both the source and the DOM:

| Measure | Value | What it counts |
| --- | --- | --- |
| Composed children in the default export | **13** | React components rendered inside the shell |
| Of those, `MotifDivider` | **3** | `The feature`, `The room`, `The invitation` |
| DOM `<section>` elements | **10** | 13 − 3, because `MotifDivider` renders a `motion.div` |

So 13 children − 3 dividers = 10 `<section>` elements. Confirmed empirically:
the DOM reports `sectionCount: 10` and the three dividers report `tagName: DIV`.
The 10 `<section>` count was identical before and after the Phase 2 pass, so
there was **no structural change** — only ambiguous wording.

Going forward this document uses **"composed children"** for the 13 and
**"`<section>` elements"** for the 10.


**Why.** The entrance previously carried its own `useScroll()` inside `Cover`.
The shell is the single source of scroll truth, so later sections consume the
same progress instead of each adding a listener. The shell renders a plain `div`
with no class, so borders, stacking and the board composition are untouched.

### 2. The brass thread

A vertical hairline on the left registration measure, between the top-left crop
mark (`top-[86px]`) and the bottom-left crop mark (`bottom-[3.5rem]`), desktop
only, drawn by the shell's progress across band `0 → 0.12`.

**Why this and not a new ornament.** The threshold already speaks a press-sheet
language: brass crop marks at the four corners in `#D9B978`. A thread on the
same left measure in the same brass reads as part of that registration rather
than as decoration added on top. It draws while the cover is being read and
finishes as the cover leaves, which is the "thread appears" beat of the sequence
without inventing a new visual element.

### What was deliberately not changed

| Candidate | Decision |
| --- | --- |
| The `<h1>` | **left alone.** It is `"Where Vision <em>Becomes</em> A Voice"` with an italic gold `<em>`. `KineticHeading` takes a plain string, so using it would have destroyed the emphasis on a canonical line. |
| The ivory feature plate | **left alone.** It is the P27 board's mandated feature sheet; the plate-to-archive hand-off needs its own review pass. |
| `SpatialArchive` and its camera | **left alone.** R3F keeps sole ownership of the 3D camera. |
| Parallax planes, entrance timeline | **left alone.** `motion/react` keeps them. |

### Engine ownership after this pass

```
motion/react  parallax planes, entrance timeline, presence, route transitions
R3F           SpatialArchive's scene and camera, in its own useFrame
anime.js      ui/BrassRule's discrete SVG draw (not on this page)
shell         supplies scroll progress only; animates nothing itself
```

No property is written by two engines. The thread writes only `stroke-dashoffset`
and `stroke-dasharray` on its own line.

### GSAP

**Update — this has since changed.** GSAP was originally not added, for the
reasons below. It has now been wired on **one route, `/about`**, by explicit
decision of the project owner, who was shown the licence terms and overrode the
standing "no unlicensed or unclear-source components" rule.

The current licence record, engine-ownership table, measured bundle cost and
verification results live in `docs/ANIMATION-DECISIONS.md` → *"GSAP — ADOPTED ON
ONE ROUTE, BY EXPLICIT OVERRIDE"*. Read that before adding a second GSAP surface.
The homepage itself still uses no GSAP.

<details>
<summary>Original reasoning (kept as the historical record)</summary>

Not added. `motion/react` already exports `useScroll`, `useTransform`,
`useSpring`, `useInView`, `useMotionValueEvent` and `useAnimationFrame`, so GSAP
would be a fourth engine duplicating motion's scroll capability. It is also
GreenSock's proprietary "no charge" license (not open source; no LICENSE file
ships in the tarball) at 58.9 kB gz for core plus ScrollTrigger.

</details>

## Protected-file re-baseline

`src/pages/Home.tsx` is in the 27-entry protected manifest and was modified under
explicit authorization for this pass only.

| | |
| --- | --- |
| before | `e97499ae9db931025978f33e5d96645d90ac5fa727cfbf7611749227f779fd1b` |
| after | `f7cc13b97795d82bf8ab3fca2ea81551a11917aa514f51d9492f24ccbe496626` |
| delta | +29 / −2 lines, 818 → 845 |

The other 26 entries are unchanged and still verify. No other protected file was
touched, and no further unlock should be inferred from this one.

## Verification

Homepage audited before and after at three viewports, every field compared:

| field | desk | tab | mob |
| --- | --- | --- | --- |
| h1 text | same | same | same |
| h1 count | 1 | 1 | 1 |
| h2 set (6) | same | same | same |
| sections | 10 | 10 | 10 |
| images | 14 | 14 | 14 |
| images missing alt | 0 | 0 | 0 |
| links | 42 | 42 | 42 |
| article links | 11 | 11 | 11 |
| canvases | 1 | 1 | 1 |
| scrollHeight | 15201 | 19479 | 19513 |
| horizontal overflow | none | none | none |
| console / page errors | 0 | 0 | 0 |
| failed requests | 0 | 0 | 0 |

`imgsLoaded` read 13/14 at one viewport in one run and 14/13 in the other, with
`imgs=14`, `imgsNoAlt=0` and a separate check returning `loaded=14 lazy=14`. All
fourteen images are `loading="lazy"`, so that field is decode timing at the
sample instant, not a regression.

Thread behaviour:

| | top | 10% | 25% |
| --- | --- | --- | --- |
| animated | `1px` | `0.237px` | `0px` (fully drawn) |
| reduced motion | `0px` | `0px` | `0px` (static) |

`pointer-events: none`, inside an `aria-hidden` subtree, 0 page errors.

Gates:

```
tsc -b                          exit 0
npm run build                   exit 0, 25 chunks, 50 metadata routes
audit/phase205-validate-v2.mjs  TOTAL 89 | PASS 89 | FAIL 0
npm test                        exit 0 — 51 routes x 3 viewports,
                                0 console/page/network errors, 0 overflow,
                                reduced-motion PASS, WebGL-off PASS,
                                assets 40/40, 0 FAIL
protected checksums             26/27 unchanged; Home.tsx re-baselined above
```

## Still open for Phase 2

The plate-to-archive hand-off (sequence step 5) is not implemented. It requires
animating the ivory feature plate, which is the P27 board's mandated sheet, and
should be reviewed on its own rather than folded into this pass.
