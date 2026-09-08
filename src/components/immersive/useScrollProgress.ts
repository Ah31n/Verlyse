import { useEffect, useRef, useState, type RefObject } from 'react'
import {
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  type MotionValue,
} from 'motion/react'

/**
 * motion/react does not re-export its offset union, so derive it from the hook
 * itself. This keeps the typing exact without depending on an internal path.
 */
type ScrollOffset = NonNullable<Parameters<typeof useScroll>[0]>['offset']
import {
  DEFAULT_PHASE_MARKS,
  phaseAt,
  type PhaseMark,
  type ScenePhase,
} from './phases'
import { useReducedMotionScene } from './useReducedMotionScene'

export type ScrollProgressOptions = {
  /**
   * Measure this element instead of the window. Leave unset for a page-level
   * scene, which is the common case.
   */
  target?: RefObject<HTMLElement | null>
  /**
   * ScrollTrigger-style offset pair. The default measures the whole document:
   * progress is 0 at the very top and 1 when the bottom is reached.
   */
  offset?: ScrollOffset
  /** Stiffness of the smoothing spring. 0 disables smoothing entirely. */
  stiffness?: number
  /** Phase marks for this page. Defaults to the shared page rhythm. */
  marks?: readonly PhaseMark[]
}

export type ScrollProgress = {
  /** raw scroll progress, 0..1 */
  progress: MotionValue<number>
  /** smoothed scroll progress — drive transforms from this one */
  smooth: MotionValue<number>
  /** the current phase. Changes only at a mark, never per frame. */
  phase: ScenePhase
  /** true under prefers-reduced-motion; the scene should hold its final frame */
  reduce: boolean
}

/**
 * SCROLL PROGRESS -> PHASE.
 *
 * The single source of scroll truth for an immersive page. Two things about it
 * are deliberate:
 *
 * 1. Progress is a MotionValue, not React state. Transforms are driven straight
 *    off it, so scrolling never re-renders the tree.
 * 2. `phase` IS React state, but it is only written when the resolved phase
 *    actually changes — at most eight times a page, never per frame.
 *
 * Under reduced motion the progress value is pinned to 1, so every component
 * reading it lands on its final composed state without needing its own branch.
 */
export function useScrollProgress({
  target,
  offset = ['start start', 'end end'] as ScrollOffset,
  stiffness = 90,
  marks = DEFAULT_PHASE_MARKS,
}: ScrollProgressOptions = {}): ScrollProgress {
  const { reduce } = useReducedMotionScene()

  /* No target means "measure the window". Passing an unattached ref here would
     hand useScroll an element it can never measure, and progress would sit at
     0 forever — so the key is omitted entirely rather than defaulted. */
  const { scrollYProgress } = useScroll(
    target ? { target, offset } : { offset },
  )

  /* a gentle smoothing so long scroll-linked moves feel weighted rather than
     twitchy. Under reduced motion there is nothing to smooth. */
  const smooth = useSpring(scrollYProgress, {
    stiffness,
    damping: 30,
    restDelta: 0.001,
  })

  const [phase, setPhase] = useState<ScenePhase>(() =>
    phaseAt(reduce ? 1 : 0, marks),
  )

  /* Under reduced motion the whole scene must rest in its final frame, so both
     values are frozen at the end of the range. Pinning only the phase is not
     enough: every component reads `smooth` to place itself, and a live value
     there would keep scroll-linked offsets moving. */
  const frozen = useMotionValue(1)

  /* read the raw value, not the spring: phase boundaries should be crossed
     where the marks say, not where the easing happens to be. */
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const next = phaseAt(reduce ? 1 : latest, marks)
    setPhase((prev) => (prev === next ? prev : next))
  })

  /* keep the phase honest if the marks change between renders */
  const markKey = marks.map((m) => `${m.at}:${m.phase}`).join('|')
  const lastMarkKey = useRef(markKey)
  useEffect(() => {
    if (lastMarkKey.current === markKey) return
    lastMarkKey.current = markKey
    setPhase(phaseAt(reduce ? 1 : scrollYProgress.get(), marks))
  }, [markKey, marks, reduce, scrollYProgress])

  return {
    progress: reduce ? frozen : scrollYProgress,
    smooth: reduce ? frozen : smooth,
    phase,
    reduce,
  }
}
