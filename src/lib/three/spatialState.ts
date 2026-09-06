/**
 * The homepage spatial state machine.
 *
 * threshold -> archive -> selected -> reading -> desk -> quiet
 *
 * React owns the state; the spatial renderer reads it to adjust the camera,
 * plane depth/focus, and signal intensity. `reading`/`desk` drive intensity down
 * so the DOM wins; `quiet` (reduced-motion / Quiet View) suppresses motion.
 */
export type SpatialState =
  | 'threshold'
  | 'archive'
  | 'selected'
  | 'reading'
  | 'desk'
  | 'quiet'

export const SPATIAL_STATES: SpatialState[] = [
  'threshold',
  'archive',
  'selected',
  'reading',
  'desk',
  'quiet',
]

/** Lower intensity when the reader should be focused on the DOM. */
export function spatialIntensity(state: SpatialState): number {
  switch (state) {
    case 'threshold': return 0.85
    case 'archive': return 0.7
    case 'selected': return 1
    case 'reading': return 0.4
    case 'desk': return 0.45
    case 'quiet': return 0.2
  }
}
