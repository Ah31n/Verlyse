# Verlyse Project Map

## Authority Order

1. **Current user request and explicit permissions**
2. **Active working branch/worktree in the Arena workspace** (`arena/741ed410-verlyse` branched from `HEAD` `ea6392572d2481ef3f197799ac0ac2917e9e135a`)
3. **Active source-of-truth code** (`src/data/content.ts`, `src/App.tsx`, `src/components/layout/Layout.tsx`, `src/components/layout/Footer.tsx`, `package.json`)
4. **Current project docs that agree with active code**
5. **User-pasted or earlier 2026-10-18 branch/test reports** — treat as claims to verify in the active worktree
6. **Dated catalog entries** (`src/data/verlyse_2026_04_catalog.ts`) — supplementary metadata only

## Route Map & Existing Owners

| Route | Primary Owner | Notes |
|---|---|---|
| `/` | `src/pages/Home.tsx` | Cover (`Cover`, including decorative `<FloralWord>` & `<HaikeiContourPlane>`), IssueBand, WorksStrip (`feature`, `s1`/`s2`, `spread`, `poem`), ExhibitionHall (`SpatialArchive` WebGL + reduced-motion gated inside `SpatialBoundary` + static fallback), VoicesStrip, MastheadStrip, Colophon |
| `/articles` | `src/pages/Articles.tsx` | Archive exhibition hall (`20` catalogued features = `19` published folios + `1` provisional record): Spine Shelf (`xl:grid-cols-7`), Reading Table preview, Dept Band, Full Catalogue |
| `/article/:id` | `src/pages/ArticleDetail.tsx` | Single folio reader, `ReadingRoom` (`src/components/reading/ReadingRoom.tsx`), `ArtGallery` (`src/components/ui/ArtGallery.tsx`), `EndingSpatialStage` (`glSupported && !reduce && near && tabVisible` gating `StoryEnding3D` inside the `EndingSpatialBoundary` React Error Boundary), `ArticleSignature`, `ArticleClosing`, related dispatches |
| `/categories` (`/categories/:slug`) | `src/pages/Categories.tsx` | Seven curatorial wings (`first:col-span-2 xl:first:col-span-1` balanced 7-cell grid) + selected wing room |
| `/creators` (`/creator/:authorId`) | `src/pages/Creators.tsx` + `src/components/ui/WriterProfile.tsx` | Living Directory of `15` bylined voices + `1` co-credited poet (`16` wall records) across `20` catalogued features (`19` published folios + `1` provisional record) |
| `/community` | `src/pages/Community.tsx` | Public reader letters, recruitment call (`Researcher`, `Palette Designer`, `Content Writer`), and reader dialogue |
| `/about` | `src/pages/About.tsx` | Publication manifesto, masthead, timeline, five pillars, and lazy-gated `BrassRule` |
| `/ambassadors` | `src/pages/Ambassadors.tsx` | Regional chapters (`14` ambassadors across `6` chapters; `10` active `BRAND.team` records; Haiqa Nafees and Manha excluded from `/ambassadors` and `BRAND.team` only) |
| `/submit` | `src/pages/Submit.tsx` | Submission guidelines, 4-step editorial process, cover filename disclosure, and submission form |
| `/contact` | `src/pages/Contact.tsx` | Editorial correspondence desk, channel directory, and inquiry form |
| `/room` | `src/components/room/Room.tsx` | Self-contained 3D Reading Room (renders its own spatial HUD; omits standard `Header`/`Footer`) |

## Shared Layout & Motion Owners

- **Layout Shell**: `src/components/layout/Layout.tsx` — wraps all standard publication routes (except `/room`) in one `Header`, `<main id="main">`, and one `Footer`.
- **Header & Navigation**: `src/components/layout/Header.tsx` — masthead bar with original Verlyse `V` crest monogram and full-hall `#site-menu` drawer (`overflow-y-auto` on short viewports).
- **Single Shared Footer**: `src/components/layout/Footer.tsx` — the sole `<footer aria-label="Footer">` across standard routes (`document.querySelectorAll('footer[aria-label="Footer"]').length === 1` on all `10` audited standard-layout routes; `0` on `/room`). Exports `resolveNewsletterEndpoint()` (`https://verlyse-react.vercel.app/api/newsletter` on `verlysemedia.kesug.com`, `/api/newsletter` on Vercel/local dev).
- **StringTune Bootstrap**: `src/lib/stringTune/boot.ts`, `src/lib/stringTune/runtime.ts`, `src/lib/stringTune/attrs.ts`, `src/lib/stringTune/StringTuneProvider.tsx` — registers only the **4 active modules** (`StringProgress`, `StringGlide`, `StringParallax`, `StringSpotlight`; `dist/assets/boot-CfrjN6Gu.js`, `199.82 kB` / `51.65 kB` gzip) with generation-checked reduced-motion and unmount race protection.
- **Canonical Editorial Data**: `src/data/content.ts` — derived counts: `20` catalogued features (`LEDGER.features = 20`: `LEDGER.publishedFeatures = 19` published folios + `LEDGER.provisionalFeatures = 1` provisional `"The Quiet Grief"`), `15` bylined creators (`16` wall records including co-credited Mochi), `7` categories, `14` ambassadors across `6` regional chapters, `10` active team members in `BRAND.team`, and `104` static media/font assets in `public/` (`100` image/SVG files + `4` `.woff2` font files).
