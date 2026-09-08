# PHASE 31B — AUTHORITY MAP (P27 PENPOT FAMILIES)

**Method:** board screenshots in `/home/user/p27-shots/` are the approved P27-family renders (evidence basis; the annotation rail on the right edge is cropped at `x = 0.87W` for all analysis). Composition derived by pixel analysis (row/column profiles, ivory/gold/dark-text masks, ASCII luminance maps) — see `audit/phase31b/board-{entrance,archive,wings}.json`.

**Board ambiguity resolutions**
- The P27 Entrance boards appear under P19 pages in the Penpot file, and duplicate desktop/tablet entrance boards exist. Resolution: the **`p27-entrance-{desk,tab,mob,red}.png` renders** are the approved P27 outputs (validated by Phase-28 harnesses); they are the authority for this phase. Their measured canvas corners (`#35101B` → `#1D1214` wine gradient) confirm they are genuine wine-canvas boards, not bleed.
- P25 Reading Room stale/empty boards: **not used** in this phase (three P27 families only).
- Each board file = one viewport (desk 1440×900 · tab 768×1024 · mob 390×844 · red 1440×900). Reduced boards are pixel-identical to desktop (verified: ivory/gold profiles match exactly).

## ENTRANCE (`/`) — P27 family

| Viewport | Board evidence | Dominant composition (from analysis) |
|---|---|---|
| 1440×900 | `p27-entrance-desk.png` | Wine hall; annotation labels top-right (DESIGN ANNOTATION — do not reproduce). **Large ivory feature sheet** x≈29–71%, y≈54–76% (blob 113,852 px), wine text inside, brass hairlines (gold rows at y≈64% and y≈71%), short brass rule at y≈50%, folio-bar marks at y≈88%. Upper canvas empty wine. |
| 768×1024 | `p27-entrance-tab.png` | Same composition; ivory sheet **wider** x≈22–87%, y≈53–78% (89,529 px), brass rule y≈50%, folio bar bottom-left y≈80–88%. |
| 390×844 | `p27-entrance-mob.png` | **Full-width ivory sheet** x≈5–100%, y≈42–61% (48,341 px), gold rule y≈36%, folio bar bottom-left y≈73–82%. |
| 1440×900 (reduced) | `p27-entrance-red.png` | Identical to desk (static composition). |

Classification: feature sheet + brass rules + folio bar = **IMPLEMENTED (target)**; top-right gold labels = **DESIGN ANNOTATION**; "STATE/BACK/MID/FRONT" = **REFERENCE**.

## ARCHIVE (`/articles`) — P27 family

| Viewport | Board evidence | Dominant composition |
|---|---|---|
| 1440×900 | `p27-archive-desk.png` | Wine hall; gold kicker band top (y≈5–15%). **Three shelf rows of solid ivory folio cards** (each ≈11% wide, ~1.5–2% gaps): row 1 y≈30–42%, row 2 y≈51–63%, row 3 y≈72–82%; wine text on cards, gold card rules (row 3 shows gold at x≈71–90 = card accents + ghost `№ 01–19` right). |
| 768×1024 | `p27-archive-tab.png` | **3 columns × 3 rows of ivory cards** (x≈8–90, rows y≈31–41/52–61/72–81) with visible gold vertical card rules. |
| 390×844 | `p27-archive-mob.png` | **Three full-width ivory cards** stacked: y≈35–42%, y≈57–65%, y≈80–87% (18–18.5k px each). |
| 1440×900 (reduced) | `p27-archive-red.png` | Identical to desk. |

## WINGS (`/categories`) — P27 family

| Viewport | Board evidence | Dominant composition |
|---|---|---|
| 1440×900 | `p27-wings-desk.png` | Wine hall; gold kicker top. **First door = tall solid ivory arched plate** x≈22–31%, y≈21–73% (41,398 px, dark text inside, gold right edge); the other six doors = **gold ghost arches + labels** (gold columns at x≈33/44/55/66/77/88, labels y≈25–26% and y≈61%); selected-wing content bottom-right y≈73–90%. |
| 768×1024 | `p27-wings-tab.png` | Same; ivory door x≈19–36%, y≈20–54% + small plate y≈56–61%. |
| 390×844 | `p27-wings-mob.png` | **Full-width ivory door plate** y≈13–28% (gold edges, dark text inside); other wings as gold text rows below (y≈38–73%); footer gold y≈80–92%. |
| 1440×900 (reduced) | `p27-wings-red.png` | Identical to desk. |

## Authority statement
- **Penpot decides composition** (the three P27 families above).
- **Registry decides content** (`src/data/content.ts`: 19 articles · 16 author records · 7 departments · real counts).
- **Existing architecture decides what is preserved** (protected files, /room, dossier, reading room).
- Live Penpot MCP stream: not reachable from this sandbox session; the approved P27 renders are the authoritative visual evidence and are the basis of every comparison record in the gap matrix.
