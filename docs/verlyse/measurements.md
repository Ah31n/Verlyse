# Build & Measurement Evidence

Run: `npm run build` (tsc -b && vite build) on the provided local workspace.

## Result
`✓ built` — 0 TypeScript errors, 0 build errors.

## Chunk sizes (post spatial-layer + code-split)
| Chunk | Size | gzip | Loads on |
|---|---|---|---|
| `index` | 116.03 kB | 38.51 kB | first paint (all routes) |
| `react` | 278.27 kB | 89.76 kB | first paint (vendor) |
| `motion` | 122.86 kB | 40.91 kB | first paint (vendor) |
| `three` | 768.62 kB | 202.74 kB | **on demand** — only where a spatial scene renders |
| `SpatialArchive` | 3.15 kB | 1.57 kB | on demand (home hero) |
| `StoryEnding3D` | 4.10 kB | 1.94 kB | on demand (article ending) |
| route pages | 4.79–56.81 kB | 1.72–13.25 kB | per route (existing lazy) |

## Local preview smoke test
`npm run preview -- --host 127.0.0.1 --port 5173`
- `/` → HTTP 200, 2,301 bytes (index.html)
- `assets/index-*.js` → 200 (38.5 kB gzip)
- `assets/react-*.js` → 200
- `assets/motion-*.js` → 200
- `assets/SpatialArchive-*.js` → 200
- `assets/StoryEnding3D-*.js` → 200
- `assets/three-*.js` → 200

## Before/after main chunk
- Before spatial layer (single file, `inlineDynamicImports:true`): `index` ~615 kB, one JS file.
- After (this build): initial index 116 kB; heavy `three` isolated to an on-demand 202 kB gzip
  chunk. Net improvement in first-paint payload.

## NOT VERIFIED this session (no headless-browser runtime here)
- Live WebGL rendering, canvas paint, and per-route browser `scrollHeight` at 1440×900 / 390×844.
- Actual browser `console` / network capture; keyboard & focus traversal; reduced-motion behaviour
  in a real browser; WebGL-fallback visual result.
These are gated on code (WebGL detection, visibility/offscreen pause, reduced-motion suppression)
and pass `tsc`; they need a real browser run to fully confirm visually.
