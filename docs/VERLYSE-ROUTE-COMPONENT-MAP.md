# Verlyse Media — Route-by-Route Component Architecture Map

**Publication:** Verlyse Media  
**Scope:** 53 Public Canonical Routes + Dev Lab  
**Date:** October 2026  

---

## 1. Route Family Component Allocations

### Route 1 — `/` Home / Publication Cover
- **Route Local Folder:** `src/components/home/`
- **Rendered Components:**
  - `HomeMasthead`: Brand monogram, edition volume, issue date, volume number.
  - `IssueMetadata`: Accession numbering, publication date, registry size.
  - `HomeFeaturePlate`: 12-column asymmetric lead cover with spotlight.
  - `HomeFolioSequence`: Grouped 3-column chronological shelf.
  - `HomePullQuote`: Literary philosophical interlude in Cormorant Garamond.
  - `HomeDepartmentIndex`: The Seven Wings gateway cards.
  - `HomeSpatialHandoff`: Ceremonial portal into `/room`.
  - `HomeColophon`: Four-column institutional footer ledger.

### Route 2 — `/articles` Full Folio Archive
- **Route Local Folder:** `src/components/archive/`
- **Rendered Components:**
  - `ArchiveHeader`: Tabular counter, registry title, curatorial summary.
  - `ArchiveControls`: Category segment filter pills and live search input.
  - `ArchiveLeadFolio`: 8-column dominant feature plate.
  - `ArchiveSupportingFolio`: 4-column secondary work units.
  - `ArchiveEmptyState`: Filter reset and empty notice.
  - `ArchiveLoadingShell`: Archival paper skeleton.
  - `PullQuotePlate`: Typographic pause between folio groups.

### Route 3 — `/categories` & Routes 4–10 Departments
- **Route Local Folder:** `src/components/categories/`
- **Rendered Components:**
  - `CategoryHeader`: Wing title, department count, curatorial kicker.
  - `DepartmentDoor`: Arched cathedral door with step-forward hover.
  - `PoetryLeadPlate`: Specialized generous-whitespace stanza layout for `/categories/poetry`.
  - `CategoryLeadFolio`: Feature narrative plate for `/categories/stories`, `/categories/essays`, etc.
  - `CategoryReturnNav`: Cross-navigation between wings and full archive.

### Route 11 & Routes 12–29 — Canonical Articles (`/article/:id`)
- **Route Local Folder:** `src/components/article/`
- **Rendered Components:**
  - `ArticleHeader`: Title dek, accession number, category tag, byline.
  - `ArticleHeroPlate`: Duotone cover with aspect ratio bounding box.
  - `ReadingProgressLine`: Pinned top brass progress indicator.
  - `ArticleBody`: 68ch reading measure with comfortable line height.
  - `PullQuotePlate`: Mid-article typographic emphasis.
  - `ArticleActions`: Save to shelf, share dialogue, return to wing.
  - `RelatedFolioShelf`: Curatorial cross-references.
  - `ArticleClosing`: Authentic closing slide from original dataset.

### Route 30 & Routes 31–46 — Creators Wall & Dossiers (`/creators`, `/creator/:id`)
- **Route Local Folder:** `src/components/creators/`
- **Rendered Components:**
  - `CreatorsHeader`: Contributor wall header and creator count.
  - `CreatorIndex`: Responsive wall of 16 authenticated creators.
  - `DossierCard`: Creator monograph with role badge and work ledger.
  - `ArchivalMonogramSeal`: Distinct monogram fallback when portrait is omitted.
  - `CreatorWallEmptyState`: Empty state fallback.

### Route 47 — `/submit` & Route 48 — `/contact`
- **Route Local Folders:** `src/components/submit/`, `src/components/contact/`
- **Rendered Components:**
  - `SubmissionHeader` / `ContactHeader`: Desk registration banners.
  - `CorrespondenceSheet`: Archival paper form surface with corner brass registration.
  - `ManuscriptWordCount`: Live word counter with zero layout shift.
  - `SubmissionGuidelines`: Explicit length and review expectations.
  - `ContactMethods`: Truthful contact channels and Lahore office information.

### Route 49 — `/about`, Route 50 — `/community`, Route 51 — `/ambassadors`
- **Route Local Folders:** `src/components/about/`, `src/components/community/`, `src/components/ambassadors/`
- **Rendered Components:**
  - `AboutHeader` / `FoundingPrinciples` / `ColophonBlock`.
  - `CommunityHeader` / `CommonsIntro` / `ReaderFolio`.
  - `AmbassadorsHeader` / `AmbassadorDirectory` / `AmbassadorCard`.

### Route 52 — `/room` (The Keeping Room)
- **Route Local Folder:** `src/components/room/`
- **Rendered Components:**
  - `RoomMasthead`, `StatusRail`, `CollectionRail`, `NavigationControls`, `DossierPanel`, `HelpModal`, `RoomLoading`, `NoWebGLFallback`.
