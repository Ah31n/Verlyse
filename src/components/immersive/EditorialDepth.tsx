import { type ReactNode } from 'react'
import { motion, useTransform, type MotionValue } from 'motion/react'
import { useImmersive } from './ImmersiveShell'

/**
 * EDITORIAL DEPTH — stacked paper sheets that separate as the page moves.
 *
 * The publication's depth cue. Instead of a drop shadow pretending to be 3D,
 * real layers sit at different scroll rates, so the composition has parallax
 * the way a stack of paper does when you tilt it. Used where a route wants
 * tactile document layers (the colophon, a dossier, a submission desk) rather
 * than a spatial 3D scene.
 *
 * Deliberately modest: a few tens of pixels of separation, no rotation beyond a
 * whisper, no scroll hijacking. The content on top stays legible and scrollable
 * at every point in the range.
 *
 * Each sheet is its own component so it owns exactly one `useTransform` — the
 * hook count never varies with the number of layers.
 *
 * Under reduced motion every sheet rests at its final offset and nothing drifts.
 */
export type DepthTone = 'wine' | 'ivory' | 'brass' | 'ink'

const TONE: Record<DepthTone, string> = {
  wine: 'linear-gradient(175deg,#3E0D17 0%,#2A0F18 60%,#1B070E 100%)',
  ivory: 'linear-gradient(178deg,#FBF9F6 0%,#F8F6F2 55%,#EFEBE3 100%)',
  brass:
    'linear-gradient(180deg,rgba(184,145,70,0.20) 0%,rgba(184,145,70,0.05) 100%)',
  ink: 'linear-gradient(180deg,rgba(23,6,12,0.55) 0%,rgba(23,6,12,0.15) 100%)',
}

export type DepthLayer = {
  tone: DepthTone
  /** how far this layer travels, in px, across the band. Negative = recedes. */
  travel?: number
  /** inset from the sheet edge, any CSS length */
  inset?: string
  /** brass hairline along the top edge */
  hairline?: boolean
  className?: string
}

type SheetProps = DepthLayer & {
  smooth: MotionValue<number>
  from: number
  to: number
  reduce: boolean
}

function DepthSheet({
  tone,
  travel = -28,
  inset = '0',
  hairline,
  className,
  smooth,
  from,
  to,
  reduce,
}: SheetProps) {
  /* one hook, one layer — the count never changes between renders */
  const y = useTransform(smooth, [from, to], [travel, 0], { clamp: true })

  return (
    <motion.div
      className={`absolute ${className ?? ''}`}
      style={{
        inset,
        background: TONE[tone],
        y: reduce ? 0 : y,
        borderTop: hairline ? '1px solid rgba(184,145,70,0.35)' : undefined,
        boxShadow:
          tone === 'ivory' ? '0 18px 44px rgba(0,0,0,0.35)' : undefined,
      }}
    />
  )
}

export type EditorialDepthProps = {
  layers: DepthLayer[]
  /** band of the page this depth responds to */
  from?: number
  to?: number
  children?: ReactNode
  className?: string
  /** accessible name for the group; omit for purely decorative depth */
  label?: string
}

export default function EditorialDepth({
  layers,
  from = 0,
  to = 1,
  children,
  className = '',
  label,
}: EditorialDepthProps) {
  const { smooth, reduce } = useImmersive()

  return (
    <div
      className={`relative ${className}`}
      aria-label={label}
      role={label ? 'group' : undefined}
    >
      {/* the sheets are decoration; the content above them is the real thing */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {layers.map((l, i) => (
          <DepthSheet
            key={i}
            {...l}
            smooth={smooth}
            from={from}
            to={to}
            reduce={reduce}
          />
        ))}
      </div>
      {children ? <div className="relative z-[1]">{children}</div> : null}
    </div>
  )
}
