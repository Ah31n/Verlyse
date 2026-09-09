import { Fragment, type ReactNode } from 'react'
import { motion, useTransform, type MotionValue } from 'motion/react'
import { useImmersive } from './ImmersiveShell'

/**
 * KINETIC HEADING — a title that assembles out of depth as it arrives.
 *
 * The words rise from behind the plane on a short stagger, each with a little
 * rotateX, so the headline reads as something arriving into the room rather
 * than fading in. It communicates arrival, which is the one thing an entrance
 * title has to say.
 *
 * The accessible text is never split. The heading carries the whole string for
 * assistive technology in one node, the animated word spans are `aria-hidden`,
 * and the heading level is whatever the page declares — so the document
 * outline and the reading order are exactly what they would be for a plain
 * `<h1>`.
 *
 * Under reduced motion there is no stagger and no rotation: the title is simply
 * present. It is never hidden waiting for a scroll that may not come.
 */
type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'div'

export type KineticHeadingProps = {
  /** the full text. Kept intact for screen readers. */
  text: string
  as?: HeadingTag
  /** band of the page across which the title assembles */
  from?: number
  to?: number
  /** px the words travel */
  rise?: number
  /** degrees of rotateX at the start */
  tilt?: number
  /** stagger between words, as a fraction of the band */
  stagger?: number
  className?: string
  /** split on words (default) or lines the caller already broke */
  lines?: string[]
}

type WordProps = {
  children: ReactNode
  t: MotionValue<number>
  start: number
  end: number
  rise: number
  tilt: number
  reduce: boolean
}

/* one word, one set of transforms — the hook count never varies */
function Word({ children, t, start, end, rise, tilt, reduce }: WordProps) {
  const y = useTransform(t, [start, end], [rise, 0], { clamp: true })
  const opacity = useTransform(t, [start, end], [0, 1], { clamp: true })
  const rotateX = useTransform(t, [start, end], [tilt, 0], { clamp: true })

  return (
    <span className="inline-block" style={{ perspective: 700 }}>
      <motion.span
        className="inline-block will-change-transform"
        style={
          reduce
            ? undefined
            : { y, opacity, rotateX, transformOrigin: '50% 100%' }
        }
      >
        {children}
      </motion.span>
    </span>
  )
}

export default function KineticHeading({
  text,
  as: Tag = 'h2',
  from = 0,
  to = 0.25,
  rise = 28,
  tilt = 42,
  stagger = 0.06,
  className = '',
  lines,
}: KineticHeadingProps) {
  const { smooth, reduce } = useImmersive()

  const units = lines ?? text.split(' ')
  /* spread the words across the band, leaving room for the last one to finish */
  const span = Math.max(0.001, to - from)
  const step = units.length > 1 ? (span * stagger) / 1 : 0
  const wordSpan = Math.max(0.05, span - step * (units.length - 1))

  return (
    <Tag className={className}>
      {/* the whole string, intact, for assistive technology */}
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {units.map((u, i) => (
          <Fragment key={i}>
            <Word
              t={smooth}
              start={from + step * i}
              end={from + step * i + wordSpan}
              rise={rise}
              tilt={tilt}
              reduce={reduce}
            >
              {u}
            </Word>
            {i < units.length - 1 ? ' ' : null}
          </Fragment>
        ))}
      </span>
    </Tag>
  )
}
