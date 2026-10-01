import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { isReducedMotion, isTouchDevice } from './StringTuneAdapter'

let stringTuneInstance: any = null

/**
 * Rescan the DOM for newly mounted [string] elements after route change or DOM mutation.
 */
export function rescanStringTune() {
  if (typeof window === 'undefined' || !stringTuneInstance || isReducedMotion()) return
  try {
    if (typeof stringTuneInstance.queueResize === 'function') {
      stringTuneInstance.queueResize(true, 'route-change')
    }
    if (typeof stringTuneInstance.debouncedResize === 'function') {
      stringTuneInstance.debouncedResize('route-change')
    }
  } catch (err) {
    // Non-blocking
  }
}

/**
 * StringTuneProvider — Global lifecycle provider for @fiddle-digital/string-tune.
 * Registers active production modules and coordinates route-safe re-scanning.
 */
export function StringTuneProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const initialMount = useRef(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (isReducedMotion()) return

    let active = true

    import('@fiddle-digital/string-tune').then((st) => {
      if (!active) return

      try {
        if (!stringTuneInstance && st.StringTune) {
          const instance = st.StringTune.getInstance()
          stringTuneInstance = instance

          // Register active production StringTune modules
          if (st.StringParallax) instance.use(st.StringParallax)
          if (st.StringMagnetic && !isTouchDevice()) instance.use(st.StringMagnetic)
          if (st.StringSpotlight && !isTouchDevice()) instance.use(st.StringSpotlight)
          if (st.StringProgress) instance.use(st.StringProgress)
          if (st.StringSplit) instance.use(st.StringSplit)
          if (st.StringSequence) instance.use(st.StringSequence)
          if (st.StringMasonry) instance.use(st.StringMasonry)
          if (st.StringTilt && !isTouchDevice()) instance.use(st.StringTilt)
          if (st.StringLazy) instance.use(st.StringLazy)
          if (st.StringMarquee) instance.use(st.StringMarquee)

          // Start StringTune engine at 60 FPS
          instance.start(60)
        }

        // Trigger immediate scan after start
        if (stringTuneInstance) {
          rescanStringTune()
        }
      } catch (err) {
        console.warn('[Verlyse StringTune] Initialization note:', err)
      }
    }).catch(() => {
      // Graceful fallback
    })

    return () => {
      active = false
    }
  }, [])

  // On route change, notify StringTune to measure and bind newly mounted elements
  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false
      return
    }
    const timer = setTimeout(() => {
      rescanStringTune()
    }, 120)
    return () => clearTimeout(timer)
  }, [location.pathname, location.search])

  return <>{children}</>
}
