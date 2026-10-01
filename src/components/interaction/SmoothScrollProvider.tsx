import { useEffect, type ReactNode } from 'react'

/**
 * SmoothScrollProvider — Lenis smooth scroll provider that coordinates scroll state.
 * Gracefully bypassed under reduced motion or touch devices.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Check if reduced motion or coarse pointer is active
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    const touchDevice = window.matchMedia?.('(pointer: coarse)')?.matches
    if (reduceMotion || touchDevice) return

    let lenis: any = null
    let rafId: number

    import('lenis').then(({ default: Lenis }) => {
      lenis = new Lenis({
        duration: 1.1,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.5,
      })

      function raf(time: number) {
        lenis.raf(time)
        rafId = requestAnimationFrame(raf)
      }

      rafId = requestAnimationFrame(raf)
    }).catch(() => {
      // Lenis optional fallback to browser native smooth scroll
    })

    return () => {
      if (lenis) {
        lenis.destroy()
      }
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [])

  return <>{children}</>
}
