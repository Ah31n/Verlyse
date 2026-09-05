import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'

interface SavedItem {
  id: string
  title: string
  category: string
  author?: string
}

const KEY = 'verlyse-saved'

export function openSaved() {
  window.dispatchEvent(new CustomEvent('verlyse:saved'))
}

export function toggleSaved(item: SavedItem): boolean {
  let saved: SavedItem[] = []
  try { saved = JSON.parse(localStorage.getItem(KEY) || '[]') } catch { saved = [] }
  const exists = saved.some((s) => s.id === item.id)
  saved = exists ? saved.filter((s) => s.id !== item.id) : [...saved, item]
  try { localStorage.setItem(KEY, JSON.stringify(saved)) } catch {}
  window.dispatchEvent(new CustomEvent('verlyse:saved-updated'))
  return !exists
}

export function isSaved(id: string): boolean {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]').some((s: SavedItem) => s.id === id) } catch { return false }
}

/** Saved-stories drawer — slide-in from the right, localStorage-backed. */
export default function SavedDrawer() {
  const [open, setOpen] = useState(false)
  const [saved, setSaved] = useState<SavedItem[]>([])
  const closeRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const load = () => {
      try { setSaved(JSON.parse(localStorage.getItem(KEY) || '[]')) } catch { setSaved([]) }
    }
    load()
    const onOpen = () => {
      openerRef.current = (document.activeElement as HTMLElement) || null
      setOpen(true)
    }
    const onUpdate = () => load()
    window.addEventListener('verlyse:saved', onOpen)
    window.addEventListener('verlyse:saved-updated', onUpdate)
    return () => {
      window.removeEventListener('verlyse:saved', onOpen)
      window.removeEventListener('verlyse:saved-updated', onUpdate)
    }
  }, [])

  // the element that opened the drawer, so focus can be restored on close
  const openerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    document.body.classList.toggle('no-scroll', open)
    if (!open) {
      const op = openerRef.current
      if (op) {
        const t = setTimeout(() => (op as HTMLElement).focus?.(), 0)
        openerRef.current = null
        return () => clearTimeout(t)
      }
    }
  }, [open])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (open && event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    if (open) {
      const t = window.setTimeout(() => closeRef.current?.focus(), 0)
      return () => {
        window.clearTimeout(t)
        window.removeEventListener('keydown', onKey)
      }
    }
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const remove = (id: string) => {
    const next = saved.filter((s) => s.id !== id)
    try { localStorage.setItem(KEY, JSON.stringify(next)) } catch {}
    setSaved(next)
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[1250]" role="dialog" aria-modal="true" aria-label="Saved stories">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-[rgba(14,3,7,0.9)]"
            onClick={() => setOpen(false)}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-0 right-0 top-0 flex w-full max-w-[420px] flex-col border-l border-gold/30 bg-gradient-to-b from-wine-deep to-[#2A0811] p-8 shadow-[-40px_0_90px_rgba(0,0,0,0.5)]"
            aria-labelledby="saved-title"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <h3 id="saved-title" className="flex items-center gap-3 font-serif text-2xl font-light text-ivory">
                <span aria-hidden="true" className="inline-block h-5 w-3 rounded-[2px] border border-gold/60 bg-[#3B0D17]" />
                The bookmarks
              </h3>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close saved stories"
                className="grid h-9 w-9 place-items-center border border-gold/40 font-serif text-lg text-ivory transition-colors hover:bg-gold hover:text-charcoal"
              >
                ✕
              </button>
            </div>

            <ul className="mt-4 flex-1 overflow-y-auto">
              {saved.length === 0 && (
                <li className="py-10 text-center font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">
                  Nothing saved yet — bookmark a story and it will wait for you here.
                </li>
              )}
              {saved.map((s) => (
                <li key={s.id} className="group flex items-center gap-4 border-b border-white/10 py-4">
                  <span aria-hidden="true" className="inline-block h-9 w-2 shrink-0 self-stretch rounded-[2px] border border-gold/50 bg-[#3B0D17] transition-colors duration-500 group-hover:bg-gold/40" />
                  <div className="min-w-0 flex-1">
                    <Link to={`/article/${s.id}`} onClick={() => setOpen(false)} className="font-serif text-lg leading-snug text-ivory no-underline transition-colors duration-500 hover:italic hover:text-[#E8D9A8]">
                      {s.title}
                    </Link>
                    <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.30em] text-white/55">
                      {s.category}{s.author ? ` ✦ ${s.author}` : ''}
                    </p>
                  </div>
                  <span aria-hidden="true" className="font-mono text-[9px] tracking-[0.26em] text-gold/50">
                    {String(saved.indexOf(s) + 1).padStart(2, '0')}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(s.id)}
                    aria-label={`Remove ${s.title}`}
                    className="grid h-8 w-8 shrink-0 place-items-center border border-white/25 font-serif text-white/55 transition-colors hover:border-gold hover:bg-gold hover:text-charcoal"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}
