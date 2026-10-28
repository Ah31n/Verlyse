import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { spotlitGlide } from '../lib/stringTune/attrs'
import { motion } from 'motion/react'
import { useSeo } from '../hooks/useSeo'
import { getAuthor, ARTICLES, LEDGER, sortArticles, stampDate, isEditorsPick, folioNoOf, articleSearchText, SORTS, type SortKey } from '../data/content'
import SaveButton from '../components/ui/SaveButton'
import { handleImgError } from '../lib/imgFallback'
import { ImmersiveShell, BrassThread } from '../components/immersive'
import {
  FloralWord,
  HaikeiContourPlane,
} from '../components/ui/EditorialCraftSystem'

const ROOM_PARAM = 'room'
const QUERY_PARAM = 'q'
const ORDER_PARAM = 'order'
const SORT_KEYS = new Set<SortKey | 'registry'>(['registry', 'latest', 'most-discussed', 'most-appreciated', 'editors-picks'])
/* Links shared before the key was renamed still carry ?order=most-read.
   They must keep resolving to the same view. */
const LEGACY_ORDER: Record<string, SortKey> = { 'most-read': 'most-discussed' }
const normaliseOrder = (raw: string | null): SortKey | 'registry' => {
  if (!raw) return 'registry'
  const mapped = LEGACY_ORDER[raw] ?? raw
  return SORT_KEYS.has(mapped as SortKey | 'registry') ? (mapped as SortKey | 'registry') : 'registry'
}

/** keyword match — the title, the writer (name AND handle), the department,
    secondary credits, tags, excerpt and description: the archive answers to
    more than its headline, and a shared index keeps it identical to the
    global search overlay. */
function matchesQuery(id: string, q: string): boolean {
  if (!q) return true
  const a = ARTICLES.find((x) => x.id === id)!
  return articleSearchText(a).includes(q)
}

/**
 * THE ARCHIVE — the publication's physical archive, from the approved
 * Penpot board P27 / THE ARCHIVE.
 *
 * BACK  · wine hall with shelf depths (hairline shelf rows receding)
 * MID   · SEARCH THE ARCHIVE… + department rail (seven real rooms) + a
 *         quiet order rail (registry · latest · most discussed · most
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

  /* the archive state lives in the URL — q, room, order — so a search or
     room is shareable and survives a deep-link refresh, exactly like the
     rest of the publication */
  const [searchParams, setSearchParams] = useSearchParams()
  const validCats = useMemo(() => ['All', ...new Set(ARTICLES.map((a) => a.category))], [])
  const initialSort = normaliseOrder(searchParams.get(ORDER_PARAM))
  const [query, setQuery] = useState(searchParams.get(QUERY_PARAM) ?? '')
  const [cat, setCat] = useState(
    validCats.includes(searchParams.get(ROOM_PARAM) ?? '') ? (searchParams.get(ROOM_PARAM) as string) : 'All',
  )
  const [sort, setSort] = useState<SortKey | 'registry'>(
    SORT_KEYS.has(initialSort) ? initialSort : 'registry',
  )
  const [busy, setBusy] = useState(false)
  const railRef = useRef<HTMLDivElement>(null)

  const cats = validCats

  /* write the shelf state back to the URL (replace — typing a query must
     not fill the browser history with one entry per keystroke) */
  useEffect(() => {
    const next = new URLSearchParams()
    if (query.trim()) next.set(QUERY_PARAM, query.trim())
    if (cat !== 'All') next.set(ROOM_PARAM, cat)
    if (sort !== 'registry') next.set(ORDER_PARAM, sort)
    const as = next.toString()
    const cur = searchParams.toString()
    if (as !== cur) setSearchParams(next, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, cat, sort])

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

  const filtered = visibleIds.length > 0

  /* a momentary "reading the index" state while a query settles — honest,
     brief, and the only motion the input makes */
  useEffect(() => {
    if (!query) { setBusy(false); return }
    setBusy(true)
    const t = setTimeout(() => setBusy(false), 180)
    return () => clearTimeout(t)
  }, [query, cat, sort])

  /* RETURN — one reset, shared by Escape, the empty state and the ledger,
     so the shelf can only come back to rest in one way. */
  const resetShelf = () => {
    setCat('All')
    setQuery('')
    setSort('registry')
  }

  const moveTo = (id: string) => {
    document.getElementById(`folio-${id}`)?.focus()
  }

  /* The shelf's own keys. The cursor is read from whatever folio actually
     holds focus — never from a hover — so a mouse passing over the shelf
     can no longer move the keyboard's place in it. */
  const onKeyDown = (e: React.KeyboardEvent) => {
    const n = visibleIds.length
    if (n === 0) return
    const active = typeof document === 'undefined' ? null : document.activeElement
    const activeId = active?.id?.startsWith('folio-') ? active.id.slice('folio-'.length) : null
    /* −1 means the shelf is entered from outside: the first key lands on
       the nearest end rather than skipping the folio it should open on. */
    const pos = activeId ? visibleIds.indexOf(activeId) : -1
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault()
        moveTo(pos < 0 ? visibleIds[0] : visibleIds[(pos + 1) % n])
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault()
        moveTo(pos < 0 ? visibleIds[n - 1] : visibleIds[(pos - 1 + n) % n])
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
          resetShelf()
          railRef.current?.focus()
        }
        break
    }
  }

  /* The search field owns its own keys. ← and → must move the caret inside
     the input; the shelf's arrow navigation belongs to the shelf. Only
     Escape is shared, because returning the shelf is the same act wherever
     the reader is standing. */
  const onSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Escape') return
    if (cat !== 'All' || query || sort !== 'registry') {
      e.preventDefault()
      resetShelf()
    }
  }

  const activeSortNote = sort === 'registry'
    ? `Registry order — as the archive files them, № 01 to № ${String(LEDGER.features).padStart(2, '0')}.`
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
        <HaikeiContourPlane tone="dark" seed={2} className="opacity-20" />
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
          <div aria-hidden="true" className="pointer-events-none absolute -top-6 right-0 z-0 hidden select-none lg:block">
            <span className="whitespace-nowrap font-serif text-[clamp(3.5rem,7.5vw,6.2rem)] font-semibold leading-[0.8] text-transparent [-webkit-text-stroke:1px_rgba(184,145,70,0.09)]">
              № 01–{LEDGER.features}
            </span>
          </div>
          <div className="relative z-10 min-w-0">
            {/* R10 — the archive masthead: the shelf announces itself at
                publication scale, on the same press rule as every chapter. */}
            <span
              aria-hidden="true"
              className="mb-4 block h-[4px] w-[clamp(3.5rem,14vw,9rem)] bg-[linear-gradient(to_bottom,rgba(217,185,120,0.52)_0_1px,transparent_1px)_top/100%_1px_no-repeat,linear-gradient(to_bottom,rgba(217,185,120,0.17)_0_1px,transparent_1px)_bottom/100%_1px_no-repeat]"
            />
            <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-gold-lit">
              The Archive — {LEDGER.features} features · {LEDGER.creators} creators · {LEDGER.departments} departments
            </p>
            <h1 className="mt-4 font-serif text-[clamp(2.8rem,6vw,5rem)] font-light leading-[0.92] tracking-[-0.022em] text-ivory">
              The <FloralWord variant="laurel">folio shelf</FloralWord>
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
              onKeyDown={onSearchKeyDown}
              aria-describedby="art-search-status"
              className="mt-2 w-full border border-gold/40 bg-transparent px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ivory outline-none focus:border-gold"
            />
            <p id="art-search-status" aria-live="polite" className="mt-1.5 min-h-4 font-mono text-[9px] uppercase tracking-[0.24em] text-white/60">
              {busy
                ? 'Reading the index…'
                : (query.trim() || cat !== 'All' || sort !== 'registry')
                  ? `${visibleIds.length} of ${LEDGER.features} folio${visibleIds.length === 1 ? '' : 's'} ${visibleIds.length === 1 ? 'matches' : 'match'}${cat !== 'All' ? ` in ${cat}` : ''}${sort === 'editors-picks' ? ' · desk picks' : sort !== 'registry' ? ` · ${SORTS.find((s) => s.key === sort)?.label ?? ''}` : ''}`
                  : `${LEDGER.features} folios — title, writer name or handle, department, co-credit, keyword`}
            </p>
          </div>
        </div>

        {/* ——— MID · the department rail + the order rail ——— */}
        <div
          ref={railRef}
          tabIndex={-1}
          className="relative z-10 mt-3 flex flex-wrap items-center gap-x-2 gap-y-3 border-t border-white/10 pt-4 outline-none md:mt-5 md:pt-5"
        >
          <span className="mr-1 font-mono text-[9px] uppercase tracking-[0.28em] text-white/60">Room</span>
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
          <span className="mr-1 font-mono text-[9px] uppercase tracking-[0.28em] text-white/60">Order</span>
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
          <span aria-live="polite" className="w-full font-mono text-[9px] uppercase leading-[1.9] tracking-[0.2em] text-white/60 md:ml-auto md:w-auto">
            {activeSortNote}
          </span>
        </div>

        {/* ——— FRONT · the folios — the gallery wall.
            Every folio is a published 4:5 plate, and the shelf shows all of
            it. The work carries the row; the brass label underneath carries
            the record. Three columns on desktop and tablet keep 7 × 3 = 21
            rows full, so the wall never ends on an orphaned gap. ——— */}
        <div className={`relative ${filtered ? '' : 'hidden'}`}>
          {/* the shelf's central brass spine */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-1/2 top-0 z-0 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[#D9B978]/30 to-transparent xl:block"
          />
          <ul
            aria-label={`The archive — ${visibleIds.length} of ${LEDGER.features} folios shown`}
            /* Two plates abreast from 360px up. Below that the column would
               fall under ~134px, where the title drops to three or four words
               a line and the record line can no longer hold № + status + date
               — so the shelf honestly falls back to one column. The gutter
               tightens to 12px on phones to buy that width back. */
            className="relative z-10 mx-auto mt-[clamp(1.5rem,3.5vh,2.5rem)] grid list-none grid-cols-1 items-stretch gap-x-[clamp(0.75rem,1.8vw,1.75rem)] gap-y-[clamp(2rem,4vh,3rem)] p-0 pb-16 min-[360px]:grid-cols-2 md:mt-[clamp(2rem,4.5vh,2.75rem)] md:grid-cols-3 md:pb-0"
            onKeyDown={onKeyDown}
          >
            {ordered.map((a, pos) => {
              const author = getAuthor(a.authorId)
              const folio = String(ARTICLES.findIndex((x) => x.id === a.id) + 1).padStart(2, '0')
              const filtering = cat !== 'All' || query !== '' || sort === 'editors-picks'
              const isMatch = visibleIds.includes(a.id)
              /* a folio outside the current filter keeps its place on the
                 wall — the archive never collapses, it recedes. It also stops
                 being a destination: no pointer, no tab stop, and hidden from
                 assistive technology, so what is announced matches what the
                 status line claims is showing. */
              const receded = filtering && !isMatch
              return (
                <motion.li
                  key={a.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '0px 0px -6% 0px' }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className={`relative ${
                    ordered.length % 2 === 1 && pos === ordered.length - 1 ? 'min-[360px]:col-span-2 md:col-span-1' : ''
                  }`}
                >
                  {/* Two owners, two properties: Motion owns the entrance
                      opacity on the list item, CSS owns the recede opacity
                      here. Sharing one element would let Motion's inline
                      style win and the filter would stop dimming anything. */}
                  <div
                    aria-hidden={receded || undefined}
                    className={`group/plate relative h-full transition-opacity duration-700 ${
                      receded ? 'pointer-events-none opacity-[0.14]' : 'opacity-100'
                    }`}
                  >
                  <Link
                    id={`folio-${a.id}`}
                    to={`/article/${a.id}`}
                    aria-label={`Folio ${folio} — ${a.title}, ${a.category}, ${author?.name}. ${a.readingTime}, ${a.publicationStatus === 'provisional' ? `provisional record ${a.date}` : `published ${a.date}`}.`}
                    tabIndex={receded ? -1 : 0}
                    className="group flex h-full flex-col overflow-hidden border border-[#B89146]/35 bg-[#F8F6F2] text-left no-underline transition-[border-color,box-shadow,transform] duration-500 hover:border-[#D9B978]/90 hover:shadow-[0_14px_34px_rgba(0,0,0,0.42)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold motion-safe:hover:-translate-y-1.5 motion-safe:focus-visible:-translate-y-1.5"
                  >
                    {/* the plate — the contributor's published cover, whole.
                        Every cover in the registry is 4:5, so the frame is the
                        artwork's own proportion: nothing is cropped away and
                        no scrim is laid over someone's work. */}
                    <span className="plate-thumb" {...spotlitGlide('restrained')}>
                      <img
                        src={a.thumbnail ?? a.cover}
                        alt=""
                        width={420}
                        height={525}
                        loading={pos < 3 ? 'eager' : 'lazy'}
                        decoding="async"
                        onError={(e) => handleImgError(e, a.title, folioNoOf(a.id))}
                      />
                      {/* Sampled on rendered pixels, `text-gold` (#B89146)
                          over this scrim measured 3.89:1 — under AA at 7px.
                          #D9B978 on a /88 scrim measures ~9.7:1 typical and
                          stays >5.7:1 even where the artwork beneath is
                          near-white. Same brass family, legible ink. */}
                      {isEditorsPick(a.id) && (
                        <span className="absolute left-2.5 top-2.5 border border-[#D9B978]/70 bg-[#1C0509]/[0.88] px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.16em] text-[#D9B978] backdrop-blur-[2px]">
                          Desk pick
                        </span>
                      )}
                    </span>

                    {/* the label — the brass plaque under the plate */}
                    <span className="flex flex-1 flex-col px-4 pb-4 pt-3">
                      {/* The record line wraps as whole units rather than
                          truncating, so a ten-minute read is never filed on
                          the wall as “10 MIN RE…”. */}
                      <span className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                        <span className="shrink-0 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.16em] text-[#7C6338] md:tracking-[0.28em]">№ {folio}</span>
                        {/* The registry already distinguishes a finished folio
                            from a record still being set. That fact was only
                            ever spoken to screen readers here; the wall now
                            states it in ink too, so both audiences read the
                            same shelf. No new data — `publicationStatus`
                            straight off the record. */}
                        {a.publicationStatus === 'provisional' && (
                          <span className="shrink-0 whitespace-nowrap border border-[#7C6338]/45 px-1.5 py-px font-mono text-[9px] uppercase leading-[1.5] tracking-[0.1em] text-[#7C6338]">
                            Provisional
                          </span>
                        )}
                        {/* /55 measured 3.94:1 on this paper — below WCAG 2.1
                            AA for 8px text. /65 is 5.45:1 and matches the
                            byline ink already used below. */}
                        <span className="whitespace-nowrap font-mono text-[8px] uppercase tracking-[0.1em] text-[#2A0F18]/65 md:tracking-[0.18em]">{stampDate(a.date)} · {a.readingTime}</span>
                      </span>
                      <span className="mt-2 block font-serif text-[clamp(1.08rem,1.3vw,1.3rem)] font-normal leading-[1.14] text-[#1E0B12] transition-colors duration-500 group-hover:text-[#5C1224]">
                        {a.title}
                      </span>
                      <span className="mt-auto flex items-start gap-2 pt-3 font-mono text-[8px] uppercase leading-[1.6] tracking-[0.14em] text-[#2A0F18]/65 md:tracking-[0.26em]">
                        {/* items-start now, so the rule needs a nudge to sit on
                            the first line's optical centre instead of its top */}
                        <span aria-hidden="true" className="mt-1.5 h-px w-3 shrink-0 bg-[#B89146] transition-[width] duration-500 group-hover:w-5" />
                        <span className="min-w-0 break-words">{a.category} · {author?.name}</span>
                      </span>
                    </span>
                  </Link>
                  {/* the keep-mark — above the plate, never inside the link */}
                  <SaveButton
                    id={a.id}
                    title={a.title}
                    category={a.category}
                    author={author?.name}
                    compact
                    /* On touch the keep-mark is always visible, so it needs a
                       44px target — but a 44px *box* covers a quarter of a
                       162px plate and sits on the contributor's artwork. The
                       visible disc therefore stays 32px and the touch target
                       is grown to 44px with an invisible inset ring, so the
                       hand gets its target and the picture keeps its space. */
                    className="absolute right-2 top-2 z-10 opacity-100 transition-opacity duration-300 max-md:after:absolute max-md:after:-inset-2 max-md:after:content-[''] md:opacity-0 md:group-hover/plate:opacity-100 md:focus-within:opacity-100 [&_svg]:h-3.5 [&_svg]:w-3.5 md:[&_svg]:h-3 md:[&_svg]:w-3"
                  />
                  </div>
                </motion.li>
              )
            })}
          </ul>
        </div>
        {!filtered && (
          <div className="mt-10 border border-dashed border-white/15 px-6 py-14 text-center md:mt-16">
            <p className="font-serif text-2xl font-light italic text-white/65">
              Nothing on this shelf matches — the archive keeps its promises honestly.
            </p>
            <p className="mx-auto mt-3 max-w-[46ch] text-sm leading-relaxed text-white/65">
              Try another word, open a different room, or return to the full shelf. If a feature truly is missing, the desk can add it — every folio began as a submission.
            </p>
            <button
              type="button"
              onClick={resetShelf}
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
                onClick={resetShelf}
                className="border-b border-gold/60 pb-0.5 font-mono text-[9px] uppercase tracking-[0.3em] text-gold no-underline transition-colors hover:text-ivory"
              >
                Esc · return to the full shelf
              </button>
            )}
            {cat === 'All' && !query && sort === 'registry' && <span className="text-white/60">Issue № {LEDGER.issueNo} — all {LEDGER.features} folios in registry order</span>}
          </span>
        </div>
      </div>
    </div>
    </ImmersiveShell>
  )
}

export default Archive
