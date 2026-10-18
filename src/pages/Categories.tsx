import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { useSeo } from '../hooks/useSeo'
import { getAuthor, ARTICLES, CATEGORIES, LEDGER, folioNoOf } from '../data/content'
import { handleImgError } from '../lib/imgFallback'
import { ImmersiveShell, BrassThread } from '../components/immersive'
import { spotlight } from '../lib/stringTune/attrs'
import {
  DotMatrixLedger,
  FloralWord,
  HaikeiContourPlane,
  RouteEmblemSeal,
} from '../components/ui/EditorialCraftSystem'

/**
 * THE WINGS — the department doors of the publication, from the approved
 * Penpot board P27 / THE WINGS.
 *
 * BACK  · hall with arched recesses (wine falloff + ghost arches)
 * MID   · seven wing-doors — arched facades, real departments, real counts
 * FRONT · the selected wing's stories step forward beneath its door; the
 *         other doors recede (FILTERED ARCHIVE — never a filtered list)
 *
 * States: REST · FOCUS · SELECTED WING · FILTERED ARCHIVE · RETURN
 * Keyboard: doors are real buttons (Tab / Enter / Space); ← → move between
 * doors · Esc returns to REST (all seven doors).
 */
/** "1 folio" / "7 folios" — the wing headers already get this right; the
    selected-wing line used to read "1 folios". */
const folioWord = (n: number) => `${n} folio${n === 1 ? '' : 's'}`

export default function Categories() {
  const { slug } = useParams<{ slug?: string }>()
  const [searchParams] = useSearchParams()
  const roomQuery = searchParams.get('room')
  const navigate = useNavigate()
  const selectedCategory = slug
    ? CATEGORIES.find((category) => category.slug === slug)
    : roomQuery
      ? CATEGORIES.find(
          (category) =>
            category.name.toLowerCase() === roomQuery.toLowerCase() ||
            category.slug.toLowerCase() === roomQuery.toLowerCase()
        )
      : undefined
  useSeo({
    path: slug && selectedCategory ? `/categories/${selectedCategory.slug}` : '/categories',
    title: selectedCategory?.name ?? 'Categories',
    description: selectedCategory?.blurb ?? 'The departments of Verlyse Media — seven wings, one publication.',
  })

  const [active, setActive] = useState<string | null>(selectedCategory?.name ?? null)
  const [focusIdx, setFocusIdx] = useState(() => Math.max(0, selectedCategory ? CATEGORIES.findIndex((category) => category.slug === selectedCategory.slug) : 0))

  useEffect(() => {
    setActive(selectedCategory?.name ?? null)
    setFocusIdx(Math.max(0, selectedCategory ? CATEGORIES.findIndex((category) => category.slug === selectedCategory.slug) : 0))
  }, [selectedCategory?.name, selectedCategory?.slug])
  const hallRef = useRef<HTMLDivElement>(null)

  /* every wing's folios — registry order, real data (the selected wing's
     stories step forward; the others hold their folios quietly) */
  const foliosOf = (name: string) => ARTICLES.map((a, i) => ({ a, i })).filter(({ a }) => a.category === name)
  const wingArticles = useMemo(() => (active ? foliosOf(active) : []), [active])

  /* selecting a door also deep-links it — /categories/:slug keeps the
     exact room on refresh and on share */
  const select = (name: string) => {
    const wasActive = active === name
    setActive(wasActive ? null : name)
    setFocusIdx(Math.max(0, CATEGORIES.findIndex((c) => c.name === name)))
    const slugOf = CATEGORIES.find((c) => c.name === name)?.slug
    navigate(wasActive || !slugOf ? '/categories' : `/categories/${slugOf}`, { replace: true })
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    const n = CATEGORIES.length
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault()
        setFocusIdx((i) => (i + 1) % n)
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault()
        setFocusIdx((i) => (i - 1 + n) % n)
        break
      case 'Escape':
        if (active) {
          e.preventDefault()
          setActive(null)
          navigate('/categories', { replace: true })
        }
        break
    }
  }

  useEffect(() => {
    // Move the accessible focus to the hall without scrolling the document:
    // the hall starts below the masthead, and a bare focus() on load made the
    // browser pull the page ~18px down so the focused box met the viewport.
    hallRef.current?.focus({ preventScroll: true })
  }, [focusIdx])

  return (
    /* One choreography model, shared with the entrance and the archive: the
       shell supplies scroll progress and phase, and nothing on this page opens
       a second scroll listener.

       Engine ownership is unchanged: motion/react keeps the door presence
       animation it already had, native CSS/React owns selection, depth and the
       accessible controls, and the shell animates nothing itself — it only
       feeds the brass measure. No engine shares a transform with another:
       motion animates each door wrapper's opacity/y, CSS transitions animate the
       door buttons, and the thread animates only its own stroke-dash pair. */
    <ImmersiveShell>
    <div className="relative overflow-hidden bg-wine-deep">
      {/* ——— the brass measure — a single hairline down the left edge of the
          hall, drawn as the wings are read. It gives the seven doors one shared
          spine so they read as rooms off a corridor rather than tiles on a
          grid, and it uses the same brass the doors' arches already use.
          Desktop only, decorative: aria-hidden, no pointer events, no
          focusable descendants. Under reduced motion the shell freezes
          progress, so it simply renders fully drawn. ——— */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[7rem] left-[clamp(1.25rem,3.2vw,3rem)] top-[7rem] z-[1] hidden lg:block"
      >
        <BrassThread height="100%" from={0} to={0.6} stroke="#D9B978" />
      </div>
      {/* ——— BACK · the hall — wine falloff, arched recesses ——— */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,rgba(92,18,36,0.38),transparent_62%),radial-gradient(90%_70%_at_90%_100%,rgba(184,145,70,0.10),transparent_60%),linear-gradient(170deg,#4A1120_0%,#3B0D17_52%,#1A070E_100%)]" />
        <HaikeiContourPlane tone="dark" seed={3} className="opacity-20" />
        {/* ghost arched recesses — the doors' negative space behind the row */}
        <div className="absolute inset-x-0 top-[26%] hidden justify-center gap-[4.5vw] xl:flex">
          {CATEGORIES.map((c) => (
            <div key={c.slug} className="h-[46vh] w-[8.5vw] rounded-t-full border border-[#D9B978]/[0.06]" />
          ))}
        </div>
      </div>

      <div
        ref={hallRef}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        className="relative mx-auto max-w-[1440px] px-[clamp(1.25rem,4vw,4.75rem)] pb-[clamp(4rem,9vh,7rem)] pt-[clamp(7rem,16vh,10rem)] outline-none"
        aria-label="The wings — seven departments"
      >
        {/* ——— MID · header — ghost WINGS + real subtitle ——— */}
        <div className="text-center">
          <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
            <RouteEmblemSeal variant="prism" folioCode="07 WINGS" tone="dark" />
            <DotMatrixLedger
              code={`0${LEDGER.departments}${LEDGER.features}`}
              label={`${LEDGER.departments} Curatorial Wings · ${LEDGER.features} Folios`}
              tone="dark"
            />
          </div>
          <h1 className="relative font-serif text-[clamp(3.4rem,10vw,8rem)] font-light leading-[0.85] tracking-[-0.02em] text-ivory">
            <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none font-serif text-[clamp(4rem,13vw,10.5rem)] font-semibold leading-none text-transparent [-webkit-text-stroke:1px_rgba(184,145,70,0.08)]">
              WINGS
            </span>
            <span className="relative">The <FloralWord variant="iris">wings</FloralWord></span>
          </h1>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.34em] text-gold/85">
            The wings — seven departments of Verlyse Media
          </p>
          {/* A live status line, not a section heading. As an <h2> it put a
              changing sentence into the document outline between the page
              title and the real section headings. */}
          <p role="status" aria-live="polite" className="mt-3 font-mono text-[10px] uppercase tracking-[0.3em] text-white/60">
            {active
              ? `${active} — ${folioWord(CATEGORIES.find((c) => c.name === active)?.count ?? 0)} · step forward`
              : `Seven doors — ${LEDGER.features} folios · choose your department`}
          </p>
        </div>

        {/* ——— MID · the seven wing-doors — balanced architectural colonnade ——— */}
        <div className="mt-[clamp(3rem,7vh,4.5rem)] grid grid-cols-2 items-stretch gap-4 md:grid-cols-4 xl:grid-cols-7 xl:[perspective:1500px]" onKeyDown={onKeyDown}>
          {CATEGORIES.map((c, i) => {
            const isActive = active === c.name
            /* the ivory plate: the selected wing's door — or the first door at
               rest, as the board keeps the first wing standing forward */
            const isPlate = isActive || (!active && i === 0)
            const isFocused = focusIdx === i && !active
            const leadItem = foliosOf(c.name)[0]
            const leadFolioNum = leadItem ? String(leadItem.i + 1).padStart(2, '0') : '01'
            return (
              <motion.div
                key={c.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '0px 0px -4% 0px' }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: Math.min(i * 0.05, 0.3) }}
                className={i === 0 ? 'col-span-2 md:col-span-1' : ''}
              >
                <div className={`flex h-full flex-col items-center transition-all duration-700 ${active && !isActive ? 'opacity-35' : 'opacity-100'}`}>
                  <button
                    type="button"
                    onClick={() => select(c.name)}
                    onFocus={() => !active && setFocusIdx(i)}
                    aria-pressed={isActive}
                    {...spotlight()}
                    className={`st-spotlit group relative flex min-h-[clamp(11.5rem,21vh,14rem)] w-full flex-1 flex-col items-center justify-between px-3 pb-4 pt-7 text-center outline-none transition-all duration-700 ${
                      isPlate
                        ? 'z-[2] bg-[#F8F6F2] shadow-[0_18px_44px_rgba(0,0,0,0.45)] md:-translate-y-1.5 xl:-translate-y-2.5 xl:scale-[1.03] xl:shadow-[0_26px_54px_rgba(0,0,0,0.52)]'
                        : 'cursor-pointer hover:-translate-y-1'
                    }`}
                  >
                    {/* the arch — a solid ivory plate for the standing wing, gold ghost otherwise */}
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute inset-0 rounded-t-full border transition-colors duration-500 ${
                        isPlate
                          ? 'border-[#B89146]'
                          : isFocused
                            ? 'border-gold/70 bg-gold/[0.04]'
                            : 'border-white/20 group-hover:border-gold/50'
                      }`}
                      style={isPlate ? undefined : { backgroundColor: `${c.accent}0F` }}
                    />
                    {/* the plate's inner hairline — brass thread inside the ivory door */}
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute inset-1 rounded-t-full border transition-colors duration-500 ${
                        isPlate ? 'border-[#D9B978]/50' : 'border-transparent'
                      }`}
                    />
                    {/* the recess — a darker opening inside the arch */}
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute inset-x-[16%] top-[8%] bottom-[4%] rounded-t-full border transition-colors duration-500 ${
                        isPlate ? 'border-[#B89146]/25' : 'border-white/10 group-hover:border-gold/25'
                      }`}
                    />
                    <div className="relative flex flex-col items-center">
                      <span
                        className={`font-mono text-[8px] uppercase tracking-[0.3em] ${
                          isPlate ? 'text-[#7C6338]' : 'text-gold'
                        }`}
                      >
                        Wing {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][i]}
                      </span>
                      <span aria-hidden="true" className="mt-2 text-lg leading-none" style={{ color: isPlate ? '#7C6338' : c.accent }}>
                        {c.motif}
                      </span>
                      <span
                        className={`mt-3 font-serif text-[clamp(1.18rem,1.45vw,1.45rem)] font-normal leading-[1.08] transition-colors duration-500 ${
                          isPlate ? 'italic text-[#1E0B12]' : 'text-ivory group-hover:text-gold'
                        }`}
                      >
                        {c.name}
                      </span>
                    </div>
                    <div className="relative mt-3 flex flex-col items-center">
                      <span
                        className={`font-mono text-[8px] uppercase tracking-[0.28em] ${
                          isPlate ? 'text-[#2A0F18]/75' : 'text-white/60'
                        }`}
                      >
                        {c.count} folio{c.count === 1 ? '' : 's'}
                      </span>
                      <span
                        className={`mt-1.5 font-mono text-[7px] uppercase tracking-[0.22em] ${
                          isPlate ? 'text-[#7C6338]' : 'text-gold/65 group-hover:text-gold'
                        }`}
                      >
                        {isActive ? 'Showing room ↓' : `Lead · № ${leadFolioNum}`}
                      </span>
                    </div>
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* ——— FRONT · Curatorial Wing Folio Shelves — balanced multi-column gallery with zero empty vertical voids ——— */}
        <div className="mt-12 space-y-6">
          {[...CATEGORIES]
            .sort((a, b) => (active === a.name ? -1 : active === b.name ? 1 : 0))
            .map((c) => {
              const wingIdx = CATEGORIES.findIndex((cat) => cat.slug === c.slug)
              const isActive = active === c.name
              const ghosted = !!active && !isActive
              const items = foliosOf(c.name)

              return (
                <section
                  key={c.slug}
                  aria-label={`${c.name} wing shelf`}
                  className={`border transition-all duration-700 ${
                    isActive
                      ? 'border-gold/60 bg-[#240912]/90 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.45)] md:p-8'
                      : ghosted
                        ? 'pointer-events-none border-white/5 bg-white/[0.01] p-4 opacity-20'
                        : 'border-white/10 bg-[#1E070F]/65 p-5 hover:border-gold/30 md:p-6'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-gold">
                        Wing {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][wingIdx]}
                      </span>
                      <span aria-hidden="true" className="text-base leading-none" style={{ color: c.accent }}>
                        {c.motif}
                      </span>
                      <h2 className="font-serif text-2xl font-normal italic text-ivory">
                        {c.name}
                      </h2>
                      <span className="font-mono text-[9px] uppercase tracking-[0.26em] text-white/50">
                        · {folioWord(c.count)}
                      </span>
                    </div>
                    <p className="max-w-[54ch] font-serif text-sm italic text-ivory/65">
                      {c.blurb}
                    </p>
                  </div>

                  <ul
                    className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    aria-label={`Folios in the ${c.name} wing`}
                  >
                    {items.map(({ a, i }) => {
                      const author = getAuthor(a.authorId)
                      const folio = String(i + 1).padStart(2, '0')
                      return (
                        <li
                          key={a.id}
                          className={`transition-opacity duration-700 ${ghosted ? 'pointer-events-none opacity-10' : 'opacity-100'}`}
                          aria-hidden={ghosted || undefined}
                        >
                          <Link
                            to={`/article/${a.id}`}
                            tabIndex={ghosted ? -1 : undefined}
                            aria-label={`Folio ${folio} — ${a.title}, ${c.name}`}
                            className="group flex h-full items-center gap-3.5 border border-white/10 bg-black/25 p-3 no-underline transition-all duration-300 hover:border-gold/55 hover:bg-gold/[0.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold/70"
                          >
                            <img
                              src={a.thumbnail ?? a.cover}
                              alt=""
                              loading="lazy"
                              decoding="async"
                              onError={(e) => handleImgError(e, a.title, folioNoOf(a.id))}
                              className="h-14 w-12 shrink-0 border border-white/15 object-cover"
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block font-mono text-[8px] uppercase tracking-[0.28em] text-gold/90">
                                № {folio} · {a.readingTime}
                              </span>
                              <span className="mt-1 block truncate font-serif text-base leading-[1.2] text-ivory transition-colors duration-300 group-hover:text-gold">
                                {a.title}
                              </span>
                              <span className="mt-1 block truncate font-mono text-[8px] uppercase tracking-[0.22em] text-white/55">
                                {c.name} · {author?.name}
                              </span>
                            </span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </section>
              )
            })}
        </div>

        {/* ——— FRONT · the selected-wing line + RETURN ——— */}
        <div className="mt-[clamp(3rem,7vh,5rem)] flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold">
            {active
              ? `Selected wing — ${active} · ${wingArticles[0] ? `“${wingArticles[0].a.title}” steps forward` : ''}`
              : 'Seven doors — choose a wing and its stories step forward'}
          </p>
          <div className="flex items-center gap-6 font-mono text-[9px] uppercase tracking-[0.3em] text-white/55">
            {active && (
              <button
                type="button"
                onClick={() => { setActive(null); navigate('/categories', { replace: true }) }}
                className="border-b border-gold/60 pb-0.5 font-mono text-[9px] uppercase tracking-[0.3em] text-gold no-underline transition-colors hover:text-ivory"
              >
                Esc · return to all seven doors
              </button>
            )}
            <Link to="/articles" className="border-b border-gold/50 pb-0.5 font-mono text-[9px] uppercase tracking-[0.3em] text-gold no-underline transition-colors hover:text-ivory">
              The full shelf →
            </Link>
          </div>
        </div>

        {/* the eighth wing — an open door for the next submission (real CTA) */}
        <div className="mt-8 border border-dashed border-white/15 px-6 py-6 text-center transition-colors duration-500 hover:border-gold/35">
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/55">Wing VIII — unopened</p>
          <p className="mt-2 font-serif text-lg font-light italic text-ivory/70">
            Every wing on this page was opened by a writer who sent their work in. The eighth opens with the first submission that belongs to it.
          </p>
          <Link to="/submit" className="mt-4 inline-block border-b border-gold/60 pb-1 font-mono text-[10px] uppercase tracking-[0.28em] text-gold no-underline transition-colors hover:text-ivory">
            Send your work →
          </Link>
        </div>
      </div>
    </div>
    </ImmersiveShell>
  )
}
