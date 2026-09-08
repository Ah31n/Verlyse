import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * GSAP lifecycle for the cinematic layer.
 *
 * Three guarantees this hook exists to provide:
 *
 * 1. REDUCED MOTION IS STRUCTURAL. The build callback is never invoked when the
 *    visitor prefers reduced motion, so no `gsap.set` ever writes an initial
 *    (often hidden) state. Content therefore rests at its natural CSS state and
 *    can never be left invisible by an animation that declined to run.
 *
 * 2. CLEANUP IS TOTAL. `gsap.context(...).revert()` kills every tween and
 *    ScrollTrigger created inside the callback and strips the inline styles they
 *    wrote, so unmounting a route leaves no orphaned transforms or listeners.
 *
 * 3. SCOPE IS LOCAL. Selectors resolve inside `scope` only, so this layer cannot
 *    reach into another page's DOM.
 *
 * Engine ownership: GSAP writes transform/opacity ONLY on elements created by
 * the cinematic components. It never targets a `motion.*` element or the
 * BrassRule SVG, so no property is written by two engines.
 */

let pluginsRegistered = false
function ensurePlugins() {
  if (pluginsRegistered) return
  gsap.registerPlugin(ScrollTrigger)
  pluginsRegistered = true
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

type Context = ReturnType<typeof gsap.context>

/**
 * Runs `build` inside a scoped, revertible GSAP context.
 * Returns a ref to attach to the component's root element.
 *
 * `build` may return a cleanup function for things `context().revert()` cannot
 * know about (e.g. `addEventListener`); it runs before the context is reverted.
 */
export function useCinematic(build: (scope: HTMLElement) => void | (() => void)) {
  const scope = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const root = scope.current
    if (!root) return
    if (prefersReducedMotion()) return
    ensurePlugins()

    let userCleanup: void | (() => void)
    const ctx: Context = gsap.context(() => {
      userCleanup = build(root)
    }, root)
    return () => {
      if (typeof userCleanup === 'function') userCleanup()
      ctx.revert()
    }
    // `build` is recreated per render by design; the sequence is static, so it
    // is intentionally not a dependency. Re-running it would rebuild identical
    // tweens on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return scope
}
