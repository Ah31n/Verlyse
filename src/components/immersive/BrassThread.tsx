import { motion, useTransform, type MotionValue } from 'motion/react'
import { useImmersiveOrStatic } from './ImmersiveShell'

/**
 * BRASS THREAD — the connective line that runs the length of a scene.
 *
 * A single hairline that draws itself downward as the page is scrolled, so the
 * eye is given continuity between sections. It communicates hierarchy and
 * return: the thread is the same object from the threshold to the closing
 * invitation, and its length is a direct read of how far the reader has come.
 *
 * ENGINE OWNERSHIP. This is a *scroll-linked* property, so motion/react owns it
 * (`useTransform` on `strokeDashoffset`). That is deliberately different from
 * `ui/BrassRule`, where a *discrete one-shot* draw is owned by anime.js. Two
 * different surfaces, two different triggers, no shared property.
 *
 * It is also unrelated to `room/BrassThread.tsx`, which belongs to the
 * protected room composition and is never mounted alongside this one.
 *
 * Under reduced motion the shell pins progress to 1, so the thread simply
 * renders fully drawn. It is decorative: `aria-hidden` and no pointer events.
 */
export type BrassThreadProps = {
  /** height of the thread track, any CSS length */
  height?: string
  /** 0..1 of the scroll this thread spans; defaults to the whole page */
  from?: number
  to?: number
  /** stroke colour; defaults to the house brass */
  stroke?: string
  /** drive it from an explicit progress value instead of the shell */
  progress?: MotionValue<number>
  className?: string
}

export default function BrassThread({
  height = '100%',
  from = 0,
  to = 1,
  stroke = '#B89146',
  progress,
  className = '',
}: BrassThreadProps) {
  /* hooks stay unconditional: always read the shell, then prefer an explicit
     progress value when the caller supplied one. Calling useImmersive inside
     the branch would break the rules of hooks. */
  const shell = useImmersiveOrStatic()
  const source = progress ?? shell.smooth

  /* pathLength is normalised to 1, so the dash pair is just 1 and the offset
     runs 1 -> 0 across the band */
  const dashoffset = useTransform(source, [from, to], [1, 0], { clamp: true })
  const opacity = useTransform(source, [from, to], [0.15, 0.6], {
    clamp: true,
  })

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
      style={{ height }}
    >
      <svg
        viewBox="0 0 2 100"
        preserveAspectRatio="none"
        className="h-full w-[2px] overflow-visible"
        focusable="false"
      >
        <motion.line
          x1="1"
          y1="0"
          x2="1"
          y2="100"
          stroke={stroke}
          strokeWidth="1"
          pathLength={1}
          strokeDasharray={1}
          style={{ strokeDashoffset: dashoffset, opacity }}
        />
      </svg>
    </div>
  )
}
