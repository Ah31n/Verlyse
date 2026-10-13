# Verlyse Media — 3D immersive upgrade: Prompt 0 recon & plan

**Status:** plan only, no code written. Awaiting approval before Prompt 1.
**Decisions carried in:** StringTune read from the npm package (not tutorial files); criticals fixed first (done, `c117669`); **consolidate hard** on animation libraries.

---

## 1 · Routes — the README list is wrong

`audit-routes.cjs` requires `puppeteer-core` and therefore a browser, which this environment cannot install. It was not the source used. Instead every route was fetched and read individually last session (see `audit/SITE-AUDIT-2026-09-29.md`).

**52 addressable routes, not the 10 route patterns in the README.**

| Pattern | Count | In README? |
|---|---|---|
| `/`, `/about`, `/articles`, `/categories`, `/community`, `/submit`, `/ambassadors`, `/creators`, `/contact` | 9 | yes |
| `/article/:id` | 19 | yes (as a pattern) |
| `/creator/:id` | 16 | **no** |
| `/categories/:slug` | 7 | **no** |
| `/room` | 1 | **no** |
| 404 catch-all | — | no |

Three route families the prompt pack never mentions. Two of them matter a lot:

- **`/creator/:id` (16 routes)** is the single biggest surface in the site and the one Prompt 4 describes as "the polaroid wall". See §4 for why that prompt cannot be built as written.
- **`/room`** is a full-screen spatial page that already renders **outside** `Layout` (no header, no footer) and already has its own WebGL archive. It is the closest thing to the target aesthetic that already exists, and the pack has no plan for it. It must be reconciled with `SceneRoot` or it will end up with two Canvases.

**Action for Prompt 1:** the scene map and the `SceneRoot` mount logic must account for 52 routes and for `/room` being outside the normal chrome.

---

## 2 · Scroll owner

### What exists today

- **`src/hooks/useSmoothScroll.ts` does not exist.** Prompt 0 asks what it does; the answer is that there is no smooth-scroll engine in this project at all. Scrolling is 100% native.
- **GSAP ScrollTrigger *is* used** — `cinematic/primitives.tsx:67` runs `scrollTrigger: { trigger, start, end, scrub: 0.6 }`. There are **10 `gsap.fromTo` call sites**, most scrubbed.
- **`motion`'s `useScroll`** is used in 5 components (`Home`, `ReadingRoom`, `ImmersiveShell`, `DossierRoom`, `ScrollBeat`).
- **Manual `scroll` listeners** in `Layout` (progress bar), `Header` (condense) and `Room`.
- **`ScrollToTop`** in `App.tsx` calls `window.scrollTo(0,0)` on every navigation.

So there are already three scroll readers, but **only one scroll owner: the browser.** Nothing hijacks it.

### The decision: **the browser stays the scroll owner. StringTune observes only.**

StringTune ships its own smooth-scroll engine, and the types confirm it can be switched off:

```ts
tune.scrollDesktopMode = 'default'   // native scroll, StringTune only observes
tune.scrollMobileMode  = 'default'
```

`ScrollState.mode` accepts `'smooth' | 'disable' | 'default'`, and `registerScrollMode()` exists for Lenis/Locomotive adapters. **We use none of that.** Rationale:

1. Native scroll is what the site does today and it is not a problem worth solving. Smooth-scroll hijacking is the single most common cause of broken `scroll-into-view`, broken find-in-page, and motion sickness.
2. `ScrollToTop` and the browser's own scroll restoration keep working untouched.
3. The README's reading-column promise on `/article/:id` ("the reading column stays still") is only credible if the page scrolls natively.

**Consequence to document in the README:** one scroll owner = the browser. StringTune's smooth mode is explicitly disabled on both desktop and mobile. GSAP ScrollTrigger is removed (§3), and its scrubbed effects move to StringTune `Progress`, which reads scroll rather than driving it.

**Bonus:** `tune.lockPageScroll()` / `unlockPageScroll()` exist. That is a first-class fix for audit finding **D4** (no scroll lock behind the search overlay, saved drawer and mobile menu). Fold it into Prompt 1.

---

## 3 · Library jobs after consolidating hard

| Library | Job | Verdict |
|---|---|---|
| **StringTune** 1.2.5 | Scroll progress, split text, glide/lerp, sequence, masonry, form validation, pointer layer (cursor/magnetic/impulse/spotlight), scroll lock | **add** |
| **motion** 13.2 | Route transitions, `AnimatePresence`, overlays, filter layout animation, reduced-motion source of truth | **keep** |
| **three** 0.185 + **@react-three/fiber** 8.18 | The Canvas, plates, gallery lighting | **keep** |
| **GSAP** 3.15 | ScrollTrigger scrubs + `quickTo` in `Magnetic` | **remove** |
| **animejs** 4.5 | One SVG line-draw in `BrassRule` | **remove** |
| **@react-spring/three** | not installed | **do not add** — `motion`'s spring covers plate hover; a fourth animation dependency contradicts the consolidation decision |

### Cost of removing GSAP — measured, not guessed

`cinematic/primitives.tsx` exports 10 primitives with **40 call sites** across the pages:

| Primitive | Call sites | Replacement |
|---|---|---|
| `MaskReveal` | 10 | StringTune `Progress` → CSS `clip-path` |
| `Slate` | 7 | `motion` variant |
| `CrashZoom` | 6 | StringTune `Progress` → `--progress` scrub |
| `Magnetic` | 6 | `motion` `useSpring` (~15 lines) |
| `DepthLayer` | 4 | StringTune `Parallax` |
| `Tilt3D` | 3 | `motion` `useSpring` |
| `PushIn`, `Rise3D`, `DepthStage`, `OrbitalDrift` | 4 total | `Progress` / `motion` |

This is the largest single piece of work in the whole plan and it is **pure refactor with no visible feature gain**. It is worth doing because it deletes a non-open-source dependency and, critically, because `Magnetic` is imported by `Header` — which is never lazy — so **GSAP currently ships in the 261 kB main chunk on every route including `/contact`** (audit finding B2).

**Recommendation: do this as Prompt 1b, its own branch and its own PR, before any 3D work.** Mixing a 40-call-site refactor into the Home rebuild would make the diff unreviewable.

---

## 4 · The two blocking content problems

### 4a · The Creators wall has 4 photographs and 12 monograms

Prompt 4 says: *"the polaroid wall. Each frame is a 3D-lit card … Portraits stay flat, uncropped, full rectangles, using the same asset from `/img/authors/{id}.webp`."*

Reality in `content.ts` and `public/img/authors/`:

- **4** of 16 creators have a `portrait:` field.
- Files are **`.jpg`**, not `.webp`. Five exist: `alina-javed-about.jpg`, `alina-javed.jpg`, `adeena-irfan.jpg`, `munkashay-javed.jpg`, `syeda-tasbeeha-noman.jpg`.
- The other **12** render typographic monograms — the live dossiers say "Portrait — the monogram".

A wall of 3D-lit photo frames would be four photographs and twelve sets of initials in identical frames. That reads as broken, not as design.

**Options (needs your call):**
1. **Design for the monogram.** Treat the monogram card as a first-class object — a letterpress plate, deep-embossed, lit by the same spotlight. The wall becomes photographs *and* pressed initials, which is honest to an archive that credits people it has no photo of. *Recommended — no invented content, and it respects the Portrait Rule by not faking portraits.*
2. Collect the missing 12 portraits before Prompt 4.
3. Show only the 4 photographed creators in 3D and leave the other 12 as DOM cards — inconsistent, not recommended.

### 4b · Home has 4 plates, not 3

`SPATIAL_PICKS` (`Home.tsx:860`) = `their-voices-matter`, `3-13`, `the-garden-beyond-my-tower`, `behind-every-headline`. The live page reads "№ 01 / 04". Prompt 3's "three real posters" and `Sequence` "01/03" are both off by one. Trivial, but it changes the sequence markup.

---

## 5 · StringTune 1.2.5 vs the tutorials — verified against the shipped types

Installed `@fiddle-digital/string-tune@1.2.5`, read `dist/index.d.ts` (4,352 lines).

**Confirmed working:** `StringTune.getInstance()`, `use(Module, settings?)`, `start(fps)`, `on/off/emit`, `destroy()`, `setupSettings()`. Types resolve correctly under `moduleResolution: "bundler"` despite the package `exports` map having no `types` condition — verified with a `tsc --noEmit` probe.

**License: MIT.** Cleaner than GSAP's, which is a point in favour of the swap.

**Modules exported (~30), all present:** `StringProgress`, `StringLerp`, `StringGlide`, `StringSplit`, `StringParallax`, `StringCursor`, `StringMagnetic`, `StringImpulse`, `StringSpotlight`, `StringSequence`, `StringMasonry`, `StringForm`, `StringLazy`, plus ones the pack never mentions that are directly useful: **`StringTilt`**, `StringMarquee`, `StringVelocity`, `StringAnchor`, `StringScrollbar`, `StringVideoAutoplay`, `StringResponsive`.

**API present in 1.2.5 that the tutorials (1.2.1, CDN script tags) do not show:**

- `registerScrollMode(name, factory)` and the `ScrollController` class — the scroll-owner escape hatch used in §2.
- `lockPageScroll()` / `unlockPageScroll()` — fixes audit D4.
- `scrollTo(position | selector | element | { …, duration, offset, immediate })`.
- `addScrollMark(rule)` / `removeScrollMark(id)` — declarative scroll triggers.
- `domBatcherEnabled`, `intersectionObserverEnabled`, `invalidateCenter(id)`, `onRebuild()`.
- A full `StringDev*` devtools suite beyond the two trackers the pack lists.

**⚠️ Devtools make a remote call.** The bundle hard-codes `DEVTOOLS_ACCESS_URL = "https://access.fiddle.digital/"` and the trackers run `validateDevtoolsAccess()` against it. Consequences:

1. Our CSP is `connect-src 'self' https://verlyse-react.vercel.app https://formsubmit.co` — that request **will be blocked in production**, which is the correct outcome but means the trackers silently do nothing there.
2. Prompt 1's "enable the FPS and position trackers behind `?debug`" and Prompt 9's "the dev FPS tracker shows ≥55fps" both depend on a remotely-gated feature. **Plan: dev-only, never shipped, and do not add the domain to the production CSP.** Measure frame rate with the browser's own profiler instead of making the acceptance criterion depend on a third-party server.

### Bundle cost — measured, not estimated

Built isolated Vite lib bundles against the real package:

| Import set | raw | **gzip** |
|---|---|---|
| Whole package (no tree-shaking) | 509 KB | **129 KB** |
| Core + `Progress` only | 217 KB | **50 KB** |
| Core + the 12 modules the pack wants | 322 KB | **75 KB** |

Tree-shaking works. **Budget for StringTune: 75 KB gzip**, and it cannot be route-lazy because it owns scroll/split/forms sitewide — it loads once, after first paint.

### Is Prompt 9's "3D chunk ≤ 300 KB gzip" reachable? Yes — with a correction

The budget is reachable **only because StringTune is not part of the 3D chunk.** Current measured gzip:

| Chunk | gzip today | after this plan |
|---|---|---|
| `three` + r3f (lazy) | 203 KB | ~210–230 KB with plates/shaders — **inside the 300 KB budget** |
| `react` (incl. react-router) | 90 KB | 90 KB |
| `index` (app + **GSAP**) | 92 KB | ~75 KB once GSAP goes |
| `motion` | 45 KB | 45 KB |
| `string-tune` (new, deferred) | — | 75 KB |

The 3D budget holds. But **total non-3D JS grows by roughly 58 KB gzip** (+75 StringTune, −17 GSAP). Prompt 9 should add a second budget: *initial JS (excluding 3D) ≤ 215 KB gzip.* Without that, the 3D budget is satisfied while the site still gets slower.

---

## 6 · Scene map, route by route (real content only)

| Route(s) | Scene | StringTune | Fallback <1024px / reduced motion |
|---|---|---|---|
| `/` | Dim hall, camera dolly, **4** plates from `SPATIAL_PICKS` | `Progress` (dolly + lead-plate clip-path open), `Sequence` (01/04), `Parallax` ×2, `Cursor`, `Magnetic`, `Split` (h1) | Current static cover |
| `/articles` | Folio rail, depth on 19 rows | `Progress` (rail), `Lerp` (row skew) | Current grid |
| `/categories` | Ring of the 7 real departments, `--total: 7` | `Split` + `Lerp` | Current 7 cards |
| `/categories/:slug` (7) | Selected wing steps forward | `Progress` | Current — **also fix D2/D11 here** |
| `/creators` | Wall of 4 photo plates + **12 monogram plates** (§4a) | `Spotlight`, `Impulse`, `Glide` on separate nested wrappers | Current wall |
| `/creator/:id` (16) | Single lit dossier plate | `Spotlight`, `Progress` | Current — **also fix D12/D13 here** |
| `/article/:id` (19) | Scene behind hero + `ArticleClosing` only; **frozen behind body text** | `Split` (h1 only), `Progress` (closings), `Masonry` ("Within the post") | Static |
| `/community` | Monumental 1,281; 19-cover film strip | `Split` `fit`, `Progress` + `Glide` | Current — **also fix D8** |
| `/about` | Inset depth | `Parallax`, `Progress` (mission line) | Current |
| `/submit`, `/contact` | **No scene.** Forms only | `Form` | — |
| `/ambassadors` | Medallion depth | `Progress` | Current |
| `/room` | **Already spatial.** Reconcile with `SceneRoot`, do not add a second Canvas | `Progress` | Existing |
| 404 | No scene | — | — |

---

## 7 · Risks

1. **Two Canvases on `/room`.** `SceneRoot` is "one persistent Canvas behind the router", but `/room` renders outside `Layout` and already mounts `SpatialArchive`. Must be resolved in Prompt 1, not discovered in Prompt 4.
2. **SSR / prerender.** `scripts/prerender-metadata.mjs` and `test:smoke` render all 19 routes in Node. StringTune touches `window` at module scope risk — it must be dynamically imported client-side only, and `test:smoke` must stay green after every prompt.
3. **The `.htaccess` ↔ `vercel.json` duplication just introduced.** Any new external origin (fonts, CDN, `access.fiddle.digital`) must be added to the CSP **in both files**. Easy to forget; it will present as a silently broken feature in production only.
4. **Accessibility regressions**, specifically: `Split` must keep `aria-label` on the parent; the `Cursor` follower must be `aria-hidden` and pointer-events-none; `Sequence` needs real keyboard controls; the existing focus traps must survive `lockPageScroll`.
5. **Mobile.** The pack notes parallax/cursor/magnetic/impulse/spotlight/lerp/glide are disabled on mobile by default — so ~60% of the visual work is desktop-only. Worth being explicit with stakeholders that the phone experience is the current site plus a few reveals.
6. **Scope.** 40 GSAP call sites + 52 routes + a new scene layer is not a one-week change.

---

## 8 · Proposed sequence (revised from the pack)

| Step | Work | Why here |
|---|---|---|
| ~~0~~ | ~~Criticals: HTTPS, headers, cover-image honesty, error boundary~~ | **done — `c117669`** |
| **1a** | StringTune provider, `@property` declarations, scroll mode `default`, `lockPageScroll` wired to the 3 modals (fixes D4) | Foundation, no visual change |
| **1b** | **Remove GSAP + animejs**; port 40 call sites to `motion` + `Progress` | Own PR. Deletes a non-OSS dep, removes GSAP from the main chunk |
| **1c** | Quick UI defect sweep from the audit: D1, D9, D11, D12, D13, C1 alt text | ~40 lines total, and Prompts 3–5 will rewrite these files anyway |
| **2** | `SceneRoot` + DOM→3D bridge + `Plate`, **including the `/room` reconciliation** | |
| **3** | Home (4 plates, not 3) | |
| **4** | Listing rooms — **after the §4a monogram decision** | |
| **5** | Article pages | |
| **6** | Forms → `StringTune Form` (also lands C2: `aria-invalid`/`aria-describedby`) | |
| **7** | Footer reveal | |
| **8** | Polish pass | |
| **9** | Perf/a11y/QA with the corrected two-budget rule | |

---

## 9 · Open questions for you

1. **§4a — the 12 missing portraits.** Design for the monogram (recommended), collect photographs first, or something else?
2. **§3 — do you want Prompt 1b (the GSAP removal) as its own PR before any 3D?** Recommended; it is the biggest diff and the least visual.
3. **Prompt 9's budget** — accept the added rule *initial JS excluding 3D ≤ 215 KB gzip*?
4. **`/room`** — fold it into `SceneRoot`, or leave it as the standalone spatial page it already is?
