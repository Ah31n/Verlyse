import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { rescanStringTune, startStringTune, stopStringTune } from './runtime'

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

  useEffect(() => {
    let cancelled = false
    const idle =
      (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number })
        .requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 400))

    const handle = idle(() => {
      if (!cancelled) void startStringTune()
    }, { timeout: 2000 })

    return () => {
      cancelled = true
      const cancel = (window as unknown as { cancelIdleCallback?: (h: number) => void }).cancelIdleCallback
      if (cancel) cancel(handle as number)
      else window.clearTimeout(handle as number)
    }
  }, [])

  /* A new route is a new DOM tree; the runtime has to find its elements.
     Deferred a frame so React has committed before the scan runs. */
  useEffect(() => {
    const t = window.setTimeout(() => rescanStringTune(), 60)
    return () => window.clearTimeout(t)
  }, [pathname])

  useEffect(() => () => stopStringTune(), [])

  return null
}
