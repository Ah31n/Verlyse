import { motion, useScroll, useSpring } from 'motion/react'

/**
 * ReadingProgressLine — sticky 1px brass hairline measuring scroll progress.
 */
export function ReadingProgressLine({
  className = '',
}: {
  className?: string
}) {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <div
      className={`fixed inset-x-0 top-0 z-[1200] h-[2px] bg-white/5 pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <motion.div
        className="h-full bg-gradient-to-r from-gold/40 via-gold to-[#D9B978] origin-left"
        style={{ scaleX }}
      />
    </div>
  )
}
