// The Keeping Room — Verlyse Media's spatial editorial archive.
// Penpot (Phase 19) is the visual source of truth. PULL -> READ -> RETURN.
// Isolated: reads the canonical registry; never modifies ArticleDetail or any
// protected system. Reading hands off to /article/:id; the canonical routes
// (search, people, creators) stay canonical — the room only links into them.
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Plate from './Plate'
import BrassThread from './BrassThread'
import {
  FOLIOS, FEATURED, NEXT_FOLIO, CATEGORIES, foliosByAuthor, searchFolios,
} from '../../lib/room/folios'
import { getAuthor } from '../../data/content'
import {
  type RoomState, STATE_HINT,
} from '../../lib/room/state'
import {
  plateTransform, layoutForWidth, type Layout, type RoomTransformContext,
} from '../../lib/room/geometry'

const count = FOLIOS.length
const READ_KEY = 'verlyse-room-read'
const RETURN_KEY = 'verlyse-room-return'

function loadSet(key: string): Set<string> {
  try {
    const raw = sessionStorage.getItem(key)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    return new Set()
  }
}

// The closing pull-quote (frame 07) is the story's own final line — real
// registry text, never invented. Falls back to the full excerpt if it can't
// be split into sentences.
function closingLine(excerpt: string): string {
  const sentences = excerpt.split(/(?<=[.!?…])\s+/).filter(Boolean)
  return sentences.length > 1 ? sentences[sentences.length - 1] : excerpt
}

export default function Room() {
  const navigate = useNavigate()
  const reduced = useReducedMotion() === true
  const [state, setState] = useState<RoomState>('arrival')
  const [layout, setLayout] = useState<Layout>(
    typeof window !== 'undefined' ? layoutForWidth(window.innerWidth) : 'desktop',
  )
  // Desktop/tablet open on the primary folio №01; the mobile composition puts
  // the newest folio №19 in hand (Penpot frame 15).
  const [focus, setFocus] = useState<number>(
    typeof window !== 'undefined' && layoutForWidth(window.innerWidth) === 'mobile'
      ? NEXT_FOLIO.index
      : FEATURED.index,
  )
  const [readSet, setReadSet] = useState<Set<string>>(() => loadSet(READ_KEY))
  const [category, setCategory] = useState<string | null>(null)
  const [dossierAuthor, setDossierAuthor] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const booted = useRef(false)
  // the folio most recently read — so NEXT can step back to its Ending beat
  const lastRead = useRef<number>(FEATURED.index)

  // On mount, a reader returning from the article lands in the ENDING beat
  // (the room reforms); from there NEXT or RETURN completes the loop.
  useEffect(() => {
    if (booted.current) return
    booted.current = true
    try {
      const ret = sessionStorage.getItem(RETURN_KEY)
      if (ret) {
        const { focus: f } = JSON.parse(ret) as { focus: number }
        const fIdx = typeof f === 'number' ? f : FEATURED.index
        setFocus(fIdx)
        lastRead.current = fIdx
        setState('ending')
        sessionStorage.removeItem(RETURN_KEY)
      }
    } catch {
      /* ignore malformed marker */
    }
  }, [])

  useEffect(() => {
    const onResize = () => setLayout(layoutForWidth(window.innerWidth))
    const previousOverflowX = document.body.style.overflowX
    document.body.style.overflowX = 'hidden'
    window.addEventListener('resize', onResize)
    onResize()
    return () => {
      document.body.style.overflowX = previousOverflowX
      window.removeEventListener('resize', onResize)
    }
  }, [])

  useEffect(() => {
    if (searchOpen) {
      const t = window.setTimeout(() => searchRef.current?.focus(), 60)
      return () => window.clearTimeout(t)
    }
  }, [searchOpen])

  const focusedFolio = FOLIOS[focus]

  const go = useCallback((s: RoomState) => setState(s), [])

  // NEXT on the thread offers the newest folio (№19); move attention to it.
  const goNext = useCallback(() => {
    setFocus(NEXT_FOLIO.index)
    setState('next')
  }, [])

  const markRead = useCallback((id: string) => {
    setReadSet((prev) => {
      const next = new Set(prev)
      next.add(id)
      try { sessionStorage.setItem(READ_KEY, JSON.stringify([...next])) } catch { /* noop */ }
      return next
    })
  }, [])

  const select = useCallback((i: number) => {
    setFocus(i)
    // In the spatial discovery layers, selecting a neighbour draws attention to
    // it without changing state; in discovery the room deepens toward focus.
    setState((s) => {
      if (s === 'arrival' || s === 'discovery') return 'focus'
      return s
    })
  }, [])

  const enter = useCallback((i: number) => {
    setFocus(i)
    lastRead.current = i
    markRead(FOLIOS[i].id)
    setState('entry')
    try { sessionStorage.setItem(RETURN_KEY, JSON.stringify({ focus: i })) } catch { /* noop */ }
    // entry: the wine threshold holds briefly, then hands off to the canonical article
    window.setTimeout(() => navigate(`/article/${FOLIOS[i].id}`), reduced ? 80 : 950)
  }, [navigate, reduced, markRead])

  const openDossier = useCallback((authorId: string) => {
    setDossierAuthor(authorId)
    const first = FOLIOS.find((f) => f.authorId === authorId)
    if (first) setFocus(first.index)
    setState('dossier')
  }, [])

  const openCategory = useCallback((cat: string) => {
    setCategory(cat)
    const first = FOLIOS.find((f) => f.category === cat)
    if (first) setFocus(first.index)
    setState('category')
  }, [])

  const closeLayer = useCallback(() => {
    setSearchOpen(false)
    setCategory(null)
    setDossierAuthor(null)
    setState((s) => (s === 'category' || s === 'dossier' ? 'discovery' : s))
  }, [])

  // keyboard: arrows/enter/esc drive the slice; "/" opens search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (searchOpen) { setSearchOpen(false); return }
        if (state === 'category' || state === 'dossier') { closeLayer(); return }
        if (state === 'discovery' || state === 'focus') setState('arrival')
        else if (state === 'settle') setState('focus')
        else if (state === 'next') { setFocus(lastRead.current); setState('ending') }
        else if (state === 'return' || state === 'ending') setState('discovery')
        return
      }
      if (searchOpen) {
        if (e.key === 'Enter') {
          const r = searchFolios(query)
          if (r[0]) { setSearchOpen(false); enter(r[0].index) }
        }
        return
      }
      if (e.key === '/' && (state === 'discovery' || state === 'arrival')) {
        e.preventDefault(); setSearchOpen(true); return
      }
      if (e.key === 'Enter') {
        if (state === 'arrival') { setState('discovery'); return }
        if (state === 'discovery') { setState('focus'); return }
        if (state === 'focus') { enter(focus); return }
        if (state === 'settle') { enter(focus); return }
        if (state === 'ending') { goNext(); return }
        if (state === 'next') { enter(focus); return }
        if (state === 'category') { setState('focus'); return }
        if (state === 'dossier') { enter(focus); return }
      }
      if (e.key === 'ArrowRight') { setFocus((f) => Math.min(count - 1, f + 1)); if (state === 'arrival') setState('discovery') }
      if (e.key === 'ArrowLeft') setFocus((f) => Math.max(0, f - 1))
      if (e.key === 'ArrowDown' && state === 'discovery') setState('focus')
      if (e.key === 'ArrowUp' && (state === 'focus' || state === 'settle')) setState('discovery')
      if (e.key === 'ArrowDown' && state === 'focus') setState('settle')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [state, focus, enter, reduced, searchOpen, query, category, closeLayer])

  const roomProgress = useMemo(() => STATE_INDEX[state] ?? 1, [state])

  // transform context for discovery-layer states
  const ctx = useMemo<RoomTransformContext>(() => {
    if (state === 'category' && category) {
      const set = new Set<number>()
      FOLIOS.forEach((f, i) => { if (f.category === category) set.add(i) })
      return { categorySet: set }
    }
    if (state === 'dossier' && dossierAuthor) {
      const authorSet = new Set<number>()
      const authorRank: Record<number, number> = {}
      let rank = 0
      FOLIOS.forEach((f, i) => {
        if (f.authorId === dossierAuthor) { authorSet.add(i); authorRank[i] = rank++; }
      })
      return { authorSet, authorRank, authorCount: rank }
    }
    return {}
  }, [state, category, dossierAuthor])

  const searchResults = useMemo(() => (searchOpen ? searchFolios(query) : []), [searchOpen, query])
  const dossierAuthorRecord = dossierAuthor ? getAuthor(dossierAuthor) : null
  const dossierFolios = dossierAuthor ? foliosByAuthor(dossierAuthor) : []

  return (
    <main
      className="room relative min-h-[100svh] w-full touch-pan-y overflow-x-clip overflow-y-auto bg-charcoal text-ivory lg:h-screen lg:overflow-hidden"
      style={{ perspective: reduced ? undefined : '1600px' }}
      aria-label="The Keeping Room — a Verlyse Media spatial archive"
    >
      {/* room atmosphere: warm vignette, no neon / particles */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 32% 18%, rgba(92,18,36,0.55) 0%, rgba(30,11,18,0.35) 38%, #161412 78%)',
        }}
      />

      <BrassThread state={state} reduced={reduced} mobile={layout === 'mobile'} />

      {/* 3D stage */}
      {/* Mobile gets real document height instead of a clipped desktop stage. */}
      <div aria-hidden="true" className="h-[32svh] md:hidden" />
      <div
        className="absolute inset-0 min-h-[132svh] md:min-h-0"
        style={{ transformStyle: 'preserve-3d', perspective: reduced ? undefined : '1600px' }}
      >
        {FOLIOS.map((f, i) => (
          <Plate
            key={f.id}
            folio={f}
            state={state}
            reduced={reduced}
            read={readSet.has(f.id)}
            transform={plateTransform(state, i, focus, count, layout, ctx)}
            onSelect={select}
            onEnter={enter}
            onPull={() => setState('settle')}
            onBack={() => setState('discovery')}
          />
        ))}
      </div>

      {/* ---- persistent editorial chrome (hidden during the full-screen wine
            takeover beats — entry & ending carry their own masthead) ---- */}
      {state !== 'entry' && state !== 'ending' && (
      <header className="pointer-events-none absolute inset-x-0 top-0 z-[400] flex items-start justify-between p-5 md:p-10">
        <div>
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.28em] text-gold md:text-[11px] md:tracking-[0.32em]">
            Verlyse Media
          </p>
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.28em] text-gold/70 md:text-[11px] md:tracking-[0.32em]">
            The Keeping Room
          </p>
        </div>
        <nav className="pointer-events-auto flex gap-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ivory/70 md:gap-5 md:text-[11px] md:tracking-[0.2em]">
          <button type="button" onClick={() => setSearchOpen(true)} className="transition-colors hover:text-gold">
            Search
          </button>
          <Link to="/ambassadors" className="transition-colors hover:text-gold">People</Link>
          <Link to="/articles" className="transition-colors hover:text-gold">Articles</Link>
        </nav>
      </header>
      )}

      {/* ---- state-specific content ---- */}
      <AnimatePresence mode="wait">
        {state === 'arrival' && (
          <Overlay key="arrival">
            <p className="font-mono text-[12px] font-medium uppercase tracking-[0.32em] text-gold">
              A spatial archive of {count} voices
            </p>
            <h1 className="mt-4 max-w-[10ch] font-serif text-[clamp(2.7rem,13vw,7.5rem)] font-semibold leading-[0.94] md:max-w-none">
              The Keeping<br />Room
            </h1>
            <p className="mt-6 max-w-xl font-serif text-[clamp(1.1rem,2vw,1.5rem)] italic leading-snug text-cream/90">
              Enter quietly. Pull a plate when a title calls to you. Read, then return it
              to the thread.
            </p>
            <div className="mt-8 h-px w-64 bg-gold" aria-hidden />
            <button
              type="button"
              onClick={() => go('discovery')}
              className="btn btn-gold mt-8 pointer-events-auto"
            >
              Enter the archive
            </button>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.28em] text-ivory/50">
              Press Enter · PULL → READ → RETURN
            </p>
          </Overlay>
        )}

        {state === 'ending' && (
          /* frame 07 — the wine threshold closes around the story; room re-forms */
          <motion.div
            key="ending"
            className="absolute inset-0 z-[480] flex items-center justify-center bg-[#2A0F18] px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.6 }}
            aria-live="polite"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute left-[6vw] top-1/2 -translate-y-1/2 select-none font-serif text-[16rem] font-semibold leading-none text-[#F8F6F2] opacity-[0.04] md:text-[22rem]"
            >
              {focusedFolio.folio}
            </span>
            <div className="relative w-full max-w-2xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#D9B978]">
                Folio №{focusedFolio.folio} · Close
              </p>
              <h2 className="mt-5 font-serif text-[clamp(2rem,5vw,3.6rem)] font-semibold leading-tight text-ivory">
                {focusedFolio.title}
              </h2>
              <p className="mt-10 max-w-xl font-serif text-[clamp(1.3rem,2.6vw,1.9rem)] italic leading-snug text-cream/90">
                {closingLine(focusedFolio.excerpt)}
              </p>
              <div className="mt-8 h-px w-72 bg-[#B89146]" aria-hidden />
              <p className="mt-5 font-mono text-[13px] uppercase tracking-[0.14em] text-[#D9B978]">
                — {focusedFolio.author}
              </p>
              <p className="mt-14 font-mono text-[11px] uppercase tracking-[0.26em] text-ivory/45">
                The room re-forms around the plate
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-3">
                <button type="button" className="btn btn-gold pointer-events-auto" onClick={goNext}>
                  Next on the thread →
                </button>
                <button type="button" className="btn btn-ghost pointer-events-auto" onClick={() => go('return')}>
                  Return to archive
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {state === 'entry' && (
          /* frame 05 — wine threshold: room hands off into editorial reading */
          <motion.div
            key="entry"
            className="absolute inset-0 z-[500] bg-[#1E0B12]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.45, ease: 'easeIn' }}
            aria-live="polite"
          >
            <div className="absolute inset-x-0 top-0 flex items-start justify-between p-6 md:p-10">
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#D9B978]">Verlyse Media</p>
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-ivory/60">
                Folio №{focusedFolio.folio} · {focusedFolio.category.toUpperCase()}
              </p>
            </div>
            <div className="flex h-full items-center px-[8vw]">
              <div>
                <h2 className="font-serif text-[clamp(2.6rem,7vw,5.5rem)] font-semibold leading-[1.02] text-ivory">
                  {focusedFolio.title}
                </h2>
                <p className="mt-10 font-serif text-xl text-[#D9B978] md:text-2xl">{focusedFolio.author}</p>
                <p className="mt-3 font-mono text-[12px] uppercase tracking-[0.2em] text-ivory/55">
                  {focusedFolio.date} · {focusedFolio.readingTime.toUpperCase()}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- category header (state 10) ---- */}
      {state === 'category' && category && (
        <div className="pointer-events-none absolute inset-x-0 top-24 z-[360] px-6 md:px-16">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-gold">Filter the thread</p>
          <h2 className="mt-2 font-serif text-[clamp(2.2rem,5vw,3.6rem)] font-semibold leading-none">{category}</h2>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ivory/60">
            {FOLIOS.filter((f) => f.category === category).length} folios · the room never becomes a list
          </p>
          <button type="button" onClick={closeLayer} className="btn btn-ghost pointer-events-auto mt-4 !px-4 !py-2 text-[11px]">
            Clear filter ↩
          </button>
        </div>
      )}

      {/* ---- creator dossier panel (state 11) ---- */}
      {state === 'dossier' && dossierAuthorRecord && (
        <motion.aside
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: reduced ? 0 : 0.5 }}
          className="absolute left-0 top-0 z-[450] flex h-full max-h-[100svh] w-[min(420px,86vw)] flex-col overflow-y-auto bg-[#2A0F18] p-8 shadow-[40px_0_80px_rgba(0,0,0,0.5)] md:p-12"
          aria-label={`Creator dossier: ${dossierAuthorRecord.name}`}
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-gold">Contributor</p>
          <h2 className="mt-3 font-serif text-4xl font-semibold leading-tight text-ivory md:text-5xl">
            {dossierAuthorRecord.name}
          </h2>
          <div className="mt-6 h-px w-28 bg-gold" aria-hidden />
          <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.2em] text-ivory/60">
            {dossierFolios.length} folio{dossierFolios.length === 1 ? '' : 's'} on the thread
          </p>
          <ul className="mt-4 space-y-3">
            {dossierFolios.map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  onClick={() => enter(f.index)}
                  className="group block text-left"
                >
                  <span className="block font-serif text-xl text-cream group-hover:text-gold">
                    №{f.folio} · {f.title}
                  </span>
                  <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-ivory/50">
                    {f.category} · {f.readingTime}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-auto space-y-3 pt-8">
            <Link
              to={`/creator/${dossierAuthor}`}
              className="btn btn-gold pointer-events-auto block text-center"
            >
              Full profile →
            </Link>
            <button type="button" onClick={closeLayer} className="btn btn-ghost pointer-events-auto w-full">
              Back to the room
            </button>
          </div>
        </motion.aside>
      )}

      {/* ---- search overlay (state 12) ---- */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.35 }}
            className="absolute inset-0 z-[600] flex items-start justify-center overflow-y-auto bg-[#2A0F18]/90 px-6 pt-[18vh] pb-12"
            role="dialog"
            aria-modal="true"
            aria-label="Search the archive"
          >
            <div className="w-full max-w-xl">
              <p className="text-center font-mono text-[12px] uppercase tracking-[0.3em] text-gold">Search the archive</p>
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="title, author, or category…"
                aria-label="Search folios"
                className="mt-6 w-full border-b border-gold/60 bg-transparent pb-3 text-center font-serif text-3xl italic text-ivory placeholder:text-ivory/30 focus:outline-none focus:ring-0 md:text-4xl"
              />
              <ul className="mt-6 space-y-2">
                {searchResults.map((f) => (
                  <li key={f.id}>
                    <button
                      type="button"
                      onClick={() => { setSearchOpen(false); enter(f.index) }}
                      className="flex w-full items-center gap-4 rounded-sm bg-ivory px-4 py-3 text-left transition-transform hover:-translate-y-0.5"
                    >
                      <span className="font-mono text-base font-semibold text-gold">{f.folio}</span>
                      <span className="flex-1">
                        <span className="block font-serif text-xl font-semibold text-[#241D18]">{f.title}</span>
                        <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-gold/80">
                          {f.author} · {f.category}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
                {query.trim() && searchResults.length === 0 && (
                  <li className="text-center font-mono text-[11px] uppercase tracking-[0.2em] text-ivory/50">
                    No folios on the thread match “{query}”.
                  </li>
                )}
              </ul>
              <p className="mt-6 text-center font-mono text-[11px] uppercase tracking-[0.24em] text-ivory/50">
                Esc to return · or <Link to="/articles" className="text-gold underline underline-offset-4">browse the full archive</Link>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- discovery controls: categories + dossier (discovery only, so they
            never collide with the focus plate or the RETURN headline) ---- */}
      {state === 'discovery' && (
        <div className="pointer-events-none absolute inset-x-0 bottom-16 z-[400] hidden flex-col items-center gap-3 px-6 md:flex">
          <div className="pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => openDossier(FEATURED.authorId)}
              className="rounded-full border border-gold/50 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-gold/90 transition-colors hover:border-gold hover:text-gold"
            >
              Dossier · {FEATURED.author}
            </button>
            {CATEGORIES.slice(0, 5).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => openCategory(c)}
                className="rounded-full border border-ivory/20 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ivory/60 transition-colors hover:border-gold hover:text-gold"
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* discovery-layer chips should not overlay the focus/settle/next plates */}

      {/* ---- discovery hint / controls ---- */}
      {state === 'discovery' && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[400] flex flex-col items-center gap-3 p-8 pb-20 md:pb-8">
          <p className="text-center font-mono text-[10px] uppercase tracking-[0.2em] text-ivory/60 md:text-[11px] md:tracking-[0.24em]">
            <span className="md:hidden">Tap a plate · Enter pulls · Esc back</span>
            <span className="hidden md:inline">← → choose plate · Enter pull · / search · Esc back</span>
          </p>
          <button type="button" className="btn btn-seal pointer-events-auto" onClick={() => go('focus')}>
            Pull folio {focusedFolio.folio}
          </button>
        </div>
      )}

      {state === 'return' && (
        <>
          {/* frame 09 — RETURN headline over the restored thread */}
          <div className="pointer-events-none absolute inset-x-0 top-24 z-[400] px-6 md:px-16">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-gold">Return</p>
            <h2 className="mt-3 font-serif text-[clamp(2.2rem,5vw,4rem)] font-semibold leading-none text-ivory">
              Back to the archive.
            </h2>
            <div className="mt-5 h-px w-full bg-gold/40" aria-hidden />
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[400] flex flex-col items-center gap-2 p-8 pb-20 md:pb-8">
            <p className="text-center font-mono text-[10px] uppercase tracking-[0.2em] text-ivory/60 md:text-[11px] md:tracking-[0.24em]">
              {readSet.size} folio{readSet.size === 1 ? '' : 's'} read · the thread remembers
            </p>
            <button type="button" className="btn btn-ghost pointer-events-auto" onClick={() => go('discovery')}>
              Browse the threads
            </button>
          </div>
        </>
      )}

      {/* ---- footer meta (hidden during the wine takeover beats) ---- */}
      {state !== 'entry' && state !== 'ending' && (
      <footer className="pointer-events-none absolute inset-x-0 bottom-0 z-[300] flex items-end justify-between p-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ivory/40 md:p-6">
        <span>State {String(roomProgress).padStart(2, '0')} · {STATE_HINT[state]}</span>
        <span className="hidden md:inline">Folio {focusedFolio.folio} / {String(count).padStart(2, '0')}</span>
      </footer>
      )}
    </main>
  )
}

const STATE_INDEX: Partial<Record<RoomState, number>> = {
  arrival: 1, discovery: 2, focus: 3, settle: 4, entry: 5,
  ending: 7, next: 8, return: 9, category: 10, dossier: 11,
}

function Overlay({ children, align = 'center' }: { children: ReactNode; align?: 'center' | 'bottom' }) {
  const pos =
    align === 'bottom'
      ? 'inset-x-0 bottom-24 items-center pb-6 text-center'
      : 'inset-0 items-center justify-center px-6 text-center md:items-start md:justify-center md:pl-[8vw] md:pr-0 md:text-left'
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`pointer-events-none absolute z-[350] flex flex-col ${pos}`}
    >
      <div className="max-w-3xl px-6 md:px-0">{children}</div>
    </motion.div>
  )
}
