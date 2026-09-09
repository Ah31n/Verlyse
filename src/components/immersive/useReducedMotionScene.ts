import { useReducedMotion } from 'motion/react'

/**
 * REDUCED MOTION, DECIDED ONCE FOR A WHOLE SCENE.
 *
 * Every immersive component asks this instead of reading the media query
 * itself, so a scene can never end up half-animated: either the whole scene
 * moves, or the whole scene rests in its final, fully-composed frame.
 *
 * The rule the whole layer follows: under reduced motion nothing is hidden and
 * nothing waits to be revealed. Content that would have travelled in is simply
 * already there — `staticFrame` is the signal to skip the timeline and render
 * the end state.
 */
export type ReducedMotionScene = {
  /** the user asked for reduced motion */
  reduce: boolean
  /** skip timelines and render the final composed frame */
  staticFrame: boolean
  /** the value to use for any progress-derived offset: the end of the range */
  restingProgress: number
}

export function useReducedMotionScene(): ReducedMotionScene {
  /* motion/react's hook is null until the media query has resolved; treat
     "unknown" as "not reduced" so first paint is never stuck in a static frame
     for users who did not ask for one. */
  const reduce = useReducedMotion() === true
  return {
    reduce,
    staticFrame: reduce,
    restingProgress: 1,
  }
}
