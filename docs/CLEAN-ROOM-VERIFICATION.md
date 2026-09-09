# Clean-room verification record

Re-run from scratch after the sandbox wiped dependencies. Every number below is
command output, not recollection.

## Command sequence

| # | Command | Result |
| --- | --- | --- |
| 1 | `bash scripts/setup-browser-env.sh` | exit 0 — `Chromium 149.0.7827.0` |
| 2 | `npm ci --no-audit --no-fund` | **exit 1** — see below |
| 2b | `PUPPETEER_SKIP_DOWNLOAD=1 npm ci --no-audit --no-fund` | exit 0 — 264 packages |
| 3 | `npm run build` | exit 0 — ✓ 4.30 s, 50 metadata routes prerendered |
| 4 | `npm test` | exit 0 |
| 5 | `npm run check:secrets` | exit 0 — "no sensitive filenames or obvious secret patterns" |
| 6 | `npm run typecheck:api` | exit 0 |
| 7 | `npm run test:metadata` | exit 0 — "passed for 50 generated routes" |
| 8 | `npm run test:newsletter` | exit 0 — "6 synthetic checks; no provider contacted" |
| 9 | `git diff --check` | clean |

### Step 2 fails for an environmental reason, not a code defect

Puppeteer's `postinstall` downloads Chrome from `storage.googleapis.com`, which is
unreachable from this sandbox (`Client network socket disconnected before secure
TLS connection was established`). The error message itself names the remedy:
`Set "PUPPETEER_SKIP_DOWNLOAD" env variable to skip download`. Step 2b applies it.
A working Chromium is supplied by `scripts/setup-browser-env.sh` instead.

Blocked here: `storage.googleapis.com`, `cdn.playwright.dev`, `deb.debian.org`,
`objects.githubusercontent.com`. Reachable: `registry.npmjs.org`, `github.com`.

## Suite results

| Gate | Result |
| --- | --- |
| `/room` (`audit/phase205-validate-v2.mjs`) | **89 / 89 PASS, 0 FAIL** |
| Route matrix | 51 routes × 3 viewports, **0** console/page/network errors, **0** horizontal overflow |
| Interaction audit | 12/12 PASS, 0 console errors |
| Assets | **40 / 40** (covers 19, inner 7, signature 1, portrait 5, fonts 4, logo 1, poster 3) |
| Metadata | **50** generated routes |

## Library greps

```
grep -R "framer-motion" -n src package.json package-lock.json
  src/               -> 0 matches
  package.json       -> 0 matches
  package-lock.json  -> 3 matches
```

The three lockfile matches are **motion@13's own transitive dependency**, not a
leftover: `"framer-motion": "^13.2.0"` resolved to `framer-motion-13.2.0.tgz`
under `node_modules/motion/node_modules/`. Confirmed independently:

- occurrences of `framer-motion-11` in the lockfile: **0**
- top-level `node_modules/framer-motion` present: **no** (no duplicate copy)
- resolved nested version: **13.2.0**

```
grep -R "animejs" -n src                                        -> 0 matches
find dist/assets -type f -print0 | xargs -0 grep -l \
  "animejs\|createTimeline"                                     -> 0 files
```

Measured against a real build output (25 JS chunks, 12 MB). Anime.js is installed
and functional but contributes **zero bytes** to the shipped bundle.

## Protected files — verified against an independent reference

`audit/protected-checksums-milestone-final.sha256` **did not exist** in this repo
at any point; it was created this turn (27 entries, SHA256) so the specified
command works going forward. A manifest verified against itself proves nothing
about drift, so every protected file was additionally diffed against the pristine
branch `origin/Ah31n-patch-1` (`c82208c`):

| Classification | Count | Files |
| --- | --- | --- |
| **UNCHANGED** (byte-identical) | 11 | `pages/Room.tsx`, `lib/motion.ts`, `vite.config.ts`, `ArticleWorld.tsx`, `Motifs.tsx`, `VibeAmbient.tsx`, `lib/room/state.ts`, `lib/room/geometry.ts`, `lib/room/folios.ts`, `lib/three/seed.ts`, `lib/three/spatialState.ts`, `lib/three/useWebGLSupport.ts` |
| **motion@13 import path only** (2 diff lines) | 9 | `App.tsx`, `index.css`, `ArticleClosing.tsx`, `ArticleDetail.tsx`, `Home.tsx`, `Articles.tsx`, `Categories.tsx`, `room/Plate.tsx`, `room/BrassThread.tsx` |
| **Authored change** | 5 | `spatial/SpatialArchive.tsx` (122), `spatial/StoryEnding3D.tsx` (24), `room/Room.tsx` (20), `package.json` (3), `package-lock.json` (127) |
| **New file** | 1 | `lib/three/easing.ts` |

`room/Plate.tsx` and `room/BrassThread.tsx` differ from pristine by **the import
line alone** — verified by full diff. `room/Room.tsx` differs by the import line
plus the documented `focus`/`settle` `Enter` fix. No change to the room's state
vocabulary, geometry, plate composition, or interaction model.

## Standing caveats

```
PENPOT FIDELITY  = UNVERIFIED
DEPLOYMENT PARITY = UNVERIFIED
```

No authoritative Penpot board comparison was performed — no Penpot MCP tool is
available in this agent. No production deployment occurred. On-screen WebGL
fidelity in a real GPU browser has not been confirmed; measurements here were
taken under SwiftShader software GL.

**RELEASE STATUS: NOT CLOSURE-COMPLETE** — pending independent Penpot comparison
and deployment-parity verification.
