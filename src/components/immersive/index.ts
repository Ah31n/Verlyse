/**
 * THE IMMERSIVE LAYER — one barrel, one choreography model.
 *
 * Import from here rather than from the individual files, so a route cannot
 * quietly reach past the shell and build its own scroll system.
 *
 *   <ImmersiveShell marks={...}>        the page declares its choreography
 *     <ScrollScene from to>             a band owns part of it
 *       <KineticHeading />              arrival
 *       <EditorialDepth />              document layers
 *       <SpatialImage />                a cover in space
 *       <BrassThread />                 the connective line
 *     </ScrollScene>
 *   </ImmersiveShell>
 *
 * Engine allocation inside this layer:
 *
 *   motion/react  scroll-linked transforms, presence, route transitions
 *   anime.js      discrete one-shot SVG ornament draws (ui/BrassRule)
 *   R3F           3D scene and camera, in its own useFrame
 *
 * Never mounted on `/room`, which keeps its own protected state machine.
 */

export { default as ImmersiveShell, useImmersive, useImmersiveOrStatic } from './ImmersiveShell'
export type { ImmersiveContextValue, ImmersiveShellProps } from './ImmersiveShell'

export { default as ScrollScene, bandProgress } from './ScrollScene'
export type { ScrollSceneProps, ScrollSceneState } from './ScrollScene'

export { default as BrassThread } from './BrassThread'
export type { BrassThreadProps } from './BrassThread'

export { default as ReadingMeasure } from './ReadingMeasure'

export { default as EditorialDepth } from './EditorialDepth'
export type { EditorialDepthProps, DepthLayer, DepthTone } from './EditorialDepth'

export { default as SpatialImage } from './SpatialImage'
export type { SpatialImageProps } from './SpatialImage'

export { default as KineticHeading } from './KineticHeading'
export type { KineticHeadingProps } from './KineticHeading'

export { default as SceneTransition } from './SceneTransition'
export type { SceneTransitionProps } from './SceneTransition'

export { useScrollProgress } from './useScrollProgress'
export type { ScrollProgress, ScrollProgressOptions } from './useScrollProgress'

export { useReducedMotionScene } from './useReducedMotionScene'
export type { ReducedMotionScene } from './useReducedMotionScene'

export { SCENE_PHASES, DEFAULT_PHASE_MARKS, phaseAt, localProgress } from './phases'
export type { ScenePhase, PhaseMark } from './phases'
