import { EASE } from '../motion'

/**
 * The house easing curves, made usable inside a WebGL frame loop.
 *
 * `src/lib/motion.ts` defines Verlyse's motion language as CSS cubic-bezier
 * control points, which Framer Motion and CSS can consume directly. A r3f
 * `useFrame` cannot — it needs `t -> progress` as a number. This module is the
 * single bridge, so the spatial layer speaks the SAME curve as the DOM instead
 * of inventing its own.
 *
 * Implementation: Newton-Raphson on x(t) with a bisection fallback, the standard
 * approach. Stateless and allocation-free in the hot path.
 */

function bezierComponent(p1: number, p2: number, t: number): number {
  // B(t) for a cubic bezier with endpoints pinned at 0 and 1.
  const c = 3 * p1
  const b = 3 * (p2 - p1) - c
  const a = 1 - c - b
  return ((a * t + b) * t + c) * t
}

function bezierSlope(p1: number, p2: number, t: number): number {
  const c = 3 * p1
  const b = 3 * (p2 - p1) - c
  const a = 1 - c - b
  return (3 * a * t + 2 * b) * t + c
}

/** Build a `progress(x) -> y` solver for a CSS cubic-bezier control pair. */
export function cubicBezier(p1x: number, p1y: number, p2x: number, p2y: number) {
  return (x: number): number => {
    if (x <= 0) return 0
    if (x >= 1) return 1
    let t = x
    // Newton-Raphson converges in a couple of iterations for these curves.
    for (let i = 0; i < 6; i++) {
      const dx = bezierComponent(p1x, p2x, t) - x
      if (Math.abs(dx) < 1e-5) return bezierComponent(p1y, p2y, t)
      const slope = bezierSlope(p1x, p2x, t)
      if (Math.abs(slope) < 1e-6) break
      t -= dx / slope
    }
    // Bisection fallback — guaranteed, still cheap.
    let lo = 0
    let hi = 1
    t = x
    while (lo < hi) {
      const cx = bezierComponent(p1x, p2x, t)
      if (Math.abs(cx - x) < 1e-5) break
      if (cx < x) lo = t
      else hi = t
      t = (hi + lo) / 2
      if (hi - lo < 1e-6) break
    }
    return bezierComponent(p1y, p2y, t)
  }
}

/**
 * The house "ink" curve as a frame-loop easing: fast to arrive, long to land —
 * the easing of a pen stroke settling. Used for the archive's arrival.
 */
export const easeInk = cubicBezier(EASE.ink[0], EASE.ink[1], EASE.ink[2], EASE.ink[3])

/** The house "leaf" curve: softer, for ambient drift that should never hurry. */
export const easeLeaf = cubicBezier(EASE.leaf[0], EASE.leaf[1], EASE.leaf[2], EASE.leaf[3])
