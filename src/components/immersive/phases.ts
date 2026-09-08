/**
 * THE SCENE PHASE MODEL — the one choreography vocabulary every route shares.
 *
 * A page does not invent its own animation system. It declares, once, where its
 * phases fall along the scroll, and every immersive component below it reads the
 * same progress value and the same phase name.
 *
 *   scroll progress -> scene phase -> visual state -> scene update
 *
 * The eight shared phases. Not every route uses all eight; a route names the
 * ones it has and the rest are simply never reached.
 *
 *   threshold   the dark wine ground, before anything has arrived
 *   arrival     the title assembles from depth
 *   reveal      the featured plate surfaces
 *   archive     the shelf / covers open out
 *   focus       one record is held forward
 *   transition  the hand-off between two spatial states
 *   reading     the quiet body copy
 *   return      the closing invitation
 *
 * These names deliberately echo the vocabulary `/room` already uses, so the two
 * systems read alike — but they are independent. Nothing here imports or drives
 * the room state machine.
 */

export const SCENE_PHASES = [
  'threshold',
  'arrival',
  'reveal',
  'archive',
  'focus',
  'transition',
  'reading',
  'return',
] as const

export type ScenePhase = (typeof SCENE_PHASES)[number]

/** A phase and the scroll progress (0..1) at which it begins. */
export type PhaseMark = { at: number; phase: ScenePhase }

/**
 * The default page rhythm. Deliberately front-loaded: the entrance is where the
 * spectacle lives, and the later phases get more of the scroll so the reading
 * and the return stay unhurried.
 */
export const DEFAULT_PHASE_MARKS: readonly PhaseMark[] = [
  { at: 0.0, phase: 'threshold' },
  { at: 0.06, phase: 'arrival' },
  { at: 0.16, phase: 'reveal' },
  { at: 0.32, phase: 'archive' },
  { at: 0.52, phase: 'focus' },
  { at: 0.68, phase: 'transition' },
  { at: 0.82, phase: 'reading' },
  { at: 0.94, phase: 'return' },
]

const clamp01 = (n: number): number => (n < 0 ? 0 : n > 1 ? 1 : n)

/**
 * Resolve a scroll progress to a phase.
 *
 * Pure and deterministic: the same progress and the same marks always give the
 * same phase, which is what makes the whole system reproducible in tests. Marks
 * are sorted defensively so a route can declare them in any order.
 */
export function phaseAt(
  progress: number,
  marks: readonly PhaseMark[] = DEFAULT_PHASE_MARKS,
): ScenePhase {
  const p = clamp01(Number.isFinite(progress) ? progress : 0)
  const sorted = [...marks].sort((a, b) => a.at - b.at)
  let current: ScenePhase = sorted.length ? sorted[0].phase : 'threshold'
  for (const m of sorted) {
    if (m.at <= p) current = m.phase
    else break
  }
  return current
}

/**
 * Normalise a sub-range of the scroll into a local 0..1.
 *
 * Lets a section own part of the page: `<ScrollScene from={0.32} to={0.52}>`
 * gets `t` running 0->1 across exactly that band, clamped outside it.
 */
export function localProgress(
  progress: number,
  from: number,
  to: number,
): number {
  const p = clamp01(Number.isFinite(progress) ? progress : 0)
  const span = to - from
  if (!Number.isFinite(span) || span <= 0) return p >= to ? 1 : 0
  return clamp01((p - from) / span)
}
