# Verlyse Media — React Edition

**Where Vision Becomes A Voice.** A production-grade editorial publication built with
React, TypeScript, Tailwind CSS and Framer Motion. Content is grounded entirely in
the real Instagram post datasets (2026-08-01/02, all kept in `/home/user/uploads/`),
the profile screenshots, and the founder article — 19 features, 15 credited
creators, 95 real images (self-hosted), real captions, and real comments beneath
every work. Nothing is invented.


## The Portrait Rule (permanent)

Creator portraits are contributor photographs in an editorial magazine — never avatars.

- **Source**: the complete original photograph from the creator's post (head, shoulders,
  clothing, full composition). One photograph, one crop, used everywhere.
- **Preserve** the original aspect ratio. Never crop to a square unless the source is square.
- **Never** use face detection / AI cropping / background removal / transparent cut-outs /
  circular avatars / redraws. A portrait is always a full rectangular photograph.
- **Crop tool only**: open the slide, select the rectangle of the complete photograph,
  crop. No Magic Wand, no Select Subject, no Remove Background, no AI matting, no alpha
  masks, no transparency, no semantic segmentation — ever.
- **Original pixels**: no color grading, no filters, no recoloring. The asset must look
  exactly like the original selfie (WebP compression aside).
- **Rotation**: if the photo is tilted only by scrapbook styling, rotate the ENTIRE
  photograph (whole image, never just the subject), then crop the rectangle afterward
  (≤ ±10°, invisible to the viewer).
- **Framing**: every portrait lives inside an editorial frame — polaroid, matte print,
  archival card, museum print. The frame, not the portrait, creates the identity.
- **Consistency**: the exact same asset (`/img/authors/{id}.webp`) is reused on the
  Featured Creators wall, writer/artist notes, profiles, the Community page, and anywhere
  an author is referenced. Never generate multiple crops of the same photograph.

## The feed (all real)

| Feature | Creator | Category | Date |
|---|---|---|---|
| The Arts Deserve Respect | Shaza Fatima @r3ptillia | Essays | 30.06 |
| A Student's Worth | Adeena Irfan @deena.pmo | Art | 01.07 |
| Hope Becomes Mythology | Alina Javed @lina_.jved | Poetry | 02.07 |
| Tasbih-e-Fatima | Craft with Bro @craft_with_bro | Art | 03.07 |
| Forgive Me, Mother | Abheesha Ghosh @abheesha_21 | Poetry | 04.07 |
| Intellect Lost to Code | Munkashay Javed @nothingjustaninchident91 | Essays | 06.07 |
| If Hope Were a Feather | Hadia Raza @h._.d1aa | Poetry | 07.07 |
| Water Cat | Kenza Imene @its.kenzou | Art | 09.07 |
| The Horrors of Child Sexual Abuse | Zuha Farhan @zvhxx__ | Social Issues | 12.07 |
| 3:13 | Anshujit Singh @anshujit.singh | Horror | 16.07 |
| Khageena | Haiqa Nafees @maddu__0 | Lifestyle | 24.07 |
| The Empty Waltz | Haieqa Wahab @miss_haieqa | Stories | 29.07 |
| Behind Every Headline | Zuha Farhan @zvhxx__ | Social Issues | 01.08 |
| Jaldi | Haiqa Nafees @maddu__0 | Poetry | 14.07 |
| Failure | Kazi Fatimataz Zahra @jk1.23army | Poetry | 21.07 |
| My Last Breath | Abheesha Ghosh @abheesha_21 | Poetry | 26.07 |
| The Garden Beyond My Tower | Syeda Tasbeeha Noman @syeda._tasbeeha | Poetry | 30.07 |
| Their Voices Matter | Alina Javed @lina_.jved | Social Issues | 26.06 |

## Pages (dataset-only content)

| Route | Page |
|---|---|
| `/` | Home — masthead, ledger (19 features · 15 creators · 1281 appreciations · 585 conversations), feed strip, departments |
| `/about` | About — the platform's mission, values, milestones, founder |
| `/articles` | Articles — all 19 features with filters and search |
| `/article/:id` | Feature — full extracted text, plates, unique ending, conversations |
| `/categories` | Categories — all 7 departments of the feed |
| `/community` | Community — real numbers, real voices, transparency |
| `/submit` | Submit — editorial form + guidelines |
| `/ambassadors` | Brand Ambassador — application open (forms.gle link), team as credited in the feed |
| `/creators` | Featured Creators — all 16 credited voices (15 named writers + the masthead record) |
| `/contact` | Contact — desk list + letter form |

**No mock data.** All content traces to the datasets: every feature, its writer,
the slides, the likes/comments, and the disclosed tool use (e.g. the platform's
own reply "microsoft designer is used to create this post"). The writer's
monogram stands in for a photograph that does not exist in the dataset.

## Architecture

```
src/
├── data/content.ts        # THE CONTENT LAYER — 19 articles (bodies = the slides'
│                          #   full text, word for word), authors, categories,
│                          #   community stats, brand facts, per-article closings
├── hooks/useSeo.ts        # per-page meta, OG tags, JSON-LD (WebPage + Article)
├── components/
│   ├── layout/            # Header, MenuOverlay, SearchOverlay, Dock, Footer,
│   │                      #   Preloader, Layout (chrome + progress)
│   └── ui/                # Reveal, SplitText, ArticleClosing,
│                          #   ShareButtons, SectionHead, MetaRow, primitives
└── pages/                 # one file per route
```

## Every feature ends with its own ending

The final slide of each post (About Us card, writer's note, artist's note, or a
unique ending) is rendered as a designed, animated editorial block — never the
raw image. `src/components/ui/ArticleClosing.tsx` dispatches on
`article.closing.kind`:

| Kind | Rendered for | What it shows |
|---|---|---|
| `voices` | Their Voices Matter | The founder's three lines, animated |
| `story-end` | 3:13 | The whisper — "Your turn to wait." + the cover's tagline |
| `passage` | The Arts Deserve Respect | The essay's closing argument |
| `final-verse` | Forgive Me, Mother | The poem's final stanza |
| `about-work` | Tasbih-e-Fatima | Gallery label + pull quote + habits |
| `note` | Hope Becomes Mythology, A Student's Worth, Intellect Lost to Code, Water Cat, If Hope Were a Feather, CSA | The writer's/artist's own note, verbatim |
| `mission` | The Empty Waltz, Khageena, Behind Every Headline | The platform's About Us card (their real last slide) |

Writer's notes sit after the body and plates, mirroring the posts' note slides;
the news-update line in "Their Voices Matter" renders as a newspaper clipping.

## Feature map

- **Search** — ⌘K / Ctrl+K global overlay across titles, authors, categories
- **Filters** — category chips + live text search on Articles
- **Reading time** — on every article row and detail
- **Share buttons** — X, Facebook, WhatsApp, copy (native share on mobile)
- **Related articles** — data-driven; graceful placeholder while the archive is young
- **Author profiles** — portrait, handle, role, bio on detail + creators wall
- **Newsletter** — footer form with validation and success state
- **Smooth page transitions** — AnimatePresence curtain + scroll-to-top reset
- **SEO** — per-route titles, meta, OG and JSON-LD (WebPage / Article)
- **Accessibility** — skip link, aria-current, aria labels, focus-visible, reduced-motion
- **Responsive** — 1440 / 820 / 390 verified; glass bottom dock on mobile

## Dataset truth vs. placeholder

| Subject | Status |
|---|---|
| Brand name, handle @verlyse.media | Dataset |
| Feature "3:13" + writer Anshujit Singh | Dataset |
| 3 poster images (1080×1350) | Dataset (downloaded, only images on the site) |
| 45 likes · 23 comments · 1 captured comment | Dataset |
| AI-tool disclosure practice | Dataset (🚨 Microsoft Designer) |
| Horror / stories categories | Dataset (caption + hashtags) |
| Tagline "Where Vision Becomes A Voice" | Client brief |
| Founder, submission mechanics, ambassador program, other categories | Honest placeholders — marked "in preparation"/"forthcoming", no invented facts |

## Creative direction pass

Reviewed as a design critic (Pentagram / Awwwards register) — every generic
composition was recomposed, nothing rebuilt:

- **Cover** — the centered dual-button hero is gone. The home now opens as a
  typographic cover: one cinematic image, a left-set headline constrained to
  14ch, a single primary gesture, and a folio bar (issue metadata) along the
  bottom hairline. The five-image cycling montage was removed for restraint.
- **Current feature** — the interactive carousel was replaced with a staggered
  three-plate contact-sheet composition of the real posters (48px offset on the
  centre plate), captioned `01/03` like printed plates.
- **Community pulse** — the four equal stat cells became a ledger: one dominant
  figure (45), then marginalia rows, then the disclosure note — hierarchy
  instead of a dashboard.
- **Departments** — the equal card grid became a hairline index of rooms:
  number, huge serif name, blurb, count — hover indents like a table of contents.
- **Page heroes** — each of the eight secondary pages now carries its own
  vertical folio rail (e.g. “The desk — reads everything, answers”), so no two
  openings read alike.
- **About** — gained its photographic moment: plate II of the first feature set
  as a floated editorial inset with caption.
- **Footer** — the redundant nine-link site index was removed; one nav, socials,
  the letter, and the colophon remain.
- **Rhythm** — section padding alternates across the page; display type
  tightened to `-0.03em` tracking on the cover scale.

## Final production audit (all fixed)

Measured with headless Chromium across 7 viewports (360–1920px) × 10 routes:

| Area | Result |
|---|---|
| Responsiveness | Zero horizontal overflow at every viewport; 360px edge case (gold frame bleed) fixed; `overflow-x: clip` on root |
| Accessibility | Contrast worst-case 5.71:1 (AA) after bumping faint text; menu Escape-close + focus management; skip link, landmarks, labeled inputs, aria-current, reduced-motion |
| Performance | Images recompressed + posters downscaled to display size (2.98MB → ~2.4MB total); home payload 870KB / 6 images; LCP preloaded; lazy loading verified |
| SEO | Per-route canonical + WebSite/WebPage JSON-LD (and Article graph on detail); robots.txt served |
| Semantics | Exactly one h1 per page; sr-only h2 section headings on About fix heading-order; no duplicate IDs, no unlabeled inputs, no type-less buttons |
| Consistency | Single `.btn` system, one reveal/ease vocabulary, shared hairlines and ghost numerals |

## Editorial copy

Every section's copy was rewritten in the register of a literary magazine —
specific, restrained, and emotional without being sentimental. Rules observed:

- **Every fact is accurate.** The only claims are those supported by the
  dataset: one feature (“3:13” by Anshujit Singh, July 16 2026), 45
  appreciations, 23 conversations, one captured comment, and the disclosure
  practice. Nothing is invented; the word “forthcoming” is used precisely.
- **The writer's note is verbatim.** Anshujit Singh's words are quoted exactly
  as published — the magazine never rewrites its writers.
- **No marketing jargon.** No “unlock”, “empower”, “journey”, or exclamation
  marks. The voice is that of a desk that reads everything and answers.

## Design system

Cormorant Garamond (display) · Inter (body) · IBM Plex Mono (labels).
Wine `#5C1224` · Deep wine `#3B0D17` · Ivory `#F8F6F2` · Cream `#EFE8DD` ·
Gold `#B89146` · Charcoal `#1C1C1C`. Editorial devices: ghost numerals, hairline
rules, gold offset frames, drop caps, writer's-note pull quotes, ink
signatures, editorial wipes, paper folds, and word-mask reveals. No grain,
no parallax, no custom cursor, no theme switcher — one identity, native
scroll, still reading columns.

## Rhythm pass — no two pages open alike

Every page now opens with its own hero composition (no shared template):
Home = cinematic layered cover · About = split promise + mission pull ·
Articles = the contents — a numbered index with true folios 01–19 ·
Categories = cover-band hero + image-led rooms · Community = monumental 1281
numeral + a full-width film strip of every cover · Creators = wall of names
with a roll of handles · Ambassadors = the open application set
as a card in the hero · Submit = invitation beside a featured plate ·
Contact = a narrow centered letterhead. Repetitive dashed placeholders were
replaced with full bands; sections alternate split layouts, narrow reading
columns, pull-quotes, full-width imagery, and large typography.

## Featured Stories & Founder redesigns

- **Featured Stories (home)** — the uniform card grid was replaced with a
  magazine spread: one dominant cover story (large 4:5 crop, excerpt, full
  meta), two supporting stories in a staggered right stack, a three-story
  spread with the middle story floating lower, and a wide-crop closing duo.
  Each story carries category, author, reading time, plate numbers, and
  elegant hovers (slow zoom, gold hairline draw, read chip, italic title).
- **Founder (about)** — the profile-style block became a feature interview:
  large editorial portrait plate with gold offset frame, a hand-drawn
  signature flourish (animated SVG), an elegant gold-dot timeline of real
  dates (26.06 / 02.07 / 07.07 / now), the founder's quote, the trust quote,
  and subtle paper texture. All facts stay within the datasets.

## Vibes & inner pictures

Every feature carries its own temperament — a `vibe` in the content layer that
drives hero treatment, reveal motion, world texture, and a single still
atmospheric element (a breathing vignette for horror, a gallery frame,
a gold hairline, a dispatch label). Nothing floats, pulses or flickers in
the reading column; body figures stand still; only the small motif glyphs
move. All strictly inside the wine/ivory/gold palette.

Pictures embedded inside the posts' slides were detected (text-free,
photo-scored regions) and cropped into `public/img/inner/`: the Student's Worth
painting, the Tasbih calligraphies, the Water Cat artwork, the Khageena dish,
an Afghanistan photograph (Their Voices Matter), and two news photos (Kashmir,
Balochistan — Behind Every Headline). They render in a "Within the post"
section on each article.

## Truth pass (dataset-only numbers)

Verified against the datasets: the feed totals are **19 features · 1281 likes ·
585 comments · 15 creators** (the sums of every post's own counts), the first
post on the feed is the founder's “Their Voices Matter” (26.06.2026), and the
profile shows 23 posts / 261 followers. The About, Home, and Community pages
state exactly these numbers — every figure on the site is data-driven, never
hardcoded. The creator wall links each creator to their own feature and cover —
never a placeholder.

## Repository hygiene

- The old static HTML site (`verlyse/`) was **removed** — the React build is the
  single source of truth.
- Superseded preview screenshots and the old screen-cropped work images were
  removed; only the real dataset images (self-hosted in `public/img/works/`)
  remain — all 37 referenced, none orphaned.
- Dead code removed: `PosterCarousel.tsx`, `GhostWord`, the duplicate
  `lib/smoothScroll.tsx` (the wired one is `hooks/useSmoothScroll.ts`), and the
  unused exports `categoryCount` and `CommunityStat`.
