/* ------------------------------------------------------------------ */
/* THE TREE-SHAKEABLE BOOT MODULE                                       */
/*                                                                      */
/* Why this file exists, and why the imports below are STATIC:          */
/*                                                                      */
/* `runtime.ts` reaches StringTune through `await import('./boot')`.    */
/* If it had dynamically imported the package directly and then read    */
/* `mod.StringProgress`, Rollup would have to keep the entire namespace */
/* alive — and it did: the chunk measured 130 KB gzip, the whole        */
/* library, including two dozen modules the publication never uses.     */
/*                                                                      */
/* Static named imports inside a module that is itself dynamically      */
/* imported are tree-shakeable. The chunk stays lazy AND only carries   */
/* the modules listed here.                                             */
/*                                                                      */
/* Adding a module to the publication means adding it here, and nowhere */
/* else. Anything absent from this list is absent from the bundle.      */
/* ------------------------------------------------------------------ */

import {
  StringTune,
  StringProgress,
  StringSplit,
  StringLerp,
  StringGlide,
  StringParallax,
  StringMagnetic,
  StringSpotlight,
} from '@fiddle-digital/string-tune'

export interface TuneHandle {
  use: (mod: unknown) => void
  start: (fps: number) => void
  destroy: () => void
  onRebuild: () => void
  scrollDesktopMode: string
  scrollMobileMode: string
}

/** Modules that run everywhere — DOM motion only, no pointer required. */
export const UNIVERSAL_MODULES = [StringProgress, StringSplit, StringLerp, StringGlide]

/** Pointer-driven modules — registered only on a fine pointer at >=1024px. */
export const POINTER_MODULES = [StringParallax, StringMagnetic, StringSpotlight]

export function getTune(): TuneHandle {
  return StringTune.getInstance() as unknown as TuneHandle
}
