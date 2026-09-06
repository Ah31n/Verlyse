import { motion, useInView, useReducedMotion, type Variants } from 'framer-motion'
import { useRef, type ReactNode } from 'react'
import { useNearViewport } from '../../hooks/useNearViewport'
import { EASE, DUR } from '../../lib/motion'

/**
 * THE HOUSE MOTIONS — the signature moves of the magazine's physical
 * life: ink spreading into wet paper, a page folding down, a gold
 * hairline wiping the section open. All of them calm, all of them
 * handcrafted, all of them borrowed from print.
 */

const inViewOpts = { once: true, margin: '0px 0px -8% 0px' } as const

/* ------------------------------------------------------------------ */
/* INK SPREAD — the content blooms from a point, blurred at the edges  */
/* like ink spreading into damp paper. Used for titles and openings.   */
/* ------------------------------------------------------------------ */
export function InkSpread({
  children,
  className = '',
  origin = '50% 40%',
  delay = 0,
  as = 'div',
}: {
  children: ReactNode
  className?: string
  origin?: string
  delay?: number
  as?: 'div' | 'h1' | 'h2' | 'p'
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, inViewOpts)
  const near = useNearViewport(ref)
  const reduce = useReducedMotion()
  const Comp = motion[as] as typeof motion.div
  const show = inView || near

  const variants: Variants = {
    hidden: { opacity: 0, scale: 0.94, filter: 'blur(16px)' },
    show: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  }

  return (
    <Comp
      ref={ref}
      className={className}
      style={{ transformOrigin: origin }}
      variants={variants}
      initial={reduce ? false : 'hidden'}
      animate={show ? 'show' : 'hidden'}
      transition={{ duration: DUR.ink, ease: EASE.ink, delay }}
    >
      {children}
    </Comp>
  )
}

/* ------------------------------------------------------------------ */
/* PAPER UNFOLD — a leaf folding down into place. Used for plates and  */
/* gallery items, like turning to a new page of the magazine.          */
/* ------------------------------------------------------------------ */
export function PaperFold({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, inViewOpts)
  const near = useNearViewport(ref)
  const reduce = useReducedMotion()
  const show = inView || near

  const variants: Variants = {
    hidden: { opacity: 0, rotateX: -92, y: 26 },
    show: { opacity: 1, rotateX: 0, y: 0 },
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ transformPerspective: 1000, transformOrigin: 'top center' }}
      variants={variants}
      initial={reduce ? false : 'hidden'}
      animate={show ? 'show' : 'hidden'}
      transition={{ duration: DUR.unfold, ease: EASE.ink, delay }}
    >
      {children}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/* EDITORIAL WIPE — a gold hairline sweeps the section open, then the  */
/* label arrives through the opening it made.                          */
/* ------------------------------------------------------------------ */
export function EditorialWipe({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, inViewOpts)
  const near = useNearViewport(ref)
  const reduce = useReducedMotion()
  const show = inView || near

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* the wipe — a gold line that draws the section open */}
      <motion.span
        aria-hidden="true"
        initial={reduce ? false : { scaleX: 0 }}
        animate={show ? { scaleX: 1 } : undefined}
        transition={{ duration: DUR.unfold, ease: EASE.ink, delay }}
        className="absolute -top-3 left-0 h-px w-full origin-left bg-gradient-to-r from-gold/70 via-gold/30 to-transparent"
      />
      {/* the content, arriving through the opening */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={show ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: DUR.settle, ease: EASE.ink, delay: delay + 0.25 }}
      >
        {children}
      </motion.div>
    </div>
  )
}
