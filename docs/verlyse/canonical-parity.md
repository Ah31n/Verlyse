# Canonical-Source Parity Evidence (read-only)

Canonical: `https://verlysemedia.kesug.com` (read-only reference; no modification).
Local: `verlyse-project` workspace registry (`src/data/content.ts`).

Method: fetched the canonical homepage (read-only) and compared to the workspace content
registry. No live-site writes; no deployment.

## Confirmed parity (canonical rendered text == workspace registry)

| Item | Canonical (live) | Workspace registry | Match |
|---|---|---|---|
| Document title | Where Vision Becomes A Voice — Verlyse Media | `index.html` title | ✅ |
| Primary heading | Where Vision Becomes A Voice | `Home` H1 | ✅ |
| Current feature | Their Voices Matter · Social Issues · Alina Javed · 2026-06-26 · 4 min | `ARTICLES[0]` | ✅ |
| Issue 01 8 works | Behind Every Headline / The Garden Beyond My Tower / The Empty Waltz / My Last Breath / Khageena / Failure / 3:13 / Jaldi — categories, creators, read times match | `ARTICLES` | ✅ |
| Stats | 19 features · 15 creators · 1281 appreciations · 585 conversations · one room | `COMMUNITY_STATS` / `BRAND` | ✅ |
| 7 departments | Stories 1 · Poetry 7 · Essays 2 · Art 3 · Social Issues 4 · Lifestyle 1 · Horror 1 | `CATEGORIES` | ✅ |
| Real comments | @r3ptillia, @anshujit.singh, @marziaontop, @a.a1raahh, @yura_archives, @maggotsforbrains1, @lycheeye — beneath the named features | `COMMUNITY_VOICES` / article `voices` | ✅ |
| Tool disclosure | "microsoft designer is used to create this post." | `Submit`/`About` credo | ✅ |
| Current-feature plates | Their Voices Matter — plate 1–4 of 4 | article `slides` | ✅ |

## Asset-role parity
- Alina Javed: portrait. Others: work-cover. (Verified in the registry role mapping; no invented
  portraits.)

## Known measurement note (NOT a content mismatch)
- Canonical homepage baseline ~13,182 px desktop / 15,161 px mobile (from the provided audit
  tables). Our local build measures ~14,574 px desktop / ~18,758 px mobile. The difference is from
  (a) the added spatial layer and (b) this being the live dev build with dev-only assets; content
  order, sections, and copy are unchanged. No content is missing or duplicated.

## Source-parity verdict
Content is source-faithful and complete. No missing/unordered/duplicated articles. Signatures and
endings are story-specific and verified against the canonical signature labels.
