# Animation & UI-kit decisions

Recorded so the reasoning survives. Every claim below was measured in this repo.

## motion.dev — ADOPTED

Migrated `framer-motion@11.18.2` → `motion@13.2.0`, **33 files**, import path
`framer-motion` → `motion/react`. Zero `framer-motion` references remain in `src/`.

`motion@13`'s type entry (`node_modules/motion/dist/react.d.ts`) is literally
`export * from 'framer-motion'` — it is a renamed re-export, not a separate
implementation. Consequence: installing `motion` *alongside* a `framer-motion@11`
pin produces **two copies** in the dependency tree:

```
+-- framer-motion@11.18.2      ← duplicate
`-- motion@13.2.0
  `-- framer-motion@13.2.0
```

The top-level `framer-motion` pin was therefore removed rather than kept. Only one
copy now resolves.

Cost of 11 → 13, measured on the emitted bundle:

| chunk | before | after |
| --- | --- | --- |
| `motion` | 122.86 kB / 40.91 kB gzip | **136.81 kB / 45.27 kB gzip** |

API surface in use was narrow and fully supported at v13: `motion` (29 sites),
`useReducedMotion` (21), `AnimatePresence` (9), `useInView` (5), `useTransform`
(4), `useScroll` (4), `useSpring` (1), `Variants` (1). No call site needed
rewriting — only the import specifier.

Verified after migration: `tsc -b` exit 0 · `npm run build` ✓ with 50 prerendered
metadata routes · `/room` **89/89** · `npm test` exit 0 (51 routes × 3 viewports,
0 console/page/network errors, 0 horizontal overflow) · assets **40/40** ·
`git diff --check` clean.

## anime.js — SELECTIVELY WIRED, ONE ISOLATED SURFACE

`animejs@4.5.0` (MIT). Under the updated authorization it is now wired into
exactly **one** surface: `src/components/ui/BrassRule.tsx`, an ornamental section
rule on `/about` that draws itself outward from the centre and closes with a brass
lozenge.

**Why anime.js rather than the existing motion system.** This is a path-length
draw, not a layout or route transition. `animejs/svg`'s `createDrawable` measures
the geometry (`pathLength`) and drives the dash pair as one normalised
`draw: "start end"` value, so both halves of the rule and the lozenge share a
single timeline. The same effect in `motion/react` means measuring every path by
hand and keeping two dash properties per element in sync — more code for no gain.

**Engine ownership.** anime.js is the only engine that touches this element, and
the only properties it writes are `stroke-dasharray` and `stroke-dashoffset`.
`motion/react` owns the surrounding section's opacity and transform; R3F owns 3D.
No property is shared, so no two engines write to the same transform or state.

**Not used on 3D.** `animejs/adapters/three` remains unwired. `SpatialArchive`'s
camera rig runs inside R3F's `useFrame`; two engines on one camera is a known
source of jitter.

**Verified in a real browser, not assumed:**

| check | result |
| --- | --- |
| draw progression (`stroke-dasharray`) | `0 1010` → `570.1 439.9` → `976.5 33.5` → `1000 0` |
| collapsed while off-screen (no flash) | `0 1010` before scroll |
| `prefers-reduced-motion` | dash attributes never applied; rule renders complete; no timeline created |
| `aria-hidden` / `pointer-events` | `true` / `none` |
| focusable nodes inside the rule | 0 |
| tab stops landing inside the rule | **0 of 80** |
| console errors | 0 |
| bundle cost, measured against a real `dist` before/after | **+32.9 kB raw / +13.2 kB gz**, confined to 1 chunk |

One real defect was found and fixed during this work: under React StrictMode the
effect runs twice, and `createDrawable` only applies its initial collapsed state
the first time it sees an element (it keys off `pathLength`). The second pass left
the rule fully drawn, so it flashed and then redrew. The component now forces the
collapsed state explicitly and removes `pathLength` on cleanup.

## Skiper UI / Watermelon UI — EVALUATED, REJECTED

Both are real, but neither is an npm package. Both are shadcn-style **copy-paste
registries**, and both registries are unreachable from a sandboxed agent:

```
skiperui.com      -> 000
watermelon.sh     -> 000
ui.watermelon.sh  -> 000
```

`registry.npmjs.org` is reachable, which is why `motion` and `animejs` installed
and these did not.

Beyond reachability:

| Requirement | Verlyse |
| --- | --- |
| `components.json` | **missing** |
| `src/lib/utils.ts` (`cn()`) | **missing** |
| `@radix-ui/*` | **0 dependencies** |
| `clsx` / `tailwind-merge` | **0** |
| React | **18.3.1** (Watermelon targets 19) |
| Framework | **Vite + react-router-dom 7** (both kits target Next.js) |

Skiper is additionally **paid** ($129 Premium / $549 Exclusive; free tier requires
attribution) and describes itself as a *"dark, black-canvas"* collection with
*"Geist-typeset, Vercel/Apple-inspired"* polish. Its catalogue — OTP inputs, KPI
stat tiles, sortable data tables, sparklines, a Dynamic Island — is SaaS-dashboard
furniture, which the project brief explicitly excludes.

**Decision:** adopt no UI kit. Verlyse already ships 24 hand-authored UI components
and an art-directed 3D layer. If a concrete interaction pattern is needed later,
implement that single pattern natively in the house idiom (wine / brass / ivory /
serif display) rather than adopting an entire kit and its foundation.

### Re-check under the updated authorization

Watermelon UI is now permitted selectively, so it was re-examined before use. It
still cannot be adopted, for a reason that is not just reachability:

- `watermelon.sh`, `ui.watermelon.sh` and `ui.xiaowei.fun` all return `000`.
- The npm package named `watermelon-ui` is **not this project**. Its metadata
  resolves to `github.com/cyrianax/watermelon` — an unrelated repository, with no
  React peer dependency and no component registry. Installing it would import
  someone else's code under a familiar name.
- The real registry's license and dependency tree therefore **cannot be verified**,
  and unclear-source components are out of scope by policy.

**Decision:** no Watermelon UI import. When one of its patterns is wanted, the
pattern is reimplemented natively on the existing Verlyse components, and the
pattern and its source are recorded here. `BrassRule` is the first such case: the
"line draws itself" ornament is authored from scratch as inline SVG, with zero
added dependencies beyond the already-approved anime.js.

Skiper UI remains rejected on its own terms — paid, Next.js-targeted, and
SaaS-dashboard furniture the brief excludes.

## GSAP — ADOPTED ON ONE ROUTE, BY EXPLICIT OVERRIDE

**Status:** wired on `/about` only (the cinematic pilot). Not present on any
other route.

### Licence — read this before adding a second surface

GSAP is **not open source**. Verified from the registry and the installed
package, not from memory:

| field | value |
| --- | --- |
| version | `3.15.0` |
| `package.json` `license` | `"Standard 'no charge' license: https://gsap.com/standard-license."` |
| `LICENSE` file in the tarball | **none** |
| unpacked size | 6.26 MB |

This was recorded as a rejection reason in `docs/IMMERSIVE-HOMEPAGE.md` and the
package was deliberately omitted. It has now been added by explicit decision of
the project owner, who was shown the licence terms and chose to override the
standing "no unlicensed or unclear-source components" rule for this case.

**Consequence:** the "no charge" terms are GreenSock's, not an OSI licence. If
this repository is ever redistributed, sublicensed, or used commercially, the
terms at `https://gsap.com/standard-license` must be re-read and satisfied. This
note exists so that decision is never invisible.

### Why GSAP and not the existing engines

`motion/react` already covers scroll choreography. GSAP was chosen for the
Higgsfield-style camera moves on `/about` because `ScrollTrigger`'s scrub model
gives direct, declarative scroll-linked control of a multi-beat camera sequence
(crash zoom → tilt through the stack → orbital drift → push in) without
hand-rolling the interpolation. That is a real capability argument, not
preference — but it is a *fourth* engine, so the ownership rule below is strict.

### Engine ownership on `/about`

| engine | owns | element |
| --- | --- | --- |
| GSAP ScrollTrigger | crash-zoom scale/opacity, stage `rotateX`, stack `rotateY`, per-sheet parallax `y`, imprint push-in | **only** the wrapper `div`s created inside `src/components/cinematic/primitives.tsx` |
| `motion/react` | the four `motion.section` reveals (`opacity`, `translateY`) | the `motion.section` elements |
| anime.js | `stroke-dashoffset` / `stroke-dasharray` | the BrassRule `<line>` only |

Enforced structurally, not by convention: every primitive renders two nested
elements — an outer one that carries `className` (so layout stays the page's)
and an inner one that GSAP alone animates. Page content sits *inside* the
animated element, so GSAP can never target a `motion.*` element. No property on
any element is written by two engines.

### Reduced motion, cleanup, scope

- **Reduced motion is structural.** `useCinematic` returns before invoking the
  build callback when `prefers-reduced-motion: reduce` matches, so no `gsap.set`
  ever writes an initial state. Verified by probe: the crash-zoom and stage
  elements carry `null` transform in reduced mode, and the `h1` plus all four
  sections are present.
- **Cleanup is total.** `gsap.context(...).revert()` on unmount kills every
  tween and ScrollTrigger and strips the inline styles they wrote.
- **No scroll hijacking.** Every tween is `scrub`; nothing pins or traps the
  scrollbar. The page moves when the visitor moves.
- **Scope is one route.** The barrel is imported only by `src/pages/About.tsx`.

### Cost, measured on real build output

| | before | after | delta |
| --- | --- | --- | --- |
| JS chunks | 26 | 26 | 0 |
| raw | 1,621,868 B | 1,738,731 B | **+116,863 B** |
| gzip | 470,761 B | 515,969 B | **+45,208 B** |

The whole addition lands in the lazy-loaded `About-*.js` route chunk
(157,449 B). No other route downloads GSAP.

### Verification at the pilot commit

```
npm test                exit 0 — 51 routes × 3 viewports, 0 console/page/network
                        errors, 0 horizontal overflow, reduced-motion PASS,
                        WebGL-off PASS, 0 FAIL
/room validator         exit 0 — TOTAL 89 | PASS 89 | FAIL 0
phase16-a11y            exit 0 — 24 ✓ / 0 ✗
cinematic probe         PASS — crash zoom translate(0,0) → scale(2.2,2.2),
                        opacity 1 → 0; stage rotateX(2.81deg) → 0;
                        reduced motion writes no transform at all
/about in matrix        about|desktop 1440/1440, about|tablet 768/768,
                        about|mobile 390/390 — scrollWidth == innerWidth
```

### Roll-out rule

`/about` is a **pilot**. Extending the cinematic layer to any other route needs
its own decision, because `Home`, `Articles`, `Categories`, `ArticleDetail`,
`App` and `index.css` are protected and Penpot fidelity is still unverified.

### Site-wide rollout (after the /about pilot)

The crash-zoom beat was extended to the five other **unprotected** pages —
`/ambassadors`, `/community`, `/creators`, `/submit`, `/contact` — so the whole
unprotected site shares one camera language. Each wraps only its decorative,
`aria-hidden` ghost heading in `CrashZoom`; no form field, grid, button or
protected component is transformed.

The **protected** pages (`Home`, `Articles`, `Categories`, `ArticleDetail`) and
`/room` were deliberately left out: they are in the protected manifest and their
visuals are Penpot-unverified, so extending the cinematic layer there needs its
own decision plus a manifest re-baseline. The article `Signature` flourishes
already draw in ink via `motion/react` in the protected `ArticleClosing.tsx`;
that logic is untouched.

Verified after the rollout: `npm test` exit 0 (51 routes × 3 viewports, 0
console/page/network errors, 0 horizontal overflow, reduced-motion PASS,
WebGL-off PASS, 0 FAIL); `/room` 89/89; reduced-motion writes no transform on the
reworked pages; `/creators`, `/community`, `/ambassadors`, `/submit`, `/contact`
all have scrollWidth == innerWidth at desktop.
