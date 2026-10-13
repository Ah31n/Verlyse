# Verlyse Media — codebase & site assessment

**Scope:** the full repository at `2ea7839` + both live deployments
**Date:** 2026-09-30 · **Branch:** `arena/01a0ee58-verlyse`

Companion to `SITE-AUDIT-2026-09-29.md` (the 52-route crawl). That document covers what the *pages* do wrong. This one covers the *codebase, build, infrastructure and delivery* — and the UI defects that only show up when you read the source.

**What ran clean:** `tsc -b` with `strict: true`, `noUnusedLocals`, `noUnusedParameters` — **zero errors, zero `any`, zero `@ts-ignore` across 15,844 lines**. `vite build` succeeds. `npm run test:smoke` renders all 19 SSR routes without crashing. This is a disciplined codebase; most of what follows is infrastructure and delivery, not code quality.

**Still not covered:** no browser in this sandbox, so no pixel/layout/contrast/frame-timing pass. Unchanged from the previous report.

---

## 0 · The headline finding: your canonical site is the unprotected one

There are **two live deployments**:

| | `verlysemedia.kesug.com` (InfinityFree/Apache) | `verlyse-react.vercel.app` (Vercel) |
|---|---|---|
| Role | **canonical** — robots.txt + sitemap + every `<link rel=canonical>` point here | mirror; self-canonicalises to kesug |
| Security headers | **none** | full set (CSP, HSTS, nosniff, Permissions-Policy…) |
| HTTPS forced | **no** | yes |
| Serverless `/api` | responds | native |
| Trailing-slash 301 | yes → causes **D1** | no → D1 absent |

Every security header you wrote lives in `vercel.json`, which **InfinityFree never reads**. The host only gets `public/.htaccess`, and that file sets caching and rewrites — nothing else. So the deployment you tell Google and every social platform is the real one is the one running with no CSP, no `X-Content-Type-Options`, no `Referrer-Policy`, no `Permissions-Policy`, no `X-Frame-Options`, and no HSTS.

**And it serves over plain HTTP.** I crawled all 52 routes over `http://` this session — no redirect, no upgrade. `public/.htaccess` has no HTTP→HTTPS rule. The `/submit` form collects a name, an email and an entire unpublished manuscript; `/contact` collects a name, email and message body. On an `http://` page those post in the clear, and any network between the writer and the site can read or alter them.

### A1 · Port the security headers to `.htaccess` — **Critical**

```apache
<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set X-Frame-Options "SAMEORIGIN"
  Header always set Permissions-Policy "geolocation=(), camera=(), microphone=(), payment=()"
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
  Header always set Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://verlyse-react.vercel.app https://formsubmit.co; frame-ancestors 'self'; base-uri 'self'; form-action 'self' https://formsubmit.co; object-src 'none'"
</IfModule>
```

One caution: your `vercel.json` CSP sets `form-action 'self'`, but `/submit` and `/contact` POST to `formsubmit.co`. They use `fetch` (governed by `connect-src`, which does allow it), so nothing breaks today — but if the no-JS fallback ever becomes a real `<form action>`, `form-action` will block it. Worth adding `https://formsubmit.co` now.

### A2 · Force HTTPS — **Critical**

```apache
RewriteCond %{HTTPS} off
RewriteCond %{HTTP:X-Forwarded-Proto} !https
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]
```

Place it above the SPA fallback rule. HSTS (A1) is only safe once this exists.

### A3 · Decide which deployment is canonical, and keep them in step — **High**

Right now the two builds can drift silently, and they already behave differently (D1 appears on kesug only, because only Apache adds the trailing slash). Either make Vercel canonical and point the domain at it — which would fix A1, A2 and D1 in one move, and give you a real `/api` — or keep kesug canonical and accept that `.htaccess` must mirror `vercel.json` by hand forever. The first option is strictly less work.

### A4 · CORS allowlist omits the live domain — **Low (latent)**

`api/newsletter.ts:133` defaults to `['https://verlyse-react.vercel.app', 'http://localhost:5173', 'http://localhost:4173']`. The kesug origin isn't there. Nothing breaks today because `Footer.tsx:29` calls `/api/newsletter` as a *relative* URL. The moment anyone makes that absolute, the newsletter dies with a CORS error and no obvious cause. Add the origin to `ALLOWED_ORIGINS` now.

*Note: I tested `https://verlysemedia.kesug.com/api/newsletter` live and it correctly returns `{"error":"method-not-allowed"}` to a GET, so the endpoint is reachable on the canonical domain. I could not determine from the repo how it is routed there — `dist/` contains no `api/`, and `scripts/deploy-ftp.mjs` uploads only `dist`. Worth you confirming, because an undocumented routing hop is a thing that breaks at 2am.*

---

## 1 · The submit form silently discards uploaded cover images — **Critical**

`/submit` presents a file picker: *"Cover / supporting image — optional · a cover plate, a photograph, a scan."* It validates the MIME type against five formats and rejects anything over 8 MB (`Submit.tsx:40-60`). It looks like a working upload.

**The file is never sent.** `sendToDesk()` (`Submit.tsx:65-72`) posts JSON to `formsubmit.co/ajax/…`, and the payload carries only `fileName` — a string. A JSON body cannot carry a binary attachment. On the happy path the writer sees the success state and the desk receives a submission with no artwork.

The file name *is* mentioned, but only in the `mailto:` fallback that fires when the network call fails — `"(cover image selected: X — please attach it to this email)"`. So the fallback path is honest and the primary path is not.

For a publication whose entire premise is presenting artists' work with care, an art submission that arrives without the art is the worst possible failure. Three options, cheapest first:

1. **Remove the picker**, and ask writers to email the image (the page already prints the address).
2. **Keep it, tell the truth** — on success, show "Your work is with the desk. Please reply to the confirmation email with your cover image attached."
3. **Make it real** — switch to `FormData` (formsubmit's non-AJAX endpoint accepts multipart), or upload to storage and send the URL.

---

## 2 · Performance & delivery

### B1 · `three.js` is 770 kB (203 kB gzipped) and loads on the two most-visited page types — **High**

It is your largest chunk by a factor of three. It ships on `/` (`SpatialArchive`) and on all 19 `/article/:id` pages (`StoryEnding3D`), entirely for decorative background scenes.

Credit where due: both are lazily imported, and both are properly gated — `useWebGLSupport()`, `useReducedMotion()`, and even `tabVisible` (`SpatialArchive.tsx:271`). The scenes are suppressed correctly for reduced-motion users and non-WebGL devices.

**But the gates run after the chunk downloads.** The decision to skip the scene happens in React, by which point 203 kB has already crossed the wire. On a mid-range phone in Lahore on 4G that is roughly a second of transfer for something the user may never see.

Fix: move the gate *before* the import. `useWebGLSupport` and `matchMedia('(prefers-reduced-motion: reduce)')` are both synchronous and available pre-render — check them, and only then `import()`. Consider adding `navigator.connection.saveData` and `deviceMemory <= 4` to the same guard.

### B2 · GSAP loads on every route, including the forms — **High**

`Header.tsx:4` imports `Magnetic` from `../cinematic`. `Header` is inside `Layout`, which is never lazy — so `cinematic/primitives.tsx` and therefore **GSAP land in the 261 kB main `index` chunk on every single route**, including `/contact` and `/submit` where nothing cinematic renders.

`Magnetic` is a cursor-follow effect using `gsap.quickTo` (`primitives.tsx:232`). That is ~15 lines with `motion`'s `useSpring`, which is already bundled. Dropping GSAP from the header either removes the library entirely or pushes it into the page chunks that actually use it.

### B3 · Three animation libraries — **Medium**

`motion` (137 kB chunk), `gsap` (in main), and `animejs`. Anime.js is used in exactly one place — `BrassRule.tsx`, an SVG line-draw, rendered once on `/about`. That is a whole library for one decorative rule.

There's also a licensing note your own code flags (`cinematic/index.ts:10`): GSAP is not open source and ships under its Standard "no charge" license. Fine for this site today, but it's a dependency with terms attached, carried for effects `motion` can already do. Consolidating on `motion` removes the question.

### B4 · A dead rule in `manualChunks` — **Low**

`vite.config.ts:40-42`:

```js
if (id.includes('node_modules/react') || …) return 'react'   // line 40
…
if (id.includes('node_modules/react-router')) return 'router' // line 42 — unreachable
```

`node_modules/react-router-dom` contains the substring `node_modules/react`, so line 40 claims it first. Line 42 never fires, and there is no `router` chunk in the build output — react-router is silently folded into the 279 kB `react` chunk. Reorder (most specific first) or anchor the match.

### B5 · 9.8 MB of images, zero responsive variants — **High**

- **0 of 28 `<img>` tags have `srcset`/`sizes`.** Every device downloads full-resolution art. Phones get desktop plates.
- **6 files are still JPG**, including `alina-javed-about.jpg` at **259 kB** — the founder portrait, which renders on `/about`, on `/creator/alina-javed`, and inside two article pages. The other 89 images are already WebP.
- Largest plates run 170–220 kB each; several articles load four.

Converting the six JPGs to WebP and adding two or three widths with `srcset` is the single biggest bandwidth win available, and it needs no code restructuring.

### B6 · 24 of 28 images have no `width`/`height` — **Medium (CLS)**

Only four carry intrinsic dimensions. Everything else reserves no space, so text reflows as each plate arrives. On the article pages — where a full-bleed cover sits directly above the headline — this is the most visible layout shift on the site. Add `width`/`height` (or an `aspect-ratio` class) to every `<img>`; the aspect ratios are already known and consistent (4:5 for plates).

---

## 3 · Accessibility

### C1 · The artwork has `alt=""` — **High**

`ArticleDetail.tsx:438` and `:454` render the cover plate as:

```tsx
<img src={article.cover} alt="" … />
```

Empty alt means "decorative, skip me." On `/article/water-cat`, `/article/a-students-worth` and `/article/tasbih-e-fatima` **the cover plate *is* the published work** — the painting, the calligraphy, the illustration. A screen-reader user gets a byline, a two-line caption, and silence where the art is.

13 of 28 images across the site use `alt=""`. For thumbnails adjacent to a text link that's correct practice. For the hero plate of an Art folio it is not. At minimum, key the alt text off the category: decorative for Poetry/Essays where the plate is a title card, descriptive for Art where it's the piece.

### C2 · Form validation errors aren't announced — **Medium**

`/submit` and `/contact` score well on the basics: every field has a `<label htmlFor>`, `autoComplete` is set correctly, the submit button carries `aria-busy`, and the status line is `aria-live="polite"`.

But **there is not one `aria-invalid` or `aria-describedby` in either file.** `FieldHint` renders "The work itself is required." visually, with no programmatic link to the input it describes. A screen-reader user tabbing the form after a failed submit hears the label and nothing else — they cannot tell which field failed or why. Add `aria-invalid={errors.includes('work')}` and `aria-describedby="sf-work-err"` on each input, with the matching `id` on the hint.

### C3 · Also see the companion report

D2 (126 invisible-but-focusable links), D3 (`ArticleClosing` ignores reduced motion — 34 animations on all 19 article pages), D4 (no scroll lock behind three modals), D9 (progress strip over the header without `pointer-events-none`).

---

## 4 · Robustness

### E1 · No error boundary anywhere except one 3D scene — **High**

The only `componentDidCatch` in the codebase is `Home.tsx:32`, guarding the WebGL archive. There is:

- no error boundary around `<Suspense>` in `App.tsx:119`
- no `errorElement` on any route

Every page is a lazy chunk. If any one of them throws during render — or simply fails to download on a flaky connection — the user gets **a blank white page** with no message and no way back. The `Suspense` fallback is `<div className="min-h-screen bg-charcoal" aria-hidden="true" />`, so a failed chunk load looks identical to a slow one: an empty dark rectangle, forever.

This is worth fixing regardless, but it's especially worth it here because it's exactly the failure I mistook for a real bug during the route crawl — when a page renders empty you cannot tell a crash from a slow load, and neither can your users.

A ~30-line `RouteErrorBoundary` wrapping the `Suspense`, showing the existing NotFound styling plus a reload link, closes this.

### E2 · Dead CSS hooks — **Low**

`Preloader.tsx:37,39` toggle `.preloading` and `.loaded` on `<html>`. **Neither class is defined in `index.css`, the Tailwind config, or anywhere else.** The intended scroll-lock during the 1.9s intro doesn't exist — the page scrolls behind the curtain. Either implement `html.preloading { overflow: hidden }` or delete the toggles.

### E3 · Global `CustomEvent` bus instead of context — **Low**

Seven `window.dispatchEvent(new CustomEvent('verlyse:…'))` calls wire the header to the search overlay and saved drawer. It works and it avoids prop drilling, but it's untyped, invisible to React DevTools, and impossible to trace statically — a listener typo fails silently. A small typed context (or a 20-line store) would be sturdier. Not urgent.

### E4 · Repo hygiene — **Low**

`audit/` holds **56 committed files / 588 kB** of one-off phase validators (`phase205-`, `phase21-ab-`, `phase28-*`, `probe-*`, `_probe28c.mjs`), plus 25 scripts in `scripts/`. Much of it is superseded scaffolding. Three duplicate filenames (`BrassThread.tsx`, `Room.tsx`, `primitives.tsx`) exist in different directories — the two `BrassThread`s are genuinely different components (83 vs 29 lines) with the same name, which is a trap for the next person. Archive the spent validators and rename one `BrassThread`.

---

## 5 · What's genuinely good

Worth recording, because a defect list reads like a verdict and this isn't one:

- **Type discipline** — `strict`, `noUnusedLocals`, `noUnusedParameters`, and not a single `any` or `@ts-ignore` in 15.8k lines. Rare.
- **Dialog accessibility** — all three overlays have real focus traps, Escape handling and focus restoration to the opening control. Most sites this size have none.
- **Motion hygiene** — 28 of 32 animated components guard on `useReducedMotion`; no infinite loops; every scroll listener passive and cleaned up; RAF cancelled on unmount.
- **The 3D layer is gated properly** — WebGL support, reduced motion, *and* tab visibility. The only issue is that the gate runs after the download (B1).
- **The API is well written** — the `clientIp` rate-limit key derivation deliberately avoids the caller-controlled leftmost `x-forwarded-for` (with a CWE reference in the comment), bounds its memory, fails closed on unattributable callers, and treats duplicate subscribers as success. That's better than most production code.
- **Forms degrade gracefully** — a `mailto:` fallback with the whole submission prefilled when the network path fails, plus a double-submit guard.
- **Content integrity** — 19 folios, 16 contributors, 7 wings reconcile exactly across all 52 routes. 91 asset references, 0 missing.

---

## 6 · Priority

| # | Item | Severity | Effort |
|---|---|---|---|
| 1 | **A1/A2** — security headers + forced HTTPS on the canonical host | Critical | ~20 lines of `.htaccess` |
| 2 | **§1** — submit form discards cover images | Critical | 1 line (honest copy) → half a day (real upload) |
| 3 | **D1** — `Folio —` on all 19 article pages *(companion report)* | High | 1 line |
| 4 | **E1** — route error boundary; blank page on any chunk failure | High | ~30 lines |
| 5 | **D2** — 126 invisible focusable links *(companion)* | High | ~10 lines |
| 6 | **B5** — JPGs → WebP, add `srcset` | High | ~2 hours |
| 7 | **C1** — alt text on artwork plates | High | ~10 lines |
| 8 | **B2** — GSAP out of the main chunk | High | ~15 lines |
| 9 | **A3** — settle the two-deployment question | High | a decision |
| 10 | **B1** — gate three.js before the import | Medium | ~20 lines |
| 11 | **D12** — doubled quotes on 6 dossiers *(companion)* | Medium | ~3 lines |
| 12 | **B6** — `width`/`height` on 24 images | Medium | ~30 lines |
| 13 | **C2** — `aria-invalid` / `aria-describedby` on forms | Medium | ~20 lines |
| 14 | **D3, D4, D8, D13** *(companion)* | Medium | ~50 lines total |
| 15 | **B3, B4, E2, E3, E4, A4, D9, D11** | Low | ~1 hour total |

**If you only do three things:** `.htaccess` headers + HTTPS (A1/A2), tell the truth about the cover image (§1), and add the error boundary (E1). The first two are a Sunday afternoon; the third is thirty lines.
