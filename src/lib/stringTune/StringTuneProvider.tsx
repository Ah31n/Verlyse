import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import {
  prefersReducedMotion,
  rescanStringTune,
  startStringTune,
  stopStringTune,
} from './runtime'

export function shouldSuspendStringTune(pathname: string): boolean {
  if (prefersReducedMotion()) return true
  if (pathname === '/room' || pathname.startsWith('/room/')) return true
  if (typeof document !== 'undefined') {
    if (document.visibilityState === 'hidden') return true
    if (!document.querySelector('[string]')) return true
  }
  return false
}

/**
 * Mounts the StringTune runtime once, for the whole publication.
 *
 * Placed inside the router so it can re-scan the DOM after navigation, and
 * rendered as a null component so it adds nothing to the layout.
 *
 * Boot is deferred to an idle callback after first paint: the library is
 * expressive polish, and it must never compete with the cover plate or the
 * fonts for the first second of a reader's attention.
 *
 * Performance & lifecycle gating:
 * - Never boots or stays running on `/room` (where no `[string]` bindings exist),
 *   when the document tab is hidden (`visibilityState === 'hidden'`), when no
 *   `[string]` elements exist in the current DOM, or under `prefers-reduced-motion: reduce`.
 */
export default function StringTuneProvider() {
  const { pathname } = useLocation()
  const mountedRef = useRef(false)
  const transitionGenRef = useRef(0)
  const pathnameRef = useRef(pathname)
  pathnameRef.current = pathname

  const bootOrRescan = () => {
    const myGen = ++transitionGenRef.current
    if (!mountedRef.current || shouldSuspendStringTune(pathnameRef.current)) {
      stopStringTune()
      return
    }
    void startStringTune()
      .then((tune) => {
        if (
          !mountedRef.current ||
          myGen !== transitionGenRef.current ||
          !tune ||
          shouldSuspendStringTune(pathnameRef.current)
        ) {
          if (!mountedRef.current || shouldSuspendStringTune(pathnameRef.current)) {
            stopStringTune()
          }
          return
        }
        rescanStringTune()
      })
      .catch(() => {
        /* Static CSS composition remains the fallback */
      })
  }

  useEffect(() => {
    mountedRef.current = true
    const myGen = ++transitionGenRef.current

    const idle =
      (
        window as unknown as {
          requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number
        }
      ).requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 400))

    const handle = idle(
      () => {
        if (
          !mountedRef.current ||
          myGen !== transitionGenRef.current ||
          shouldSuspendStringTune(pathnameRef.current)
        ) {
          if (shouldSuspendStringTune(pathnameRef.current)) {
            stopStringTune()
          }
          return
        }
        bootOrRescan()
      },
      { timeout: 2000 },
    )

    return () => {
      const cancel = (window as unknown as { cancelIdleCallback?: (h: number) => void })
        .cancelIdleCallback
      if (cancel) cancel(handle as number)
      else window.clearTimeout(handle as number)
    }
  }, [])

  /* A new route is a new DOM tree; the runtime has to find its elements, or
     tear down on `/room` and routes with zero `[string]` bindings.
     Deferred a frame so React has committed before the scan runs. */
  useEffect(() => {
    if (pathname === '/room' || pathname.startsWith('/room/')) {
      transitionGenRef.current += 1
      stopStringTune()
      return undefined
    }
    const t = window.setTimeout(() => {
      if (!mountedRef.current) return
      bootOrRescan()
    }, 60)
    return () => window.clearTimeout(t)
  }, [pathname])

  /* Pause StringTune when the tab is hidden; resume when visible again. */
  useEffect(() => {
    if (typeof document === 'undefined') return undefined
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        transitionGenRef.current += 1
        stopStringTune()
      } else {
        bootOrRescan()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  /* Dynamic reduced-motion preference changes: tear down immediately if the
     reader enables reduced motion mid-session, or boot/rescan if disabled. */
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (e?: MediaQueryListEvent) => {
      const isReduced = typeof e?.matches === 'boolean' ? e.matches : mql.matches
      if (isReduced || prefersReducedMotion()) {
        transitionGenRef.current += 1
        stopStringTune()
        return
      }
      bootOrRescan()
    }

    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    }
    if (typeof mql.addListener === 'function') {
      mql.addListener(onChange)
      return () => mql.removeListener(onChange)
    }
    return undefined
  }, [])

  useEffect(
    () => () => {
      mountedRef.current = false
      transitionGenRef.current += 1
      stopStringTune()
    },
    [],
  )

  return null
}
