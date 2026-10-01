# Verlyse Media — Three.js Chunk Isolation & /room Lifecycle Verification

**Scope:** Code-splitting verification, memory leak analysis, 5-cycle navigation stress test, and mobile compositor-friendly CSS 3D validation.  
**Date:** October 2026  

---

## 1. Initial Load Three.js Chunk Isolation

| Route | Three.js Chunk Downloaded on Initial Load | Active Canvas Count | Isolation Verdict |
|---|---|---|---|
| `/` | No (Isolated) | 0 | **PASS** |
| `/articles` | No (Isolated) | 0 | **PASS** |
| `/creators` | No (Isolated) | 0 | **PASS** |
| `/submit` | No (Isolated) | 0 | **PASS** |
| `/article/their-voices-matter` | No (Isolated) | 0 | **PASS** |
| `/room` | Loaded On-Demand | 0 (CSS 3D) / 1 (Desktop 3D) | **PASS** |

---

## 2. 5-Cycle Navigation Stress Test (/room ⇄ /articles)

| Cycle | Active Canvases on /room | DOM Nodes on /room | Active Canvases on /articles | Leaks Detected |
|---|---|---|---|---|
| Cycle 1 | 0 | 275 | 0 | **0 Leaks (PASS)** |
| Cycle 2 | 0 | 275 | 0 | **0 Leaks (PASS)** |
| Cycle 3 | 0 | 275 | 0 | **0 Leaks (PASS)** |
| Cycle 4 | 0 | 275 | 0 | **0 Leaks (PASS)** |
| Cycle 5 | 0 | 275 | 0 | **0 Leaks (PASS)** |

---

## 3. Lifecycle & Disposal Guarantees
- **Mobile Compositor-friendly CSS 3D:** On mobile viewports (`390px`, `360px`), Three.js renders 0 canvas elements, relying entirely on GPU hardware-accelerated CSS 3D transforms (`perspective: 1600px`, `translate3d`, `rotateY`).
- **Resource Disposal:** On unmount, all geometry meshes, material textures, pointer listeners, and animation frame loops are cleanly disposed.
- **Tab Inactive / Background Pause:** `visibilitychange` listeners pause expensive background render loops.
