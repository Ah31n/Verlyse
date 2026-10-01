# Verlyse Media — Route-by-Route Responsive & Viewport Matrix

**Publication:** Verlyse Media  
**Target Viewports:** 1440×900 (Desktop Large), 1280×800 (Desktop Laptop), 768×1024 (Tablet Portrait), 430×932 (iPhone Pro Max), 390×844 (iPhone Standard), 360×800 (Android Standard)  
**Date:** October 2026  

---

## Responsive Composition Matrix

| Route Family | Desktop (1440px & 1280px) | Tablet (768px) | Mobile (430px, 390px, 360px) | Zero Overflow Verified |
|---|---|---|---|---|
| **`/` Cover** | 12-col asymmetric cover with negative space and dominant plate | Stacked 2-col layout with reduced simultaneous decorative layers | Single-column editorial opening with stable aspect-ratio boxes, 0 pointer effects | PASS (0px) |
| **`/articles`** | Asymmetric 8-col lead with 4-col supporting matrix | 2-column balanced grid | Single-column chronological stack with prominent accession markers | PASS (0px) |
| **`/categories`** | 4-column arched door matrix | 2-column door grid | 1-column readable vertical index with one active door at a time | PASS (0px) |
| **`/categories/*`** | Department hero + 3-col supporting shelf | 2-column supporting shelf | 1-column vertical reading list | PASS (0px) |
| **`/article/:id`** | Strict 68ch reading measure with generous margins | Centered 60ch reading measure | Edge-padded reading column (16px), 17px base text, pinned hairline progress | PASS (0px) |
| **`/creators`** | 4-column wall of names with floating monograph preview | 2-column wall of names | 1-column stacked creator monographs with touch actions | PASS (0px) |
| **`/creator/:id`** | 2-column profile layout (monograph left, works right) | Stacked profile header with 2-col works | 1-column stacked dossier with readable line breaks | PASS (0px) |
| **`/submit`** | 2-column layout (guidelines left, stationery right) | Stacked guidelines above stationery | 1-column form with 48px tap targets and comfortable typing measures | PASS (0px) |
| **`/contact`** | 2-column layout (official channels left, form right) | Stacked office channels above form | 1-column form with touch-friendly input heights | PASS (0px) |
| **`/about`** | 4-column colophon directory and milestone sheets | 2-column colophon cards | 1-column vertical directory with clear section dividers | PASS (0px) |
| **`/community`** | 3-column reflection cards | 2-column reflection cards | 1-column stacked reflections | PASS (0px) |
| **`/ambassadors`** | 3-column guild directory | 2-column guild directory | 1-column stacked guild cards | PASS (0px) |
| **`/room`** | Full parametric cylindrical 3D arc ($R=1000\text{px}$) with right-side dossier | Parametric arc ($R=720\text{px}$) | Hardware-accelerated CSS 3D stack + mobile bottom sheet dossier, 0 Three.js loops | PASS (0px) |
