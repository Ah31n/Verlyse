import { motion, useTransform } from 'motion/react'
import { useImmersiveOrStatic } from './ImmersiveShell'

/**
 * READING MEASURE — the quietest possible progress indicator.
 *
 * A one-pixel brass hairline pinned to the very top edge of the viewport, drawn
 * left to right as the feature is read. It exists because a long article gives
 * no sense of how much remains, and a numeric or chunky bar would compete with
 * the writing.
 *
 * It is deliberately subordinate to the reading body:
 *   · it sits in the margin of the page, never over the column of text
 *   · it is 1px, aria-hidden, pointer-events-none, and takes no part in layout
 *   · it cannot shift content — the only thing that changes is `scaleX`
 *   · it adds no scroll listener of its own; it reads the shell's smoothed
 *     progress, so the whole route still has exactly one scroll model
 *
 * Under reduced motion the shell pins progress to 1, so the line simply renders
 * fully drawn and never animates.
 *
 * The line is placed just above the header's own stacking level (header 1100,
 * reading bar 1110) so it reads as a hairline on the header's top edge and never
 * covers a control.
 */
export default function ReadingMeasure() {
  const { smooth } = useImmersiveOrStatic()
  const scaleX = useTransform(smooth, [0, 1], [0, 1])

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[1105] h-px origin-left bg-[#B89146]/70"
      style={{ scaleX }}
    />
  )
}
