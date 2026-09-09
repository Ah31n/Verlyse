# Protected-file baseline — provenance and re-baseline record

Two manifests exist in this directory. They are not interchangeable.

## `protected-baseline-phase31b.md5` (historical, 17 entries)

Captured during Phase 31B. **It is stale.** Verified in this session:

| Source tree | Result |
| --- | --- |
| Prior-workspace archive (the tree that claimed `/room` 89/89) | **5 FAILED** — `src/App.tsx`, `package.json`, `package-lock.json`, `src/pages/Home.tsx`, `src/pages/Categories.tsx` |
| `origin/Ah31n-patch-1`, pristine, no local edits | **7 FAILED** — the same 5, plus `src/pages/ArticleDetail.tsx`, `src/pages/Articles.tsx` |

The prior-workspace archive does not satisfy its own manifest. The drift is
legitimate committed work that landed after the manifest was captured:

| File | Commit on `Ah31n-patch-1` |
| --- | --- |
| `src/pages/ArticleDetail.tsx` | `c82208c` Center documentary reading hero to Penpot P25 composition |
| `src/pages/Articles.tsx` | `7230a10` Align archive shelf with Penpot P27 desktop state |
| `src/App.tsx` | `4532a35` Sync current workspace |
| `src/pages/Home.tsx` | `014f461` Sync current workspace |
| `src/pages/Categories.tsx` | `069da45` Sync current workspace |
| `package.json` | `e49dadc` Sync current workspace |
| `package-lock.json` | `d03836b` Sync current workspace |

This manifest is retained unmodified as the historical record. It must not be
used as a gate — it fails against its own source.

## `protected-baseline-current.md5` (authoritative, 23 entries)

Recomputed against the current working tree. Changes from the Phase 31B set:

- The 7 entries above re-anchored to their current committed content.
- **Six room-state-machine files added** — they were previously *unprotected*
  despite being the subject of the strongest regression suite in the project:
  `src/components/room/Room.tsx`, `Plate.tsx`, `BrassThread.tsx`,
  `src/lib/room/state.ts`, `geometry.ts`, `folios.ts`.

`src/components/room/Room.tsx` was modified once in this session. Reason and
evidence:

- **Defect:** the window `keydown` handler mapped `Enter` in the `focus` state
  to `enter(focus)`, which navigates to the article. `STATE_ORDER` is
  `arrival -> discovery -> focus -> settle -> entry`, so `settle` was
  unreachable by keyboard. The room's own affordance advertises
  "← → choose plate · Enter pull". Additionally, when the "Pull the plate"
  button held focus, one Enter fired both the button's `onClick` and the window
  handler.
- **Measured before:** `audit/phase205-validate-v2.mjs` → **85 total / 71 PASS /
  14 FAIL**. The four checks emitted only downstream of `settle` never ran,
  which is why the total read 85 rather than 89.
- **Measured after:** **89 total / 89 PASS / 0 FAIL**.
- **Scope:** the `focus` and `settle` branches of the `Enter` handler only. No
  change to the state vocabulary, geometry, plate composition, or interaction
  model. `src/pages/Room.tsx` is untouched and still matches its Phase 31B
  checksum `372d6555bbe5edad7989798a5c08b297`.

## Premium 3D art-direction pass (authorised unlock)

The user explicitly authorised editing the protected spatial set, resolving the
contradiction between "authorise a premium cinematic 3D redesign" and
"protect `src/components/spatial/*`". Baseline re-anchored afterwards.

| File | Change | Lines |
| --- | --- | --- |
| `src/lib/three/easing.ts` | **New.** Bridges the house CSS cubic-beziers in `src/lib/motion.ts` into `t -> progress` solvers (`easeInk`, `easeLeaf`) so the WebGL layer can speak the same motion language as the DOM. Newton-Raphson with bisection fallback. | new |
| `src/components/spatial/SpatialArchive.tsx` | (1) ACES filmic tone mapping at exposure 1.06; (2) brass thread re-authored from a flat closed hoop into a helix that traces the plates' own parametric arc; (3) archival mat card behind each cover so plates read as mounted photographs rather than floating sprites; (4) deterministic arrival — plates rise on `easeInk` over `DUR.settle` with a per-article seeded delay, GPU-driven, stopping when landed. | 120 |
| `src/components/spatial/StoryEnding3D.tsx` | Same ACES grade for continuity with the archive; `SlowGroup` default period 1s → `DUR.breathe` (5s), so endings breathe at the house rate instead of visibly oscillating. Two scenes that author an explicit period keep it. | 22 |

Preserved unchanged: reduced-motion gate, no-WebGL fallback, `pointer-events:
none` + `aria-hidden`, viewport/tab gating, seeded determinism, `dpr` cap,
`low-power` preference, and disposal of every material and geometry created.
No essential content moved into the canvas. No React state is written per frame.

### Measured evidence

Canvas centre 256×160, SwiftShader software GL, identical harness, A/B:

| | non-black % | mean luma | max luma | `gl.getError()` |
| --- | --- | --- | --- | --- |
| before | 1.0 | 3.52 | 23 | 0 |
| after | **24.7** | **7.25** | 21.3 | 0 |

The scene is dark in this sandbox under software GL both before and after — a
renderer limitation already recorded in `PHASE23A1-REPORT.md` — not a regression
from the grade. On-screen WebGL fidelity in a real GPU browser remains the
user's final visual check.

Regression state after the pass: `/room` **89/89**, `npm test` exit 0 (51 routes
× 3 viewports, 0 errors, 0 overflow, 40/40 assets), `tsc -b` clean, build clean,
`verify-determinism` PASS, `check:secrets` PASS, `git diff --check` clean.

## `protected-checksums-milestone-final.sha256` — Phase 2 homepage re-baseline

`src/pages/Home.tsx` was modified under explicit authorization for the Phase 2
homepage pass only, and its entry re-baselined.

| | |
| --- | --- |
| before | `e97499ae9db931025978f33e5d96645d90ac5fa727cfbf7611749227f779fd1b` |
| after | `f7cc13b97795d82bf8ab3fca2ea81551a11917aa514f51d9492f24ccbe496626` |
| delta | +29 / −2 lines (818 → 845): adopted `ImmersiveShell`, added the brass thread |

The change is additive: the same thirteen composed children in the same order, the same
`<h1>`, the same ivory feature plate, the same `SpatialArchive`. Documented in
`docs/IMMERSIVE-HOMEPAGE.md`.

Note on wording: "thirteen" counts composed React children in the default
export, of which three are `MotifDivider` (rendered as a `motion.div`). The DOM
therefore reports ten `<section>` elements — 13 − 3. Both figures are correct
about different things; the browser baseline's `sections: 10` was unchanged
before and after the pass, so there was no structural change.

The other 26 entries are unchanged and still verify. This re-baseline authorizes
**Home.tsx only**. `Articles.tsx`, `Categories.tsx`, `ArticleDetail.tsx`,
`App.tsx` and `index.css` remain frozen at their original hashes.

## Phase 3 — `src/pages/Articles.tsx` re-baseline

Modified under explicit authorization for the Phase 3 archive pass only.

| | |
| --- | --- |
| before | `b221b693babed676e142321131f08c45a06eb18ca6c6332a59c72b1b67a9e876` |
| after | `27fb01d957bb2f0f7ce0b54d62f94950b496d4ed75c6c9a3d769858f26320a8a` |
| delta | +42 / −3 lines (303 → 342) |

Three additive changes: the page adopts `ImmersiveShell`; a desktop brass index
thread is added in the left margin; the focused folio gains depth (perspective on
the shelf, lift and scale on the selected plate, a slight recession on its
neighbours), desktop-only. Documented in `docs/IMMERSIVE-ARCHIVE.md`.

Unchanged: the roving tabindex and keyboard contract, `aria-current`,
`aria-label`, the search input, the category rail, the `visibleIdx` logic, the
`contents` grid wrapper, the motion presence animation, and the mobile thread.

The other 26 entries are unchanged and still verify. This authorizes
`Articles.tsx` only — `Categories.tsx`, `ArticleDetail.tsx`, `index.css` and
`App.tsx` remain frozen at their original hashes.

## Phase 4 — `src/pages/Categories.tsx` re-baseline

Modified under explicit authorization for the Phase 4 wings pass only.

| | |
| --- | --- |
| before | `ccd50f1e6007f58a287bb861f8c486ba0ec8f36c724d24b234fd9d6812dde824` |
| after | `11781f5c963275a8e01175f411d6567afab458ad86c93d6894159480f6d9b54e` |
| delta | +41 / −3 lines (273 → 311) |

Three additive changes: the page adopts `ImmersiveShell`; a desktop brass measure
is added down the left edge of the hall; the standing ivory door gains depth
(perspective on the grid, lift and scale on the plate, a slight recession on the
other doors), graded md < xl and absent on mobile. Documented in
`docs/IMMERSIVE-WINGS.md`.

Unchanged: the seven doors and their `aria-pressed` semantics, the roving visual
focus ring and the hall-focus effect, the `onKeyDown` handler, the wing folio
lists and their ghosting, the `aria-live` h2, the return control, the eighth-wing
CTA, the motion presence animation, and the mobile composition.

The recorded mobile ivory figure (18.99% measured vs 6.5% board target) was
**not** optimised toward and remains an UNRESOLVED VISUAL MEASUREMENT — no
authoritative Penpot MCP or official board export was available.

The other 26 entries are unchanged and still verify. This authorizes
`Categories.tsx` only — `ArticleDetail.tsx`, `index.css` and `App.tsx` remain
frozen at their original hashes.

## Phase 5 — `src/pages/ArticleDetail.tsx` re-baseline

Modified under explicit authorization for the Phase 5 reading-room pass only.

| | |
| --- | --- |
| before | `5d318c49a07b48b78cd74ac086137550c5578972f80fe2750f277f3ebb02ef8f` |
| after | `025e01e9347218bf01af1024c2a3ac68b174216ee68b63909616d875f7771123` |
| delta | +37 / −1 lines (747 → 783) |

Four additive changes, all outside the reading column: the page adopts
`ImmersiveShell`; a 1px brass reading measure is pinned to the header's top edge;
a desktop folio thread is added in the left margin; the next-feature card is set
as a plate (shadow + inner brass hairline, no transform). Documented in
`docs/IMMERSIVE-READING.md`.

One new non-protected helper: `src/components/immersive/ReadingMeasure.tsx`
(37 lines), exported from the immersive barrel (+2 lines).

Unchanged: every article title, body, author, date, category and reading time;
all covers, signatures, endings, comments and next-feature relationships;
save/share behaviour; creator links; the reading column measure (720px); the
roving reading mode and its Escape handling.

Measured against the strict reading-body rule at seven scroll positions:
paragraph X is a single value (436), paragraph `transform` is `none` throughout,
and the column stays 720px — while the measure's scaleX varies 0.015 -> 0.944
and the thread draws 0.885px -> 0px.

Deliberately not added: an opaque entrance veil, because a solid wine threshold
would put the title and first paragraph behind a transition.

The three protected child components — `ui/ArticleWorld.tsx`,
`ui/StoryEnding3D.tsx`, `ui/ArticleClosing.tsx` — were not opened, re-timed,
re-propped or re-composed; `#ending` measures 1849px before and after.

The other 26 entries are unchanged and still verify. This authorizes
`ArticleDetail.tsx` only — `index.css` and `App.tsx` remain frozen.
