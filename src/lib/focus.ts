/* ------------------------------------------------------------------ */
/* Focus trapping for the publication's dialogs — the search index,    */
/* the bookmarks drawer, the full-screen menu. Escape already closes   */
/* each of them; this keeps Tab inside them while they are open, so a   */
/* keyboard reader never wanders into the page behind the veil.         */
/* ------------------------------------------------------------------ */

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Attach to a dialog's container element while it is open. Returns a cleanup. */
export function trapFocus(container: HTMLElement | null): () => void {
  if (!container) return () => {}
  const onKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return
    const nodes = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.offsetParent !== null || el === document.activeElement,
    )
    if (nodes.length === 0) return
    const first = nodes[0]
    const last = nodes[nodes.length - 1]
    const active = document.activeElement as HTMLElement | null
    if (e.shiftKey && (active === first || !container.contains(active))) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && (active === last || !container.contains(active))) {
      e.preventDefault()
      first.focus()
    }
  }
  container.addEventListener('keydown', onKey)
  return () => container.removeEventListener('keydown', onKey)
}
