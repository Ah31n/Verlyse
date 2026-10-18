# Verlyse — visual refinement log

Required by the Visual + Interaction Override, §20. One entry per change: what it was, what it is, why, and what happens when motion is unavailable.

**Scope honesty:** this pass built the interaction *foundation* and applied it to four production surfaces. It is a first pass against a directive that asks for work across every route. §22's creative test — *"does this feel like the same Verlyse, but substantially more alive?"* — cannot be answered from this environment, because no browser can be installed here. Nothing below claims a visual result I have seen.

---

## 1 · The interaction runtime

**Old** — no scroll-linked DOM motion system. Reveals were motion's `useInView`; scroll-scrubbed effects were GSAP ScrollTrigger inside `components/cinematic`.

**New** — `src/lib/stringTune/` owns a StringTune 1.2.5 runtime: idle-booted after first paint, route-aware, reduced-motion aware, pointer-gated.

**Why** — the directive requires StringTune to genuinely contribute to the interaction language, with documented ownership, not to exist as a dependency.

**Implementation** — `boot.ts` (module allowlist), `runtime.ts` (lifecycle), `tokens.ts` (scales), `attrs.ts` (typed attribute builders), `StringTuneProvider.tsx` (mount + per-route re-scan).

**Interaction goal** — the page should feel composed across scroll rather than assembled from fades.

**Accessibility fallback** — the runtime does not boot at all under `prefers-reduced-motion`. Every custom property's registered `initial-value` resolves to the at-rest composition.

**Performance** — lazy chunk, **59 KB gzip**. Entry chunk unchanged at 93 KB gzip.

---

## 2 · `/articles` — the folio shelf

**Old** — a grid of plates. Each card entered with a motion fade-and-rise; the cover image was static. Depth came only from the selected card's shadow and scale.

**New** — each cover plate now lags the scroll slightly (`glide`, restrained) and catches a soft cursor light that tracks across it (`spotlight`). The shelf reads with layered depth instead of as a flat grid.

**Why** — §4 asks for orchestrated folio entry and selective image parallax; §14 warns against the archive feeling like a generic card grid.

**Implementation** — `spotlitGlide('restrained')` + `.st-spotlit` on the `.plate-thumb` wrapper inside each card.

**Ownership** — deliberately *not* the card. Motion already animates card opacity from filter state (`receded`, `inner`), so StringTune was given the inner plate and different properties: transform via glide, and a `::after` overlay for light. No two systems write one property.

**Accessibility fallback** — `--spotlight-distance` rests at `1`, so the overlay is fully transparent; glide resolves to no offset. The shelf renders exactly as before.

**Mobile** — spotlight and parallax modules are never registered below 1024px, and the CSS neutralises the overlay under `(hover: none)`.

---

## 3 · `/creators` — the contributor wall

**Old** — the portrait plate had a GSAP `Tilt3D` hover tilt. Nothing responded to pointer *position* within the plate.

**New** — light now tracks the cursor across the portrait frame, so the plate reads as a physical print under a moving lamp rather than a flat image that tilts.

**Why** — §4 asks for contributor portrait hover interaction and spotlight/focus behaviour that improves exploration.

**Implementation** — `spotlight()` + `.st-spotlit` on the `img-frame`.

**Ownership** — `Tilt3D` (GSAP) keeps the transform; StringTune only paints through `::after`. The dossier CTA keeps GSAP `Magnetic` — StringTune's magnetic is registered but intentionally not used there, because two magnetics on one control is exactly the effect soup §5 forbids.

**Portrait Rule** — untouched. The image keeps `object-contain`, its own aspect ratio, no crop, no mask, no recolour. The effect is an overlay on the *frame*, never a filter on the photograph.

**Accessibility fallback** — overlay transparent at rest.

---

## 4 · `/article/:id` — the reading measure

**Old** — reading progress existed only as the global 12-leaf hairline in the site chrome, shared by every route.

**New** — the feature itself carries a brass hairline directly under the hero that fills as the reader moves through the body. Progress becomes part of the editorial composition rather than browser chrome.

**Why** — §4 asks for progress-linked reading indicators; §11 asks that scroll become composition.

**Implementation** — `progress('bottom','top')` on the `<article>`; `--progress` inherits to a sticky child carrying `.st-measure`, which scales on X.

**Reading column** — untouched. The body text is never moved, skewed or scrubbed. `--progress` is consumed only by the hairline. This is a hard rule from the directive and from R05.

**Accessibility fallback** — `--progress` initial value is `1`, so with no runtime the rule renders complete — the correct resting state for a feature you have finished. Under reduced motion the transform is removed entirely.

---

## 5 · `/` — the feature cover plate

**Old** — the cover plate faded and scaled in on load, then sat still.

**New** — the image drifts against the page at a restrained rate as the reader scrolls past it.

**Why** — §13: photography is editorial material, not background decoration; §6 gives "an editorial image may move against the page at a restrained rate" as a target.

**Implementation** — `drift('restrained')` (rate `-0.06`) on the `<img>`, with a `scale-[1.06]` so the drift never exposes an edge.

**Ownership** — motion animates the *frame* (entry opacity/scale); StringTune drifts the *image* inside it.

**LCP note** — this is the likely LCP element. The effect is transform-only, so it cannot cause layout shift, and the runtime boots on idle *after* first paint, so it cannot delay the image. The separate finding that this image's `<link rel=preload>` carries `fetchpriority="low"` is still open and still unmeasured — see `audit/CODEBASE-AND-SITE-ASSESSMENT.md`.

**Mobile** — parallax is not registered below 1024px.

---

## 6 · Design tokens

**Old** — durations and rates written inline per component.

**New** — `tokens.ts` defines distance (`micro`→`cinematic`), timing (`instant`→`cinematic`), intensity (`restrained`/`standard`/`expressive`), plus drift and glide scales. `attrs.ts` builds every `string-*` attribute set from them, so no component hand-writes a rate. Complements the Tailwind duration/easing tokens added in R08.

**Why** — §19. The whole site's expressiveness can be dialled in one file.

---

## 7 · Completed in the `2026-10-18` Skill Pack & Review Pass

- **Extended StringTune across `/categories`, `/community`, `/about`, `/creator/:authorId`, `Footer`, and `ArtGallery`**: Wired `spotlight()` onto `/categories` index shelves, `/community` `FilmFrame` cards, `/about` Sheet IV founder portrait, `Footer` newsletter card, and `WriterProfile` portrait, plus `spotlitGlide('restrained')` onto `WriterProfile` related plates and `ArtGallery` exhibition plates (`transition-[border-color,box-shadow]`).
- **StringTune 4-module allowlist & race-safe reduced-motion lifecycle**: Trimmed `src/lib/stringTune/boot.ts` to the 4 active modules (`StringProgress`, `StringGlide`, `StringParallax`, `StringSpotlight`; `dist/assets/boot-CfrjN6Gu.js`: `199.82 kB` / `51.65 kB` gzip), updated `drift()` in `src/lib/stringTune/attrs.ts` to `string: 'progress|parallax[]'`, and added generation-checked start/stop serialization in `runtime.ts` + `StringTuneProvider.tsx`.
- **Evicted `gsap` from `Header`/`index-*.js` and gated `animejs` & `StoryEnding3D`**: Migrated `Magnetic` to `src/components/ui/Magnetic.tsx` (`motion/react` `useSpring`), isolated `gsap` (`dist/assets/gsap-a3sj5zmn.js`, `114.01 kB` / `45.16 kB` gzip), lazy-gated `animejs` (`dist/assets/anime-CcJk6tc-.js`, `32.40 kB` / `13.15 kB` gzip) inside `BrassRule.tsx` on `!reduce && near`, and lazy-gated `StoryEnding3D` (`dist/assets/StoryEnding3D-CDvXr6Hv.js`, `10.93 kB` / `3.21 kB` gzip) inside `EndingSpatialStage` on `glSupported && !reduce && near && tabVisible`.
- **Verified in headless Chromium (`153.0.8010.0`)**: Executed `asset-audit.mjs` (`45/45` role subset + `104/104` full public media/font inventory), `interaction-audit.mjs` (`17/17` checks including `quiet-grief-gallery-computed-layout`), and `verify-flags.mjs` with `0` console errors.

---

## 8 · Verification actually performed

| Check | Result |
|---|---|
| `tsc -b` & `npm run typecheck:api` | pass |
| `vite build` | pass — 54 shells, 54 sitemap URLs |
| `test:metadata` | pass — registry coherent (54 shells, 54 sitemap URLs) |
| `test:smoke` | pass — 20/20 SSR route cases render (18 valid routes across all 11 `<Route>` patterns + 2 missing-slug 404 fallbacks) |
| `test:flows` (jsdom) | 14/14 — dialog semantics, search keyboard contract, focus restoration, save persistence + single-item removal sync, `ArtGallery` layout & transform ownership, editorial published/provisional counts, craft `aria-pressed` states, StringTune pending-boot race safety, 12× mount/unmount clean |
| `test:newsletter` | pass (15/15 synthetic checks; live production verification pending / blocked in sandbox) |
| `check:secrets` | pass |
| Chromium `asset-audit`, `interaction-audit`, `verify-flags` | pass — 45/45 role subset & 104/104 full public media/font inventory, 17/17 interaction checks, 0 console errors |
| entry chunk (`dist/assets/index-Br7b5VOr.js`) | `89.38 kB` gzip (`gsap` bundled) → `51.49 kB` gzip (`gsap` evicted) → **`58.04 kB` gzip** (`180.42 kB` raw, including `EditorialCraftSystem`) |
| StringTune chunk (`dist/assets/boot-CfrjN6Gu.js`) | `130 kB` → `60.60 kB` (7 modules) → **`51.65 kB` gzip** (`199.82 kB` raw, 4 active modules only) |
