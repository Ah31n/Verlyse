import { createContext, useContext, useMemo, type ReactNode, type RefObject } from 'react'
import type { MotionValue } from 'motion/react'
import { useScrollProgress, type ScrollProgressOptions } from './useScrollProgress'
import { DEFAULT_PHASE_MARKS, type PhaseMark, type ScenePhase } from './phases'

/**
 * IMMERSIVE SHELL — the one place a page declares its choreography.
 *
 * A route wraps itself in `<ImmersiveShell marks={...}>` and every immersive
 * component underneath reads the same progress and the same phase from context.
 * That is the whole point: no page invents a second scroll system, and no two
 * components on a page fight over the same scroll value.
 *
 * Engine ownership inside the shell is fixed:
 *
 *   motion/react  -> scroll-linked transforms, presence, layout
 *   anime.js      -> discrete one-shot SVG/DOM ornament draws
 *   R3F           -> 3D scene and camera, in its own useFrame
 *
 * Nothing in this layer animates a 3D camera, and nothing here is mounted on
 * `/room`, which keeps its own protected state machine.
 */
export type ImmersiveContextValue = {
  /** raw scroll progress, 0..1 */
  progress: MotionValue<number>
  /** smoothed progress — drive transforms from this */
  smooth: MotionValue<number>
  /** current phase; changes only at a mark */
  phase: ScenePhase
  /** true under prefers-reduced-motion */
  reduce: boolean
  /** the marks this shell was configured with */
  marks: readonly PhaseMark[]
}

const ImmersiveContext = createContext<ImmersiveContextValue | null>(null)

export type ImmersiveShellProps = ScrollProgressOptions & {
  children: ReactNode
  className?: string
  /**
   * Semantic landmark for the scene. Defaults to no wrapper element semantics
   * beyond the className, so the shell never changes a page's heading or
   * landmark structure.
   */
  as?: 'div' | 'section' | 'main'
  /** accessible name when `as` is a landmark */
  label?: string
  ref?: RefObject<HTMLElement | null>
}

export default function ImmersiveShell({
  children,
  className,
  as: Tag = 'div',
  label,
  marks = DEFAULT_PHASE_MARKS,
  ...scroll
}: ImmersiveShellProps) {
  const { progress, smooth, phase, reduce } = useScrollProgress({
    marks,
    ...scroll,
  })

  const value = useMemo<ImmersiveContextValue>(
    () => ({ progress, smooth, phase, reduce, marks }),
    [progress, smooth, phase, reduce, marks],
  )

  return (
    <ImmersiveContext.Provider value={value}>
      <Tag className={className} aria-label={label}>
        {children}
      </Tag>
    </ImmersiveContext.Provider>
  )
}

/**
 * Read the scene. Throws outside a shell rather than silently returning zeros,
 * because a component quietly animating against a dead scroll value is exactly
 * the kind of drift this layer exists to prevent.
 */
export function useImmersive(): ImmersiveContextValue {
  const ctx = useContext(ImmersiveContext)
  if (!ctx) {
    throw new Error(
      'useImmersive must be used inside <ImmersiveShell>. ' +
        'Wrap the page in an ImmersiveShell so it shares one scroll model.',
    )
  }
  return ctx
}

/**
 * Like `useImmersive`, but tolerates being used outside a shell by falling back
 * to a static end-state. For components that may legitimately render on a plain
 * page (an editorial card inside an ordinary form, say).
 */
export function useImmersiveOrStatic(): ImmersiveContextValue & {
  inside: boolean
} {
  const ctx = useContext(ImmersiveContext)
  if (ctx) return { ...ctx, inside: true }
  /* a frozen 0..1 value: components resolve to their final state */
  const frozen = { get: () => 1, set: () => {} } as unknown as MotionValue<number>
  return {
    progress: frozen,
    smooth: frozen,
    phase: 'return',
    reduce: true,
    marks: DEFAULT_PHASE_MARKS,
    inside: false,
  }
}
