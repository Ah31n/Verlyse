# Verlyse Media — full-site UI & motion audit

**Target:** http://verlysemedia.kesug.com (InfinityFree / Apache-LiteSpeed static host)
**Date:** 2026-09-29 · **Branch:** `arena/01a0ee58-verlyse` · **Source commit:** `2ea7839`

---

## 0 · Method & one caveat, stated up front

Two passes were run:

1. **Live crawl** of the deployed site — every route template, fetched and rendered, output compared against the content registry (`src/data/content.ts`).
2. **Source audit** of the checkout, plus the repo's own headless gates.

**The caveat:** this sandbox has no outbound access to the Chrome/Chromium download CDNs, so no browser could be installed. Every Playwright/Puppeteer gate in this repo (`verify-flags`, `asset-audit`, `interaction-audit`, `full-matrix-audit`, the `audit/phase*` validators) **could not run**, and no pixel/layout/screenshot pass was possible. So:

* Findings marked **[CONFIRMED]** were reproduced on the live site or are unambiguous in the source.
* Findings marked **[NEEDS EYES]** are structural conclusions that want a 30-second visual check in a real browser.

What *did* run clean: `tsc -b` (no type errors), `npm run build` (7.3s, 50 prerendered shells), and `npm run test:smoke` — **all 19 SSR routes render without crashing**.

A local build of the current source is running in the preview pane so you can click through the same routes side by side with production.

---

## 1 · Route inventory — what's actually deployed

**52 addressable routes.** 50 ship a prerendered metadata shell; 2 do not.

| Group | Count | Status |
|---|---|---|
| `/` , `/about`, `/articles`, `/categories`, `/community`, `/contact`, `/submit`, `/ambassadors` | 8 | ✅ prerendered, crawled, correct |
| `/article/:id` | 19 | ✅ prerendered — but see **D1** |
| `/creator/:id` | 16 | ✅ prerendered, crawled |
| `/categories/:slug` | 7 | ✅ prerendered — but see **D2** |
| `/creators` | 1 | ⚠️ **in sitemap, no prerendered shell** (D5) |
| `/room` | 1 | ⚠️ **no shell, no sitemap entry, no `<title>`** (D6) |
| 404 fallback | — | ✅ `.htaccess` rewrite works; NotFound renders correctly |

Content integrity is genuinely good: 19 folios / 16 contributor records / 7 wings reconcile across home, `/articles`, `/categories`, `/creators` and `/community`. **91 referenced assets, 0 missing.** No broken internal links found outside D2.

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

### D10 · `/article/3-13` returned an empty body twice — [NEEDS EYES]

Two independent live fetches of `/article/3-13` returned **only the preloader markup** — no article body, no reading room, no footer. Every other article route returned full content. Against that:

* SSR smoke renders the same route fine (`/article (horror) ✓ 55748 chars`).
* The route's prerendered shell exists in `dist/article/3-13/index.html`.
* It is the only article carrying a WebGL clock scene (`ArticleSignature.tsx:687` → `SceneClock`, plus the `three` chunk at 770 kB).

Most likely explanation: the 770 kB three.js chunk pushes this page past the crawler's render budget, and the content is simply late rather than absent. But it is also the exact signature of a client-side crash in a lazy chunk, and it happened on the single heaviest page on the site. **Open `/article/3-13` in a real browser with the console visible before dismissing this.** If it is just slow, the 770 kB `three` chunk on a mobile connection is its own problem worth solving.

---

## 3 · What's in good shape

Worth saying, because it's not common: focus traps, Escape handling and focus restoration are implemented correctly on all three dialogs; the skip link works on every route; `svh` units are used instead of `100vh` everywhere that matters (no mobile URL-bar jump); no `repeat: Infinity` animations anywhere; every scroll listener is passive and cleaned up; `CountUp` cancels its RAF on unmount; no missing assets across 91 references; the `.htaccess` caching and SPA-fallback rules are correct; and the preloader has a skip control, a session guard, a reduced-motion bypass *and* a hard 1.9s timer. The content registry reconciles perfectly across all 52 routes.

---

## 4 · Suggested order of work

| # | Defect | Severity | Effort |
|---|---|---|---|
| 1 | **D1** — folio label broken on all 19 article pages | High (visible, production-only) | 1 line |
| 2 | **D2** — 126 dead/invisible-focusable links across 7 category pages | High (a11y + SEO) | ~10 lines |
| 3 | **D10** — verify `/article/3-13` in a browser | High *if* real | unknown |
| 4 | **D4** — scroll lock on 3 dialogs + dead `.preloading` hook | Medium | ~15 lines |
| 5 | **D3** — reduced-motion guard in `ArticleClosing` | Medium (a11y) | ~20 lines |
| 6 | **D8** — static fallback for home ledger numbers | Medium | ~5 lines |
| 7 | **D5 / D6 / D7** — prerender `/creators`, register `/room`, fix canonicals | Low–Medium | ~15 lines |
| 8 | **D9** — `pointer-events-none` on the progress strip | Low | 1 word |

D1, D2, D7, D8 and D9 are each a handful of lines and could go out as one commit.

---

## 5 · Gap this audit could not close

No visual pass happened. Not covered: actual layout at 320/768/1440/2560px, overflow and clipping, contrast ratios, animation jank and frame timing, hover/focus states, form submission behaviour on `/submit` and `/contact`, the drag/keyboard reels on `/community` and `/room`, and Lighthouse/CWV numbers.

Two ways to close it: allowlist `storage.googleapis.com` for this sandbox and the repo's existing Playwright suite (`npm test`, plus the 30+ `audit/phase*` validators) will run the whole matrix in minutes — or run `npm test` locally against the branch and hand me the output.
