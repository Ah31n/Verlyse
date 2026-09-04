import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSeo } from '../hooks/useSeo'
import { getAuthor, ARTICLES } from '../data/content'

/**
 * THE ARCHIVE — the publication's physical archive, from the approved
 * Penpot board P27 / THE ARCHIVE.
 *
 * BACK  · wine hall with shelf depths (hairline shelf rows receding)
 * MID   · SEARCH THE ARCHIVE… + category rail (seven real departments)
 * FRONT · the nineteen folios as shelf spines, registry order, №01 SELECTED
 *
 * States: REST · FOCUS (hover/keyboard lifts the folio) · SELECTED (№ NN
 * carries “SELECTED — OPEN FOLIO →”) · FILTERED (rail/search: matching folios
 * stay bright, the rest recede — never a conventional list) · SEARCH ·
 * RETURN (All / Esc restores all nineteen).
 * Keyboard: ← → ↑ ↓ move selection · Enter opens · Esc returns to REST.
 */
function Archive() {
  useSeo({
    path: '/articles',
    title: 'Articles',
    description: 'The Verlyse Media archive — nineteen features, nineteen credited voices.',
  })

  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('All')
  const [sel, setSel] = useState(0)
  const railRef = useRef<HTMLDivElement>(null)

  const cats = useMemo(() => ['All', ...new Set(ARTICLES.map((a) => a.category))], [])

  /* visible set — the folios that stay bright under FILTERED / SEARCH */
  const visibleIdx = useMemo(() => {
    const q = query.trim().toLowerCase()
    const idx: number[] = []
    ARTICLES.forEach((a, i) => {
      const author = getAuthor(a.authorId)?.name ?? ''
      const okCat = cat === 'All' || a.category === cat
      const okQ = !q || (a.title + ' ' + a.category + ' ' + author).toLowerCase().includes(q)
      if (okCat && okQ) idx.push(i)
    })
    return idx
  }, [query, cat])

  /* keep the selection inside the visible set */
  useEffect(() => {
    if (!visibleIdx.includes(sel) && visibleIdx.length > 0) setSel(visibleIdx[0])
  }, [visibleIdx, sel])

  const filtered = visibleIdx.length > 0

  const moveTo = (i: number) => {
    setSel(i)
    document.getElementById(`folio-${i}`)?.focus()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    const n = visibleIdx.length
    if (n === 0) return
    const pos = visibleIdx.indexOf(sel)
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault()
        moveTo(visibleIdx[(pos + 1) % n])
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault()
        moveTo(visibleIdx[(pos - 1 + n) % n])
        break
      case 'Home':
        e.preventDefault()
        moveTo(visibleIdx[0])
        break
      case 'End':
        e.preventDefault()
        moveTo(visibleIdx[n - 1])
        break
      case 'Escape':
        /* RETURN — clear filter and search, restore all nineteen */
        if (cat !== 'All' || query) {
          e.preventDefault()
          setCat('All')
          setQuery('')
          setSel(0)
          railRef.current?.focus()
        }
        break
    }
  }

  return (
    <div className="relative overflow-hidden bg-wine-deep">
      {/* mobile — the vertical brass thread that ties the single-column shelf.
          Absolute in the right margin so the archive header stays above the fold
          (Penpot P27 mobile board: kicker/title/first folio visible without scroll). */}
      <div aria-hidden="true" className="pointer-events-none absolute right-[8%] top-24 h-[340px] w-px bg-[linear-gradient(180deg,transparent,rgba(217,185,120,0.25),transparent)] md:hidden" />
      {/* ——— BACK · the wine hall with shelf depths ——— */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,rgba(92,18,36,0.38),transparent_62%),radial-gradient(90%_70%_at_90%_100%,rgba(184,145,70,0.10),transparent_60%),linear-gradient(170deg,#4A1120_0%,#3B0D17_52%,#1A070E_100%)]" />
        {/* shelf rows — horizontal hairlines receding into the hall */}
        {[0.16, 0.3, 0.44, 0.58, 0.72, 0.86].map((t, i) => (
          <div
            key={i}
            className="absolute inset-x-0 h-px"
            style={{ top: `${t * 100}%`, background: 'linear-gradient(90deg, transparent, rgba(217,185,120,0.10), transparent)' }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-[1440px] px-[clamp(1.25rem,4vw,4.75rem)] pb-[clamp(5rem,10vh,8rem)] pt-[clamp(4.5rem,7.5vh,5.5rem)] md:pt-[clamp(5rem,10vh,7rem)]">
        {/* ——— MID · header block — ghost folio range, title, search ———
            The ghost № 01–19 floats at the shelf's top-right, out of flow, so
            the first folio row starts high — as the board's shelf does. ——— */}
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 z-0 hidden select-none md:block">
            <span className="whitespace-nowrap font-serif text-[clamp(4rem,10vw,8rem)] font-semibold leading-[0.8] text-transparent [-webkit-text-stroke:1px_rgba(184,145,70,0.18)]">
              № 01–19
            </span>
          </div>
          <div className="relative z-10 min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-gold">
              The Archive — 19 features · 16 voices · 7 departments
            </p>
            <h1 className="mt-4 font-serif text-[clamp(2.2rem,4.5vw,3.75rem)] font-light leading-[0.95] tracking-[-0.02em] text-ivory">
              The <em className="italic text-gold">folio shelf</em>
            </h1>
          </div>
        </div>

        {/* search — SEARCH THE ARCHIVE… */}
        <div className="relative z-10 mt-5 max-w-md md:mt-6" onKeyDown={onKeyDown}>
          <label htmlFor="art-search" className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/55">
            Search the archive…
          </label>
          <input
            id="art-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Titles, writers, genres…"
            className="mt-2 w-full border-0 border-b border-gold/40 bg-transparent pb-3 font-serif text-2xl font-light text-ivory outline-none placeholder:italic placeholder:text-ivory/35 focus:border-gold"
          />
        </div>

        {/* ——— MID · the category rail — seven real departments ——— */}
        <div
          ref={railRef}
          role="group"
          aria-label="Filter by department"
          className="relative z-10 mt-5 flex flex-wrap gap-x-2 gap-y-3 border-t border-white/10 pt-4 md:mt-6 md:pt-5"
        >
          {cats.map((c) => {
            const active = cat === c
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCat(c)}
                aria-pressed={active}
                className={`relative px-4 py-2 font-mono text-[9px] font-medium uppercase tracking-[0.28em] transition-colors duration-300 ${
                  active
                    ? 'text-gold before:absolute before:inset-x-2 before:top-0 before:h-px before:bg-gold after:absolute after:inset-x-2 after:bottom-0 after:h-px after:bg-gold'
                    : 'text-white/60 hover:text-ivory'
                }`}
              >
                {c}
              </button>
            )
          })}
        </div>

        {/* ——— FRONT · the nineteen folios — solid ivory plates on the shelf,
            registry order. The desk grid keeps the board's central hinge: three
            folios, the brass spine, two folios. ——— */}
        <div
          role="group"
          aria-label="The archive — nineteen folios"
          className={`relative ${filtered ? '' : 'hidden'}`}
        >
          {/* the shelf's central brass spine — the board's hinge between the
              third and fourth folio of every row */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-1/2 top-0 z-0 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[#D9B978]/30 to-transparent xl:block"
          />
          <div
            className="relative z-10 mt-[clamp(1.5rem,3.5vh,2.5rem)] grid grid-cols-1 items-stretch gap-x-[clamp(1.25rem,3vw,2.5rem)] gap-y-[clamp(1.4rem,3vh,2.2rem)] pb-16 sm:grid-cols-2 md:mt-[clamp(2rem,4.5vh,2.75rem)] md:pb-0 md:grid-cols-3 xl:grid-cols-5"
            onKeyDown={onKeyDown}
            role="list"
          >
            {ARTICLES.map((a, i) => {
              const author = getAuthor(a.authorId)
              const folio = String(i + 1).padStart(2, '0')
              const selected = sel === i
              const filtering = cat !== 'All' || query !== ''
              const isMatch = visibleIdx.includes(i)
              const receded = filtering && !isMatch
              /* at rest the shelf tapers — the focused folio holds, neighbours recede by a step;
                 under FILTERED/SEARCH non-matches recede fully (ghost) while members stay bright */
              const inner = filtering ? (isMatch ? 1 : 0.1) : i === sel ? 1 : Math.max(1 - i * 0.03, 0.72)
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '0px 0px -6% 0px' }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className={`contents ${receded ? 'opacity-25 transition-all duration-700' : 'transition-all duration-700'}`}
                >
                  <span className="block" style={{ opacity: inner }}>
                    <Link
                      id={`folio-${i}`}
                      to={isMatch ? `/article/${a.id}` : '#'}
                      onClick={(e) => { if (!isMatch) e.preventDefault() }}
                      role="listitem"
                      aria-current={selected ? 'true' : undefined}
                      aria-label={`Folio ${folio} — ${a.title}, ${a.category}`}
                      onFocus={() => setSel(i)}
                      onMouseEnter={() => setSel(i)}
                      tabIndex={selected ? 0 : -1}
                      className={`group relative flex h-full flex-col bg-[#F8F6F2] px-4 py-3 text-left no-underline transition-all duration-500 ${
                        selected
                          ? 'border border-[#B89146] shadow-[0_12px_28px_rgba(0,0,0,0.4)] md:-translate-y-1.5'
                          : 'border border-[#B89146]/35 hover:border-[#D9B978]/90 hover:shadow-[0_8px_20px_rgba(0,0,0,0.25)]'
                      } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold`}
                    >
                      {/* the plate's inner brass hairline — a second frame inside the edge */}
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none absolute inset-1 border transition-colors duration-500 ${
                          selected ? 'border-[#D9B978]/60' : 'border-[#B89146]/15 group-hover:border-[#D9B978]/40'
                        }`}
                      />
                      <span className="relative flex items-baseline justify-between gap-3">
                        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#7C6338]">№ {folio}</span>
                        {i === ARTICLES.length - 1 && (
                          <span className="rounded-full bg-[#5C1224] px-2 py-0.5 font-mono text-[8px] font-medium uppercase tracking-[0.16em] text-[#F8F6F2]">
                            Newest
                          </span>
                        )}
                      </span>
                      <span className="relative mt-1.5 block font-serif text-[clamp(0.95rem,1.15vw,1.1rem)] font-normal leading-[1.15] text-[#1E0B12] transition-colors duration-500 group-hover:text-[#5C1224]">
                        {a.title}
                      </span>
                      <span className="relative mt-1.5 block font-mono text-[8px] uppercase tracking-[0.3em] text-[#2A0F18]/65">
                        {a.category} · {author?.name}
                      </span>
                      {selected && (
                        <span className="relative mt-auto inline-flex items-center gap-2 pt-2 font-mono text-[8px] uppercase tracking-[0.3em] text-[#7C6338]">
                          <span aria-hidden="true" className="h-px w-4 bg-[#B89146]" />
                          Selected — open folio →
                        </span>
                      )}
                    </Link>
                  </span>
                </motion.div>
              )
            })}
          </div>
        </div>
        {!filtered && (
          <div className="mt-10 border border-dashed border-white/15 px-6 py-14 text-center md:mt-16">
            <p className="font-serif text-2xl font-light italic text-white/65">
              Nothing on this shelf yet — the archive keeps its promises honestly.
            </p>
            <button
              type="button"
              onClick={() => { setCat('All'); setQuery(''); setSel(0) }}
              className="mt-6 border-b border-gold/60 pb-1 font-mono text-[10px] uppercase tracking-[0.28em] text-gold no-underline transition-colors hover:text-ivory"
            >
              Return to all nineteen folios
            </button>
          </div>
        )}

        {/* ——— RETURN — the quiet ledger under the shelf ——— */}
        <div className="mt-[clamp(3rem,7vh,5rem)] flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 font-mono text-[9px] uppercase tracking-[0.3em] text-white/55">
          <span>Nineteen folios · each credited · each read</span>
          <span>
            {(cat !== 'All' || query) && (
              <button
                type="button"
                onClick={() => { setCat('All'); setQuery(''); setSel(0) }}
                className="border-b border-gold/60 pb-0.5 font-mono text-[9px] uppercase tracking-[0.3em] text-gold no-underline transition-colors hover:text-ivory"
              >
                Esc · return to the full shelf
              </button>
            )}
            {cat === 'All' && !query && <span className="text-white/40">State · rest — the shelf holds all nineteen</span>}
          </span>
        </div>
      </div>
    </div>
  )
}

export default Archive
