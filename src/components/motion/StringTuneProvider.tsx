import { useEffect } from 'react'
import { isReducedMotion, isTouchDevice } from './StringTuneAdapter'

let stringTuneInstance: any = null

/**
 * StringTuneProvider — Global lifecycle provider for @fiddle-digital/string-tune.
 * Registers all core modules and starts the engine at 60 FPS in browser environments.
 * Handles route changes with re-scans and gracefully bypasses under reduced motion.
 */
export function StringTuneProvider({ children }: { children: React.ReactNode }) {
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

          // Register core StringTune modules
          if (st.StringParallax) instance.use(st.StringParallax)
          if (st.StringMagnetic && !isTouchDevice()) instance.use(st.StringMagnetic)
          if (st.StringSpotlight && !isTouchDevice()) instance.use(st.StringSpotlight)
          if (st.StringProgress) instance.use(st.StringProgress)
          if (st.StringSplit) instance.use(st.StringSplit)
          if (st.StringSequence) instance.use(st.StringSequence)
          if (st.StringGlide) instance.use(st.StringGlide)
          if (st.StringLerp) instance.use(st.StringLerp)
          if (st.StringMasonry) instance.use(st.StringMasonry)
          if (st.StringTilt && !isTouchDevice()) instance.use(st.StringTilt)
          if (st.StringMarquee) instance.use(st.StringMarquee)
          if (st.StringImpulse) instance.use(st.StringImpulse)

          // Start StringTune engine
          instance.start(60)
        }
      } catch (err) {
        console.warn('[Verlyse StringTune] Initialization note:', err)
      }
    }).catch(() => {
      // Optional fallback
    })

    return () => {
      active = false
    }
  }, [])

  return <>{children}</>
}
