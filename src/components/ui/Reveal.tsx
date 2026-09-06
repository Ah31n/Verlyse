import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef, type ReactNode } from 'react'
import { useNearViewport } from '../../hooks/useNearViewport'

interface RevealProps {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
  as?: 'div' | 'section' | 'figure' | 'li' | 'p' | 'h2' | 'h3' | 'blockquote' | 'header'
}

/**
 * The house entrance — a calm rise, like a plate set down on the table.
 * Never a hard fade, never a blur: the content arrives the way a print
 * lands, once, and stays.
 */
export default function Reveal({ children, delay = 0, y = 24, className, as = 'div' }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -8% 0px' })
  const near = useNearViewport(ref)
  const reduce = useReducedMotion()
  const Comp = motion[as] as typeof motion.div
  const show = inView || near

  return (
    <Comp
      ref={ref}
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      animate={show ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </Comp>
  )
}
