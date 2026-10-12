# Verlyse Media — Editorial Record, Skills Register & Verification Report

Updated `2026-10-12` on branch `arena/48e6e462-verlyse`.

---

## 1 · Editorial Record — “The Quiet Grief” (`DeUZFPTCjPU`)

### 1.1 Provenance & Source Record
- **Source Post URL:** `https://www.instagram.com/p/DeUZFPTCjPU/`
- **Shortcode:** `DeUZFPTCjPU`
- **Publisher:** `verlyse.media` (`Verlyse Media`, `authorId: 'verlyse-media'`)
- **Timestamp:** `2026-10-10T15:20:30.000Z` (`date: '2026-10-10'`)
- **Post Type:** `Sidecar` (5-slide carousel)
- **Registry Folio:** Folio № 20 (`id: 'the-quiet-grief'`, route `/article/the-quiet-grief`)
- **Working Title:** `The Quiet Grief` (derived from `#TheQuietGrief`; marked `publicationStatus: 'provisional'`)
- **Editorial Format:** `editorialFormat: 'carousel-feature'` (`category: 'Art'`, `world: 'gallery'`, `heroMode: 'gallery'`, `gallery: true`, `readingTime: '5 plates'`)

### 1.2 Verbatim Source Caption vs. Normalized Hashtags
Per the editorial integrity rules, the original caption is stored verbatim in `article.sourceCaption` and rendered unmodified inside the **Source Caption — Verbatim Record** colophon on `/article/the-quiet-grief`:

```text
Somewhere along the way, we stopped reaching for the things that once made us feel alive.

Not because we stopped loving them, but because life got louder, time grew scarce, and the dreams we once held so close slowly became memories we revisited instead of realities we lived.

Perhaps the saddest part of growing up is watching a passion become a stranger to us.

The colours never faded. We just stopped reaching for them.

— Verlyse Media

#verlysemedia #TheQuietGrief #LostPassions #ArtAndWords CreativeExpression
```

- **Trailing token preservation:** The final token `CreativeExpression` (which lacked a `#` prefix in the source caption) is preserved verbatim in `article.sourceCaption`.
- **Normalized hashtags (`article.normalizedHashtags`):** Stored separately as `['#verlysemedia', '#TheQuietGrief', '#LostPassions', '#ArtAndWords', '#CreativeExpression']`.
- **Filter tags (`article.tags`):** `['Art', 'TheQuietGrief', 'LostPassions', 'ArtAndWords', 'CreativeExpression']`.

### 1.3 Engagement Metrics & Comment Policy
- **Likes (`likesCount: -1`):** The source dataset reported `likesCount: -1` (unknown/unavailable). In `src/data/content.ts`, `likes` is set to `0` (so `LEDGER.appreciations` remains `1,281` and never subtracts `1`) and `likesCountRaw: -1` records the raw scraper sentinel. Because `ArticleDetail.tsx` guards appreciation display with `article.likes > 0`, neither `-1` nor `0` is ever displayed as a count.
- **Comments (`commentsCount: 5`):** The external scraper file `dataset_instagram-scraper_2026-10-12_09-04-14-145.json` was not attached to the sandbox filesystem (`/home/user/Verlyse` or `/home/user/uploads`), and direct Instagram requests from the sandbox return HTTP 403. In accordance with Section 04 (*never fabricate comment records; do not import scraped comment usernames or avatar URLs into the public UI*), `voices` is `[]` and `comments` is `0`.

### 1.4 Five-Slide Self-Hosted Original Artwork Mapping
All five original paintings from `DeUZFPTCjPU` are self-hosted in `public/img/works/` at their verified intrinsic dimensions (`1,229,906` bytes total), without cropping, recoloring, or duplicating their hand-lettered banners as visible HTML text:

| Plate | Child Shortcode | Subject | Canonical Asset Path | Dimensions | Bytes | Status |
|---|---|---|---|---|---|---|
| `01 / 05` | `DeUZAdGKvqt` | Ballet shoes | `/img/works/DeUZFPTCjPU-1.webp` | `603 × 619` | `86,416` | `verified` |
| `02 / 05` | `DeUZAc0K-DS` | A camera | `/img/works/DeUZFPTCjPU-2.webp` | `1080 × 1108` | `221,156` | `verified` |
| `03 / 05` | `DeUZAgrKhxG` | Books | `/img/works/DeUZFPTCjPU-3.webp` | `1200 × 1231` | `422,726` | `verified` |
| `04 / 05` | `DeUZAnkqU5G` | Vanity objects | `/img/works/DeUZFPTCjPU-4.webp` | `1080 × 1108` | `370,472` | `verified` |
| `05 / 05` | `DeUZArjqUA8` | Pink technology (2000s) | `/img/works/DeUZFPTCjPU-5.webp` | `585 × 600` | `129,136` | `verified` |

- **Zero cropping of embedded lettering:** Both `ArticleDetail.tsx` (`heroMode === 'gallery'`) and `ArtGallery.tsx` preserve each slide's native near-square aspect ratio (`object-contain` + intrinsic `width`/`height`) so the painted canvas and embedded banner text are never cropped.
- **Screen-reader fidelity without visible duplication:** The embedded banner text on each painting is provided in the `alt` attribute (`SlideDescription.alt`) for assistive technology while never being rendered as visible HTML text over or beneath the paintings.

### 1.5 Reclassifying the Editorial Format Later
`Article` in `src/data/content.ts` carries optional fields:
- `editorialFormat?: 'article' | 'visual-essay' | 'gallery-feature' | 'poetry-entry' | 'carousel-feature'`
- `publicationStatus?: 'published' | 'provisional'`
- `heroMode?: 'cinematic' | 'documentary' | 'gallery' | 'quiet'`
- `world?: 'paper' | 'newsprint' | 'night' | 'letter' | 'linen' | 'gallery' | 'document'`

To reclassify “The Quiet Grief” from a provisional carousel-led feature in `Art` to a `Poetry` or `Essays` entry, update `category`, `editorialFormat`, `heroMode`, and `publicationStatus` on the `the-quiet-grief` record in `src/data/content.ts`. Category counts (`CATEGORIES`), ledger totals (`LEDGER`), prerendered shells (`routes.ts`), `sitemap.xml`, and `/room` (`FOLIOS`) re-derive automatically.

---

## 2 · Skills Register

| Skill / Resource | Source URL | Reviewed Instructions & Takeaways | Status in Environment | Where Applied in Verlyse |
|---|---|---|---|---|
| **StringTune Core & Lifecycle (`@fiddle-digital/string-tune@1.2.5`)** | `https://tune.fiddle.digital/docs/api/string-tune` · `https://tune.fiddle.digital/docs/modules/overview` | Singleton initialized via `StringTune.getInstance()`, modules registered via `.use()`, started at `.start(60)`, DOM re-indexed on SPA navigation via `.onRebuild()` + `.onResize(true)`, native browser scroll preserved via `scrollDesktopMode = 'default'` & `scrollMobileMode = 'default'`. | **Installed & Active** (`@fiddle-digital/string-tune@^1.2.5` in `package.json`) | `src/lib/stringTune/{tokens,attrs,boot,runtime,StringTuneProvider}.ts(x)` |
| **StringTune Skill Hub — Progress (`03-progress` / `StringProgress`)** | `https://string-tune.fiddle.digital/skill-hub/basics/03-progress` · `https://tune.fiddle.digital/docs/modules/progress` | Binds `string="progress"`, `string-enter-vp`, `string-exit-vp`; outputs `0..1` to `--progress` CSS custom property without inline transforms. | **Installed & Active** | `src/pages/ArticleDetail.tsx` (`<article {...progress('bottom', 'top')}>`) driving `.st-measure` reading hairline in `src/index.css` |
| **StringTune Skill Hub — Parallax (`02-parallax` / `StringParallax`)** | `https://string-tune.fiddle.digital/skill-hub/basics/02-parallax` · `https://tune.fiddle.digital/docs/modules/parallax` | Binds `string="parallax[]"` and `string-parallax="<rate>"` for subtle scroll-linked vertical displacement on desktop fine pointers. | **Installed & Active** | `src/pages/Home.tsx` (`{...drift('restrained')}`) on hero cover plate |
| **StringTune Skill Hub — Glide (`05-glide` / `StringGlide`)** | `https://string-tune.fiddle.digital/skill-hub/basics/05-glide` · `https://tune.fiddle.digital/docs/modules/glide` | Binds `string="glide[]"` and `string-glide="<scale>"` for gentle scroll-velocity lag across plate grids. | **Installed & Active** | `src/pages/Articles.tsx` and `src/components/ui/ArtGallery.tsx` (`{...spotlitGlide('restrained')}`) |
| **StringTune Skill Hub — Spotlight (`08-spotlight` / `StringSpotlight`)** | `https://string-tune.fiddle.digital/skill-hub/basics/08-spotlight` · `https://tune.fiddle.digital/docs/modules/spotlight` | Binds `string="spotlight"` and `string-dist-max="320"`; writes `--spotlight-angle` (deg) and `--spotlight-distance` (px) CSS variables on fine pointers. Normalized by `320` in `src/index.css` (`.st-spotlit::after`). | **Installed & Active** | `src/pages/Articles.tsx`, `src/pages/Creators.tsx`, and `src/components/ui/ArtGallery.tsx` |
| **StringTune Skill Hub — Magnetic (`07-magnetic` / `StringMagnetic`)** | `https://string-tune.fiddle.digital/skill-hub/basics/07-magnetic` | Binds `string="magnetic"`, `string-radius`, `string-strength` for subtle cursor pull on desktop fine pointers. | **Installed & Active** | `src/lib/stringTune/attrs.ts` (`magnetic()`) |
| **StringTune Dev Guides (`STDG`)** | `https://string-tune.fiddle.digital/dev-guides/` | Development grid/guideline/FPS overlay layer (Early Access v1.2.6). Calls external origin and is dev-only. | **Reviewed · Deliberately Not Shipped** (blocked by production CSP `connect-src 'self'` and Section 11 restraint rules) | Documented in `src/lib/stringTune/runtime.ts` |
| **Motion Primitives / Origin UI (`coss.com/ui`) / shadcn Dialog & Carousel patterns** | `https://motion-primitives.com/` · `https://originui.com/` (`https://coss.com/ui`) · `https://ui.shadcn.com/` | Accessible modal dialog focus management (`role="dialog"`, `aria-modal="true"`, `useBodyScrollLock`, Escape dismissal, focus restoration to opener) and keyboard-navigable plate lightbox (`←`, `→`, `Escape`). | **Referenced & Implemented** (native React + `motion/react` without adding competing UI kit dependencies) | `src/components/ui/ArtGallery.tsx`, `src/components/layout/SearchOverlay.tsx`, `src/components/ui/SavedDrawer.tsx`, `src/components/layout/Header.tsx` |

*Environment note:* Outbound sandbox network access is restricted to `github.com`, `codeload.github.com`, `api.github.com`, `registry.npmjs.org`, `pypi.org`, and `files.pythonhosted.org` for package installation; web documentation was inspected through `fetch_page` and `web_search`.

---

## 3 · Verification Report

### 3.1 Commands Executed & Results
1. `npm run build` (`tsc -b && vite build && node scripts/prerender-metadata.mjs && node scripts/generate-sitemap.mjs`)
   - **Result:** Passed (`0` TypeScript errors, Vite production bundle built cleanly, `53` metadata shells prerendered — `core: 9, spatial: 1, category: 7, article: 20, creator: 16` — and `53` URLs written to `dist/sitemap.xml`).
2. `npm run test:metadata` (`node scripts/metadata-audit.mjs`)
   - **Result:** Passed (`Metadata audit passed: 53 shells, 53 sitemap URLs, registry coherent`).
3. `npm run test:smoke` (`node scripts/ssr-smoke.mjs`)
   - **Result:** Passed (`20/20` SSR routes rendered cleanly including `/article (the-quiet-grief)`, `SMOKE PASS`).
4. `npm run test:flows` (`node scripts/interaction-jsdom.mjs`)
   - **Result:** Passed (`7/7` JSDOM behavioral flows: search dialog open, scroll lock, query filtering, Escape focus restoration, save toggle persistence, saved drawer modal + scroll lock, clean unmount).
5. `npm test` (`node scripts/full-matrix-audit.mjs && node scripts/interaction-audit.mjs && node scripts/verify-flags.mjs && node scripts/asset-audit.mjs` using headless Chromium `153.0.8010.0`)
   - **Full Matrix Audit (`scripts/full-matrix-audit.mjs`):**
     - Desktop (`1440×900`): `52` routes audited, `0` console/page/network errors, `0` horizontal overflow routes, `0` footer alignment failures.
     - Tablet (`768×1024`): `52` routes audited, `0` console/page/network errors, `0` horizontal overflow routes, `0` footer alignment failures.
     - Mobile (`390×844`): `52` routes audited, `0` console/page/network errors, `0` horizontal overflow routes, `0` footer alignment failures.
   - **Interaction Audit (`scripts/interaction-audit.mjs`):**
     - `13/13` checks passed (`search-open-focus`, `search-query-results`, `search-escape-close`, `shelf-open`, `shelf-saved-item`, `mobile-menu-open`, `ending-voices`, `ending-wait`, `ending-quiet-grief`, `quiet-grief-gallery-and-caption`, `mobile-375px-no-overflow`, `reduced-motion-preserves`, `no-webgl-fallback`), `0` console errors.
   - **Verify Flags (`scripts/verify-flags.mjs`):**
     - Passed (`search-escape-mount-unmount`, `ending-voices-scene`).
   - **Asset Audit (`scripts/asset-audit.mjs`):**
     - `40/40` committed static assets resolved (`0` missing), `5` pending source assets documented in `audit/asset-audit.json`.
6. `npm run check:secrets` (`node scripts/check-secrets.mjs`)
   - **Result:** Passed (`Security check passed: no sensitive filenames or obvious secret patterns found`).

### 3.2 External Asset Resolution
- All five original binary slide images (`/img/works/DeUZFPTCjPU-1.webp`..`-5.webp`, `1,229,906` bytes total) are self-hosted in `public/img/works/` and verified HTTP 200 (`45/45` static assets resolved, `0` missing).
