import { useMemo, type ReactNode } from 'react'
import { useTransform, type MotionValue } from 'motion/react'
import { useImmersive } from './ImmersiveShell'
import { localProgress, type ScenePhase } from './phases'

/**
 * SCROLL SCENE — a band of the page that owns one part of the choreography.
 *
 * A section declares the slice of the scroll it is responsible for and receives
 * a local `t` running 0 -> 1 across exactly that band, clamped outside it. The
 * page stays readable as one timeline; the section never has to know where it
 * sits in the document.
 *
 *   <ScrollScene from={0.32} to={0.52} phase="archive">
 *     {({ t }) => <motion.div style={{ y: useTransform(t, [0,1], [80,0]) }} />}
 *   </ScrollScene>
 *
 * `t` is a MotionValue, so scrolling drives transforms without re-rendering.
 * Under reduced motion the shell pins progress to 1, so `t` resolves to the end
 * of the band and the section renders its final composed state.
 */
export type ScrollSceneState = {
  /** local progress across this band, 0..1 */
  t: MotionValue<number>
  /** the shell's smoothed page progress, if the child wants the whole page */
  smooth: MotionValue<number>
  /** the shell's current phase */
  phase: ScenePhase
  /** whether the shell's phase matches the phase this scene declared */
  active: boolean
  /** true under prefers-reduced-motion */
  reduce: boolean
  /** the band this scene owns */
  from: number
  to: number
}

export type ScrollSceneProps = {
  /** start of the band, in page scroll progress (0..1) */
  from: number
  /** end of the band */
  to: number
  /** the phase this band corresponds to; used only to report `active` */
  phase?: ScenePhase
  children: (state: ScrollSceneState) => ReactNode
  className?: string
  /** optional semantic label for the band */
  label?: string
}

export default function ScrollScene({
  from,
  to,
  phase: declared,
  children,
  className,
  label,
}: ScrollSceneProps) {
  const { smooth, phase, reduce } = useImmersive()

  /* clamp: outside the band the section holds its first or last frame rather
     than extrapolating into nonsense values */
  const t = useTransform(smooth, [from, to], [0, 1], { clamp: true })

  const state = useMemo<ScrollSceneState>(
    () => ({
      t,
      smooth,
      phase,
      active: declared ? phase === declared : true,
      reduce,
      from,
      to,
    }),
    [t, smooth, phase, declared, reduce, from, to],
  )

  return (
    <section className={className} aria-label={label}>
      {children(state)}
    </section>
  )
}

/**
 * The same band maths without the context, for callers that already hold a
 * progress value. Pure, so it can be unit-tested and reused in a validator.
 */
export function bandProgress(
  progress: number,
  from: number,
  to: number,
): number {
  return localProgress(progress, from, to)
}
