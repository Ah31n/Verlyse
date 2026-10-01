# Verlyse Media — Motion Ownership & Animation Matrix

**Publication:** Verlyse Media  
**Rule:** Single Owner Per Property · Zero Engine Collisions  
**Date:** October 2026  

---

## 1. Global Motion Ownership Matrix

| Behavior / Animation Class | Single Responsible Engine | Implementation Pattern | Fallback / Reduced-Motion Behavior |
|---|---|---|---|
| **Editorial Headline Split & Reveals** | **StringTune** | `string="split"`, `string="reveal"` | Instant static typography render |
| **Localized Spotlights & Pointer Cards** | **StringTune** | `string="spotlight"`, `string="tilt"` | Static border/card without spotlight |
| **Magnetic CTAs & Fine Pointer Pull** | **StringTune** | `string="magnetic"` | Coarse pointer disabled; pure CSS center |
| **Route Veil & Modal Dialog Presence** | **Motion/React** | `<AnimatePresence>`, `motion.div` | `transition={{ duration: 0 }}` instantaneous swap |
| **Drawer & Bottom Sheet Transitions** | **Motion/React** | `motion.aside`, `motion.dialog` | Instant open/close without slide |
| **3D Cylindrical Transforms (`/room`)** | **CSS 3D / Three.js** | `translate3d`, `rotateY`, `perspective` | Deterministic 2D shelf / No-WebGL fallback |
| **Button Pressed & Haptic Cues** | **CSS Transitions** | `active:scale-95`, `transition-all` | Standard CSS click state |

---

## 2. Route-by-Route Motion Verification

- **`/` Cover:** StringTune splits the headline once; Motion/React manages intro presence; 3D canvas is conditionally mounted only on desktop.
- **`/articles` Shelf:** Grouped in-view reveals via StringTune; active spotlight on focused cards; 0 body text transforms.
- **`/categories/*` Wings:** Controlled department door entrance; title reveal once; no continuous background oscillations.
- **`/article/:id` Detail:** Single split title reveal; thin pinned progress line updated on native scroll event; related shelf in-view reveal.
- **`/room` Keeping Room:** CSS 3D/Three.js owns 3D matrix coordinates; StringTune owns DOM title split; Motion/React owns dossier panel enter/exit.
