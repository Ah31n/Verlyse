# Verlyse Media — full-site UI & motion audit

**Target:** http://verlysemedia.kesug.com (InfinityFree / Apache-LiteSpeed static host)
**Date:** 2026-09-29 · **Branch:** `arena/01a0ee58-verlyse` · **Source commit:** `2ea7839`

---

## 0 · Method & one caveat, stated up front

Two passes were run:

1. **Live crawl** of the deployed site — **all 52 routes fetched and read individually** (not sampled by template), output compared against the content registry (`src/data/content.ts`). Where a route returned a suspiciously thin body it was re-fetched with a cache-busting query string before being called a defect.
2. **Source audit** of the checkout, plus the repo's own headless gates.

**The caveat:** this sandbox has no outbound access to the Chrome/Chromium download CDNs, so no browser could be installed. Every Playwright/Puppeteer gate in this repo (`verify-flags`, `asset-audit`, `interaction-audit`, `full-matrix-audit`, the `audit/phase*` validators) **could not run**, and no pixel/layout/screenshot pass was possible. So:

* Findings marked **[CONFIRMED]** were reproduced on the live site or are unambiguous in the source.
* Findings marked **[NEEDS EYES]** are structural conclusions that want a 30-second visual check in a real browser.

What *did* run clean: `tsc -b` (no type errors), `npm run build` (7.3s, 50 prerendered shells), and `npm run test:smoke` — **all 19 SSR routes render without crashing**.

A local build of the current source is running in the preview pane so you can click through the same routes side by side with production.

---

## 1 · Route inventory — what's actually deployed

**All 52 addressable routes fetched and read individually.** 50 ship a prerendered metadata shell; 2 do not.

| Group | Count | Crawled | Status |
|---|---|---|---|
| `/` , `/about`, `/articles`, `/categories`, `/community`, `/contact`, `/submit`, `/ambassadors` | 8 | 8/8 | ✅ prerendered, correct |
| `/article/:id` | 19 | 19/19 | ✅ all render — but see **D1** |
| `/creator/:id` | 16 | 16/16 | ✅ all render — but see **D12**, **D13** |
| `/categories/:slug` | 7 | 7/7 | ✅ prerendered — but see **D2**, **D11** |
| `/creators` | 1 | 1/1 | ⚠️ **in sitemap, no prerendered shell** (D5) |
| `/room` | 1 | 1/1 | ⚠️ **no shell, no sitemap entry, no `<title>`** (D6) |
| 404 fallback | — | ✅ | `.htaccess` rewrite works; NotFound renders correctly |

Content integrity is genuinely good: 19 folios / 16 contributor records / 7 wings reconcile across home, `/articles`, `/categories`, `/creators` and `/community`. Every folio number, byline, handle, date, reading time and appreciation count matches the registry on every page it appears. **91 referenced assets, 0 missing.** No broken internal links outside D2.

Per-route notes worth keeping: all 19 article pages carry the D1 label bug; the Poetry-variant articles (`forgive-me-mother`, `jaldi`, `failure`, `hope-becomes-mythology`, `if-hope-were-a-feather`) deliberately render no cover plate, which is consistent across all five; `mir-raza-ali` correctly degrades its appreciation count to "not tallied in the ledger" on the `verlyse-media` dossier rather than showing 0.

---

## 2 · Defects

### D1 · Every article page shows a broken folio label: "Folio **—** · Reading" — [CONFIRMED, live]

The highest-visibility defect on the site. Verified live on `/article/khageena`, `/article/mir-raza-ali`, `/article/the-empty-waltz` — all three render the page-transition label as `Folio — · Reading` instead of `Folio 13 · Reading`.

**Cause** — `src/App.tsx:31-35`:

```ts
const id = pathname.split('/article/')[1]        // "khageena/"  ← trailing slash
const i = ARTICLES.findIndex((a) => a.id === id) // -1
```

The host serves prerendered shells as directory indexes, so Apache **301-redirects `/article/khageena` → `/article/khageena/`**. The manual string split keeps the trailing slash, the lookup misses, and every article falls to the `'—'` fallback. React Router's own params strip the slash, which is why the page body renders fine — only this label is wrong. It is broken on **all 19 article routes in production**, and invisible in local dev (Vite doesn't add the slash).

*Fix:* normalise before lookup — `pathname.split('/article/')[1]?.replace(/\/+$/, '')`.

---

### D2 · Category pages: 18 of 19 folio links are dead and invisibly focusable — [CONFIRMED, live]

On `/categories/lifestyle` every link outside the selected wing points at `/categories/lifestyle/` instead of its article. Same on all 7 slug pages.

**Cause** — `src/pages/Categories.tsx:268-271`:

```tsx
to={ghosted ? '#' : `/article/${a.id}`}
onClick={(e) => { if (ghosted) e.preventDefault() }}
```

Three problems stack up:
1. `to="#"` under React Router resolves to the *current* URL, so crawlers and middle-click/open-in-new-tab both land back on the category page — 18 self-referential links per page × 7 pages.
2. The parent `<li>` is `opacity-10` (`:267`) — the links are essentially invisible but remain in the tab order, so a keyboard user tabs through 18 unreadable, unactionable links to reach the visible one.
3. They keep `role=link` + `aria-label="Folio 05 — Hope Becomes Mythology, Poetry"`, so a screen reader announces 18 links that do nothing.

*Fix:* when `ghosted`, render a `<span>` (or keep the `Link` but add `tabIndex={-1}` + `aria-hidden` and set `pointer-events-none` on the `<li>`).

---

### D3 · Article closing sequences ignore `prefers-reduced-motion` — [CONFIRMED, source]

`src/components/ui/ArticleClosing.tsx` — **61 `motion.*` elements, 34 with `initial=` entrance animations, zero reduced-motion guard.** It's the one animation-heavy component in the codebase with no `useReducedMotion()` call, and it renders on every one of the 19 article pages.

The global `@media (prefers-reduced-motion: reduce)` block at `src/index.css:69-76` does **not** cover this: it clamps CSS `animation-duration` / `transition-duration`, but Motion drives transforms via JS/WAAPI, which that rule can't touch. The other 28 animated components all guard correctly — this is the gap, not the pattern.

Also unguarded, lower volume: `pages/About.tsx` (5), `pages/Articles.tsx` (1), `pages/Contact.tsx` (1).

---

### D4 · No scroll lock behind any modal — [CONFIRMED, source]

The search overlay (`SearchOverlay.tsx:115`, `z-[1250]`), the saved drawer (`SavedDrawer.tsx:101`, `z-[1250]`) and the mobile menu (`Header.tsx:222`, `z-[1050]`) are all `role="dialog" aria-modal="true"` with proper focus traps and Escape handling — but **none of them locks body scroll**. The page scrolls underneath an open dialog; on mobile a touch-scroll on the overlay backdrop moves the page behind it.

Only `ArtGallery.tsx:26` does this correctly (`document.body.style.overflow = 'hidden'` + cleanup). That's the pattern to lift into the other three.

**Related dead code:** `Preloader.tsx:37` toggles `.preloading` on `<html>` and `:39` adds `.loaded` — **neither class is defined anywhere** in `index.css` or the Tailwind config. The intro curtain's intended scroll-lock/entrance gating simply doesn't exist, so the page can be wheel-scrolled behind the curtain during the 1.9s opening.

---

### D5 · `/creators` is in the sitemap but has no prerendered shell — [CONFIRMED]

`public/sitemap.xml` lists 51 URLs; `scripts/prerender-metadata.mjs` emits 50. The odd one out is `/creators` — the contributor wall, a top-level nav destination. It falls through `.htaccess` to the bare `index.html`, so **its `<title>`, description, canonical and `og:image` are the home page's** until React hydrates. Every share of that URL previews as the home page.

---

### D6 · `/room` is unregistered and untitled — [CONFIRMED, live]

The Keeping Room ships no prerendered shell, no sitemap entry, and `src/pages/Room.tsx` never calls `useSeo` — so the live tab title is the generic `"Where Vision Becomes A Voice — Verlyse Media"`. It's also mounted outside the chrome (no header, no footer), which is deliberate, but combined with no title it reads as an orphan page.

---

### D7 · Canonical URLs disagree with the URLs the host serves — [CONFIRMED]

`scripts/prerender-metadata.mjs` writes `<link rel="canonical" href="{origin}{route.path}">` — i.e. **no trailing slash**. Apache 301s every one of those 50 routes **to** the trailing-slash form. So every page's canonical points at a URL that immediately redirects elsewhere. Harmless for users, consistently wrong for crawlers and the same root cause as D1.

---

### D8 · Home ledger renders "0 · 0 · 0" before hydration — [CONFIRMED, live]

The home "Community pulse" block shows `Features presented 19` next to `0 Appreciations`, `0 Conversations`, `0 Creators credited` in the pre-hydration HTML. `CountUp.tsx:15` seeds `useState(0)` and only fills once `useInView` fires.

The `/community` page does this correctly — its numbers ship as static text with the animated value layered on (the crawl shows `1,281 1,281`, the static + animated pair). The home ledger is missing that fallback, so no-JS visitors, crawlers and slow first paints see a magazine claiming zero appreciations and zero creators.

---

### D9 · Decorative progress bar sits above the header and eats pointer events — [CONFIRMED, source]

`Layout.tsx:33` — the reading-progress strip is `fixed inset-x-0 top-0 z-[1110]`, **above** the header's `z-[1100]` (`Header.tsx:100`), with `py-1` and a bottom border. Its contents are `aria-hidden` and purely decorative, but the wrapper has **no `pointer-events-none`** and, when unscrolled, is `opacity-100`-invisible-but-present (`opacity-0` only).

Result: a ~16px invisible full-width strip across the top of every page that intercepts clicks over the header. The logo (30px, centred in a 68–86px bar) clears it by ~3px, so this is currently a near-miss rather than a live breakage — but it's one header-height tweak away from swallowing clicks on the wordmark. The reading-mode wrappers directly below it (`:36`, `:43`) do add `pointer-events-none`; this one was missed.

---

### ~~D10 · `/article/3-13` returned an empty body~~ — **RETRACTED, not a site defect**

During the first pass `/article/3-13` returned only preloader markup on two attempts, and `/article/if-hope-were-a-feather` did the same on three. Both looked like client-side crashes.

They are not. Re-fetching each with a cache-busting query string (`?nocache=1`) returned the **full** article — body, reading room, signature scene, conversations, up-next rail. The empty responses were the crawler's own cached/early-render artifact, not the site. Both routes are healthy and are counted as passing in the inventory above.

Recorded here rather than deleted because the first version of this report flagged it as a likely high-severity bug, and that call was wrong.

---

### D11 · "1 folios" — missing pluralisation on three category pages — [CONFIRMED, live]

`/categories/stories`, `/categories/horror` and `/categories/lifestyle` all render the subtitle **"Stories — 1 folios · step forward"**.

**Cause** — `src/pages/Categories.tsx:142` hardcodes the plural:

```tsx
`${active} — ${CATEGORIES.find((c) => c.name === active)?.count ?? ''} folios · step forward`
```

The wing headers on the very same page get it right ("1 folio"), and `Creators.tsx:322` already has the correct helper (`` `${n} folio${n === 1 ? '' : 's'}` ``). Only this one string was missed.

---

### D12 · Doubled quotation marks on 6 contributor dossiers — [CONFIRMED, live]

`WriterProfile.tsx:141` wraps the writer's note in literal curly quotes:

```tsx
“{note ?? author.favoriteQuote}”
```

But **6 of the 14 notes in `content.ts` already open and close with their own curly quotes.** The result, live:

* `/creator/kenza-imene` → `““The cats always reflect people’s unspoken personalities…””`
* `/creator/abheesha-ghosh` → `“…repeating her words to her.” — Abheesha”`
* `/creator/haiqa-nafees` → `“…helps the mind work better.” — Haiqa Nafees”`
* `/creator/syeda-tasbeeha-noman` → `“…a tower and a garden.” — Syeda Tasbeeha Noman”`
* plus `anshujit-singh` and `haieqa-wahab`

Two flavours of wrong: a visible double `““ … ””`, and — worse for a publication whose whole premise is crediting writers properly — the attribution dash swallowed *inside* the outer quotation mark, so it reads as if the writer quoted their own name.

*Fix:* strip leading/trailing `“ ”` from the note before wrapping, or drop the literal quotes and let the data own them.

---

### D13 · The "Stories beside theirs" rail is 0, 1, 2 or 3 cards in a 3-column grid — [CONFIRMED, live]

`WriterProfile.tsx:193` renders the related rail as `grid-cols-1 sm:grid-cols-3`, filled from same-category articles only. Across the 16 dossiers the live counts are:

| Cards | Dossiers |
|---|---|
| 3 | alina-javed, mochjixx, abheesha-ghosh, hadia-raza, syeda-tasbeeha-noman, kazi-fatimataz-zahra, verlyse-media |
| 2 | adeena-irfan, craft-with-bro, kenza-imene, zuha-farhan |
| 1 | shaza-fatima, munkashay-javed |
| **0** | **haieqa-wahab, anshujit-singh, haiqa-nafees** |

At 1 card the rail is a lone thumbnail with two thirds of the row empty. At 0 the section is hidden entirely (`others.length > 0`), which leaves three dossiers ending on the published-works block with no onward link except the back-to-wall control — the only dead ends in the site's navigation graph.

Both are consequences of same-category-only matching in wings that hold 1 folio (Stories, Horror, Lifestyle). Widening the fallback to "same category, then newest elsewhere" fixes the empty and the thin cases at once.

---

## 3 · What's in good shape

Worth saying, because it's not common: focus traps, Escape handling and focus restoration are implemented correctly on all three dialogs; the skip link works on every route; `svh` units are used instead of `100vh` everywhere that matters (no mobile URL-bar jump); no `repeat: Infinity` animations anywhere; every scroll listener is passive and cleaned up; `CountUp` cancels its RAF on unmount; no missing assets across 91 references; the `.htaccess` caching and SPA-fallback rules are correct; and the preloader has a skip control, a session guard, a reduced-motion bypass *and* a hard 1.9s timer. The content registry reconciles perfectly across all 52 routes.

---

## 4 · Suggested order of work

| # | Defect | Severity | Effort |
|---|---|---|---|
| 1 | **D1** — folio label broken on all 19 article pages | High (visible, production-only) | 1 line |
| 2 | **D2** — 126 dead/invisible-focusable links across 7 category pages | High (a11y + SEO) | ~10 lines |
| 3 | **D12** — doubled quote marks on 6 dossiers, attribution inside the quote | Medium-High (credit is the brand promise) | ~3 lines |
| 4 | **D4** — scroll lock on 3 dialogs + dead `.preloading` hook | Medium | ~15 lines |
| 5 | **D3** — reduced-motion guard in `ArticleClosing` | Medium (a11y) | ~20 lines |
| 6 | **D8** — static fallback for home ledger numbers | Medium | ~5 lines |
| 7 | **D13** — related rail empty on 3 dossiers, 1-of-3 on 2 more | Medium | ~8 lines |
| 8 | **D5 / D6 / D7** — prerender `/creators`, register `/room`, fix canonicals | Low–Medium | ~15 lines |
| 9 | **D11** — "1 folios" on 3 category pages | Low | 1 line |
| 10 | **D9** — `pointer-events-none` on the progress strip | Low | 1 word |

D1, D7, D8, D9 and D11 are one-to-five-line changes and could go out as a single commit.

---

## 5 · Gap this audit could not close

No visual pass happened. Not covered: actual layout at 320/768/1440/2560px, overflow and clipping, contrast ratios, animation jank and frame timing, hover/focus states, form submission behaviour on `/submit` and `/contact`, the drag/keyboard reels on `/community` and `/room`, and Lighthouse/CWV numbers.

Two ways to close it: allowlist `storage.googleapis.com` for this sandbox and the repo's existing Playwright suite (`npm test`, plus the 30+ `audit/phase*` validators) will run the whole matrix in minutes — or run `npm test` locally against the branch and hand me the output.
