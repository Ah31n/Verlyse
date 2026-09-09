/* ------------------------------------------------------------------ */
/* THE INTRO — one small state the preloader and the cover share.     */
/*                                                                    */
/* The entrance may only ever hold the reader once per visit: the     */
/* first arrival in a browsing session gets the full sequence, every  */
/* return gets the cover at rest. The Skip control resolves the same  */
/* flag the timer does, and subscribers (the cover timeline) drop     */
/* their delays the moment the intro is dismissed — so skipping never */
/* leaves a half-animated masthead behind.                            */
/* ------------------------------------------------------------------ */

const KEY = 'verlyse:intro-seen'
let resolved = false
const listeners = new Set<() => void>()

/** Has the intro already been played or dismissed in this browsing session? */
export function introSeen(): boolean {
  if (resolved) return true
  try {
    return sessionStorage.getItem(KEY) === '1'
  } catch {
    /* private mode / disabled storage — treat as unseen, never throw */
    return false
  }
}

export function markIntroSeen(): void {
  resolved = true
  try {
    sessionStorage.setItem(KEY, '1')
  } catch {
    /* storage unavailable — the in-memory flag still prevents a repeat */
  }
  listeners.forEach((cb) => cb())
}

/** Subscribe to the intro being resolved (finished or skipped). */
export function onIntroResolved(cb: () => void): () => void {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

/** The skip control — resolves the intro immediately, everywhere. */
export function skipIntro(): void {
  markIntroSeen()
  window.dispatchEvent(new CustomEvent('verlyse:intro-skip'))
}
