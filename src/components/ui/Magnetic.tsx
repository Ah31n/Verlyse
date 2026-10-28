import { useRef, useState, type ReactNode } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'

export interface MagneticProps {
  children: ReactNode
  className?: string
  strength?: number
}

function isCoarsePointer(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: coarse)').matches
  )
}

/**
 * MAGNETIC — subtle fine-pointer pull toward the cursor.
 * Built on `motion/react` (`useMotionValue` + `useSpring`) so `Header` and
 * shared chrome never pull `gsap` + `ScrollTrigger` into the initial entry
 * chunk on routes that do not mount cinematic scroll scenes.
 *
 * Single-owner rule: only the inner `<motion.span>` receives `x`/`y` spring
 * transforms; under `prefers-reduced-motion: reduce` or coarse pointers no
 * movement occurs and `will-change-transform` is never applied.
 */
export function Magnetic({
  children,
  className = '',
  strength = 0.3,
}: MagneticProps) {
  const rootRef = useRef<HTMLSpanElement>(null)
  const reduce = useReducedMotion() === true
  const [engaged, setEngaged] = useState(false)
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, { stiffness: 220, damping: 22, mass: 0.5 })
  const y = useSpring(rawY, { stiffness: 220, damping: 22, mass: 0.5 })

  const onMouseMove = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (reduce || isCoarsePointer()) return
    const root = rootRef.current
    if (!root) return
    if (!engaged) setEngaged(true)
    const r = root.getBoundingClientRect()
    rawX.set((e.clientX - (r.left + r.width / 2)) * strength)
    rawY.set((e.clientY - (r.top + r.height / 2)) * strength)
  }

  const onMouseLeave = () => {
    if (engaged) setEngaged(false)
    rawX.set(0)
    rawY.set(0)
  }

  return (
    <span
      ref={rootRef}
      onMouseMove={reduce ? undefined : onMouseMove}
      onMouseLeave={reduce ? undefined : onMouseLeave}
      className={`inline-block ${className}`}
    >
      <motion.span
        style={reduce || !engaged ? undefined : { x, y }}
        className={
          engaged && !reduce
            ? 'inline-block will-change-transform'
            : 'inline-block'
        }
      >
        {children}
      </motion.span>
    </span>
  )
}

export default Magnetic
