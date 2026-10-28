# Verlyse Change Brief

- **Task**: Verlyse submission delivery, binary cover image upload, performance hardening, and 20-point comprehensive site QA (P0–P3) on active branch `arena/9f76f00e-verlyse`.
- **Active Branch / Base**: `arena/9f76f00e-verlyse` branched from `origin/main` (`1a20dd1a34f2c7ccf164427a9ae60c719d8f24d0`, containing merged PR #8 `c74e6b7`).

## Summary of P0–P3 Engineering Changes

1. **P0 — Dedicated Server-Side Editorial Submission & Correspondence Boundary (`api/submit.ts`, `src/pages/Submit.tsx`, `src/pages/Contact.tsx`, `scripts/submit-smoke.mjs`, `.env.example`, `vercel.json`, `public/.htaccess`)**:
   - **Pre-Fix Root Cause Verified in Browser Trace**: Previously, `src/pages/Submit.tsx` and `src/pages/Contact.tsx` posted `application/json` directly from the browser to `https://formsubmit.co/ajax/Verlysemedia.09@gmail.com`. On `/submit`, only `fileName` (`string`) was serialized in JSON (`0` binary image bytes were ever read or transmitted), `if (res.ok) return true` ignored FormSubmit JSON body errors (`{ success: "false" }`), and on network/HTTP failure `onSubmit` triggered `window.location.href = mailto:...` and unconditionally set `sent = true` / `sealed = true` (displaying `"Sent to the desk"` / `"Letter sealed"` and wiping the user's form state even when delivery failed).
   - **Server Endpoint (`api/submit.ts`)**:
     - Created dedicated `/api/submit` serverless endpoint supporting `kind="submission"` (`multipart/form-data` with optional binary cover image) and `kind="contact"` (editorial correspondence). Kept `api/newsletter.ts` and `BUTTONDOWN_API_KEY` completely separate.
     - Enforced strict Kesug-only cross-origin CORS in production (`https://verlysemedia.kesug.com` and `https://www.verlysemedia.kesug.com`; localhost preview ports in non-prod; same-origin `POST` permitted when `Origin` host matches `Host`), `OPTIONS` preflight (`204`), `403 forbidden-origin` on disallowed origins, `405` on non-`POST`/`OPTIONS`, and hardened IP rate limiting (`8` requests / `10 min` keyed on platform IP / rightmost `x-forwarded-for` hop).
     - Implemented zero-dependency RFC 7578 `multipart/form-data` binary parsing for both `kind="submission"` and `kind="contact"`, rejecting malformed boundaries (`400 malformed-multipart`), filename-only payloads without binary bytes (`400 filename-only-not-accepted`), missing required fields (`422 invalid-fields`), files over `MAX_COVER_BYTES = 4 * 1024 * 1024` (4 MB; `413 file-too-large`), and spoofed or disallowed image bytes via magic-byte header verification (`detectImageMimeFromBytes` for `image/jpeg`, `image/png`, `image/webp`, `image/avif`, `image/gif`; `415 invalid-image-signature` / `invalid-image-type`), plus path-traversal filename sanitization (`sanitizeCoverFilename`).
     - Wired server-only outbound transport via owner-chosen provider (`VERLYSE_MAIL_PROVIDER`: `RESEND_API_KEY` via `https://api.resend.com/emails` with base64 binary `attachments`, or `VERLYSE_MAIL_WEBHOOK_URL`) with an 8s `AbortController` timeout (`504 upstream-timeout`, `502 upstream-rejected`). When no mail provider secret is configured, returns HTTP `503` `{ ok: false, error: "provider-unconfigured" }`.
   - **Truthful Client State Machine (`src/pages/Submit.tsx`, `src/pages/Contact.tsx`)**:
     - Exported `resolveSubmitEndpoint()` and `resolveContactEndpoint()` (`https://verlyse-react.vercel.app/api/submit` on `verlysemedia.kesug.com`, `/api/submit` on Vercel/local dev).
     - Represented distinct `idle`, `invalid`, `sending`, `accepted`, and `failed` states (`data-submission-state` / `data-contact-state`) with synchronous `inFlightRef` double-submit prevention.
     - Transmits the actual selected `File` inside `FormData` (`multipart/form-data`, boundary set by browser).
     - Shows the acceptance screen (`Accepted by the submission system` / `Letter received by the server`) ONLY after a verified `2xx` `{ ok: true }` response.
     - On `503 provider-unconfigured`, `413`, `415`, `422`, `429`, `502`, `504`, or network failure, preserves all typed inputs and the selected `File`, renders a single `role="alert"` recovery banner with a **Retry submission** button and a clearly labeled **Open email draft in your mail app** (`mailto:`) link explaining that the user must still press **Send** in their mail client and attach the cover file manually.
     - Updated `/submit` privacy copy and single `<label htmlFor="sf-cover">` association (`1:1` label per control).
2. **P2 — Performance Hardening (`src/components/spatial/SpatialArchive.tsx`, `src/pages/ArticleDetail.tsx`, `src/components/spatial/StoryEnding3D.tsx`, `src/lib/stringTune/StringTuneProvider.tsx`, `src/components/ui/Magnetic.tsx`)**:
   - **`SpatialArchive.tsx`**: Capped standing cover textures to a deterministic curated shelf of `9` plates (`MAX_ARCHIVE_PLATES = 9`, down from all `21` articles) while preserving focal selection for any `selectedId`, and replaced one-way viewport activation with bidirectional `IntersectionObserver` + scroll/resize visibility tracking so `<Canvas frameloop>` switches to `'demand'` (`data-spatial-archive="paused"`) whenever scrolled offscreen or when the tab is hidden.
   - **`EndingSpatialStage` (`ArticleDetail.tsx`) & `StoryEnding3D.tsx`**: Replaced one-way `io.disconnect()` activation with bidirectional `inView` tracking (`data-ending-loop="active" | "paused" | "idle"`) so `<Canvas frameloop>` switches to `'demand'` when scrolled away from `#ending` or when the tab is hidden.
   - **`StringTuneProvider.tsx`**: Added `shouldSuspendStringTune(pathname)` and `visibilitychange` handling so StringTune stops and does not run on `/room`, when the document tab is hidden, when zero `[string]` elements exist in the DOM, or under `prefers-reduced-motion: reduce`.
   - **Magnetic (`src/components/ui/Magnetic.tsx`)**: Removed permanent `will-change-transform` at rest; applies `will-change-transform` only while actively engaged on a fine pointer with motion enabled.
3. **P1 — Confirmed Dead Code, Scratch Residue & Redundant Dependency Cleanup**:
   - Verified zero application, route, test, or build references and removed the orphaned archive cluster (`src/components/archive/ArchiveShelf.tsx`, `src/components/archive/FolioPlate.tsx`, `src/hooks/useArchiveLayout.ts`, `src/lib/archive/geometry.ts`), unused `src/components/ui/RevealImage.tsx`, and scratch script `scripts/.count-tmp.mjs`. Preserved live `src/components/ui/ArtGallery.tsx` and protected `src/lib/room/geometry.ts`.
   - Removed redundant direct `puppeteer-core` entry from `package.json` and `package-lock.json` (`puppeteer@24.43.1` supplies `puppeteer-core@24.43.1` transitively); preserved `@testing-library/dom` (required peer dependency of `@testing-library/react`) and the `test:routes` script alias.

## Verification Results (Executed in Active `arena/9f76f00e-verlyse` Worktree)

| Check / Command | Status | Result Details |
|---|---|---|
| `npm run build` | **PASS** | `tsc -b && vite build && node scripts/prerender-metadata.mjs && node scripts/generate-sitemap.mjs` succeeded (`615` modules, `54` route shells, `54` sitemap URLs) |
| `npm run typecheck:api` | **PASS** | `tsc -p tsconfig.api.json` completed with `0` errors across `api/newsletter.ts` and `api/submit.ts` |
| `npm run check:secrets` | **PASS** | `node scripts/check-secrets.mjs` completed with `0` secret findings |
| `npm run test:metadata` / `npm run test:routes` | **PASS** | `node scripts/metadata-audit.mjs` verified `54` HTML shells, `54` sitemap URLs, and `vercel.json` rewrites |
| `npm run test:smoke` | **PASS** | `node scripts/ssr-smoke.mjs` rendered `21/21` SSR route cases (`19` valid routes across all `11` `<Route>` patterns + `2` missing-slug 404 fallbacks) |
| `npm run test:newsletter` | **PASS** (`22/22` synthetic) / **BLOCKED** (live inbox) | `node scripts/newsletter-smoke.mjs` passed `22/22` synthetic checks. Live production newsletter signup is **BLOCKED** in sandbox pending `BUTTONDOWN_API_KEY` on Vercel |
| `npm run test:submit` | **PASS** (`33/33` synthetic) / **BLOCKED** (live inbox) | `node scripts/submit-smoke.mjs` passed `33/33` synthetic checks (Kesug-only cross-origin CORS for `verlysemedia.kesug.com` & `www.verlysemedia.kesug.com`, same-origin `POST` allowance, dev/prod origins, malformed multipart, filename-only rejection, missing fields, PNG/JPEG/GIF/WebP/AVIF magic-byte verification, spoofed MIME rejection, 4 MB size limit, filename sanitization, `503 provider-unconfigured`, valid submission with & without binary image bytes, outbound attachment verification, multipart contact correspondence, `502` upstream rejection, `504` timeout, `429` rate limit). Live production inbox delivery is **BLOCKED** until owner configures `VERLYSE_MAIL_PROVIDER` / `RESEND_API_KEY` + `VERLYSE_SUBMISSION_FROM_EMAIL` (or `VERLYSE_MAIL_WEBHOOK_URL`) in Vercel |
| `npm run test:flows` | **PASS** | `node scripts/interaction-jsdom.mjs` passed `14/14` jsdom flows (including binary `File` `FormData` upload, `503` failure state preservation, manual `mailto:` draft warning, retry acceptance, `StringTune` `/room` suspension, 9-plate `SpatialArchive` curation, and `Magnetic` non-persistent `will-change-transform`) |
| `node scripts/asset-audit.mjs` | **PASS** | `53/53` role-subset assets (`covers: 32, inner: 7, signature: 1, portrait: 5, fonts: 4, logo: 1, poster: 3`) and `112/112` full `public/` media+font inventory (`108` image/SVG + `4` `.woff2` fonts, `missing: 0`) |
| `node scripts/interaction-audit.mjs` | **PASS** | `20/20` headless Chromium checks passed (including `submit-and-contact-binary-delivery`, `qubool-hai-gallery-and-caption`, `quiet-grief-gallery-computed-layout`, `footer-static-specimen-and-no-tg-residue`, `reduced-motion-preserves`, and `no-webgl-fallback`), `0` console errors |
| `node scripts/verify-flags.mjs` | **PASS** | Search Escape mount/unmount focus restoration and 3D ending fallback passed |
| 8-Viewport × 12-Route Responsive & Single-Footer Matrix (`96/96`) | **PASS** | `96/96` checks across `320×568`, `360×740`, `375×812`, `390×844`, `768×1024`, `1024×768`, `1280×800`, and `1440×900` across all `12` routes (`11/11` standard routes have `footer[aria-label="Footer"] === 1` (`88/88`), `/room` has `0` global footers (`8/8`), `0` horizontal overflow) |

---

# Change Brief № 02 — `/articles` "The folio shelf" → the archive gallery wall

- **Task**: Audit the live publication, choose the one existing surface with the clearest high-impact design problem, and redesign it in place.
- **Active Branch / Base**: `arena/9f76f00e-verlyse`, continuing on top of Change Brief № 01 (`bf77f00`), itself branched from `origin/main` `1a20dd1a34f2c7ccf164427a9ae60c719d8f24d0`.
- **Selected surface**: `src/pages/Articles.tsx` (route `/articles`) and the `.plate-thumb` rule it owns in `src/index.css`.

## Why this surface (measured evidence, not assumption)

Every cover in the registry is a **4:5 portrait plate** — all 19 unique files measure exactly `0.8000`. The rest of
the publication already renders them at their own proportion (`aspect-[4/5]` appears in `Home.tsx` ×5,
`Community.tsx`, `ArticleDetail.tsx`, `ArtGallery.tsx`, `ArticleClosing.tsx`, `WriterProfile.tsx`).

`/articles` — the one page whose entire job is to present all 21 works — was the only surface that did not.
It forced each cover into a fixed `h-[92px]` letterbox with `object-top`:

| Viewport | Cover box | Rendered AR | Natural AR | Artwork visible |
|---|---|---|---|---|
| 1440×900 | 402 × 95 | 4.24 : 1 | 0.80 : 1 | **18.9 %** |
| 768×1024 | 191 × 92 | 2.07 : 1 | 0.80 : 1 | **38.6 %** |
| 390×844 | 316 × 92 | 3.43 : 1 | 0.80 : 1 | **23.3 %** |

Because the visible sliver was the *top* of each plate, the dominant repeated element on the archive was the
boilerplate "Verlyse media presents" header band, and titles inside the artwork were cut mid-word. A full-cover
`rgba(42,15,24,0.12→0.34)` scrim darkened every contributor's work on top of that.

Three further defects were reproduced in the browser on the same surface before any edit:

| # | Defect | Reproduction (pre-fix) |
|---|---|---|
| A | The shelf's arrow-key handler was also bound to the search field, so `←`/`→` could not move the caret | type `poetry` in `#art-search`, press `ArrowLeft` → focus jumps to `folio-the-garden-beyond-my-tower` |
| B | Mouse hover silently moved the keyboard's single tab stop (`onMouseEnter` set the roving index) | tabbable before hover `['folio-their-voices-matter']`; after hovering `folio-khageena` → `['folio-khageena']` |
| C | Only 1 of 21 folio links was reachable by keyboard | `total folio links = 21, tabbable = 1` |
| D | Filtering never reached assistive technology | at `?room=Horror` the status said "1 of 21 folio matches" while all 21 links stayed exposed, `aria-hidden = 0`, non-matching ones resolving to a dead `href="/articles"` |

## Design thesis

**The archive shows the work, not the masthead.** 21 published plates at their own 4:5 proportion, each with a
brass label beneath it, like a gallery wall rather than a row of filed strips.

Principles: (1) the work sets the hierarchy and is never cropped, scrimmed or dimmed by layout;
(2) the label serves the work and sits under it; (3) one job per element; (4) native and keyboard-first.

## What changed

1. **The plate shows the whole work** — `.plate-thumb img` is now `aspect-[4/5] w-full object-cover object-center`
   with explicit `width`/`height`, matching the publication's existing cover standard. `visibleFraction` is now
   `1.000` at every breakpoint. The full-cover darkening scrim and the hover `scale(1.05)` zoom were removed:
   zooming a cover crops the composition the page exists to show, so the **plate** lifts instead of the artwork.
2. **Subtraction (PR #7 method)** — removed the *Selected Folio Curatorial Preview Bar*. It repeated, on hover,
   exactly what each plate's own caption already states (cover, folio №, department, title, byline, reading time,
   date, "Open folio"), and it was the only reason hover had to own selection state.
3. **Keyboard ownership split** — `onSearchKeyDown` now handles only `Escape` for the search field, so `←`/`→`
   are text keys again; the shelf's own `onKeyDown` reads its cursor from `document.activeElement` rather than
   from hover state. All 21 plates are ordinary tab stops; the hand-rolled roving tabindex is gone.
4. **Honest filtering** — a folio outside the current filter keeps its place on the wall (the archive still
   recedes rather than collapsing) but is genuinely out: `aria-hidden`, `tabIndex={-1}`, `pointer-events-none`.
   What is announced now matches what the `aria-live` status claims.
5. **Two owners, two properties** — Motion owns the list item's entrance opacity; CSS owns the recede opacity on
   an inner wrapper. Sharing one element let Motion's inline `opacity: 1` win and the filter stopped dimming.
6. **Semantics** — the grid is a real `<ul>` / `<li>` list instead of `role="group"` with `display: contents`.
7. **Small in-surface fixes** — the record line wraps as whole units instead of truncating to `10 MIN RE…`;
   the keep-mark is a 44 × 44 touch target below `md` (was 32 × 32 and always visible on touch); the at-rest
   `1 - pos * 0.02` opacity taper was dropped so no published work is dimmed by decoration.
8. **The shelf states its own provenance** — `publicationStatus` already distinguishes a finished folio from a
   record still being set, but on this page the distinction existed *only* inside the `aria-label`. Two folios
   (№ 20 *The Quiet Grief*, № 21 *She Didn't Say Qubool Hai*) now carry a visible `Provisional` marker on the
   brass plaque, so sighted and screen-reader readers are told the same thing. This is existing registry data
   rendered, not new content.
9. **Two plates abreast on phones** — the shelf was single-column below 640px, which is what made the mobile
   page 15 137 px long. It is now two columns from **360 px** up and one column below, where a column would
   fall under ~134 px and the record line could no longer hold № + status + date on one row. The gutter
   tightens to 12 px on phones to buy that width back, and the byline wraps instead of truncating, so
   `Social Issues · Haieqa Wahab` is no longer cut to an ellipsis. All 21 folios stay on the shelf — nothing
   is capped or paginated.
10. **The frame stopped cropping** — measuring every rendered cover (not the 18 that happened to be loaded)
   found that **one is not 4:5**: `DeUZFPTCjPU-1.webp` is 603 × 619, near-square. Under `object-cover` the
   4:5 frame was cutting ~18 % off a contributor's artwork — the exact fault this redesign set out to fix,
   surviving inside it. `.plate-thumb img` is now `object-contain` on a paper ground: a no-op for the 20
   covers that are exactly 4:5, and a mount rather than a crop for the one that isn't. The audit check was
   rewritten to measure *"is any artwork cropped"* instead of *"does the ratio match"*, so it cannot pass by
   coincidence again.
11. **The keep-mark stopped covering the picture** — at 44 × 44 it occupied ~27 % of a 162 px plate, sitting on
   the artwork. The visible disc is back to 32 px and the touch target is grown to **46 × 47** with an
   invisible inset ring, so the hand keeps its target and the picture gets its space back.

12. **Contrast brought to WCAG 2.1 AA** — measuring instead of assuming found two real failures on the wall:
   the `date · reading time` line at `#2A0F18/55` was **3.94:1**, and the `Desk pick` badge, sampled from
   *rendered pixels* over artwork, was **3.89:1**. Both are below the 4.5:1 bar for text under 18.66 px. The
   record line moved to `/65` (5.45:1, the ink the byline already used) and the badge from the `gold` token
   `#B89146` to `#D9B978` on a `/88` scrim (**5.30:1** measured; >=5.7:1 even where the artwork beneath is
   near-white). All 84 text nodes on the wall now pass.

Preserved exactly once and unchanged: search, the Room and Order rails and their `aria-pressed` states, URL state
(`q` / `room` / `order` + the `most-read` legacy alias), `Esc` reset, save marks, desk-pick badges, the empty
state, the ledger, the 3-column `7 × 3 = 21` rhythm, the brass spine, and the single shared global footer.

## Measured outcome

| Metric | Before | After |
|---|---|---|
| Artwork visible per cover (1440 / 768 / 390) | 18.9 % / 38.6 % / 23.3 % | **100 % / 100 % / 100 %** |
| Folio links reachable by keyboard | 1 of 21 | **21 of 21** |
| Hover moves keyboard tab stop | yes | **no** |
| `←` in search field | jumps focus out | **moves the caret** |
| Filtered-out folios hidden from AT (`?room=Horror`) | 0 of 20 | **20 of 20** |
| Image bytes on first load — desktop | 1 528 KB (21 requests) | **1 095 KB (18 requests), −28 %** |
| Image bytes on first load — mobile | 825 KB (14 requests) | **433 KB (6 requests), −48 %** |
| Cumulative layout shift | 0 | **0** |
| Page height (desktop / mobile) | 3 551 / 7 958 px | 6 512 / 15 137 px |
| Archive-wall text nodes failing WCAG 2.1 AA | 22 of 84 | **0 of 84** |
| `date · reading time` record line | 3.94:1 | **5.45:1** |
| `Desk pick` badge (sampled on rendered pixels) | 3.89:1 | **5.30:1** |
| `publicationStatus` visible to sighted readers | no (aria-label only) | **yes, on the 2 provisional folios** |
| Columns at 320 / 375 / 390 / 430 px | 1 / 1 / 1 / 1 | **1 / 2 / 2 / 2** |
| Mobile page height (390 px) | 15 137 px | **7 582 px** |
| Covers shown without cropping | 20 of 21 | **21 of 21** |
| Keep-mark: visible disc / touch zone | 44 × 44 / 44 × 44 | **32 × 32 / 46 × 47** |
| Byline at 162 px column | truncated to `…` | **wraps in full** |

The image URLs are unchanged (`a.thumbnail ?? a.cover` in both versions), so the page shows roughly five times
more of each artwork while *downloading fewer image bytes up front* — taller plates mean fewer covers sit in the
first viewport, so native lazy-loading defers more of them. The honest trade is a longer page.

## Reference principles used and rejected

Every row below was **opened on 2026-10-27** with a page fetch, not inferred from its name or from the dated
entries in the supplied catalogue. Classification follows `docs/VERLYSE_TOOLKIT.md`: *reference* / *hosted tool* /
*downloadable asset* / *copied source* / *installed package* / *service* / *existing Verlyse capability*. Full
per-item evidence is in `docs/TOOL_DECISION_RECORD.md`.

| Reference (verified 2026-10-27) | What it actually is | Verdict |
|---|---|---|
| [Two Much Studio — PP Model](https://www.twomuch.studio/projects/pp-model) | A campaign for **Pangram Pangram's PP Model typeface** themed on Tamiya model-car kits (mould sheets, paints, sticker sheets, instruction manuals). Project index is numbered, each work shown as a large still; credits set as a plain stacked list — *Pangram Pangram / 2025 / Typeface / Inari Type / Mathieu Desjardins / Francesca Bolognini*. | **Principle used** — a numbered index of whole artefacts with plain credits beneath. This is the caption the wall now uses (`№`, `date · read`, title, `category · author`). No identity, type, artwork or layout copied. |
| [ShutterKif](https://shutterkif-oss.github.io/) | Portfolio of Ahnaf Akif, filmmaker/educator in Dhaka. Work index is a counter — **`01 /09`** — with its keyboard controls printed on screen (`←` `→` `✕`), plus music and invert toggles. | **Principle used** — an index that *states* its keyboard affordance. Confirms keeping folio numbering and arrow-key traversal, which this redesign repaired. Audio/invert toggles not copied; no autoplay audio added. |
| [How to Talk to White Kids About Racism](https://howtotalktowhitekidsaboutracism.com/) | A digital book by Hello Monday: "Open book", Previous/Next page, a dedication, seven named chapters, and a **colophon naming the typeface (Canela, Commercial Type) and the studio**. | **Principle used** — the folio/plate metaphor and the habit of stating plainly what a thing is made of. The page-turn interaction was **not** taken: it needs a second animation controller, which this task forbids. |
| [Cindy Ly](https://www.cindyly.design/) | Portfolio built as a Tamagotchi device ("FEED ME", keychain, works/quests/profile dock, pixel stickers, `bio.txt`). Each work carries a real status chip — **Shipped / Building / 🏆 1st Place**. | **Principle used, art direction rejected** — the status chips are what prompted surfacing `publicationStatus` visibly (change 8 above). The pixel/Tamagotchi register would compete with contributors' artwork and was not borrowed. |
| [Shopify Editions Winter '26](https://www.shopify.com/editions/winter2026) | **Correction to the supplied catalogue.** The live page is an **AI product-feature catalogue** — Sidekick Pulse, custom app generation, workflow automations, ShopifyQL reports, theme edits, image generation. It is not the thesis-led seasonal editorial campaign the 2026-10-26 catalogue entry describes. | **Rejected, and my earlier claim withdrawn.** The previous version of this brief credited it with "a thesis-led opening above a clearly ordered index". Having now read the page, **nothing was taken from it.** |
| [Unbelievably Crap](https://www.unbelievablycrap.com/) | Liubomyr Ulytskyi, digital designer. A GSAP scroll experiment that announces "the crap experience is best viewed with a desktop — sorry, not sorry", with cursor readouts and awards tallies. | **Rejected — kept as a negative control.** It deliberately degrades on mobile and requires a dedicated scroll/animation controller. Both are forbidden here (native scroll; motion as progressive enhancement). |
| [WebsitePrompts.ai](https://websiteprompts.ai/) | A free library of 100+ AI website prompts for Lovable / Bolt / v0 / Claude, filed by industry, plus a blog. | **Rejected as a design source** — it produces exactly the generic industry template the Verlyse redesign protocol forbids. **One artefact used as method:** its 2026-10-20 post *"We Ran an Accessibility Audit on 154 AI-Built Websites"* prompted an actual contrast pass on this surface, which found 22 real AA failures (change 9). Its headline example and my worst measurement were both 3.89:1 — coincidence, not a shared source. |
| [ThreeUI](https://threeui.com/browse?sort=recent) + [MengTo/threeui](https://github.com/MengTo/threeui) | A gallery of Three.js scenes on FREE/PRO tiers (AURAL headphones, NEST architecture, Koi Mecha, Sakura River Valley, XGIMI 3D assets) **and a genuinely published npm package** — see the component table. | **Rejected on fit, not availability** — my earlier "not on npm" finding was wrong and is corrected below. |
| [Lenis](https://lenis.dev/) | Real smooth-scroll library by darkroom.engineering; `lenis@1.3.27`, MIT. | **Rejected** — the archive has no scroll requirement native scrolling cannot meet, and a second scroll controller is explicitly out of scope. Rejected on need, not on rights or quality. |
| [shadcn/ui](https://ui.shadcn.com/) | Source-copy registry. **Correction:** each component now ships in three variants — **Base UI (default)**, React Aria and Radix UI (`/docs/components/{base,aria,radix}/…`). The default `AspectRatio` takes a `ratio: number` prop and documents against `base-ui.com`. | **Blocked and duplicative** — see the component table. |
| [RandomA11y](https://randoma11y.com/primary) | Hosted colour aid: "all hex colors that have a contrast of 4.5 or greater with both white and black in the **WCAG 2.1 contrast algorithm**". | **Used as a standard, not as a palette.** Its stated 4.5:1 / WCAG 2.1 bar became this change's acceptance threshold; the existing brass-and-ink palette was measured against it rather than replaced. Two failures found and fixed inside the existing colour family. No colour imported. |
| [Haikei](https://haikei.app/) | Hosted SVG generator (waves, blobs, grids, gradients); free, exports PNG/SVG; © z creative labs GmbH, with its own Terms and Privacy pages. | **Not used** — the wall needs no generated background, and laying generated graphics over contributor artwork is forbidden. Terms deliberately not relied upon, because no asset was taken. |
| [Shapes Gallery](https://www.shapes.gallery/) | "Browse 70+ SVG shapes… CLICK TO COPY", plus a DOWNLOAD ALL zip. Made by Monika Michalczyk. | **Not used — rights still unverified.** Re-checked on 2026-10-27: the page states no licence or reuse terms, matching the base pack's warning. Nothing was copied or downloaded. |
| [footer.design](https://www.footer.design/browse) | Real inspiration gallery, browsable by type and style. | **Not applicable** — the footer was audited and deliberately left alone (the apparent gap in an early full-page screenshot was a `Reveal` artifact, not a defect). |
| [Type Garden](https://type-garden.vercel.app/) | **Offline on 2026-10-27**: the host returns *"This deployment is temporarily paused"* (`iad1::qwplc-1793089098901-6f53fc71881e`). | **Not used, and the catalogue entry is now stale.** Recorded so the toolkit is not cited as live. |
| Logosystem, Penpot | Brand-mark inspiration and a design-handoff tool. | **Not used** — no mark and no design-handoff artefact was in scope for an archive index. |

## Component installation requirement — re-evaluated against the live registries

The brief asks for a real component to be installed **where a suitable one exists**. The previous version of this
table was wrong in one important way, and the correction is recorded rather than quietly replaced.

> **Withdrawn:** I previously reported that "`registry.npmjs.org/threeui` and `/@threeui/react` both return
> `Not found`", and concluded ThreeUI was not installable. That was a name-guess failure. The repository's own
> release history says packages are *"Publish\[ed\] … under DesignCode scope"*, and a registry **search** —
> rather than a guessed name — returns a real, MIT-licensed, currently published package.

| Candidate | Evidence gathered 2026-10-27 | Verdict |
|---|---|---|
| **`@designcodeio/threeui@1.2.0`** | **Exists, MIT, published 2026-09-01.** Peer deps `react >=18 <20` (project: 18.3.1 ✅) and `three >=0.149 <1` (project: 0.185.1 ✅) — so it *is* compatible and rights-cleared. But it is **52.19 MB unpacked across 726 files**, and its dependencies are `three128: npm:three@0.128.0` and `three165: npm:three@0.165.0` — installing it adds **two further copies of Three.js** beside the project's existing one. | **Rejected on fit and cost, not on availability.** The surface is a 2-D grid of 21 contributor covers with no spatial requirement; content must stay readable without WebGL; and 52 MB / three Three.js runtimes for a page whose entire image payload is 1 095 KB fails any proportionality test. |
| `threeui-cli@0.3.1`, `@designcodeio/threeui-cli@0.1.0`, `3ui-cli@0.1.2` | Copy-in / Pro-access CLIs for the same catalogue. | **Rejected** — same fit problem; the Pro CLIs additionally require account authentication and a paid tier. |
| shadcn/ui `aspect-ratio` / `toggle-group` | **Blocked here:** the CLI must reach `ui.shadcn.com`, which this sandbox cannot resolve — `curl https://ui.shadcn.com/r/styles/default/aspect-ratio.json` → `SSL_ERROR_SYSCALL`, HTTP 000, while `registry.npmjs.org` returns 200 from the same shell. (The docs are readable over the page-fetch tool; the registry endpoint the CLI needs is not.) **Also duplicative:** `AspectRatio`'s `ratio` prop reproduces the native `aspect-[4/5]` already used in 15 places, and `ToggleGroup` reproduces rails that are already real `<button>`s with correct `aria-pressed`. | **Blocked + duplicative** |
| `@radix-ui/react-aspect-ratio` | Installable, MIT. | **Rejected as duplicate functionality** — an existing Verlyse capability (native CSS `aspect-ratio`). |
| `@radix-ui/react-toggle-group` | Installable, MIT. | **Rejected as duplicate functionality** — replacing working, correctly-labelled buttons would change behaviour, not add a missing primitive. |
| `lenis@1.3.27` | Installable, MIT, actively maintained. | **Rejected** — no measured scroll need; native scroll is the documented default. |

Every verified need of this redesign — true-proportion covers, no layout shift, lazy loading, scroll reveal,
accessible filter rails, keyboard navigation, AA contrast — is met by an existing project capability: native CSS,
semantic HTML, and the already-installed `motion/react`. **No dependency was added; `package.json` and
`package-lock.json` are untouched.**

The installation requirement is therefore reported as **open pending the owner's direction**, now on the stronger
footing that the most plausible candidate was found, verified as real and MIT, and rejected for measured reasons
rather than missed.

---

# Change Brief № 03 — the site-wide legibility system

Change Brief № 02 redesigned one surface. This brief promotes what that surface actually proved — a repaired
micro-label system — from `/articles` into the shared layer and the remaining twelve routes.

## Thesis

**Verlyse did not need a visual redesign; it needed its existing design language to become legible.**

Rendering all 14 router patterns at 390 / 768 / 1440 showed a coherent, intentional oxblood-and-gold editorial
system: arched category wings, serif display, mono micro-labels, folio numbering. Replacing that would destroy
real work. What was broken was one thing, repeated everywhere.

## The measured defect

**127 deterministic WCAG AA failures** across 14 routes, from **12 colour tokens**; six caused 110 of them.

| nodes broken | token |
| ---: | --- |
| 39 | `rgba(255,255,255,0.45)` — decks + shared footer |
| 29 | `rgba(184,145,70,0.80)` — shared footer colophon + CTA |
| 15 | `rgba(255,255,255,0.50)` — bylines |
| 10 | `rgba(184,145,70,0.85)` — section eyebrows |
| 10 | `rgba(184,145,70,0.90)` — sheet labels |
| 7 | `rgba(255,255,255,0.40)` — "— optional", filter labels |

Because the shared `Footer` carried `gold/80` (4.21:1) and `ivory/45` (4.44:1), **every ordinary route failed in
the footer** — including the three that were otherwise nearly clean.

## What changed

| # | Change | Evidence |
| --- | --- | --- |
| 1 | `gold` became `{ DEFAULT: '#B89146', lit: '#D9B978' }` | base gold cannot reach 4.5:1 on `wine #5C1224` even at opacity 1 (4.58:1); `lit` clears it from 0.75 |
| 2 | 116 text-token migrations across 21 files | `text-gold/65–90 → gold-lit/80–90`; `white/40,45 → /60`; `white/50 → /65`; `ivory/40,45 → /60`; `ivory/50 → /65` |
| 3 | `#8A8178 → #6E665D` (10 sites, dossier + plate captions) | 3.14:1 → 4.64:1 on cream, 5.23:1 on ivory |
| 4 | Home record line `[#2A0F18]/55 → /65` | 3.94:1 → 5.19:1 — the same fix proven on `/articles` |
| 5 | The one `text-[7px]` on the site → `8px` | `Categories.tsx` wing lead label, smallest type anywhere |
| 6 | Contributor wall faded tiles `opacity-60 → opacity-80` | handle line was 3.50:1 because a 0.60 container multiplied an already-light token → 5.25:1 |
| 7 | Wing arches `opacity-35 → opacity-85`, wing label → `gold-lit` | dimmed nav was 1.78:1; active wing still unmistakable via its solid ivory plate |

## Deliberately not changed

- **`border-gold/80`** and the **58 `text-white/55`** call sites — measured 4.93:1–5.97:1, already passing.
  Nothing was altered merely for matching a pattern.
- **The `✦` separator** (`text-[0.6em]`, 6–6.6px, 36 instances) — a decorative glyph between metadata items,
  not readable text. Inflating an ornament to satisfy a size rule would be checklist design.
- **`/room`'s receded plates** — the dimming *is* the spatial depth model (`geometry.ts`: `isFocus ? 1 : …`).
  The focused plate measures 0 failures / 12 nodes.
- **Home's composition** — 25,289px at 390px is content-driven (the eight-folio feed alone is 7,110px;
  all nine sections' padding is ~9% of the page). Shortening it means showing fewer folios. Owner decision.
- **Submit/Contact delivery, APIs, DNS, analytics, deployment** — out of scope for a visual change.

## Measured outcome

| check | before | after |
| --- | --- | --- |
| deterministic AA failures (15 routes × 3 viewports, 5,371 nodes) | 127 | **0** |
| routes with zero failures | 0 of 15 | **15 of 15** |
| media-backed groups failing at the *median* backdrop | — | **2 of 52** (both large decorative numerals) |
| smallest non-decorative type | 7px | **8px** |
| horizontal overflow (120 route × viewport) | 0 | **0** |
| `footer[aria-label="Footer"]` on ordinary routes | 1 | **1** (0 on `/room`, by design) |
| console / network errors | 0 | **0** |
| packages installed | — | **none** |

## Corrections made during this work

- A first contrast sweep used a mid-grey sentinel behind text over imagery and reported Home at 43 failures.
  Re-measured by hiding each text node and screenshotting the real backdrop, Home's "Ledger 01" is **5.07:1**,
  not the 1.25:1 the sentinel claimed. The sentinel over-reported badly; all figures here are pixel-verified.
- An initial accessibility probe reported the overlays as lacking dialog semantics and focus restoration.
  **Retracted.** The probe filtered on `offsetParent !== null` (always `null` for `position: fixed`) and used
  `.click()`, which does not focus the trigger. All three overlays were already correct.

---

# Change Brief № 04 — The Pressed Edition

**Date:** 2026-10-28 · **Branch:** `arena/9f76f00e-verlyse` · **Base:** `1a20dd1`
**Decision record:** Record 09 · **Evidence:** `docs/evidence/r09/`

## Why

Brief № 03 fixed legibility. It did not change how Verlyse looks. Every section on every
page still opened with the same 10px mono label, hand-rolled 18 times, and the shared
`SectionHead` primitive was used twice in the entire codebase. There was no designed
opening anywhere in the publication.

## The direction

**The Pressed Edition** — Verlyse as a printed journal, not a website with a wine palette.
A chapter announces itself the way a page of a printed edition does: a section numeral in
the gutter, a double brass rule, an oversized Cormorant title carrying one italic accent
word, a deck on a 46ch measure. Surfaces behave like pressed paper, with corner
registration crops instead of plain borders.

## Where it lands

- **Shared shell** — the masthead closes on the same brass rule the chapters open on.
- **`.kicker`** — upgraded once in CSS, restyling **17 call sites across 5 files**
  (Home, ArticleDetail, Submit, Contact, WriterProfile) without touching those pages.
- **About** — four boxy panels become pressed-paper sheets; three tiny labels become
  `§ 01 The mission`, `§ 02 The principles`, `§ 03 The record`.
- **Creators** — the wall opens on `§ 02 · Every name` with a live, real counter.
- **Community** — the response reel gains a chapter head; the desk letter gains an actual
  title where it previously had only a label.

## What was deliberately not done

- No dependency was added. The chapter opener is content-shaped and lives in the existing
  `primitives.tsx` owner.
- Native scroll kept; Lenis rejected. ThreeUI rejected again.
- No artwork was altered, no contributor detail invented, no route invented, no second
  footer, no folio hidden or capped.
- Articles, Categories, Ambassadors, Submit, Contact and the detail routes inherit the
  system through `.kicker` and the shell rather than bespoke openers. That is a scope
  limit of this pass, not a judgement that they were already finished.

## Verified

Build **PASS** (54 shells) · API typecheck **PASS** · secrets **PASS** ·
interaction audit **22/22 PASS**, 0 console errors ·
104 route×viewport combos **PASS** (0 overflow, 0 footer/h1 errors) ·
new-class contrast **29 checked, 0 failures** · sub-8px text in new classes **0**.

`/room` remains the documented accepted exception. Nothing committed, pushed or deployed.

---

# Change Brief № 05 — route compositions

**Date:** 2026-10-28 · **Branch:** `arena/9f76f00e-verlyse` · **Base:** `1a20dd1`
**Decision record:** Record 10 · **Evidence:** `docs/evidence/r10/` (20 sheets, desktop + phone)

Brief № 04 built The Pressed Edition and said openly that several routes only inherited it.
This brief gives those routes compositions of their own, without repeating the chapter
opener mechanically.

- **`/ambassadors` → the printed masthead.** Departments set on one rule; medallions
  104px → 64px; dense left-aligned credit rows. Page height **9,389px → 5,507px** with all
  ten names, roles, numbers and the open seat preserved.
- **`/categories` and category detail → the plate rack.** 48px thumbnails become mounted
  cover plates on cream, shown whole. The wing numeral becomes a printed department mark.
- **`/articles` → archive masthead** at publication scale, on the press rule.
- **`/submit`, `/contact`** → dead bands closed so the form and the letter sheet lead.
- **`/creator/:id`, `/article/:id`, `/room`** → deliberately left alone, each with a
  recorded reason. The creator dossier already *was* the Pressed Edition thesis.

**Verified:** build **PASS** · API typecheck **PASS** · secrets **PASS** · interaction
audit **22/22 PASS** · 112 route×viewport combos **PASS** · contrast **539 checked, 0
failures** (81 earlier hits were all `aria-hidden` decorative nodes — scope stated in
Record 10) · sub-8px text **0** · tiny touch targets **0**.

Zero dependencies added. Live site not tested. Nothing committed, pushed or deployed.

---

## Brief № 06 — "The bound issue": a contents page for Home

**Date:** 2026-10-28 · **Branch:** `arena/9f76f00e-verlyse` · **Route:** `/`

**Visual thesis.** Home is not a scroll; it is a *bound issue*. It already ran in four
movements — the `MotifDivider`s named three of them — but those marks were decorative,
`aria-hidden`, and unreachable. The issue had chapters and no contents page. Now it has
one, printed directly under the masthead ledger, and the movements are real places you
can go.

**Primary focal point.** Unchanged: the cover and the lead folio. The contents sits
*below* the ledger band so it informs the descent without competing with the masthead.

**Reading hierarchy.** Cover → ledger (what the issue holds) → contents (what shape it
has) → I The issue → II The feature → III The room → IV The invitation.

**Design principles.**
1. *Derived, never invented.* Every figure — 21 folios, 19 published, 2 provisional,
   7 departments, 7 letters, 585 conversations, the lead title and its author — is read
   from `LEDGER` and the live arrays at render time.
2. *Present at rest.* The contents carries no `Reveal`. Wayfinding must not be gated
   behind a scroll-triggered fade; it is the one element whose job is to tell a
   thirty-screen page what shape it has.
3. *Numerals carry the spine.* Roman I–IV in the contents and again on each chapter
   mark, so the reader's position is legible from either end.
4. *Native scroll only.* In-page anchors and CSS `scroll-behavior`, already disabled
   under `prefers-reduced-motion`. No scroll library, no sticky second nav.
5. *Subtract while adding.* The one genuinely redundant `/submit` link — buried in the
   archive statistics row — came out in the same pass.

**Route signature.** Home is now the only route with a contents page, because it is the
only route long enough to need one. The chapter-mark language is shared; the contents is
not stamped onto other routes.

**Existing owners used.** `IssueBand` (the contents lives inside its `<section>` — no new
section), `MotifDivider` in `ArticleClosing.tsx` (extended with `id`/`no`), `motion/react`
(already the divider's engine), native CSS smooth scroll.

**Not added.** No new route. No new section. No second nav, footer, CTA, newsletter,
logo or specimen. No sticky progress bar. No scroll-spy. No new dependency. No GSAP on
Home — `src/components/cinematic/index.ts` places Home in the protected manifest and
forbids it without an explicit per-route decision.

**Acceptance checks — all run 2026-10-28, results in Record 11.** Build / typecheck /
secrets / flows / metadata PASS; 14 routes × 3 viewports before *and* after with 0
overflow, 1 footer, 1 `h1`, 0 errors; contents 4/4 rows at `opacity: 1` with no scroll;
anchors land at 112 px under the fixed header; chapter marks no longer `aria-hidden`.
`submit-and-contact-binary-delivery` is **BLOCKED (environment)** — `vite dev` does not
serve `api/*`; verified 404 by curl; untouched by this change.

**Evidence.** `docs/evidence/r13/home-{desktop,tablet,phone}.png` plus
`articles-phone.png` as an unchanged control. Live host `verlysemedia.kesug.com`
NOT TESTED — unreachable from this sandbox.

---

## Brief № 07 — The deep routes get a spine (2026-10-28)

**The thesis, continued.** Phase C gave the issue a visible contents: Home now
opens onto four named chapters you can jump to. Phase D carries the same idea
inward, at the right scale for each route — because the thing that was missing
on the deep routes was not ornament, it was *structure you could navigate.*

**What was actually wrong.** A 13.5-screen story had one heading of its own. Its
other headings were the titles of *different* articles, sitting at the same level
as the story's own title. A 9-screen creator dossier had no outline at all. The
section labels were there and visible — "Within the post", "Conversations", "Up
next", "How they write", "Published works", "Stories beside theirs" — they were
just paragraphs wearing a heading's clothes. And on the article, the words
"Within the post" printed twice, forty pixels apart.

**The move.** Promote the labels that were already on the page into the document
outline, and delete the repeat. `MotifDivider` learned a single prop — `heading`
— so the brass rule, glyph and label that already marked each movement now *are*
the heading rather than decoration beside one. Nothing was invented and nothing
moved: `.kicker` already owned font, size and colour, so the change is
pixel-identical. The only height difference on the whole route is the 73 px of
the duplicate coming out.

**What we refused to do.** No chapter numerals on `/article/:id`. The issue has
chapters; a story has movements. Numbering a single feature would have been the
chapter opener repeated mechanically, which is exactly the failure mode the brief
warns against. And the 912 px band at 2% ink that looked like dead space on the
census turned out to be `aria-hidden` and to contain one word — **FIN.** The
silence is the point. It stays.

**Two routes deliberately left alone, with reasons.** The 404 already speaks in
the magazine's voice — *"a page that wasn't written"* — and it renders inside the
shared footer, which already owns navigation; putting an index in its body would
have duplicated that job. `/room` is the WebGL scene, viewport-locked and on the
protected manifest; its low-opacity nodes are a composition, not a bug.

**Honest limits.** Nothing is deployed; `verlysemedia.kesug.com` was not reached
from this sandbox. One article and one creator were measured in depth, though
both render from shared components. No screen reader was run — the claim is about
the DOM outline, which was verified directly.

Evidence: `docs/evidence/r13b/` — article, creator and 404 at desktop and phone,
plus an at-rest close-up of the "Conversations" heading showing visual parity.

---

## Brief № 08 — One thing on the page is allowed to be big (2026-10-28)

Home had eleven sections and ten of them were exactly the same width. Not one
image, anywhere on a visual magazine, ever broke out of its box. The nine
headings ran 61 to 89 pixels — close enough that nothing led. That is what makes
a page feel templated: not the colours, not the type, but the fact that every
section is granted the same amount of room and the same frame.

We tried to fix it as a height problem first and were wrong twice. Pulse looked
airy at 22% ink but holds four real metrics. The hiring section looked
oversized but carries a headline, an info box, a marquee and a call to action.
Compressing either would have been cutting content to flatter a measurement.

So the lead feature was given the page's one expansive moment instead. Its plate
band leaves the 1440 measure and runs to both edges, and its title became the
largest thing on the page. Everything else stays contained — which is the point.
A break only reads as emphasis if it happens once.

The first attempt cropped the plate to a 21:9 cinematic band. The build passed
and every number improved. Then we looked at it: the artwork is a 4:5 collage
with its lettering at the top and its two subjects at the bottom, and the wide
crop had cut through both — "Border, Just" sliced in half, both faces gone. The
numbers approved of something that had quietly vandalised the art. It now sits
whole inside the full-bleed band, projected rather than trimmed.

On a phone this is the clearest gain. That plate used to be a half-width
thumbnail in a two-column grid; it now fills the screen at its true proportion
and you can finally read it.

What is still unfinished is said plainly in Record 13: nine sections still share
one container, the palette still alternates across three backgrounds, and eight
other routes have not been put through this same treatment census.
