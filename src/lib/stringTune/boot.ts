/* ------------------------------------------------------------------ */
/* THE TREE-SHAKEABLE BOOT MODULE                                       */
/*                                                                      */
/* Why this file exists, and why the imports below are STATIC:          */
/*                                                                      */
/* `runtime.ts` reaches StringTune through `await import('./boot')`.    */
/* If it had dynamically imported the package directly and then read    */
/* `mod.StringProgress`, Rollup would have to keep the entire namespace */
/* alive.                                                               */
/*                                                                      */
/* Static named imports inside a module that is itself dynamically      */
/* imported are tree-shakeable. The chunk stays lazy AND only carries   */
/* the 4 modules listed here (`StringProgress`, `StringGlide`,          */
/* `StringParallax`, `StringSpotlight`). `StringSplit`, `StringLerp`,   */
/* and `StringMagnetic` are intentionally excluded because `SplitText`  */
/* (`motion/react`), native scroll, and `src/components/ui/Magnetic.tsx`*/
/* (`motion/react`) own those concerns.                                 */
/* ------------------------------------------------------------------ */

import {
  StringTune,
  StringProgress,
  StringGlide,
  StringParallax,
  StringSpotlight,
} from '@fiddle-digital/string-tune'

export interface TuneHandle {
  use: (mod: unknown) => void
  start: (fps: number) => void
  destroy: () => void
  onRebuild: () => void
  onResize: (force?: boolean) => void
  scrollDesktopMode: string
  scrollMobileMode: string
}

/** Modules that run everywhere — DOM motion only, no pointer required. */
export const UNIVERSAL_MODULES = [StringProgress, StringGlide]

/** Pointer-driven modules — registered only on a fine pointer at >=1024px. */
export const POINTER_MODULES = [StringParallax, StringSpotlight]

export function getTune(): TuneHandle {
  return StringTune.getInstance() as unknown as TuneHandle
}
