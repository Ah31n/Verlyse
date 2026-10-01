# Verlyse Media — Route-by-Route State Matrix

**Publication:** Verlyse Media  
**Scope:** Complete State Coverage across 53 Routes  
**Date:** October 2026  

---

## State Matrix Ledger

| Route Family | Initial / Idle | Loading State | Empty / No-Data | Error / Fault Boundary | Keyboard Focus State | Selected State | Reduced Motion |
|---|---|---|---|---|---|---|---|
| **`/` Cover** | Feature cover plate + issue metadata | Preloader curtain (1.85s) or instant | N/A (Registry backed) | Static gradient fallback | Ring-1 Gold on all CTAs and links | Active spotlight on lead | Instantaneous rendering |
| **`/articles`** | 19-folio lead/supporting matrix | `ArchiveLoadingShell` skeleton | `ArchiveEmptyState` with filter reset | Retry notice | Visible focus ring on search & cards | Highlighted card border | Static grid without reveal |
| **`/categories`** | 7 department doors | Department skeleton | `CategoryIndexEmptyState` | Failover to list | Border-gold outline on doors | Step-forward door | Static arched grid |
| **`/categories/*`** | Department-specific lead & shelf | Skeleton loader | Empty department notice | Return to wings link | Ring-1 Gold on cards | Active folio highlight | Static reading stack |
| **`/article/:id`** | 68ch reading measure + hero | Shimmer placeholder | "Folio not found" redirect | Article fallback shell | Action button focus rings | Text selection highlight | Instant hero presentation |
| **`/creators`** | 16-creator wall of names | Monogram loader | `CreatorWallEmptyState` | Monogram fallback | Focus ring on creator names | Active dossier step-forward | Static wall of names |
| **`/creator/:id`** | Creator monograph & work list | Profile skeleton | "Creator record omitted" notice | Profile fallback | Work card focus rings | Active work highlight | Static monograph |
| **`/submit`** | Stationery form + guidelines | Submitting spinner | Form reset | Mailto client fallback | Field active border gold | Field focus glow | Instant form feedback |
| **`/contact`** | Office record & form | Sending spinner | Form reset | Mailto client fallback | Field active border gold | Field focus glow | Instant form feedback |
| **`/about`** | Colophon & founding principles | Paper skeleton | N/A | Static colophon fallback | Nav link focus rings | Active section highlight | Instant rendering |
| **`/community`** | Reader reflections list | Reflection skeleton | "No reader notes yet" | Submission prompt | Card focus rings | Card highlight | Static list |
| **`/ambassadors`** | Guild network directory | Directory skeleton | "Guild assembling" | Contact desk link | Card focus rings | Card highlight | Static directory |
| **`/room`** | Cylindrical spatial arc | `RoomLoading` monogram | Empty folio notice | `NoWebGLFallback` 2D shelf | Focus anchor on pull button | `DossierPanel` side/bottom sheet | Deterministic 2D view |
