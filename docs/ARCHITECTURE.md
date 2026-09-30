# Verlyse Media — canonical architecture

Established by **Refinement R01 (Architecture + Truth Lock)**. This file is the reference for routes, data, deployment, environment, and animation ownership. If code and this document disagree, one of them is a bug.

---

## 1 · Route registry

**Single source of truth: `src/data/routes.ts`.**

Everything enumerable is derived from `src/data/content.ts`. Four consumers read the registry and none keeps its own list:

| Consumer | Reads |
|---|---|
| React Router (`src/App.tsx`) | `ROUTE_PATTERNS` |
| Prerendered shells (`scripts/prerender-metadata.mjs`) | `buildRouteRegistry()` |
| `sitemap.xml` (`scripts/generate-sitemap.mjs`) | `buildRouteRegistry()` |
| Route/metadata audit (`scripts/metadata-audit.mjs`) | `buildRouteRegistry()` |

Node-side consumers load it through `scripts/lib/load-registry.mjs`, which bundles the TypeScript via Vite SSR — the same mechanism `ssr-smoke.mjs` uses, so build scripts and application resolve modules identically.

### The 52 routes

| Kind | Pattern | Count | Derived from |
|---|---|---|---|
| core | `/`, `/articles`, `/categories`, `/creators`, `/community`, `/ambassadors`, `/about`, `/submit`, `/contact` | 9 | static |
| spatial | `/room` | 1 | static |
| category | `/categories/:slug` | 7 | `CATEGORIES` |
| article | `/article/:id` | 19 | `ARTICLES` |
| creator | `/creator/:authorId` | 16 | `AUTHORS` |
| fallback | `*` | — | renders `NotFound` |

All 52 ship a prerendered metadata shell and appear in `sitemap.xml`.

### Canonical URL form

The primary host serves prerendered shells as directory indexes and therefore **301s `/articles` → `/articles/`**. Canonical tags and sitemap entries carry that trailing slash, so no canonical points at a URL that immediately redirects. `canonicalUrl()` in the registry is the only place this rule is expressed.

---

## 2 · Data registry

**`src/data/content.ts`** remains the single content layer. R01 assessed splitting it and **deliberately did not split it** — the file is large (1,466 lines) but it is one cohesive editorial record, and every cross-reference (`worksBy`, `relatedArticles`, `coCreditedWorks`, `LEDGER`) depends on the whole. Splitting now would create import cycles for no runtime benefit. Revisit only if a second issue is added.

### Derived, never typed twice

| Value | Derived from |
|---|---|
| `LEDGER.features` | `ARTICLES.length` |
| `LEDGER.creators` | distinct primary `authorId`s |
| `LEDGER.departments` | `CATEGORIES.length` |
| `LEDGER.appreciations` / `conversations` | summed from article records |
| **`CATEGORIES[].count`** | **`ARTICLES.filter(a => a.category === wing.name).length`** — *fixed in R01; was seven hand-typed integers* |
| Route metadata, titles, sitemap | the registry, from the above |

### Contributor semantics

A contributor's role comes from `Author.role`. Two helpers express it:

- `primaryRole(author)` — first segment of a compound role, for titles. `"Writer · Associate Editor"` → `"Writer"`.
- `roleInSentence(author)` — grammatical form for prose. `"Artist"` → `"an artist"`; `"The platform"` → `"the platform"`.

The archive credits a Painter, a Calligrapher, an Artist, five Poets, two Essayists, editors, directors and the platform itself. **Before R01, all sixteen dossiers were titled "Writer"** in both the prerendered metadata and the client-side SEO hook.

---

## 3 · Deployment architecture

Two deployments. **They are not equivalent and the distinction matters.**

| | Primary | Mirror |
|---|---|---|
| Host | InfinityFree / Apache-LiteSpeed, `verlysemedia.kesug.com` | Vercel, `verlyse-react.vercel.app` |
| Role | **canonical** — robots.txt, sitemap and every canonical tag point here | mirror + serverless origin; self-canonicalises to primary |
| Content | static `dist/` over FTP (`scripts/deploy-ftp.mjs`) | full Vite build |
| Routing | `public/.htaccess` — directory indexes + SPA fallback | `vercel.json` rewrites |
| Headers | `public/.htaccess` | `vercel.json` |
| Serverless | none natively | `/api/*` |

### ⚠️ The header duplication rule

`public/.htaccess` and `vercel.json` must carry the **same** security header set. InfinityFree never reads `vercel.json`. Any change to the CSP, HSTS, or any header must be made in **both files**. A missed edit shows up only in production, only on the canonical host, and silently.

---

## 4 · Newsletter architecture

`Footer.tsx` → `POST /api/newsletter` (relative) → Vercel function → Buttondown.

**Verified:** `GET https://verlysemedia.kesug.com/api/newsletter` returns the function's exact payload, `{"error":"method-not-allowed"}` — identical to the Vercel origin. So the path resolves on the canonical host.

**Not verified, and it matters:** this environment cannot issue a POST. Two explanations fit the evidence equally:

1. The host proxies `/api/*` to Vercel — the endpoint genuinely works.
2. A file was placed at `api/newsletter` on the host whose contents happen to be that JSON — GET looks right and **POST silently fails**.

Explanation 2 is not far-fetched: `dist/` contains no `api/` directory, and `scripts/deploy-ftp.mjs` uploads only `dist`. Nothing in this repository would put a working function there. `GET /api/does-not-exist` returns InfinityFree's own 404 page, which tells us the host — not Vercel — is answering unknown `/api` paths.

**Required manual check before relying on the letter list:**

```bash
curl -i -X POST https://verlysemedia.kesug.com/api/newsletter \
  -H 'Content-Type: application/json' \
  --data '{"email":"you@example.com"}'
```

- `201`/`200 {"ok":true}` → architecture 1, working as designed.
- `405`, HTML, or the same 405 JSON → architecture 2. Then either proxy `/api/*` to the Vercel origin (and add `https://verlysemedia.kesug.com` to `ALLOWED_ORIGINS`), or move the form to a static-compatible provider.

**Failure behaviour is already honest.** The client requires `res.ok && data.ok`; an HTML response parses to `{}` and falls to the error branch, so it can never report a false success. R01 added a `mailto:` fallback to that branch so a reader whose subscription fails is still given a way to reach the desk.

**No API key reaches the browser.** `BUTTONDOWN_API_KEY` is read only inside `api/newsletter.ts`.

---

## 5 · Environment variables

| Variable | Class | Used by | Required? | Notes |
|---|---|---|---|---|
| `BUTTONDOWN_API_KEY` | **server-only** | `api/newsletter.ts` | optional | Absent → endpoint returns `503 not-configured`. Must never be client-exposed. |
| `ALLOWED_ORIGINS` | server-only | `api/newsletter.ts` | optional | Comma-separated CORS allowlist. Falls back to Vercel + localhost — **the canonical domain is not in the default list**; add it if the client ever calls the API cross-origin. |
| `PUBLIC_SITE_ORIGIN` | build-time | prerender, sitemap, metadata audit | optional | Defaults to `https://verlysemedia.kesug.com`. Set for preview builds. |
| `FTP_HOST` / `FTP_USER` / `FTP_PASS` / `FTP_DIR` | **server-only (deploy)** | `scripts/deploy-ftp.mjs` | required to deploy | Credentials. Never in the repo; `check:secrets` guards this. |
| `PORT` | local | preview server | optional | — |

**No `import.meta.env.*` is read anywhere in `src/`** — the client bundle carries no environment configuration at all. That is the correct posture and should be preserved.

---

## 6 · Animation ownership

One layer owns each surface. Nothing is animated by two systems.

| System | Owns | Scope |
|---|---|---|
| **CSS / Tailwind** | Hover, focus-visible, colour and opacity transitions, the global `prefers-reduced-motion` clamp (`index.css:69-76`) | sitewide |
| **motion (v13)** | Route transitions (`PageTransition`), `AnimatePresence`, overlays, reveals, scroll-linked `useScroll` in 5 components | sitewide, 44 import sites |
| **GSAP (3.15)** | `components/cinematic/primitives.tsx` only — 10 `gsap.fromTo` timelines, most ScrollTrigger-scrubbed, plus `quickTo` in `Magnetic` | 3 import sites |
| **Anime.js (4.5)** | `components/ui/BrassRule.tsx` only — one SVG line-draw | 1 import site, rendered once on `/about` |
| **R3F / three** | `SpatialArchive` (Home), `StoryEnding3D` (articles), `components/room/*` (`/room`) | lazy; gated on WebGL support, reduced motion and tab visibility |

**Scroll owner: the browser.** There is no smooth-scroll engine. GSAP ScrollTrigger and motion's `useScroll` both *read* native scroll; neither drives it.

**Known overlap risk:** GSAP and motion both animate transforms, on different elements today. Any new effect must state which layer owns the element. The standing recommendation (see `docs/3D-IMMERSIVE-PLAN.md` §3) is to retire GSAP and Anime.js onto motion + StringTune.

---

## 7 · Dependency audit

Verified by import-site count including dynamic imports — **nothing removed on a search miss**.

| Package | Import sites | Verdict |
|---|---|---|
| `motion` 13.2 | 44 | keep |
| `react-router-dom` 7.18 | 23 | keep |
| `gsap` 3.15 | 3 | **in use** — retire later, deliberately, not now. Non-OSS licence; ships in the main chunk because `Header` imports `Magnetic`. |
| `three` 0.185 | 2 | keep (lazy) |
| `@react-three/fiber` 8.18 | 2 | keep (lazy) |
| `animejs` 4.5 | 1 | **in use** — a whole library for one SVG rule on one page. Retire later. |
| `puppeteer`, `puppeteer-core`, `@playwright/test` | test harnesses | keep (dev) |

No unused runtime dependency was found. Nothing was deleted.

---

## 8 · Build configuration

`vite.config.ts` `manualChunks` — corrected in R01, and the comments now describe what it actually does:

- Specific package paths are matched **before** broader ones.
- `@react-three` is claimed before `three`.
- **`motion` is matched as well as `framer-motion`.** The old config tested only for `framer-motion`, a stale assumption from before the package rename.
- **`react-router` is claimed explicitly.** Its path contains the substring `node_modules/react`, so the previous `router` rule was unreachable and react-router silently landed in the `react` chunk. It still ships there — that is now a stated decision rather than an accident.

---

## 9 · Asset truth

100 assets in `public/` (95 images, 5 fonts), each referenced by code. R01 removed one orphan: `public/img/works/alina-cafe.jpg` (247 KB), which had zero references in `src/`, `scripts/`, `index.html` or the built output.

**Outstanding (not R01 scope):** five contributor portraits are still `.jpg` while the other 89 images are WebP — `alina-javed-about.jpg` is 259 KB and renders on four surfaces. No image uses `srcset`. See `audit/CODEBASE-AND-SITE-ASSESSMENT.md` §B5.
