/**
 * Deterministic spatial seeding.
 *
 * Every spatial node position must be derived from a stable seed (the article id),
 * never from Math.random, so the same article produces the same arrangement on
 * every mount. This is the single place to source deterministic randomness.
 */

/** Stable 0..1 hash from a string (FNV-1a). */
export function hash01(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 10000) / 10000
}

/** Deterministic sequence of values in [0,1), length `count`, from a seed key. */
export function seededFloats(seedKey: string, count: number): number[] {
  const out: number[] = []
  let h = Math.floor(hash01(seedKey) * 4294967296) || 12345
  for (let i = 0; i < count; i++) {
    // LCG — deterministic, cheap, uniform enough for scene placement.
    h = (Math.imul(h, 1664525) + 1013904223) >>> 0
    out.push(h / 4294967296)
  }
  return out
}
