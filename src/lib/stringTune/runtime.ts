/* ------------------------------------------------------------------ */
/* STRINGTUNE RUNTIME — the single owner of the library's lifecycle.    */
/*                                                                      */
/* Rules this file enforces, so no component has to remember them:      */
/*                                                                      */
/*  1. Client only. The library is dynamically imported after first     */
/*     paint, so the SSR prerender and its 52 metadata shells are       */
/*     untouched and nothing is added to the critical path.             */
/*  2. The BROWSER owns scroll. StringTune ships its own smooth-scroll  */
/*     engine; it is explicitly switched off on desktop and mobile.     */
/*     StringTune only READS scroll. No scroll-jacking (directive §11). */
/*  3. Only the modules the publication actually uses are registered.   */
/*  4. Pointer modules are registered only on a fine pointer at >=1024. */
/*     Touch is not a shrunken desktop (directive §15).                 */
/*  5. Reduced motion means the runtime never starts at all. The CSS    */
/*     static composition is the design, not a fallback (directive §16).*/
/*  6. Devtools are never shipped. They also call an external origin,   */
/*     which our CSP blocks by design.                                  */
/* ------------------------------------------------------------------ */

import { POINTER_MIN_WIDTH } from './tokens'

import type { TuneHandle as Tune } from './boot'

let instance: Tune | null = null
let starting: Promise<Tune | null> | null = null

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** A fine pointer on a wide viewport — the only place pointer effects run. */
export function supportsPointerEffects(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return (
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    window.innerWidth >= POINTER_MIN_WIDTH
  )
}

/**
 * Boot the runtime. Idempotent: repeated calls return the same instance.
 * Returns null when motion is suppressed or the import fails — callers must
 * treat that as normal, not as an error.
 */
export async function startStringTune(): Promise<Tune | null> {
  if (typeof window === 'undefined') return null
  if (prefersReducedMotion()) return null
  if (instance) return instance
  if (starting) return starting

  starting = (async () => {
    try {
      /* ./boot holds STATIC named imports so this chunk stays lazy and
         still tree-shakes to the modules actually listed there. */
      const { getTune, UNIVERSAL_MODULES, POINTER_MODULES } = await import('./boot')
      const tune = getTune()

      /* ---- scroll ownership: the browser keeps it ---- */
      tune.scrollDesktopMode = 'default'
      tune.scrollMobileMode = 'default'

      for (const m of UNIVERSAL_MODULES) tune.use(m)
      if (supportsPointerEffects()) {
        for (const m of POINTER_MODULES) tune.use(m)
      }

      /* 60fps ceiling; the library idles when nothing is in view. */
      tune.start(60)
      instance = tune
      return tune
    } catch {
      /* A missing or failed chunk must never break the publication.
         Everything degrades to the CSS composition. */
      return null
    } finally {
      starting = null
    }
  })()

  return starting
}

/**
 * Re-scan the DOM after a route change.
 *
 * StringTune binds to elements carrying `string="..."` at init. React Router
 * swaps the whole tree on navigation, so the new page's elements have to be
 * picked up explicitly.
 */
export function rescanStringTune(): void {
  instance?.onRebuild()
}

export function stopStringTune(): void {
  instance?.destroy()
  instance = null
}
