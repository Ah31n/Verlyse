# The Verlyse interaction system

Required by the Visual + Interaction Override, §20. This is the ownership contract for every animated surface in the publication.

---

## 1 · StringTune version

`@fiddle-digital/string-tune` — **1.2.5**, pinned in `package.json`, installed from npm. MIT licensed.

Not the CDN build the Skill Hub tutorials use (1.2.1). The shipped `dist/index.d.ts` (4,352 lines) was read directly and is the source of truth for the API used here; several methods relied on below (`scrollDesktopMode`, `onRebuild`) are not shown in the tutorials.

---

## 2 · Modules used, and where

Registered in `src/lib/stringTune/boot.ts`. **That list is the bundle.** Anything absent from it is absent from the build.

| Module | Registered | Surface | Attribute helper |
|---|---|---|---|
| `StringProgress` | always | `/article/:id` — the reading measure under the hero, filling as the reader moves through the feature | `progress()` |
| `StringGlide` | always | `/articles`, `ArtGallery`, `WriterProfile` — each folio's cover plate lags the scroll, so the shelf reads with depth rather than as a flat grid | `spotlitGlide()` |
| `StringParallax` | desktop only | `/` — the feature cover plate drifts against the page at a restrained rate | `drift('restrained')` |
| `StringSpotlight` | desktop only | `/articles`, `/creators`, `/categories`, `/community`, `/about`, `Footer`, `WriterProfile`, and `ArtGallery` plates — light follows the cursor across the plate | `spotlight()` |

*(Note: `src/lib/stringTune/boot.ts` registers only these **4 active modules** (`UNIVERSAL_MODULES = [StringProgress, StringGlide]`, `POINTER_MODULES = [StringParallax, StringSpotlight]`, emitted as `dist/assets/boot-CfrjN6Gu.js`: `199.82 kB` / `51.65 kB` gzip), `drift()` in `attrs.ts` uses `string: 'progress|parallax[]'`, and `runtime.ts` + `StringTuneProvider.tsx` enforce generation-checked start/stop serialization on `prefers-reduced-motion: reduce` and unmount.)*

### Modules deliberately NOT used

| Module | Why not |
|---|---|
| `StringLazy` | Would remove `src` from the prerendered HTML, hiding images from crawlers. Native `loading="lazy"` is already in place. |
| `StringMasonry` | The archive is a deliberate folio shelf with a receding-neighbour rhythm; a masonry reflow would fight the existing filter states and push it toward Pinterest, which §14 forbids. |
| `StringSequence` | The home plate sequence is already a working React state machine. Replacing it would be substitution, not improvement. |
| `StringForm` | `/submit` and `/contact` already validate, focus the first bad field, and expose `aria-live` status. Re-implementing validation in a library risks the accessibility work for no user gain. |
| `StringCursor` | A follower element sitewide is the "agency website cursor" §12 explicitly rejects. Spotlight gives the tactility without the ornament. |
| `StringImpulse` | No surface has an editorial reason to sway. |
| `StringFPSTracker`, `StringPositionTracker`, `StringDev*` | Development only, and they call `https://access.fiddle.digital/`, which our CSP blocks by design. Never shipped. |
| `StringScroller` / smooth scroll | See §3. |

---

## 3 · Scroll ownership

**The browser owns scroll.** StringTune ships its own smooth-scroll engine and it is explicitly switched off:

```ts
tune.scrollDesktopMode = 'default'
tune.scrollMobileMode  = 'default'
```

StringTune only *reads* scroll. No scroll-jacking (§11), native scrolling, find-in-page and `scroll-into-view` all keep working, and `ScrollToTop` remains the only code that ever sets scroll position.

---

## 4 · What each system controls

| System | Owns | Never touches |
|---|---|---|
| **CSS** | hover, focus-visible, colour/opacity transitions, layout, the meaning of every StringTune custom property (`src/index.css`, "THE STRINGTUNE CONTRACT") | runtime-computed values |
| **StringTune** | scroll-linked DOM motion, cursor light, parallax drift, progress mapping | React state, presence/exit, WebGL |
| **motion** | route transitions, `AnimatePresence`, overlays, `Reveal`, `SplitText`, filter-aware card entry on `/articles` | scroll position |
| **GSAP** | the established cinematic primitives only — `CrashZoom`, `MaskReveal`, `Slate`, `Magnetic`, `Tilt3D` and the rest of `components/cinematic` | anything new |
| **R3F / three** | `SpatialArchive`, `StoryEnding3D` | DOM layout |

### No two systems on one property

This was the main design constraint, and it shaped every insertion point:

- **`/articles`** — motion keeps the card-level entry (it is computed from filter state: `opacity` depends on whether the folio matches the query). StringTune was applied to the **inner plate**, using *glide* (transform) and *spotlight* (a `::after` overlay). Different element, different properties.
- **`/creators`** — the portrait plate is already inside GSAP `Tilt3D`, which owns its transform. StringTune adds **only** spotlight, which paints through `::after`. The dossier CTA keeps GSAP `Magnetic`; StringTune's magnetic is registered but deliberately unused there.
- **`/`** — motion animates the plate *frame* (opacity/scale on entry); StringTune drifts the `<img>` *inside* it.
- **`/article/:id`** — the reading column is never moved. `--progress` is published on the `<article>` and consumed only by the sticky hairline.

---

## 5 · GSAP isolation & `Magnetic` migration (`2026-10-18` update)

Per §5 of the directive, GSAP remains for already-established `ScrollTrigger` camera sequences (`CrashZoom`, `DepthStage`, `DepthLayer`, `OrbitalDrift`, `PushIn`, `MaskReveal`, `Tilt3D`, `Rise3D` in `src/components/cinematic/primitives.tsx`) and no new GSAP scenes were added. However, `Magnetic` was migrated to `src/components/ui/Magnetic.tsx` (`motion/react` `useMotionValue` + `useSpring`), `vite.config.ts` isolates `gsap` (`dist/assets/gsap-a3sj5zmn.js`, `114.01 kB` / `45.16 kB` gzip) into a lazy chunk, and `BrassRule.tsx` dynamically imports `animejs` (`dist/assets/anime-CcJk6tc-.js`, `32.40 kB` / `13.15 kB` gzip) only when `!reduce && near`. As a result, `Header.tsx` no longer pulls `gsap` into the initial entry chunk (`252.87 kB` / `89.38 kB` gzip before `gsap` eviction; `154.45 kB` / `51.49 kB` gzip immediately after `gsap` eviction prior to `EditorialCraftSystem`; `dist/assets/index-Br7b5VOr.js` at `180.42 kB` / `58.04 kB` gzip in the current build with `EditorialCraftSystem`), and 46 of 53 routes never download `gsap`.

---

## 6 · Mobile behaviour

Not a shrunken desktop (§15).

`supportsPointerEffects()` requires `(hover: hover) and (pointer: fine)` **and** `innerWidth >= 1024`. Below that, `StringParallax`, `StringMagnetic` and `StringSpotlight` are **never registered** — not disabled, not hidden: the code never runs and the modules are inert.

The CSS contract independently neutralises the spotlight under `@media (hover: none), (max-width: 1023px)`, so even a mis-registration cannot produce a stuck highlight on a phone.

Touch keeps: progress-driven reading measure, glide lag, and the full static composition.

---

## 7 · Reduced motion

`startStringTune()` returns `null` immediately when `prefers-reduced-motion: reduce` matches. **The runtime never boots.** No listeners, no rAF loop, no chunk fetch.

This is safe because every StringTune custom property has a registered `initial-value` chosen so the at-rest state *is* the design:

| Property | Initial | Meaning at rest |
|---|---|---|
| `--progress` | `1` | reading measure full, plates fully entered |
| `--spotlight-distance` | `1` | overlay fully transparent |
| `--spotlight-angle` | `0` | unused |

The `@media (prefers-reduced-motion: reduce)` block in the contract then flattens transforms and delays to zero. The result is a deliberate static composition, not a frozen animation.

---

## 8 · Performance

Measured, gzipped, from the current production build (`arena/741ed410-verlyse`, branched from `ea6392572d2481ef3f197799ac0ac2917e9e135a`):

| Chunk | Historical baseline (`gsap` in `index`) | Current build (`npm run build`) |
|---|---|---|
| entry (`dist/assets/index-Br7b5VOr.js`) | `252.87 kB` (`89.38 kB` gzip) | **`180.42 kB` (`58.04 kB` gzip)** (`gsap` evicted; includes shared `EditorialCraftSystem`; was `154.45 kB` / `51.49 kB` gzip prior to `EditorialCraftSystem`) |
| StringTune (`dist/assets/boot-CfrjN6Gu.js`, lazy) | `233.36 kB` (`59.09 kB` gzip, 7 modules) | **`199.82 kB` (`51.65 kB` gzip)** (4 active modules in `boot.ts`) |
| `dist/assets/gsap-a3sj5zmn.js` (lazy on secondary camera routes) | bundled in `index` | **`114.01 kB` (`45.16 kB` gzip)** |
| `dist/assets/anime-CcJk6tc-.js` (lazy inside `BrassRule` when `!reduce && near`) | bundled in `About` | **`32.40 kB` (`13.15 kB` gzip)** |

The library is dynamically imported on `requestIdleCallback` after first paint, so it is not on the critical path and cannot delay LCP.

**A tree-shaking trap worth recording:** the first implementation did `await import('@fiddle-digital/string-tune')` and read `mod.StringProgress`. That retains the whole namespace — the chunk measured **130 KB gzip**, the entire library. Moving the imports into `boot.ts` as *static named imports*, and dynamically importing *that module*, let Rollup shake it to **59 KB**. A dynamic import of a package cannot be tree-shaken; a dynamic import of your own module with static named imports can.

**Not measured:** LCP, CLS, INP, FPS. No browser can be installed in the environment this was built in, so no runtime performance claim is made.

---

## 9 · Custom modules

**None.** No `StringModule` subclass was written. Everything uses the documented public API (`getInstance`, `use`, `start`, `onRebuild`, `destroy`, `scrollDesktopMode`, `scrollMobileMode`) and the documented `string-*` attributes. No undocumented internal runtime API is touched.

---

## 10 · File map

```
src/lib/stringTune/
├── boot.ts                 static named imports — the module allowlist and the bundle
├── runtime.ts              lifecycle: idle boot, scroll mode, gating, re-scan, teardown
├── tokens.ts               distance / timing / intensity / drift / glide scales (§19)
├── attrs.ts                typed builders for every string-* attribute set used
└── StringTuneProvider.tsx  mounts once inside the router; re-scans per route
```

`src/index.css` → "THE STRINGTUNE CONTRACT" holds the `@property` registrations and every rule that gives a StringTune value visual meaning.
