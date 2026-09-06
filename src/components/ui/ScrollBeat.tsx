import { useRef } from 'react'
import { motion, useScroll, useSpring, useTransform, useReducedMotion } from 'framer-motion'

/**
 * ANTICIPATION — a title that gathers itself as the reader approaches:
 * the words sit slightly blurred and low, sharpen and rise as the section
 * arrives, then drift on. The reader feels the section coming before it's
 * here — the beat before the reveal.
 */
export function AnticipatedTitle({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 0.35'] })
  const smooth = useSpring(scrollYProgress, { stiffness: 60, damping: 20 })
  const y = useTransform(smooth, [0, 1], [46, 0])
  const opacity = useTransform(smooth, [0, 0.35, 1], [0.15, 0.4, 1])

  return (
    <div ref={ref} className="relative">
      <motion.div
        style={reduce ? undefined : { y, opacity }}
        className={className}
      >
        {children}
      </motion.div>
    </div>
  )
}

/**
 * REFLECTION — a line that drifts up slowly and stays, like a thought held
 * at the end of a chapter. Longer, softer, with nothing else competing.
 */
export function ReflectionLine({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 30 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -18% 0px' }}
      transition={reduce ? undefined : { duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

