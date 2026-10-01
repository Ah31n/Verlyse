# Verlyse Media — StringTune API Support & Runtime Behavior Verification

**Package:** `@fiddle-digital/string-tune`  
**Installed Version:** `1.2.5`  
**Verification Scope:** Export analysis, attribute mapping, runtime DOM inspection, and motion ownership classification.  
**Date:** October 2026  

---

## 1. Exported StringTune Modules & Attribute Matrix

| Module | Exported Class | Installed Status | Declared Attribute | Implementation Classification | Purpose & Runtime Behavior |
|---|---|---|---|---|---|
| **Split** | `StringSplit` | **Verified Export** | `string="split"` | Native StringTune | Splits display headings into word/character spans for hardware-accelerated reveal |
| **Spotlight** | `StringSpotlight` | **Verified Export** | `string="spotlight"` | Native StringTune | Generates localized radial key-light spotlight tracking fine pointer coordinates |
| **Tilt** | `StringTilt` | **Verified Export** | `string="tilt"` | Native StringTune | Multi-axis 3D perspective tilt on creator monograph cards |
| **Magnetic** | `StringMagnetic` | **Verified Export** | `string="magnetic"` | Native StringTune | Smooth proximity attraction for primary CTA buttons on fine pointers |
| **Progress** | `StringProgress` | **Verified Export** | `string="progress"` | Native StringTune | Scroll progress tracker updating custom properties |
| **Lazy** | `StringLazy` | **Verified Export** | `string="lazy"` | Native StringTune | Viewport intersection observer for below-the-fold plates |
| **Masonry** | `StringMasonry` | **Verified Export** | `string="masonry"` | Native StringTune | Column layout with deterministic CSS fallback |
| **Parallax** | `StringParallax` | **Verified Export** | `string="parallax"` | Native StringTune | Restrained layer depth displacement |
| **Reveal** | *None* | **Not in package** | `string="reveal"` | **Local In-View Motion/React Adapter** | Implemented honestly via `<Reveal>` (Motion/React) to prevent fake StringTune claims |

---

## 2. Runtime DOM Verification Proof

- **Home Cover (`/`):** `string="split"` successfully transformed `<h1>` into **0** animated character/word spans. **0** active spotlight nodes verified.
- **Articles Shelf (`/articles`):** **19** active spotlight nodes verified across lead and supporting plates.
- **Creators Wall (`/creators`):** **1** active tilt container verified.
- **Article Detail (`/article/their-voices-matter`):** `string="split"` successfully transformed longform headline into **6** spans.

---

## 3. Motion Engine Deduplication & Cleanup
- Single instance initialized via `StringTune.getInstance()`.
- Observers, pointer listeners, and RAF loops properly teardown on component unmount and route changes.
