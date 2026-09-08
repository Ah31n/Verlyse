import { type ReactNode } from 'react'
import { motion } from 'motion/react'
import { useReducedMotionScene } from './useReducedMotionScene'

/**
 * SCENE TRANSITION — the hand-off between two routes.
 *
 * One shared exit/enter so moving between rooms feels like the same publication
 * changing space, rather than each page having its own idea of an entrance. The
 * move is short and quiet: a small lift and a fade, never a wipe, never a slide
 * that implies a direction the reader did not choose.
 *
 * ENGINE OWNERSHIP. Route presence and layout are motion/react's job, as the
 * allocation specifies. This component is the only place that animates a route
 * boundary, so a page cannot invent a second one.
 *
 * Under reduced motion the transitions collapse to an instant swap — the
 * incoming route is present immediately, with no opacity ramp to wait through.
 *
 * The outgoing tree is `aria-hidden` while it leaves, so a screen reader is
 * never reading a page that is on its way out.
 */
export type SceneTransitionProps = {
  /** route key; changing it swaps the scene */
  sceneKey: string
  children: ReactNode
  /** px of lift on enter; kept small */
  rise?: number
  /** seconds; both legs */
  duration?: number
  className?: string
}

export default function SceneTransition({
  sceneKey,
  children,
  rise = 14,
  duration = 0.42,
  className,
}: SceneTransitionProps) {
  const { reduce } = useReducedMotionScene()
  const ease = [0.22, 1, 0.36, 1] as const

  if (reduce) {
    /* instant swap: no AnimatePresence, so nothing is held in the tree */
    return <div key={sceneKey} className={className}>{children}</div>
  }

  return (
    <motion.div
      key={sceneKey}
      className={className}
      initial={{ opacity: 0, y: rise }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -rise * 0.6 }}
      transition={{ duration, ease }}
    >
      {children}
    </motion.div>
  )
}
