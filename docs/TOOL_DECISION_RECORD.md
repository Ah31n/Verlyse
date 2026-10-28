# Verlyse Tool Decision Record

## Primary Evaluations & Active Implementations (`src/components/ui/EditorialCraftSystem.tsx`)

### 1. Type Garden (`https://type-garden.vercel.app/`) — Fixed Botanical Typography & Back-Cover Specimen

- **Resource / Tool**: Type Garden (`https://type-garden.vercel.app/`)
- **Classification**: Hosted creative tool / interactive typography reference (treated strictly as a design reference, not an embedded widget/editor)
- **User Intent**: Adapt the botanical-typography craft principle into fixed, brand-owned Verlyse display typography and the back-cover wordmark specimen without exposing a user-editable generative editor or tool/demo labels.
- **Target Existing Owners**:
  - `src/components/ui/EditorialCraftSystem.tsx` (`<FloralWord>` and `<VerlyseBackCoverSpecimen>`)
  - Route `<h1>` / section display headers across `src/pages/Home.tsx` (`rose`, `magnolia`, `camellia`, `lotus`), `src/pages/Articles.tsx` (`laurel`), `src/pages/Categories.tsx` (`iris`), `src/pages/Creators.tsx` (`lotus`), `src/pages/Community.tsx` (`marigold`), `src/pages/About.tsx` (`camellia`), `src/pages/Ambassadors.tsx` (`astrolabe-bloom`), `src/pages/Submit.tsx` (`magnolia`), and `src/pages/Contact.tsx` (`wax-rose`)
  - Single shared `src/components/layout/Footer.tsx` (Band 04 fixed back-cover `<VerlyseBackCoverSpecimen>`)
- **Compatibility Check**:
  - `<FloralWord>` wraps the italicized accent word of each route's `<h1>` with a decorative baseline bough and outer-terminal botanical sprigs (`aria-hidden="true"`, `pointer-events-none`) without crossing letterforms or adding nested interactive controls inside headings.
  - `<VerlyseBackCoverSpecimen>` inside `Footer.tsx` renders a fixed, non-editable, brand-owned `"Verlyse"` back-cover specimen (`data-footer-specimen="verlyse"`, `aria-hidden="true"`, `pointer-events-none`) with zero inputs, selects, radios, buttons, download links, focusable descendants, `TG`+digit codes, or generic tool-demo labels.
  - Uses 100% inline `<svg>` (zero `<canvas>` elements), preserving the `no-webgl-fallback` (`canvases === 0`) check and `jsdom` compatibility.
- **Rights / License Check**: Zero Type Garden code, controls, sample labels, IDs, or assets copied; 100% original project-authored React + SVG implementation.
- **Accessibility / Reduced Motion Impact**: Full semantic `<h1>` text and footer tagline remain intact on every route; decorative SVG layers are `aria-hidden="true"`.
- **Decision**: Implemented original project-native `<FloralWord>` across routes and fixed `<VerlyseBackCoverSpecimen>` in `src/components/layout/Footer.tsx`.
- **Evidence**: Verified in `src/components/ui/EditorialCraftSystem.tsx`, `npm run build`, `npm run test:flows` (`14/14`), `node scripts/interaction-audit.mjs` (`18/18`), and 8-viewport × 11-route (`88/88`) Chromium verification.

### 2. Dot Matrix System (`<DotMatrixLedger>`)

- **Resource / Tool**: 5×7 Dot-Matrix Punch-Card Counter & Telemetry Strip
- **Classification**: Project-native SVG capability (`src/components/ui/EditorialCraftSystem.tsx`)
- **User Intent**: Integrate intentional dot-matrix counters derived strictly from canonical data (`src/data/content.ts`) across route mastheads without synthetic `TG` or demo codes.
- **Target Existing Owners**: `Home.tsx` (`2007`), `Articles.tsx` (`2007`), `Categories.tsx` (`0720`), `Creators.tsx` (`1516`), `Community.tsx` (`0520`), `About.tsx` (`0420`), `Ambassadors.tsx` (`1003`), `Submit.tsx` (`0704`), and `Contact.tsx` (`0301`).
- **Decision**: Implemented in `src/components/ui/EditorialCraftSystem.tsx` (`DOT_GLYPHS` 5×7 numeric bitmap matrix rendered as inline `<svg aria-hidden="true">` with live counts derived from `src/data/content.ts`).

### 3. Logosystem (`https://logosystem.co/`) & Shapes Gallery (`https://shapes.gallery/`) — `<RouteEmblemSeal>` & Header Monogram

- **Resource / Tool**: Logosystem (`https://logosystem.co/`) & Shapes Gallery (`https://shapes.gallery/`)
- **Classification**: Reference galleries → Original project-native SVG emblem system
- **User Intent**: Apply intentional logo geometry and editorial shapes across the masthead logo and route headers.
- **Target Existing Owners**:
  - `src/components/layout/Header.tsx`: Upgraded the Verlyse `V` monogram with an octagonal registration ring, cardinal compass ticks, split-serif `V`, and crimson-gold botanical calyx node.
  - `src/components/ui/EditorialCraftSystem.tsx` (`<RouteEmblemSeal>`): Route-specific geometric seals (`octagram` on Home, `rosette` on Articles, `prism` on Categories, `vesperal` on Creators, `amphora` on Community, `pillars` on About, `astrolabe` on Ambassadors, `crosshair` on Submit, `wax-seal` on Contact).
- **Rights / License Check**: Zero third-party gallery logos or Shapes Gallery SVGs copied; 100% original project-authored SVG geometry.
- **Decision**: Implemented in `src/components/layout/Header.tsx` and `src/components/ui/EditorialCraftSystem.tsx`.

### 4. Haikei (`https://haikei.app/`) — `<HaikeiContourPlane>`

- **Resource / Tool**: Haikei (`https://haikei.app/`)
- **Classification**: Hosted creative tool → Original project-native SVG contour plane
- **User Intent**: Give every route hero and the back-cover wordmark plate intentional layered organic wave contours without obscuring real artwork.
- **Target Existing Owners**: `src/components/ui/EditorialCraftSystem.tsx` (`<HaikeiContourPlane>`) integrated into `Home.tsx`, `Articles.tsx`, `Categories.tsx`, `Creators.tsx`, `Community.tsx`, `About.tsx`, `Ambassadors.tsx`, `Submit.tsx`, `Contact.tsx`, and `Footer.tsx`.
- **Decision**: Implemented deterministic seed-varied 3-path contour SVGs (`aria-hidden="true"`, `pointer-events-none`).

### 5. RandomA11y (`https://randoma11y.com/primary`) — Contrast-Verified Token Pairings

- **Resource / Tool**: RandomA11y (`https://randoma11y.com/primary`)
- **Classification**: Hosted creative tool / WCAG 2.1 contrast helper (design-time reference only)
- **User Intent**: Verify high-contrast accessible editorial tokens across Verlyse dark-wine, parchment, and brass surfaces without exposing tool/palette picker UI on the public site.
- **Target Existing Owners**: `src/index.css` tokens and `BACK_COVER_PALETTE` in `src/components/ui/EditorialCraftSystem.tsx` (`#17070C` deep oxblood, `#F8F6F2` warm ivory, `#E6C77F` / `#D9B978` antique brass, `#9E243C` crimson rose).
- **Decision**: Applied directly as fixed Verlyse design tokens without public palette-selector controls or demo contrast labels.

### 6. Footer Design (`https://www.footer.design/browse`) — Single Shared `Footer.tsx`

- **Resource / Tool**: Footer Design (`https://www.footer.design/browse`)
- **Classification**: Reference gallery
- **Target Existing Owner**: `src/components/layout/Footer.tsx`
- **Decision**: Recomposed the single shared `<footer aria-label="Footer">` into 4 architectural bands culminating in the fixed, non-editable `<VerlyseBackCoverSpecimen>` wordmark while strictly maintaining `document.querySelectorAll('footer[aria-label="Footer"]').length === 1`.

---

# Record 07 — `/articles` archive wall redesign (Change Brief № 02)

Format from `templates/TOOL_DECISION_RECORD.md` in the Verlyse Arena skill pack. Records 1–6 above are retained
unchanged; this record covers only the `/articles` redesign.

> **Rule applied:** *"Do not fill 'integrated' from a reference visit or design note. Verify a real code, asset,
> manifest or service change."* Nothing below is called integrated unless it changed a file in this repository,
> and the file is named.

- **Task / acceptance outcome**: redesign one existing surface so every contributor cover shows whole, the archive
  is fully keyboard-reachable, filtering is honest to assistive technology, and the result meets WCAG 2.1 AA —
  without adding a route, section, footer, dependency or second animation engine.
- **Active branch and commit**: `arena/9f76f00e-verlyse`, on top of `bb28c48` (← `bf77f00` ← `1a20dd1`).
- **Existing Verlyse route/component owner**: `src/pages/Articles.tsx` and `src/index.css` (`.plate-thumb`). Per
  the redesign protocol's owner table, "archive/search/filter/sort" belongs to `pages/Articles.tsx`; the work was
  done in place and nothing was appended.
- **Checked date for every source below**: **2026-10-27**, by page fetch or by a live `registry.npmjs.org` query
  from this sandbox. The supplied catalogue's 2026-10-16 / 2026-10-26 entries were treated as dated claims to
  re-check, not as evidence.

## Resources assessed

| # | Candidate & official source | Classification | Licence / terms / compatibility evidence (2026-10-27) | Decision |
|---|---|---|---|---|
| 1 | `@designcodeio/threeui@1.2.0` — found by `registry.npmjs.org` **search** after [github.com/MengTo/threeui](https://github.com/MengTo/threeui) showed packages ship "under DesignCode scope" | Installed package (candidate) | **MIT**, published 2026-09-01. Peers `react >=18 <20` OK (18.3.1), `three >=0.149 <1` OK (0.185.1). **52.19 MB unpacked / 726 files.** Deps alias **two extra Three.js copies**: `three128: npm:three@0.128.0`, `three165: npm:three@0.165.0`. | **DO NOT USE** — compatible and rights-cleared, but no spatial need on a 2-D cover grid; three Three.js runtimes and 52 MB against a 1 095 KB page is disproportionate; content must stay readable without WebGL. |
| 2 | [threeui.com](https://threeui.com/browse?sort=recent) | Hosted gallery (FREE/PRO tiers) | Catalogue is 3D product/landing scenes — AURAL headphones, NEST architecture, Koi Mecha, Sakura River Valley, XGIMI assets. PRO items are tier-licensed. | **DO NOT USE** — nothing in it addresses an editorial archive index. |
| 3 | `threeui-cli@0.3.1`, `@designcodeio/threeui-cli@0.1.0`, `3ui-cli@0.1.2` | Copied source via CLI | Community copy-in CLI plus two Pro CLIs needing account auth / API key and a paid tier. | **DO NOT USE** — same fit failure; paid/authenticated paths not authorised. |
| 4 | [shadcn/ui](https://ui.shadcn.com/docs/components/base/aspect-ratio) | Copied source registry | Now ships **Base UI (default) / React Aria / Radix UI** variants. Default `AspectRatio` API is `ratio: number`, documented against `base-ui.com`. **CLI blocked here**: `curl https://ui.shadcn.com/r/styles/default/aspect-ratio.json` → `SSL_ERROR_SYSCALL`, HTTP 000, while `registry.npmjs.org` → HTTP 200 from the same shell. | **BLOCKED + DO NOT USE** — `ratio` duplicates native `aspect-[4/5]` (15 existing uses); `ToggleGroup` duplicates rails that are already `<button aria-pressed>`. |
| 5 | `@radix-ui/react-aspect-ratio`, `@radix-ui/react-toggle-group` | Installed package (candidate) | Installable, MIT. | **DO NOT USE** — duplicate of an existing Verlyse capability. |
| 6 | [lenis.dev](https://lenis.dev/) → `lenis@1.3.27` | Installed package (candidate) | Real, MIT, maintained by darkroom.engineering. | **DO NOT USE** — no scroll requirement native scroll cannot meet; second scroll controller out of scope. Rejected on need, not rights. |
| 7 | [randoma11y.com](https://randoma11y.com/primary) | Hosted colour aid | States its bar explicitly: contrast >= 4.5 under the **WCAG 2.1** algorithm. | **USE — as a standard, not a palette.** Adopted as this change's acceptance threshold (consistent with Record 5 above). No new colour imported. |
| 8 | [haikei.app](https://haikei.app/) | Hosted generator → downloadable asset | Free, exports SVG/PNG, (c) z creative labs GmbH, has Terms + Privacy pages. | **DO NOT USE here** — no background need on this surface; `<HaikeiContourPlane>` (Record 4) already owns that job project-natively. Terms not relied upon because nothing was exported. |
| 9 | [shapes.gallery](https://www.shapes.gallery/) | Downloadable asset | "70+ SVG shapes, click to copy" + DOWNLOAD ALL zip, by Monika Michalczyk. **No licence or reuse terms stated on the page** — the base pack's warning still holds. | **DO NOT USE** — rights unverified; nothing copied or downloaded. |
| 10 | [type-garden.vercel.app](https://type-garden.vercel.app/) | Hosted creative tool | **Offline**: returns *"This deployment is temporarily paused"*. | **DO NOT USE** — unavailable. Record 1 above remains valid as history, but the source can no longer be re-verified; do not cite it as live. |
| 11 | [footer.design](https://www.footer.design/browse) | Reference gallery | Live; browsable by type/style. | **NOT APPLICABLE** — footer untouched this task (Record 6 stands). |
| 12 | Two Much Studio / PP Model, ShutterKif, HTWKR, Cindy Ly, Unbelievably Crap, Shopify Editions Winter '26, WebsitePrompts.ai | Reference (inspiration) | All fetched; what each page actually contains is tabulated in `docs/CHANGE_BRIEF.md`. | **Principles only** — four informed the work, three rejected. No layout, mark, artwork or code copied. |

## What was actually used or integrated

- **No package installed. `package.json` and `package-lock.json` are unchanged** — the manifest is the proof, not prose.
- **RandomA11y's published standard (WCAG 2.1, >= 4.5:1)** applied as an acceptance gate; it found two real
  failures, both fixed in `src/pages/Articles.tsx`:
  - record line `#2A0F18/55` → `/65` (3.94:1 → **5.45:1**)
  - `Desk pick` badge `gold #B89146` → **`#D9B978`** on a `/88` scrim (3.89:1 → **5.30:1**, sampled from rendered
    pixels). `#D9B978` is not a new colour: it is the antique-brass token already contrast-verified in Record 5.
- **Cindy Ly's per-work status chips + HTWKR's colophon honesty** → the existing `publicationStatus` registry
  field is now rendered visibly on the 2 provisional folios in `src/pages/Articles.tsx`. No new data invented.
- **Two Much Studio's numbered index with plain credits + ShutterKif's stated keyboard affordance** → confirmed
  the caption structure and arrow-key traversal kept in the redesign.
- **New permanent guard** added to `scripts/interaction-audit.mjs`: `archive-wall-contrast-and-visible-provenance`.
- **Owner decision, 2026-10-27**: the owner reviewed the evidence above and **accepted the project-native
  approach for this redesign**, explicitly declining ThreeUI on size and duplicate-Three.js grounds. The
  component rule stands for future work: *install a verified component when it solves a real gap, not to
  satisfy a checklist.* This closes unresolved item 1 below for this change.
- **Follow-up measurement found a real defect this record's own thesis had missed**: one cover
  (`DeUZFPTCjPU-1.webp`, 603x619) is not 4:5, so `object-cover` was cropping ~18% of it. Fixed by moving
  `.plate-thumb img` to `object-contain` on a paper ground; the audit now measures cropping rather than
  ratio match.

## If not used — reason and project-native alternative

The archive's needs (fixed-proportion media box, filter rails, reveal-on-scroll, keyboard traversal) are met by
**existing Verlyse capabilities**: native CSS `aspect-ratio`, semantic `<ul>/<li>` + `<button aria-pressed>`, and
the already-installed `motion/react`. Adding a package for any of them would duplicate a working owner.

## Accessibility, reduced-motion, responsive, fallback, performance

- **0 of 84** archive-wall text nodes fail WCAG 2.1 AA (was 22 of 84).
- 21 of 21 folio links are tab stops; filtered-out plates are `aria-hidden` + `tabIndex=-1` + `pointer-events-none`.
- Reduced motion collapses transitions to `0.001s`; all 21 covers still render.
- No WebGL, no second scroll controller, native scroll preserved; CLS 0.
- Image payload fell 28 % desktop / 48 % mobile.

## Unresolved items / revisit trigger

1. **Component-installation requirement — CLOSED for this change.** Owner decision, 2026-10-27: accept the
   project-native approach and do not add ThreeUI, its size and duplicate Three.js cost being disproportionate
   to a 2-D shelf. The standing rule carried into future work is to **install a verified component when it
   solves a real gap, not to satisfy a checklist**. `@designcodeio/threeui` remains real, MIT and compatible —
   revisit only if a surface with a genuine spatial requirement is commissioned.
2. **shadcn/ui is blocked by sandbox egress, not by licence** — revisit from an environment that can reach
   `ui.shadcn.com` if a genuinely missing primitive is identified.
3. **Type Garden is offline** as of 2026-10-27; re-check before any future citation.
4. **Shapes Gallery rights remain unverified**; do not download without written terms.
5. **`verlysemedia.kesug.com` was never reachable from this sandbox**, so no claim is made about production.

---

# Record 08 — site-wide legibility system (Change Brief № 03)

**Date:** 2026-10-27 · **Branch:** `arena/9f76f00e-verlyse` · **Scope:** all 14 router patterns / 54 URLs

## Need

A full-site audit (not a single route) measured **127 deterministic WCAG AA text failures** across 14 sampled
routes, traced to **12 colour tokens**; the top six accounted for 110 of them. The defect was not a page
problem but a token problem: the micro-label family (`text-gold/65…90`, `text-white/40…50`,
`text-ivory/40…50`) sits below 4.5:1 on the oxblood grounds. `/articles` had received a local fix in Record 07;
the same tokens still failed in the shared `Footer` — and therefore on **every ordinary route**.

## Classification of what was adopted

| Resource | Classification | Action |
| --- | --- | --- |
| `#D9B978` antique brass | **existing capability** — the approved Record 5 token | promoted to a named Tailwind token `gold.lit` |
| RandomA11y (`randoma11y.com`) | **reference** (Record 5) | standard applied, palette not copied |
| `@designcodeio/threeui` | **rejected** | re-evaluated site-wide, see below |
| shadcn/ui | **rejected** | no interaction gap found, see below |

**Nothing was installed.** `package.json` and `package-lock.json` are byte-identical to their pre-change state
for this work; the only manifest delta on this branch belongs to the earlier submission-delivery task.

## Component audit — whole site, outcome: none qualified

Every route was audited for a real component need, not just `/articles`.

- **Modal/dialog primitive (the strongest candidate).** An initial probe suggested the three overlays lacked
  dialog semantics and focus restoration. **That finding was wrong and is retracted.** The probe filtered on
  `offsetParent !== null`, which is always `null` for `position: fixed`, and opened overlays with `.click()`,
  which does not focus the trigger. Re-tested correctly, `SearchOverlay`, `SavedDrawer` and the mobile menu
  each expose `role="dialog"` + `aria-modal="true"` + an accessible name, trap focus (0 escapes in 40 Tab
  presses), close on Escape, and restore focus to the opener. `src/lib/focus.ts#trapFocus` already implements
  the wrap-around. Installing `focus-trap-react` would have added a dependency to solve a solved problem.
- **ThreeUI** — re-evaluated for a *separate* spatial case as required. `/room` is the only spatial surface and
  it already runs the project's own geometry model (`src/lib/room/geometry.ts`, `isFocus ? 1 : clamp(...)`)
  over the installed `three@0.185.1`. Adding 52.19 MB / 726 files and two aliased Three.js copies to replace a
  working depth model is disproportionate. **Rejected again.**
- **shadcn/ui** — no audited route showed a missing interaction primitive. Forms, menus, search, drawers and
  the archive controls all have working single owners. Nothing to add.

## What changed instead

- `tailwind.config.js` — `gold` became `{ DEFAULT: '#B89146', lit: '#D9B978' }`. Base gold is retained for
  rules, borders and seals; `lit` is the token for **text** on oxblood. Rationale recorded in-file: base gold
  cannot reach 4.5:1 on `wine #5C1224` even at full opacity (4.58:1), while `lit` clears it from 0.75 up.
- **116 text-token migrations across 21 files**, plus 10 `#8A8178` → `#6E665D` (3.14:1 → 4.64:1 on cream),
  1 `text-[#2A0F18]/55` → `/65`, and the single `text-[7px]` on the site → `8px`.
- `Creators.tsx` — the contributor wall's faded tiles went `opacity-60` → `opacity-80`; the handle line was
  3.50:1 because a 0.60 container multiplied an already-light token. The selected tile still reads as selected
  through its gold border, gradient, italic and colour.
- `Categories.tsx` — dimmed wing arches `opacity-35` → `opacity-85`, and the wing label `text-gold` →
  `text-gold-lit`. The active wing remains unmistakable via its solid ivory plate.

`border-gold/80` and the 58 `text-white/55` call sites were deliberately **not** touched: they measure
4.93:1–5.97:1 and already pass. Nothing was changed merely because it matched a pattern.

## Verification

Measured on rendered pixels with reveal animations allowed to settle, and with media-backed text sampled by
hiding the glyphs and screenshotting the real backdrop.

- Deterministic solid-backdrop AA failures **127 → 0** across 15 route instances × 3 viewports (5,371 nodes).
- 120 route × viewport combinations at 320/375/390/430/768/820/1024/1440: **0 overflow, 0 wrong footer counts,
  0 wrong `<h1>` counts, 0 console or network errors.** Exactly one `footer[aria-label="Footer"]` on the 13
  ordinary routes; zero on `/room`, which renders outside `Layout` by design (`App.tsx:137`).
- Full suite green: build 54 shells / 54 sitemap URLs, `typecheck:api`, `check:secrets`, metadata 54/54,
  SSR smoke, flows 14/14, submit 33/33, newsletter 22/22, interaction audit all PASS with 0 console errors,
  asset audit 53/53 role subset and 112/112 full inventory.

## Known limitations, not claimed as passing

1. **`/room` receded plates.** 106 text nodes sit at effective opacity 0.05–0.26 as a depth cue. The focused
   plate is `opacity: 1` and measures **0 failures / 12 nodes**. The receded plates were left unchanged: the
   dimming *is* the spatial model. Not claimed as AA-conformant.
2. **Text over artwork.** 17 of 52 media-backed groups fall below AA at the *brightest* region of their box;
   only **2** fail at the *median* backdrop, and both are large decorative display numerals (`21` on `/`,
   the `HW` monogram on `/creator/:id`). Left unchanged rather than strip an intentional brand colour;
   flagged for design review.
3. **Home page length.** 25,289px at 390px (30 screens) versus 7,582px for `/articles`. The cause is content,
   not spacing: the eight-folio feed alone is 7,110px and all nine sections' padding totals ~9% of the page.
   Shortening it means showing fewer folios, which the owner has ruled out. **Needs an owner decision.**
4. **`verlysemedia.kesug.com` is reachable from this sandbox via `fetch_page`** (it was not in earlier
   sessions) and serves the `main`-era build. None of this work is deployed there.

---

# Record 09 — "The Pressed Edition": site-wide art direction (Change Brief № 04)

**Date:** 2026-10-28 · **Branch:** `arena/9f76f00e-verlyse` · **Base commit:** `1a20dd1`
**Nothing committed, pushed, merged or deployed.**

## Need

Record 08 raised legibility to the floor (contrast 127 → 0) but did **not** change the
publication's art direction. The owner's assessment was accurate: it "mostly changed
contrast tokens and small labels." Every page still announced its sections with the same
ad-hoc `font-mono text-[10px] uppercase tracking-[0.3em]` kicker, hand-rolled 18 separate
times, so no route carried a designed opening and the shared `SectionHead` primitive had
only **2 call sites** in the whole codebase.

This record covers the visual redesign itself. Contrast is treated as the floor, not the
deliverable.

## The direction — one, named

**THE PRESSED EDITION.** Verlyse rendered as a printed journal rather than a website with
a wine palette. Concrete rules, all implemented:

| Rule | Implementation |
| --- | --- |
| Chapter numerals | `§ NN` seated in a left gutter rail with a fading brass hairline (`lg:` and up only) |
| Chapter rule | double brass hairline — 1px @ 0.52 over 1px @ 0.17, 4px apart |
| Display scale | `clamp(2.1rem, 5.2vw, 4.1rem)`, line-height `.95`, tracking `-0.022em` |
| Accent | exactly one italic brass `<em>` word per chapter title |
| Measure | decks held to `46ch` |
| Surfaces | pressed-paper `.sheet` with 11px corner **registration crops** |
| Plates | cream mount + brass keyline + printed caption under a hairline |

## Classification of every resource (viewed / generated / copied / installed / shipped)

| Resource | What actually happened |
| --- | --- |
| Shopify Editions Winter 2026 | **Viewed only.** Principle adapted: chaptered numbering and scale/pacing — lands as `§ NN` + the display scale. Its content architecture, theme, illustrations and CTAs were **not** taken. |
| Two Much Studio | **Viewed only.** Principle: numbered index with large stills and plainly stacked credits — lands on the Creators wall (`§ 02 · Every name`) and the About record. |
| How to Talk to White Kids About Racism | **Viewed only.** Principle: named-chapter pacing and a colophon mark — lands as `.chapter-close` and the Community desk letter. |
| Cindy Ly | **Viewed, rejected** for visual language (pixel/Tamagotchi). Status-chip principle was already shipped in Record 07. |
| Lenis | **Rejected, not installed.** Native scroll is mandated; nothing here needs scroll hijacking. |
| ThreeUI / `@designcodeio/threeui` | **Rejected again.** 52.19 MB / 726 files and a duplicate Three.js against the installed `three@0.185.1`. No 2D need; `/room` already has its own owner. |
| shadcn/ui | **Not installed.** Re-audited all 13 route patterns; see below. |
| Unbelievably Crap / ShutterKif / Haikei / Shapes Gallery / Type Garden | **Viewed only.** Nothing copied; Shapes Gallery and ShutterKif assets remain rights-uncleared, Type Garden is offline. |
| Pillow (`pip install --break-system-packages Pillow`) | **Installed in the sandbox only**, to compose before/after evidence sheets. Not a project dependency; `package.json` and `package-lock.json` are untouched by this record. |

## Component audit — whole site, outcome: none qualified

Re-ran the gap audit at site-wide scope, not just `/articles`. The one genuinely new UI
pattern this redesign introduces is the chapter opener, which is **content-shaped, not a
generic primitive** — it carries a section numeral, a running head, a counter and a deck
that all come from Verlyse's own data. No third-party component models that. Installing a
heading library to render an `<h2>` and two rules would add a dependency to replace nine
lines of JSX.

`ChapterOpener` was therefore built **inside the existing owner**,
`src/components/ui/primitives.tsx`, beside `SectionHead`/`MetaRow`/`UnderlineLink`/`PageRail`.
No new file, no new owner, no duplicate function.

**Dependency delta: zero.** `package.json` and `package-lock.json` are unchanged.

## What changed

| File | Visible structural change |
| --- | --- |
| `src/index.css` | `--gold-lit` token added to `:root`; new `@layer components` block defining `.chapter`, `.chapter-num`, `.chapter-rule`, `.chapter-title`, `.chapter-deck`, `.sheet`/`.sheet-pad`, `.plate-mount`, `.plate-caption`, `.chapter-close`. `.kicker` upgraded from a bare mono label to a block that **opens on the press rule** — this alone restyles **17 call sites across 5 files**. |
| `src/components/ui/primitives.tsx` | New `ChapterOpener` + `ChapterClose` exports. Running head (label + counter on one line), gutter numeral, double rule, oversized title, deck. |
| `src/pages/About.tsx` | 4 boxy `border + bg` panels → pressed-paper `.sheet` with registration crops; 3 tiny labels → real chapters (`§ 01 The mission`, `§ 02 The principles`, `§ 03 The record`); 3 offset ghost borders removed. |
| `src/pages/Creators.tsx` | The wall of names now opens on `§ 02 · Every name` with a live counter, replacing a single mono line. |
| `src/pages/Community.tsx` | Response reel opens on `§ 02 · Recent responses`; the desk letter gained a centred rule and a real `On the record` title where it previously had none. |
| `src/components/layout/Header.tsx` | The masthead now closes on the same brass press rule the chapters open on — a shared-shell change visible on every route. |

This is **not** a token or contrast pass. The diff adds a component, changes document
structure (sections that had no heading now have one), and replaces surface treatments.

## Verification — rerun against this build, not quoted from Record 08

| Check | Result |
| --- | --- |
| `npm run build` | **PASS** — 54 shells, 54 sitemap URLs |
| `npm run typecheck:api` | **PASS** |
| `npm run check:secrets` | **PASS** |
| `scripts/interaction-audit.mjs` | **PASS** — 22/22 checks, 0 console errors |
| Responsive sweep 13 routes × 8 viewports (320/375/390/430/768/820/1024/1440) | **PASS** — 104 combos: 0 horizontal overflow, 0 footer-count errors, 0 `h1`-count errors, 0 page errors |
| Sub-8px text in the new classes | **PASS** — 0 instances |
| Settle-aware contrast on the new classes, 8 routes | **PASS** — 29 nodes checked, 0 failures |
| Single shared footer | **PASS** — exactly 1 on all 12 ordinary routes, 0 on `/room` by design |

## Known limitations, not claimed as passing

1. **`/room` remains the accepted exception** — 106/118 nodes sit at effective opacity
   0.05–0.26 by design (`src/lib/room/geometry.ts`). Unchanged by this record.
   Status: `FAIL (accepted, documented)`, never "passes".
2. **Home page length is unchanged** (25,289px @390) — still an owner decision, since
   shortening it means showing fewer folios.
3. **`verlysemedia.kesug.com` was not checked this session** and nothing here is deployed.
4. **Not every route received a bespoke composition.** Articles, Categories, Ambassadors,
   Submit, Contact and the detail routes inherit the system through `.kicker` and the
   shared shell rather than through hand-placed chapter openers. That is a real scope
   limit of this pass, not a claim that those routes were "already coherent."

---

# Record 10 — route-specific compositions (Change Brief № 05)

**Date:** 2026-10-28 · **Branch:** `arena/9f76f00e-verlyse` · **Base commit:** `1a20dd1`
**Nothing committed, pushed, merged or deployed.**

## Need

Record 09 established The Pressed Edition and applied it through shared owners (`.kicker`,
`ChapterOpener`, the masthead rule). Record 09 stated its own limit plainly: several routes
*inherited* the system rather than receiving a composition of their own. This record closes
that gap for the routes named in that limit.

The governing rule for this pass: **do not repeat the chapter opener mechanically.** A
route earns a composition that fits what it actually holds.

## Route-by-route — current problem → transformation → owner

| Route | Problem found | Transformation | Owner |
| --- | --- | --- | --- |
| `/ambassadors` | 10 people spread over ~9,400px; one department filled a screen; 104px medallions centred in a sparse grid; cluster heads were a plain `h2` + caption | **The printed masthead.** Department set on a single rule (name · filling hairline · caption). Medallions 104px → 64px, rows left-aligned, 3-up dense. Page **9,389px → 5,507px** | `src/pages/Ambassadors.tsx` |
| `/categories` + `/categories/:wing` | Real artwork reduced to **48×56px thumbnails** in horizontal list rows; wing numeral was a 9px label | **The plate rack.** Covers become mounted plates — whole cover, `object-contain`, cream `#F1EDE6` pad, 4:5. Wing numeral set as an oversized printed department mark. Rack widened to 5 columns | `src/pages/Categories.tsx` |
| `/articles` | Shelf title at `clamp(2.2rem,4.5vw,3.75rem)` — smaller than every other hero; no press rule | **Archive masthead** at publication scale `clamp(2.8rem,6vw,5rem)` + the press rule. Whole-cover shelf, search, filters and registry order untouched | `src/pages/Articles.tsx` |
| `/submit` | Up to 11rem of top padding under an already-tall hero — a dead band before the form | Band closed to `clamp(3rem,7vh,5rem)`; the four numbered stages keep their press-rule kickers | `src/pages/Submit.tsx` |
| `/contact` | Hero `min-h-[58svh]` plus an 11rem body band — the cream letter sheet started far below the fold | Hero → `42svh`, body band tightened. The letter sheet and wax seal are untouched | `src/pages/Contact.tsx` |
| `/creator/:id` | **No defect found.** | **Deliberately left alone.** Current-vs-target: the target is a mounted cream sheet with printed metadata, a monogram plate and a featured-folio card — this page *already is* that, and in fact prefigured the Pressed Edition thesis. Changing it would have been change for its own sake. | — |
| `/article/:id` | **No defect found** in the reading view. | **Deliberately left alone.** It is the one route whose job is uninterrupted reading; it already receives the system through `.kicker` (Record 09). Reading clarity outranks novelty here. | — |
| `/room` | **No defect found.** | **Deliberately left alone.** The threshold is already art-directed, and its depth-opacity model is the documented accepted exception. Restyling it risked the WebGL scene for no editorial gain. | — |

## Classification of resources

| Resource | What actually happened |
| --- | --- |
| Shopify Editions Winter 2026 | **Viewed only, benchmark not template.** Principle taken: *scale discipline and chaptered pacing* — a department announces itself at display scale, then the content runs dense. Lands on the `/categories` wing plates and the `/articles` masthead. Its content architecture, theme and CTAs were again not taken. |
| Two Much Studio | **Viewed only.** Principle: numbered index with large stills and plainly stacked credits — lands on the `/ambassadors` masthead rows. |
| Everything else in the reference set | **Viewed only**, no change from Record 09's classification. |
| Pillow | Sandbox-only, for evidence composition. Not a project dependency. |

## Component audit — outcome: none installed

Re-audited the redesigned routes for a genuine gap. Candidates considered and rejected
with reasons:

- **A carousel/slider library** for the `/categories` plate rack — rejected: the rack is a
  CSS grid, needs no JS, and a slider would *hide* folios, which the owner has forbidden.
- **A masonry library** for the plate rack — rejected: covers are normalised to 4:5, so
  rows already align; masonry would add a dependency and a layout-shift class of bug.
- **shadcn `aspect-ratio`** — rejected: Tailwind's `aspect-[4/5]` already does this with
  zero dependency, and shadcn's registry host is unreachable from this sandbox anyway.

**Dependency delta: zero.** `package.json` / `package-lock.json` carry only the pre-existing
submission-task diff (1 insertion, 2 deletions).

## Verification — rerun against this build

| Check | Result |
| --- | --- |
| `npm run build` | **PASS** — 54 shells, 54 sitemap URLs |
| `npm run typecheck:api` | **PASS** |
| `npm run check:secrets` | **PASS** |
| `scripts/interaction-audit.mjs` | **PASS** — 22/22, 0 console errors |
| Responsive sweep 14 routes × 8 viewports (320→1440) | **PASS** — 112 combos: 0 overflow, 0 footer-count errors, 0 `h1`-count errors, 0 page errors |
| Sub-8px text, all leaf nodes, all 112 combos | **PASS** — 0 distinct instances |
| Touch targets < 24×24 | **PASS** — 0 across all combos |
| Settle-aware contrast, 10 routes | **PASS** — 539 AT-exposed nodes, **0 failures** |

### Contrast measurement scope — stated explicitly

The first run reported **81 failures**. All 81 were `aria-hidden="true"` **decorative**
nodes: the header's ordinal nav numerals (`text-gold/50`, 9px) and the oversized ghost
display words (`WINGS`, `№ 01–21`) which sit at contrast 1.0 **by design**. Excluding
subtrees hidden from assistive technology — which WCAG 1.4.3 does not govern — the figure
is **539 checked / 0 failed**. Both numbers are recorded here so the scope change is not
mistaken for a regression or for a silenced defect.

## Known limitations, not claimed as passing

1. **`/room` unchanged** — accepted exception stands; `FAIL (accepted, documented)`.
2. **Three routes were deliberately not redesigned** (`/creator/:id`, `/article/:id`,
   `/room`) with the reasoning recorded above. This is a judgement, not a measurement.
3. **The live site `verlysemedia.kesug.com` was NOT tested** this session. Everything here
   is local preview only.
4. **Home page length unchanged** (owner decision, unchanged since Record 08).

---

## Record 11 — The contents page: giving a thirty-screen Home a spine

**Date:** 2026-10-28 · **Branch:** `arena/9f76f00e-verlyse` · **Base commit:** `d93ce18`
**Scope:** `/` (Home) composition + `MotifDivider` (shared owner).

### Why this and not another token pass

Record 10 redesigned five route families. Home — the longest route on the site and
the one that establishes publication identity — was never compositionally touched.
Measured on the running preview before any edit:

| Route | desktop | tablet | phone |
|---|---|---|---|
| **home** | **17,333 px** | **23,991 px** | **25,423 px (30.1 screens)** |
| article (next longest) | 10,333 | 11,023 | 11,354 |
| everything else | ≤ 6,540 | ≤ 8,319 | ≤ 9,215 |

Home is 2.5× the next longest route and had **no contents, no wayfinding and no
semantic chapter structure**. That is the defect this record addresses.

### Two findings I measured, then retracted

Honesty about the audit itself, because both nearly became design decisions:

1. **"THE LETTERS is a 5%-ink dead band."** FALSE. My first density probe counted
   `p,h1..h4,li,img,a,button,input,textarea` and omitted `blockquote`, `cite` and
   `span` — which is precisely what `VoiceCarousel` is built from. Re-measured with
   those included: **25% ink**, mid-range for the page. No change was made to it.
2. **"Home has four duplicate submit CTAs."** OVERSTATED. Source review of all four
   `/submit` links: `Invitation` L1037 is the primary CTA (`btn btn-gold`);
   `Departments` L884 is a deliberate contextual invitation (source comment: "it is
   not an eighth room"); `Cover` L230 is inline masthead prose. Only the fourth —
   a mono repeat buried inside the archive **statistics panel** — repeated the job
   without adding a reason. **One** link removed, not four.

### What changed

| Owner | Change |
|---|---|
| `src/pages/Home.tsx` | New `IssueContents` region **inside the existing `IssueBand` section** (no new section, no new route). Four chapters, every figure derived from `LEDGER` / live arrays. |
| `src/pages/Home.tsx` | `MotifDivider`s given `id` + roman numeral, so the four movements the page already had become anchor targets. |
| `src/pages/Home.tsx` | Removed the redundant `/submit` link from the archive statistics row. |
| `src/components/ui/ArticleClosing.tsx` | `MotifDivider` gains optional `id` / `no`. When `id` is set the wrapper stops being `aria-hidden` (the ornament row keeps it), so chapter marks are exposed to assistive technology. |

### Resource classification

| Resource | Class | Used how |
|---|---|---|
| Shopify Editions Winter '26 — `shopify.com/editions/winter2026` | **Reference only** (opened 2026-10-28) | Observed: a long catalogue is paced by *stance-named* chapters ("Insights, proactively delivered", "Complexity, delegated", "Designs, refined") rather than numbered labels, each followed by evidence. Verlyse translation: the four movements are named as editorial stances the publication already used ("The issue / feature / room / invitation") and printed as a contents page. **Not copied:** its brand, campaign copy, product architecture, artwork, e-commerce patterns. |
| Two Much Studio — `twomuch.studio` | **Reference only** (opened 2026-10-28) | Observed: a binary hierarchy — one lead work gets the full plate, then a flat **uncapped** title-first index of all 52 projects, no cards, no pagination. Verlyse translation: the contents lists all four movements with honest counts and caps nothing; no folio was removed to shorten the page. **Not copied:** its wordmark, mascot, view/online counters, shop/play, 3D loader, grid or type. |
| `motion/react` 13.2.0 | **Existing dependency** | `MotifDivider`'s existing reveal carries the chapter marks. No new engine. |
| Native CSS `scroll-behavior: smooth` (`src/index.css:26`) | **Existing capability** | Anchor navigation. Verified disabled under `prefers-reduced-motion` at `index.css:71`. |
| GSAP / ScrollTrigger | **Rejected** | `src/components/cinematic/index.ts` states Home is in the **protected manifest** and GSAP "must not" be wired into it without an explicit per-route decision and re-baseline. Respected. |
| Lenis | **Rejected** | Not installed, and no scrolling requirement native scroll cannot meet. Confirmed absent from manifest and lockfile. |
| shadcn/ui, ThreeUI | **Rejected** | No missing UI primitive and no spatial need. A contents list is a semantic `<ol>` of anchors. |

**Dependency delta: zero.** No package added, removed or upgraded; lockfile untouched.

### Verification (run 2026-10-28 against this worktree)

| Check | Result |
|---|---|
| `npm run build` | **PASS** — 54 shells / 54 sitemap URLs (unchanged) |
| `npm run typecheck:api` | **PASS** |
| `npm run check:secrets` | **PASS** |
| `npm run test:flows` | **PASS** — 14/14 jsdom flows |
| `npm run test:metadata` | **PASS** — 54 shells, registry coherent |
| `npm test` (full matrix + interaction + flags + asset) | **PASS except one** — see below. 0 console errors; assets 112/112 |
| Route sweep 14 routes × 3 viewports, before **and** after | **PASS** — 0 overflow, exactly 1 `footer[aria-label="Footer"]` on ordinary routes (0 on `/room`), 1 `h1`, 0 page errors, both phases |
| Contents present at rest (no scroll, no reveal) | **PASS** — 4/4 rows `opacity: 1` at 1440 and 390 |
| Anchor navigation | **PASS** — click → `location.hash = #chapter-room`, settles with target at **112 px** (= `scroll-mt-28`, clearing the fixed header) |
| Chapter marks exposed to AT | **PASS** — `aria-hidden` is `null` on anchored dividers; ornament row still hidden |
| `submit-and-contact-binary-delivery` | **BLOCKED (environment)** — not a regression |

**On the one blocked check.** `liveEndpoint503Ok` expects `POST /api/submit` and
`/api/newsletter` to answer **503 `provider-unconfigured` / `not-configured`**.
`api/*.ts` are Vercel serverless functions; `vite dev` does not serve them. Verified
directly with `curl`: both return **404**. The committed `audit/interaction-audit.json`
records this check as `true`, i.e. it passes in a runtime that serves `api/*`. Every
other assertion inside the same check passed (multipart boundary, PNG magic bytes,
filename, failed-state preservation, `noFalseSent`). **Nothing in the submit/contact
delivery path was modified this session**, and per standing instruction a visual task
does not rewrite delivery. I reverted `audit/interaction-audit.json` rather than commit
an environment-dependent FAIL verdict into a tracked artifact.

### Limitations

1. **`verlysemedia.kesug.com` NOT TESTED** — unreachable from this sandbox. All
   evidence is local preview (`vite dev`, port 5173).
2. **Full-page before/after sheets under-represent below-fold content.** Sections
   below the first screen are gated by `whileInView` reveals that a programmatic
   full-page capture does not reliably latch, so those regions read dark in *both*
   columns of `docs/evidence/r13/*`. The at-rest contents captures and the numeric
   sweep are the reliable evidence.
3. **Home is still long** (17,963 / 24,612 / 26,083 px, +630/+621/+660). The contents
   page adds height deliberately: no folio was removed, per standing instruction. The
   fix for length here is navigability, not truncation.
4. Three routes remain deliberately unredesigned from Record 10 (`/creator/:id`,
   `/article/:id`, `/room`); that judgement is unchanged and unre-examined this pass.
5. **12 of 14 route families were audited but not changed** this pass. `/article/:id`
   moved +3 px purely from the `MotifDivider` label markup; everything else is
   byte-identical in height.

---

## Record 12 — Phase D: leaving no route unfinished (2026-10-28)

**Scope.** The user directed: *"leave no route unfinished."* Four of the 14 route
families had never received a disposition in this redesign: `/article/:id`,
`/creator/:authorId`, `/room`, and `*` (404). Each is resolved below. A reasoned
no-change is a valid disposition, but it had to be re-earned with fresh evidence
— the Phase-2 no-changes are stale and were not reused.

### Component-install requirement — CLOSED as "evaluated, none qualified"

Closed by explicit user decision this turn. Candidates evaluated against the
verified stack (`node -e` manifest probe, 2026-10-28: **tailwindcss ^3.4.15 →
3.4.19, react/react-dom 18.3.1, vite 7.3.6, typescript 5.9.3, npm +
package-lock.json, no components.json**):

| Candidate | Gate failed |
|---|---|
| Watermelon UI | Tailwind v4 + React 19; docs explicitly warn against v3 |
| KokonutUI | Tailwind v4 required |
| Dot Matrix | Custom Proprietary License + shadcn `components.json` prerequisite |
| OriginKit | License unverified for copied source; sign-in/paid |
| shadcn/ui | MIT and v3-viable, but registry host unreachable from this sandbox **and no missing primitive to justify it** |
| ThreeUI | 52 MB, dual `three` aliases, no spatial need on these routes |
| Lenis | Native scrolling is mandated; a second scroll controller is forbidden |

`UI_RESOURCE_PLAYBOOK` §4 backs the outcome: *"Use native HTML when it already
provides the needed behavior."* **No package was installed. Dependency delta is
zero.** Per the user's instruction, if a genuine interaction gap appears later it
will be proposed — exact component, why it fits — *before* any integration.

### The finding that drove Phase D

A section census (`scripts/.r13probe.mjs`, 390×844, outermost-section filter,
leaf-node ink selector) measured the four routes. The defect was not decorative;
it was **document structure**:

| Route | Height | Headings found in `<main>` | Visible section labels that were *not* headings |
|---|---|---|---|
| `/article/:id` | 11,357 px (13.5 screens) | H1, then **H2/H3 that are the titles of OTHER articles** | "Within the post", "Conversations", "Up next" |
| `/creator/:authorId` | 7,633 px (9.0 screens) | **H1 only** | "How they write", "Published works", "Stories beside theirs" |

Anyone navigating by heading on a 13.5-screen story left the article and landed
inside other articles' titles with no signal that the story had ended. On the
creator dossier there was no outline at all. The labels already existed and were
already visible — they were simply marked up as `<p class="kicker">`.

A second, separate defect: `ArticleDetail` printed **"Within the post" twice,
roughly 40 px apart** — once as the `MotifDivider` label, once as a `p.kicker`
immediately beneath it.

### Two findings retracted before acting

1. **`/article/:id` section idx 4 — "912 px at 2% ink" is NOT a dead band.** It
   carries `aria-hidden="true"` and contains the single word **"FIN."**. The
   silence around it is the editorial point. **Untouched.**
2. Section idx 2 (284 px, 35% ink) is likewise `aria-hidden="true"` — the
   pull-quote band. **Untouched.**

### What changed

- `src/components/ui/ArticleClosing.tsx` — `MotifDivider` gains one optional
  prop, `heading`. When set, the label renders as `motion.h2` instead of
  `motion.span` and the divider stops being hidden from assistive tech. No new
  component, no new owner, no visual change.
- `src/pages/ArticleDetail.tsx` — the duplicated `p.kicker` "Within the post" is
  **removed**; the divider now carries that label as the heading. "The ending"
  divider also becomes a heading. "Conversations" `p` → `h2`. "Up next" `p` →
  `h2`, and the next feature's title `h2` → `h3`, so it nests under "Up next"
  instead of competing with the story's own H1.
- `src/components/ui/WriterProfile.tsx` — the three real section labels become
  `h2`.

**Deliberately NOT done:** no chapter numerals were added to `/article/:id`.
Numbering belongs to the *issue* (Home), not to a single story; repeating the
chapter opener here would be the mechanical repetition the brief forbids. The
issue has chapters; a story has movements.

**`.kicker` is unchanged** (`@apply block font-mono text-[11px] uppercase
text-gold-lit` + brass `::before` rule). Because it sets font, size, weight and
colour explicitly and Tailwind preflight resets heading defaults, `<p
class="kicker">` → `<h2 class="kicker">` is **pixel-identical**. Verified: the
"Conversations" label still computes to 11 px `rgb(217,185,120)` after the change.

### Dispositions for the two remaining families — reasoned no-change

- **`*` (404).** There is **no `src/pages/NotFound.tsx`**; the 404 is an inline
  `function NotFound()` at `src/App.tsx:170`, routed at L159. Its copy is already
  genuinely Verlyse — *"A page that wasn't written" / "This page is still waiting
  for its feature"* — and it renders inside `Layout`, so the **shared footer
  already owns site navigation**. Adding a department index to the body would
  duplicate a job the footer owns and violate single-ownership. Content block is
  591 px at 23% ink inside a 2,885 px page; nothing overflows. **No change.**
- **`/room`.** 844 px, viewport-locked, 0 document sections — it is the WebGL
  scene with its own permitted scene-local HUD, and it is on the **protected
  manifest** (GSAP must not be wired in). The known `FAIL (accepted, documented)`
  for 106/118 nodes at effective opacity 0.05–0.26 is **by design** in
  `src/lib/room/geometry.ts`. Touching it for visual novelty would break a
  deliberate spatial composition. **No change.**

### Verification (named checks, this turn)

| Check | Result |
|---|---|
| `npm run build` | **PASS** — 54 shells (core 9 / spatial 1 / category 7 / article 21 / creator 16), 54 sitemap URLs |
| `typecheck:api` | **PASS** |
| `check:secrets` | **PASS** |
| `test:metadata` | **PASS** — registry coherent |
| `test:flows` | **PASS** — 14/14 |
| `test:routes` | **PASS** |
| Rendered outline, article @390 + @1440 | **PASS** — H1 → H2×4 → H3×3, correct nesting |
| Rendered outline, creator @390 + @1440 | **PASS** — H1 → H2×3 |
| Duplicate "Within the post" | **PASS** — 0 occurrences |
| Overflow / footer count / page errors | **PASS** — 0 / exactly 1 / 0 on both routes, both viewports |
| Visual parity | **PASS** — label font sizes and colours unchanged |

Heights: article 11,357 → **11,284** px phone and 10,333 → **10,263** px desktop
(the −73/−70 px is the removed duplicate). Creator **unchanged** at 7,633 / 4,155
— a purely structural change, as intended.

### Limitations

1. `verlysemedia.kesug.com` is **unreachable from this sandbox** — **NOT TESTED**.
   Nothing here has been deployed.
2. `vite dev` does not serve `api/*.ts`; any live-endpoint assertion remains
   **BLOCKED (environment)**.
3. Full-page sheets under-represent below-fold content because `whileInView` does
   not latch for programmatic capture; the at-rest close-up and the numeric
   outline probe are the reliable evidence.
4. Only one article and one creator were probed in depth
   (`their-voices-matter`, `alina-javed`); both render from shared components, so
   the fix applies to all 21 article and 16 creator shells, but only these two
   were measured.
5. No screen-reader software was run. The claim is about **document structure**,
   verified in the DOM — not about a specific AT product's behaviour.

### Resource classification

| Resource | Class | Used? |
|---|---|---|
| Existing `MotifDivider` in `ArticleClosing.tsx` | existing capability | **Yes** — extended with one prop |
| Existing `.kicker` class in `index.css` | existing capability | **Yes** — unchanged, reused |
| Native HTML heading elements | existing capability | **Yes** |
| Watermelon UI / KokonutUI / Dot Matrix / OriginKit / shadcn / ThreeUI / Lenis | rejected alternative | **No** — see table above |

**No new dependency. No copied source. No generated or altered artwork. No
invented content** — every promoted label is a string that was already rendering
on the page.
