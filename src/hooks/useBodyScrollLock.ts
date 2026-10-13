import { useEffect } from 'react'

/**
 * Hold the page still while a modal surface is open.
 *
 * The search overlay, the saved drawer and the mobile menu are all
 * `role="dialog" aria-modal="true"` with proper focus traps — but none of
 * them stopped the page scrolling underneath. On a phone, a touch-drag
 * anywhere on the backdrop moved the archive behind the dialog, which reads
 * as the page falling apart rather than as a layer above it.
 *
 * `ArtGallery` already did this correctly; this is that behaviour lifted out
 * so all four surfaces share one implementation and one cleanup path.
 *
 * Scrollbar-width compensation prevents the horizontal reflow that would
 * otherwise nudge the whole publication left as the bar disappears.
 */
export function useBodyScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return
    const { body, documentElement } = document
    const previousOverflow = body.style.overflow
    const previousPaddingRight = body.style.paddingRight

    const scrollbar = window.innerWidth - documentElement.clientWidth
    body.style.overflow = 'hidden'
    if (scrollbar > 0) {
      const current = parseFloat(window.getComputedStyle(body).paddingRight) || 0
      body.style.paddingRight = `${current + scrollbar}px`
    }

    return () => {
      body.style.overflow = previousOverflow
      body.style.paddingRight = previousPaddingRight
    }
  }, [locked])
}
