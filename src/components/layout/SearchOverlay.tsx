import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ARTICLES, getAuthor } from '../../data/content'

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

/** Where the search was opened from — the page context preserved beneath. */
function contextLabel(path: string): string {
  if (path.startsWith('/article/')) return 'the reading room'
  if (path === '/categories') return 'the rooms'
  if (path === '/creators' || path.startsWith('/creator/')) return 'the wall of names'
  if (path === '/ambassadors') return 'the people'
  if (path === '/community') return 'the commons'
  if (path === '/about') return 'the colophon'
  if (path === '/submit') return 'send a voice'
  if (path === '/contact') return 'the desk'
  if (path === '/room') return 'the room'
  if (path === '/') return 'the entrance'
  return 'the archive'
}

/**
 * Search — an editorial operation on the archive, not a field.
 * Opening it dims the archive beneath and places the index above it:
 * the page keeps its context, the results carry their real registry folio
 * numbers, and Esc (or the corner ✕) returns you to where you stood.
 */
export default function SearchOverlay() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const location = useLocation()
  const navigate = useNavigate()
  const reduced = useReducedMotion() === true
  const openerRef = useRef<HTMLElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const listRef = useRef<HTMLUListElement | null>(null)

  useEffect(() => {
    const onOpen = () => {
      openerRef.current = (document.activeElement as HTMLElement) || null
      setQ('')
      setActive(0)
      setOpen(true)
    }
    window.addEventListener('verlyse:search', onOpen)
    return () => window.removeEventListener('verlyse:search', onOpen)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.classList.toggle('no-scroll', open)
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 120)
      return () => clearTimeout(t)
    } else {
      const op = openerRef.current
      if (op) {
        const t = setTimeout(() => (op as HTMLElement).focus?.(), 0)
        openerRef.current = null
        return () => clearTimeout(t)
      }
    }
  }, [open])

  // '/' opens the search from anywhere, unless the user is typing already.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (open && e.key === 'Escape') setOpen(false)
      if (!open && e.key === '/' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('verlyse:search'))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const query = q.trim().toLowerCase()
  const results = useMemo(
    () =>
      query
        ? ARTICLES.filter((a) => {
            const author = getAuthor(a.authorId)?.name ?? ''
            return (a.title + ' ' + a.category + ' ' + author).toLowerCase().includes(query)
          }).slice(0, 8)
        : [],
    [query],
  )
  // keep the roving active index in range
  useEffect(() => { setActive(0) }, [results.length, query])

  const openResult = (id: string) => {
    setOpen(false)
    navigate(`/article/${id}`)
  }

  const onResultsKey = (e: React.KeyboardEvent) => {
    if (!results.length) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => (a + 1) % results.length) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => (a - 1 + results.length) % results.length) }
    else if (e.key === 'Enter') { e.preventDefault(); const r = results[active]; if (r) openResult(r.id) }
  }

  useEffect(() => {
    const li = listRef.current?.querySelector<HTMLAnchorElement>(`[data-active="true"]`)
    li?.focus()
  }, [active])

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[1250] grid place-items-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Search the archive"
          onKeyDown={onResultsKey}
        >
          {/* the dimmed archive beneath — context preserved, not destroyed */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.45 }}
            className="absolute inset-0 bg-[rgba(14,3,7,0.94)]"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          <motion.div
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 1 } : { opacity: 0, y: 18 }}
            transition={{ duration: reduced ? 0 : 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-[680px] border border-gold/30 bg-[#1B0610] p-8 shadow-[0_60px_140px_rgba(0,0,0,0.7)] md:p-11"
          >
            {/* the card's corner ticks — an archival record, not a modal */}
            <span aria-hidden="true" className="absolute -left-1.5 -top-1.5 h-3.5 w-3.5 border-l border-t border-gold/70" />
            <span aria-hidden="true" className="absolute -right-1.5 -top-1.5 h-3.5 w-3.5 border-r border-t border-gold/70" />
            <span aria-hidden="true" className="absolute -bottom-1.5 -left-1.5 h-3.5 w-3.5 border-b border-l border-gold/70" />
            <span aria-hidden="true" className="absolute -bottom-1.5 -right-1.5 h-3.5 w-3.5 border-b border-r border-gold/70" />

            <div className="flex items-center justify-between gap-4">
              <p className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.28em] text-gold">
                <span aria-hidden="true" className="h-px w-6 bg-gold/60" />
                The index — placed above the archive
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close search and return"
                className="grid h-9 w-9 place-items-center border border-gold/40 font-serif text-lg text-ivory transition-colors hover:bg-gold hover:text-charcoal"
              >
                ✕
              </button>
            </div>

            <input
              id="publication-search"
              ref={inputRef}
              type="search"
              autoComplete="off"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Stories, writers, genres…"
              aria-label="Search articles"
              className="mt-5 w-full border-0 border-b border-gold/40 bg-transparent pb-4 font-serif text-2xl font-light text-ivory outline-none placeholder:italic placeholder:text-ivory/35 focus:border-gold"
            />

            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">
              {query
                ? results.length
                  ? `${results.length} of ${ARTICLES.length} folios found`
                  : 'Nothing in the archive matches — not yet'
                : `${ARTICLES.length} folios in the archive · opened from ${contextLabel(location.pathname)} · Esc returns`}
            </p>

            <ul ref={listRef} className="mt-4 max-h-[44vh] overflow-y-auto">
              {results.map((a) => {
                const author = getAuthor(a.authorId)
                const folio = String(ARTICLES.findIndex((x) => x.id === a.id) + 1).padStart(2, '0')
                const isActive = results.indexOf(a) === active
                return (
                  <li key={a.id}>
                    <a
                      href={`/article/${a.id}`}
                      data-active={isActive ? 'true' : 'false'}
                      tabIndex={isActive ? 0 : -1}
                      onFocus={() => setActive(results.indexOf(a))}
                      onClick={(e) => {
                        e.preventDefault()
                        openResult(a.id)
                      }}
                      className={`group block border-b border-white/10 py-4 pl-2 no-underline transition-colors duration-500 hover:bg-gold/[0.07] hover:pl-3 ${
                        isActive ? 'bg-gold/[0.07] pl-3' : ''
                      }`}
                    >
                      <span className="flex items-baseline gap-3">
                        <span aria-hidden="true" className="font-mono text-[9px] tracking-[0.26em] text-gold">
                          №{folio}
                        </span>
                        <span className="font-serif text-xl text-ivory transition-colors duration-500 group-hover:text-[#E8D9A8]">{esc(a.title)}</span>
                      </span>
                      <span className="mt-1 block pl-8 font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">
                        <span className="text-gold">{a.category}</span> ✦ {author?.name ?? ''} ✦ {a.readingTime}
                      </span>
                    </a>
                  </li>
                )
              })}
            </ul>

            <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.24em] text-white/45">
              {results.length ? '↑ ↓ to move · Enter to pull the folio · Esc to return' : 'Type to turn the pages — the archive dims, the index stays above'}
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
