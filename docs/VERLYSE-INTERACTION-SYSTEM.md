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
| `StringGlide` | always | `/articles` — each folio's cover plate lags the scroll, so the shelf reads with depth rather than as a flat grid | `spotlitGlide()` |
| `StringSplit` | always | reserved; the display headings are still served by the existing `SplitText` (see §4) | `split()` |
| `StringLerp` | always | reserved for scroll-velocity skew | `lerp()` |
| `StringParallax` | desktop only | `/` — the feature cover plate drifts against the page at a restrained rate | `drift('restrained')` |
| `StringSpotlight` | desktop only | `/articles` folio plates and `/creators` portrait plates — light follows the cursor across the plate | `spotlight()` |
| `StringMagnetic` | desktop only | available; the existing GSAP `Magnetic` still owns the current call sites (see §5) | `magnetic()` |

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

## 5 · A reversal worth flagging

An earlier decision in this project was **"consolidate hard — drop GSAP and Anime.js entirely."** §5 of this directive instead keeps GSAP "for already-established cinematic sequences" and forbids arbitrary new GSAP scenes.

**This directive was followed.** GSAP and Anime.js remain; no new GSAP was added. The consequence is that the publication now runs four animation systems, and GSAP still ships in the 93 KB entry chunk because `Header` imports `Magnetic`. That cost is now a deliberate, documented choice rather than an oversight.

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

Measured, gzipped, from a real build:

| Chunk | Before | After |
|---|---|---|
| entry `index` | 93 KB | **93 KB — unchanged** |
| StringTune (lazy) | — | **59 KB** |

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
