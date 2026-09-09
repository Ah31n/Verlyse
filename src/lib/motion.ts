/**
 * THE VERLYSE MOTION LANGUAGE
 * ─────────────────────────────
 * Every animation on the site speaks one language — ink on paper, slowly.
 *
 * EASING
 *   ink   — the house curve [0.16, 1, 0.3, 1]: fast to arrive, long to land.
 *           It is the easing of a pen stroke settling: quick start, patient end.
 *   leaf  — the gentle curve [0.22, 1, 0.36, 1]: softer, for ambient drift.
 *
 * DURATIONS (ms)
 *   settle    — 1050  · content arriving
 *   unfold    — 1300  · pages and plates
 *   ink       — 1600+ · ink spreading, signatures drawing
 *   breathe   — 5000+ · ambient, near-still
 *
 * NAMED MOVES
 *   ink-spread    — content blooms from a point, like ink on wet paper
 *   paper-unfold  — the page folds down into place, like a leaf being turned
 *   editorial-wipe — a gold hairline sweeps the section open before the content
 */

export const EASE = {
  ink: [0.16, 1, 0.3, 1] as const,
  leaf: [0.22, 1, 0.36, 1] as const,
}

export const DUR = {
  settle: 1.05,
  unfold: 1.3,
  ink: 1.8,
  breathe: 5,
}
