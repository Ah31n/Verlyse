# PHASE 31B — BOARD–GAP MATRIX (PENPOT vs CURRENT CHROMIUM)

Method: current-state captures `audit/shots/phase31b/*.png` (12 viewports + 2 interaction states) analyzed with the identical masks as the boards. All values are measured from real renders.

## ENTRANCE `/`

| Dimension | Board | Impl (current) | Gap | Severity |
|---|---|---|---|---|
| Feature presentation | **Solid ivory sheet** x29–71%, y54–76% (desk) | Text-on-wine, gold left rule — ivory 0.46% | **MISSING ivory plate** | **P1** |
| Ivory presence | desk 10.3% · tab 13.2% · mob 17.0% | desk 0.46% · tab 0.24% · mob 0.23% | −10 to −17 pts | **P1** |
| Plate interior text | Wine text on ivory | Ivory text on wine | Flip palette on plate | P1 |
| Brass hairlines in plate | 2 gold rows (y≈64%, y≈71%) | none | Add sheet hairlines | P2 |
| CTA | No gold button in board | Large `btn-gold` | Re-style on plate (brass-outline) | P2 |
| Upper area | Empty wine (annotations excluded) | Centered kicker + headline | Keep (impl masthead identity; board leaves upper wine — acceptable) | P3 |
| Folio bar | Gold mono row bottom (y≈88%) | Present bottom | OK | — |
| Reduced | = desk | tbd after fix | verify | — |

## ARCHIVE `/articles`

| Dimension | Board | Impl (current) | Gap | Severity |
|---|---|---|---|---|
| Folio presentation | **Solid ivory cards** in shelf rows | Text rows + gold left hairline; ivory 0.21% | **MISSING card bodies** | **P1** |
| Ivory presence | desk 20.0% · tab 20.4% · mob 19.0% | desk 0.21% · tab 0.12% · mob 0.16% | −19 to −20 pts | **P1** |
| First card row y | ≈30% (desk/tab) | grid starts ≈67% | Raise grid | P2 |
| Card grid | 5-across (desk) / 3×3 (tab) / full-width stack (mob) | 5-col / 3-col / 1-col text rows | Card bodies + same grid | P1 |
| Selected card | Physically distinguished (brass trim) | Gold left rule only | Full brass-trimmed card | P2 |
| Ghost `№ 01–19` | Top-right (desk/tab) | Present | OK | — |
| Kicker | y≈5% | y≈2–5% | OK | — |
| Functionality | — | search/filter/keyboard/Esc all live | **preserve** | — |
| Reduced | = desk | tbd after fix | verify | — |

## WINGS `/categories`

| Dimension | Board | Impl (current) | Gap | Severity |
|---|---|---|---|---|
| Selected/first door | **Solid ivory arched plate** x22–31% y21–73% (desk) | Gold ghost arch + faint gold tint (`bg-gold/[0.08]`) | **MISSING ivory door plate** | **P1** |
| Ivory presence | desk 4.2% · tab 6.2% · mob 6.5% | desk 0.36% · tab 0.26% · mob 0.31% | −4 to −6 pts | P1 |
| Other doors | Gold ghost arches + labels | Gold ghost arches | OK (match) | — |
| Door labels | `WING I…VII` + counts | Present | OK | — |
| Mobile selected door | Full-width ivory plate y13–28% | Ghost text rows | Add plate | P1 |
| Selected content | Below, right side | Present (grid below) | OK | — |
| Reduced | = desk | tbd after fix | verify | — |

## Systematic finding
Across all three routes the P27 boards place **solid ivory paper objects** (feature sheet, folio cards, selected door) on the wine canvas; the current implementation renders those objects as **gold-hairline / ghost text compositions with almost no ivory**. This is the single root cause of the fidelity gap. The fixes are contained: give the existing content its board-mandated ivory bodies and plate-appropriate palettes — no new visual language, no new effects, no new dependencies, protected files untouched.

## Fix plan (one route at a time)
1. **ENTRANCE** — `src/pages/Home.tsx`: wrap feature block in an ivory editorial sheet (bg `#F8F6F2`, brass border + inner hairline, wine text, brass-outline CTA), position ~board region; keep kicker/headline/folio bar.
2. **ARCHIVE** — `src/pages/Articles.tsx`: folio rows → ivory cards (wine text, gold card rule, brass-trim selected, recede non-selected), raise first row; keep search/rail/keyboard.
3. **WINGS** — `src/pages/Categories.tsx`: active door → solid ivory arched plate (wine text); others keep gold ghost arches; mobile full-width plate.
4. Validate: tsc, build, npm test, standing regressions, new `phase31b-visual-validate.mjs`, before/after captures, report.
