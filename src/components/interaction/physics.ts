/**
 * Verlyse Media — Interaction Physics & Motion System
 * Authoritative constants and curves for all motion, spacing, physics, and pointer intelligence.
 * Calibrated post-critique for editorial restraint, material depth, and zero motion fatigue.
 */

export const MOTION_SPEED = {
  instant: 0.15,
  fast: 0.25,
  base: 0.45,
  deliberate: 0.7,
  epic: 1.2,
} as const

export const MOTION_DISTANCE = {
  sm: 8,
  md: 24,
  lg: 48,
  xl: 96,
} as const

export const MOTION_EASE = {
  /** House ink curve: fast attack, smooth luxurious deceleration */
  easeInk: [0.22, 1, 0.36, 1] as const,
  /** Damped spring curve for physical tactile feedback */
  easeDamp: [0.32, 0.72, 0, 1] as const,
  /** Snappy curve for button press and instant response */
  easePress: [0.4, 0, 0.2, 1] as const,
  /** Dramatic threshold curve for page veils */
  easeThreshold: [0.65, 0.05, 0.36, 1] as const,
  /** Editorial reading curve */
  easeEditorial: [0.16, 1, 0.3, 1] as const,
} as const

export const MOTION_INTENSITY = {
  subtle: 0.4,
  standard: 0.8,
  expressive: 1.2,
} as const

export const EDITORIAL_SPACING = {
  hairline: '1px',
  tight: '1rem',
  gutter: '2rem',
  section: 'clamp(4rem, 8vw, 7.5rem)',
  spread: 'clamp(5rem, 12vw, 10rem)',
} as const

export const ARCHIVE_SPACING = {
  matrixGap: '1.5rem',
  shelfPadding: '2rem',
  ledgerMargin: '3rem',
} as const

export const READING_SPACING = {
  columnMaxWidth: '68ch',
  paragraphSpacing: '1.75rem',
  platePadding: '2.5rem',
} as const

export const DISPLAY_SPACING = {
  mastheadPaddingTop: 'clamp(3rem, 7vw, 6rem)',
  heroMarginBottom: 'clamp(3rem, 6vw, 5rem)',
} as const

export const CURSOR_SIZE = {
  default: 10,
  link: 32,
  badge: 68,
} as const

export const MAGNETIC_STRENGTH = {
  subtle: 0.12,
  standard: 0.25,
  hero: 0.38,
} as const

/** Reduced parallax depth multipliers by ~60% for material serenity */
export const PARALLAX_DEPTH = {
  subtle: 0.06,
  plate: 0.12,
  background: 0.18,
} as const

export const REVEAL_OFFSET = {
  sm: 12,
  md: 24,
  lg: 48,
} as const

/** Calibrated 320px radius spotlight key-light for sharp, disciplined illumination */
export const SPOTLIGHT_CONFIG = {
  radius: 320,
  color: 'rgba(217, 185, 120, 0.08)',
  borderHighlightColor: 'rgba(217, 185, 120, 0.3)',
} as const
