import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import {
  prefersReducedMotion,
  rescanStringTune,
  startStringTune,
  stopStringTune,
} from './runtime'

/**
 * Mounts the StringTune runtime once, for the whole publication.
 *
 * Placed inside the router so it can re-scan the DOM after navigation, and
 * rendered as a null component so it adds nothing to the layout.
 *
 * Boot is deferred to an idle callback after first paint: the library is
 * expressive polish, and it must never compete with the cover plate or the
 * fonts for the first second of a reader's attention.
 */
export default function StringTuneProvider() {
  const { pathname } = useLocation()
  const mountedRef = useRef(false)
  const transitionGenRef = useRef(0)

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
        if (!mountedRef.current || myGen !== transitionGenRef.current || prefersReducedMotion()) {
          return
        }
        void startStringTune()
          .then((tune) => {
            if (
              !mountedRef.current ||
              myGen !== transitionGenRef.current ||
              !tune ||
              prefersReducedMotion()
            ) {
              if (!mountedRef.current || prefersReducedMotion()) {
                stopStringTune()
              }
              return
            }
            rescanStringTune()
          })
          .catch(() => {
            /* Static CSS composition remains the fallback */
          })
      },
      { timeout: 2000 }
    )

    return () => {
      const cancel = (window as unknown as { cancelIdleCallback?: (h: number) => void })
        .cancelIdleCallback
      if (cancel) cancel(handle as number)
      else window.clearTimeout(handle as number)
    }
  }, [])

  /* A new route is a new DOM tree; the runtime has to find its elements.
     Deferred a frame so React has committed before the scan runs. */
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (!mountedRef.current || prefersReducedMotion()) return
      rescanStringTune()
    }, 60)
    return () => window.clearTimeout(t)
  }, [pathname])

  /* Dynamic reduced-motion preference changes: tear down immediately if the
     reader enables reduced motion mid-session, or boot/rescan if disabled. */
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (e?: MediaQueryListEvent) => {
      const myGen = ++transitionGenRef.current
      const isReduced = typeof e?.matches === 'boolean' ? e.matches : mql.matches
      if (isReduced || prefersReducedMotion()) {
        stopStringTune()
        return
      }
      void startStringTune()
        .then((tune) => {
          if (
            !mountedRef.current ||
            myGen !== transitionGenRef.current ||
            !tune ||
            mql.matches ||
            prefersReducedMotion()
          ) {
            if (!mountedRef.current || mql.matches || prefersReducedMotion()) {
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
    []
  )

  return null
}
