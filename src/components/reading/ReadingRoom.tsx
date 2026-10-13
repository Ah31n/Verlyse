import type { ReactNode } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'

/**
 * THE READING ROOM — the ambient background shell around the canonical
 * article route.
 */
export default function ReadingRoom({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion() === true
  const { scrollY } = useScroll()
  const backY = useTransform(scrollY, (v) => (reduce ? 0 : Math.min(v, 1600) * 0.07))
  const E = [0.22, 1, 0.36, 1] as const

  return (
    <div className="relative">
      {/* ============ BACK — the room's ambient background (fixed, decorative only) ============ */}
      <motion.div
        aria-hidden="true"
        style={reduce ? undefined : { y: backY }}
        className="pointer-events-none fixed inset-0 z-0"
      >
        <div className="absolute inset-0 bg-[radial-gradient(110%_75%_at_50%_-8%,rgba(92,18,36,0.30),transparent_58%),radial-gradient(90%_55%_at_50%_118%,rgba(18,4,9,0.55),transparent_62%),linear-gradient(180deg,#3B0D17_0%,#2A0F18_55%,#1C070E_100%)]" />
      </motion.div>

      {/* ============ FRONT — the canonical article, always the focus ============ */}
      <div className="relative z-[2]">
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reduce ? undefined : { duration: 0.9, delay: 0.35, ease: E }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}
