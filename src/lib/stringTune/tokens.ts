/**
 * StringTune editorial motion tokens — Verlyse Media.
 *
 * Calibrated for restrained, print-inspired motion across the exhibition:
 * - Progress reveals (`string="progress"`) drive CSS `--progress` (0..1)
 *   for cover plates, section headings, pull quotes, and brass hairlines.
 * - Parallax (`string="parallax[]"`) is capped at subtle editorial rates
 *   so text remains calm and legible.
 * - Glide (`string="glide[]"`) provides gentle inertia on plate sequences.
 * - Spotlight (`string="spotlight"`) provides a soft brass rim-light
 *   (`--spotlight-angle`, `--spotlight-distance`) on desktop fine pointers.
 */

export type Intensity = 'whisper' | 'restrained' | 'standard' | 'measured'

export const TIMING = {
  /** Target frame budget for StringTune's internal ticker. */
  fps: 60,
} as const

/** Pointer-reactive modules (spotlight, magnetic, parallax) require a desktop fine pointer. */
export const POINTER_MIN_WIDTH = 1024

export const INTENSITY: Record<
  Intensity,
  { enterEl: string; enterVp: string; exitEl: string; exitVp: string; lerp: number }
> = {
  whisper: {
    enterEl: 'top',
    enterVp: '92%',
    exitEl: 'bottom',
    exitVp: '8%',
    lerp: 0.16,
  },
  restrained: {
    enterEl: 'top',
    enterVp: '88%',
    exitEl: 'bottom',
    exitVp: '12%',
    lerp: 0.14,
  },
  standard: {
    enterEl: 'top',
    enterVp: '86%',
    exitEl: 'bottom',
    exitVp: '14%',
    lerp: 0.13,
  },
  measured: {
    enterEl: 'top',
    enterVp: '84%',
    exitEl: 'bottom',
    exitVp: '16%',
    lerp: 0.12,
  },
}

/** Subtle parallax rates (`string-parallax="<rate>"`). */
export const DRIFT: Record<Intensity, number> = {
  whisper: 0.06,
  restrained: 0.1,
  standard: 0.15,
  measured: 0.22,
}

/** Gentle scroll-velocity glide scale (`string-glide="<scale>"`). */
export const GLIDE: Record<Intensity, number> = {
  whisper: 0.08,
  restrained: 0.14,
  standard: 0.2,
  measured: 0.28,
}

/** Maximum spotlight distance in pixels (`string-dist-max`). */
export const DISTANCE = {
  spotlightMax: 320,
} as const

/** Magnetic radius and strength for discrete CTAs (`string="magnetic"`). */
export const MAGNETIC = {
  radius: 140,
  strength: 0.22,
} as const
