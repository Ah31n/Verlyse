import { useEffect, useState, type RefObject } from 'react'

/**
 * Robust "near the viewport" detection.
 * IntersectionObserver can fail to fire in embedded previews, scaled viewers
 * and older engines — if it does, content would stay permanently hidden.
 * This hook guarantees a reveal by sweeping the element against the viewport
 * on scroll/resize/timeout, so content is never lost.
 */
export function useNearViewport(ref: RefObject<HTMLElement | null>, margin = 1.15): boolean {
  const [near, setNear] = useState(false)

  useEffect(() => {
    if (near) return
    const el = ref.current
    if (!el) return

    let done = false
    const check = () => {
      if (done) return
      const r = el.getBoundingClientRect()
      if (r.top < window.innerHeight * margin && r.bottom > -80) {
        done = true
        setNear(true)
      }
    }

    check()
    const t = setTimeout(check, 500)
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    return () => {
      clearTimeout(t)
      window.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
  }, [ref, near, margin])

  return near
}
