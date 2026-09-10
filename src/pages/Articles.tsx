import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { useSeo } from '../hooks/useSeo'
import { getAuthor, ARTICLES, LEDGER, sortArticles, stampDate, isEditorsPick, folioNoOf, SORTS, type SortKey } from '../data/content'
import SaveButton from '../components/ui/SaveButton'
import { handleImgError } from '../lib/imgFallback'
import { ImmersiveShell, BrassThread } from '../components/immersive'

/** keyword match — the title, the writer, the department, and the feature's
    own tags and excerpt: the archive answers to more than its headline. */
function matchesQuery(id: string, q: string): boolean {
  if (!q) return true
  const a = ARTICLES.find((x) => x.id === id)!
  const author = getAuthor(a.authorId)?.name ?? ''
  return `${a.title} ${a.category} ${author} ${a.tags.join(' ')} ${a.excerpt}`.toLowerCase().includes(q)
}

/**
 * THE ARCHIVE — the publication's physical archive, from the approved
 * Penpot board P27 / THE ARCHIVE.
 *
 * BACK  · wine hall with shelf depths (hairline shelf rows receding)
 * MID   · SEARCH THE ARCHIVE… + department rail (seven real rooms) + a
 *         quiet order rail (registry · latest · most read · most
 *         appreciated · editor's picks — honest rankings, each explained)
 * FRONT · the nineteen folios as shelf spines — each plate now carries its
 *         own cover strip, its date, its reading time and a save mark.
 *
 * States: REST · FOCUS (hover/keyboard lifts the folio) · SELECTED (№ NN
 * carries “SELECTED — OPEN FOLIO →”) · FILTERED (rail/search: matching
 * folios stay bright, the rest recede — never a conventional list) ·
 * SEARCH · RETURN (All / Esc restores the shelf).
 * Keyboard: ← → ↑ ↓ move selection · Home/End jump · Enter opens ·
 * Esc returns to REST. Every number under the shelf is the ledger's.
 */
function Archive() {
  useSeo({
    path: '/articles',
    title: 'Articles',
    description: `The Verlyse Media archive — ${LEDGER.features} features, ${LEDGER.creators} credited creators, seven departments. Browse, search and sort the folios.`,
  })

  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('All')
  const [sort, setSort] = useState<SortKey | 'registry'>('registry')
  const [selId, setSelId] = useState<string>(ARTICLES[0].id)
  const [busy, setBusy] = useState(false)
  const railRef = useRef<HTMLDivElement>(null)

  const cats = useMemo(() => ['All', ...new Set(ARTICLES.map((a) => a.category))], [])

  /* the ordered shelf — sorting rearranges the row; the folio number stays
     the registry number, because that is how the archive itself files them */
  const ordered = useMemo(
    () => (sort === 'registry' ? ARTICLES : sortArticles(sort as SortKey)),
    [sort],
  )

  /* visible set — the folios that stay bright under FILTERED / SEARCH */
  const visibleIds = useMemo(() => {
    const q = query.trim().toLowerCase()
    return ordered
      .filter((a) => (cat === 'All' || a.category === cat) && matchesQuery(a.id, q))
      .map((a) => a.id)
  }, [ordered, query, cat])

  /* keep the selection inside the visible set */
  useEffect(() => {
    if (visibleIds.length > 0 && !visibleIds.includes(selId)) setSelId(visibleIds[0])
  }, [visibleIds, selId])

  const filtered = visibleIds.length > 0

  /* a momentary "reading the index" state while a query settles — honest,
     brief, and the only motion the input makes */
  useEffect(() => {
    if (!query) { setBusy(false); return }
    setBusy(true)
    const t = setTimeout(() => setBusy(false), 180)
    return () => clearTimeout(t)
  }, [query, cat, sort])

  const moveTo = (id: string) => {
    setSelId(id)
    document.getElementById(`folio-${id}`)?.focus()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    const n = visibleIds.length
    if (n === 0) return
    const pos = Math.max(0, visibleIds.indexOf(selId))
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault()
        moveTo(visibleIds[(pos + 1) % n])
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault()
        moveTo(visibleIds[(pos - 1 + n) % n])
        break
      case 'Home':
        e.preventDefault()
        moveTo(visibleIds[0])
        break
      case 'End':
        e.preventDefault()
        moveTo(visibleIds[n - 1])
        break
      case 'Escape':
        /* RETURN — clear filter and search, restore the shelf */
        if (cat !== 'All' || query || sort !== 'registry') {
          e.preventDefault()
          setCat('All')
          setQuery('')
          setSort('registry')
          setSelId(ARTICLES[0].id)
          railRef.current?.focus()
        }
        break
    }
  }

  const activeSortNote = sort === 'registry'
    ? 'Registry order — as the archive files them, № 01 to № 19.'
    : SORTS.find((s) => s.key === sort)?.note ?? ''

  return (
    /* One choreography model for the archive, shared with the rest of the
       publication: the shell supplies scroll progress and the current phase,
       and nothing on this page opens a second scroll listener. */
    <ImmersiveShell>
    <div className="relative overflow-hidden bg-wine-deep">
      {/* desktop — the brass index thread running the left margin of the shelf. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[6rem] left-[clamp(1.25rem,3.2vw,3rem)] top-[7rem] z-[1] hidden lg:block"
      >
        <BrassThread height="100%" from={0} to={0.55} stroke="#D9B978" />
      </div>
      {/* mobile — the vertical brass thread that ties the single-column shelf. */}
      <div aria-hidden="true" className="pointer-events-none absolute right-[8%] top-24 h-[340px] w-px bg-[linear-gradient(180deg,transparent,rgba(217,185,120,0.25),transparent)] md:hidden" />
      {/* the grain over the hall — one still film, decorative, desktop only */}
      <div aria-hidden="true" className="grain pointer-events-none absolute inset-0 z-[1] hidden opacity-[0.2] md:block" />
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
        {/* ——— MID · header block — ghost folio range, title, search ——— */}
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 z-0 hidden select-none md:block">
            <span className="whitespace-nowrap font-serif text-[clamp(4rem,10vw,8rem)] font-semibold leading-[0.8] text-transparent [-webkit-text-stroke:1px_rgba(184,145,70,0.18)]">
              № 01–{LEDGER.features}
            </span>
          </div>
          <div className="relative z-10 min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-gold">
              The Archive — {LEDGER.features} features · {LEDGER.creators} creators · {LEDGER.departments} departments
            </p>
            <h1 className="mt-4 font-serif text-[clamp(2.2rem,4.5vw,3.75rem)] font-light leading-[0.95] tracking-[-0.02em] text-ivory">
              The <em className="italic text-gold">folio shelf</em>
            </h1>
          </div>
          <div className="relative z-10 mt-5 w-full max-w-md md:mt-0 md:w-[490px] md:max-w-none">
            <label htmlFor="art-search" className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/55">
              Search the archive…
            </label>
            <input
              id="art-search"
              type="search"
              role="searchbox"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Titles, writers, genres, keywords…"
              aria-describedby="art-search-status"
              className="mt-2 w-full border border-gold/40 bg-transparent px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ivory outline-none placeholder:text-ivory/35 focus:border-gold"
            />
            <p id="art-search-status" aria-live="polite" className="mt-1.5 h-4 font-mono text-[9px] uppercase tracking-[0.24em] text-white/45">
              {busy ? 'Reading the index…' : query ? `${visibleIds.length} of ${LEDGER.features} folios found` : `${LEDGER.features} folios — title, writer, department, keyword`}
            </p>
          </div>
        </div>

        {/* ——— MID · the department rail + the order rail ——— */}
        <div
          ref={railRef}
          tabIndex={-1}
          className="relative z-10 mt-3 flex flex-wrap items-center gap-x-2 gap-y-3 border-t border-white/10 pt-4 outline-none md:mt-5 md:pt-5"
        >
          <span className="mr-1 font-mono text-[9px] uppercase tracking-[0.28em] text-white/40">Room</span>
          {cats.map((c) => {
            const active = cat === c
            return (
              <button
                key={c}
                type="button"
                onClick={() => { setCat(c); }}
                aria-pressed={active}
                className={`relative px-4 py-2 font-mono text-[9px] font-medium uppercase tracking-[0.28em] transition-colors duration-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-gold ${
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
        <div className="relative z-10 mt-2 flex flex-wrap items-center gap-x-2 gap-y-3">
          <span className="mr-1 font-mono text-[9px] uppercase tracking-[0.28em] text-white/40">Order</span>
          {([{ key: 'registry' as const, label: 'Registry №', note: '' }] as { key: SortKey | 'registry'; label: string; note: string }[])
            .concat(SORTS.map((s) => ({ key: s.key, label: s.label, note: s.note })))
            .map((s) => {
              const active = sort === s.key
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setSort(s.key)}
                  aria-pressed={active}
                  className={`relative px-4 py-2 font-mono text-[9px] font-medium uppercase tracking-[0.28em] transition-colors duration-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-gold ${
                    active ? 'text-gold before:absolute before:inset-x-2 before:top-0 before:h-px before:bg-gold after:absolute after:inset-x-2 after:bottom-0 after:h-px after:bg-gold' : 'text-white/60 hover:text-ivory'
                  }`}
                >
                  {s.label}
                </button>
              )
            })}
          <span aria-live="polite" className="w-full font-mono text-[9px] uppercase leading-[1.9] tracking-[0.2em] text-white/40 md:ml-auto md:w-auto">
            {activeSortNote}
          </span>
        </div>

        {/* ——— FRONT · the folios — solid ivory plates on the shelf.
            Desktop follows P27's 7 + 7 + 5 shelf rhythm; mobile collapses
            to one quiet column. ——— */}
        <div
          role="group"
          aria-label={`The archive — ${visibleIds.length} of ${LEDGER.features} folios shown`}
          className={`relative ${filtered ? '' : 'hidden'}`}
        >
          {/* the shelf's central brass spine */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-1/2 top-0 z-0 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[#D9B978]/30 to-transparent xl:block"
          />
          <div
            className="relative z-10 mx-auto mt-[clamp(1.5rem,3.5vh,2.5rem)] grid max-w-[1080px] grid-cols-1 items-stretch gap-x-[clamp(0.75rem,1.2vw,1.25rem)] gap-y-[clamp(1.4rem,3vh,2.2rem)] pb-16 sm:grid-cols-2 md:mt-[clamp(2rem,4.5vh,2.75rem)] md:pb-0 md:grid-cols-3 xl:grid-cols-7 xl:[perspective:1500px]"
            onKeyDown={onKeyDown}
          >
            {ordered.map((a, pos) => {
              /* a receded folio keeps its place on the shelf — the archive
                 never collapses when it filters; the shelf dims instead */
              const author = getAuthor(a.authorId)
              const folio = String(ARTICLES.findIndex((x) => x.id === a.id) + 1).padStart(2, '0')
              const selected = selId === a.id
              const filtering = cat !== 'All' || query !== '' || sort === 'editors-picks'
              const isMatch = visibleIds.includes(a.id)
              const receded = filtering && !isMatch
              /* at rest the shelf tapers — the focused folio holds, neighbours recede by a step */
              const inner = filtering ? (isMatch ? 1 : 0.1) : selected ? 1 : Math.max(1 - pos * 0.03, 0.72)
              const dist = visibleIds.indexOf(a.id)
              const neighbour = !filtering && dist > 0 && dist <= 2
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '0px 0px -6% 0px' }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className={`contents ${receded ? 'opacity-25 transition-all duration-700' : 'transition-all duration-700'}`}
                >
                  <span className="group/plate relative block" style={{ opacity: inner }}>
                    <Link
                      id={`folio-${a.id}`}
                      to={isMatch ? `/article/${a.id}` : '#'}
                      onClick={(e) => { if (!isMatch) e.preventDefault() }}
                      aria-label={`Folio ${folio} — ${a.title}, ${a.category}, ${author?.name}. ${a.readingTime}, published ${a.date}.`}
                      onFocus={() => setSelId(a.id)}
                      onMouseEnter={() => setSelId(a.id)}
                      tabIndex={selected ? 0 : -1}
                      className={`group relative flex h-full flex-col overflow-hidden bg-[#F8F6F2] px-4 pb-3 pt-0 text-left no-underline transition-all duration-500 ${
                        selected
                          ? 'z-[2] border border-[#B89146] shadow-[0_12px_28px_rgba(0,0,0,0.4)] md:-translate-y-1.5 xl:-translate-y-3 xl:scale-[1.045] xl:shadow-[0_26px_54px_rgba(0,0,0,0.52)]'
                          : `border border-[#B89146]/35 hover:border-[#D9B978]/90 hover:shadow-[0_8px_20px_rgba(0,0,0,0.25)]${neighbour ? ' xl:scale-[0.982]' : ''}`
                      } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold`}
                    >
                      {/* the cover strip — the feature's own plate, cropped wide
                          so the shelf reads as filed photographs, not text rows */}
                      <span className="plate-thumb block w-full">
                        <img
                          src={a.thumbnail ?? a.cover}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          onError={(e) => handleImgError(e, a.title, folioNoOf(a.id))}
                          className="h-[92px] w-full object-cover object-top"
                        />
                        <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(42,15,24,0.12),rgba(42,15,24,0.34))]" />
                        {isEditorsPick(a.id) && (
                          <span className="absolute left-2 top-2 border border-gold/70 bg-[#1C0509]/70 px-2 py-0.5 font-mono text-[7px] uppercase tracking-[0.24em] text-gold">
                            Desk pick
                          </span>
                        )}
                      </span>
                      {/* the plate's inner brass hairline */}
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none absolute inset-1 border transition-colors duration-500 ${
                          selected ? 'border-[#D9B978]/50' : 'border-transparent group-hover/plate:border-[#D9B978]/25'
                        }`}
                      />
                      <span className="relative mt-3 flex items-baseline justify-between gap-3">
                        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#7C6338]">№ {folio}</span>
                        <span className="font-mono text-[8px] uppercase tracking-[0.22em] text-[#2A0F18]/50">{stampDate(a.date)} · {a.readingTime}</span>
                      </span>
                      <span className="relative mt-1.5 block font-serif text-[clamp(0.95rem,1.15vw,1.1rem)] font-normal leading-[1.15] text-[#1E0B12] transition-colors duration-500 group-hover/plate:text-[#5C1224]">
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
                    {/* the keep-mark — above the plate, never inside the link */}
                    <SaveButton
                      id={a.id}
                      title={a.title}
                      category={a.category}
                      author={author?.name}
                      compact
                      className="absolute right-2 top-2 z-10 opacity-100 transition-opacity duration-300 md:opacity-0 md:group-hover/plate:opacity-100 md:focus-within:opacity-100 [&_svg]:h-3 [&_svg]:w-3"
                    />
                  </span>
                </motion.div>
              )
            })}
          </div>
        </div>
        {!filtered && (
          <div className="mt-10 border border-dashed border-white/15 px-6 py-14 text-center md:mt-16">
            <p className="font-serif text-2xl font-light italic text-white/65">
              Nothing on this shelf matches — the archive keeps its promises honestly.
            </p>
            <p className="mx-auto mt-3 max-w-[46ch] text-sm leading-relaxed text-white/50">
              Try another word, open a different room, or return to the full shelf. If a feature truly is missing, the desk can add it — every folio began as a submission.
            </p>
            <button
              type="button"
              onClick={() => { setCat('All'); setQuery(''); setSort('registry'); setSelId(ARTICLES[0].id) }}
              className="mt-6 border-b border-gold/60 pb-1 font-mono text-[10px] uppercase tracking-[0.28em] text-gold no-underline transition-colors hover:text-ivory"
            >
              Return to all {LEDGER.features} folios
            </button>
          </div>
        )}

        {/* ——— RETURN — the quiet ledger under the shelf ——— */}
        <div className="mt-[clamp(3rem,7vh,5rem)] flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 font-mono text-[9px] uppercase tracking-[0.3em] text-white/55">
          <span>{LEDGER.features} folios · each credited · each read</span>
          <span>
            {(cat !== 'All' || query || sort !== 'registry') && (
              <button
                type="button"
                onClick={() => { setCat('All'); setQuery(''); setSort('registry'); setSelId(ARTICLES[0].id) }}
                className="border-b border-gold/60 pb-0.5 font-mono text-[9px] uppercase tracking-[0.3em] text-gold no-underline transition-colors hover:text-ivory"
              >
                Esc · return to the full shelf
              </button>
            )}
            {cat === 'All' && !query && sort === 'registry' && <span className="text-white/40">State · rest — the shelf holds all {LEDGER.features}</span>}
          </span>
        </div>
      </div>
    </div>
    </ImmersiveShell>
  )
}

export default Archive
