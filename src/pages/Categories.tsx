import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSeo } from '../hooks/useSeo'
import { getAuthor, ARTICLES, CATEGORIES } from '../data/content'

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
export default function Categories() {
  const { slug } = useParams<{ slug?: string }>()
  const selectedCategory = slug ? CATEGORIES.find((category) => category.slug === slug) : undefined
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

  const select = (name: string) => {
    setActive((cur) => (cur === name ? null : name))
    setFocusIdx(Math.max(0, CATEGORIES.findIndex((c) => c.name === name)))
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
        }
        break
    }
  }

  useEffect(() => {
    hallRef.current?.focus()
  }, [focusIdx])

  return (
    <div className="relative overflow-hidden bg-wine-deep">
      {/* ——— BACK · the hall — wine falloff, arched recesses ——— */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,rgba(92,18,36,0.38),transparent_62%),radial-gradient(90%_70%_at_90%_100%,rgba(184,145,70,0.10),transparent_60%),linear-gradient(170deg,#4A1120_0%,#3B0D17_52%,#1A070E_100%)]" />
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
          <h1 className="relative font-serif text-[clamp(3.4rem,10vw,8rem)] font-light leading-[0.85] tracking-[-0.02em] text-ivory">
            <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none font-serif text-[clamp(4rem,13vw,10.5rem)] font-semibold leading-none text-transparent [-webkit-text-stroke:1px_rgba(184,145,70,0.14)]">
              WINGS
            </span>
            <span className="relative">The <em className="italic text-gold">wings</em></span>
          </h1>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.34em] text-gold/85">
            The wings — seven departments of Verlyse Media
          </p>
          <h2 aria-live="polite" className="mt-3 font-mono text-[10px] uppercase tracking-[0.3em] text-white/60">
            {active
              ? `${active} — ${CATEGORIES.find((c) => c.name === active)?.count ?? ''} folios · step forward`
              : 'Seven doors — nineteen folios · choose your department'}
          </h2>
        </div>

        {/* ——— MID · the seven wing-doors — the active wing becomes a solid
            ivory door plate that steps forward (P27 board: tall ivory arch,
            gold ghost doors); the others recede. ——— */}
        <div className="mt-[clamp(3rem,8vh,5rem)] grid grid-cols-2 items-start gap-x-4 gap-y-10 md:grid-cols-4 xl:grid-cols-7" onKeyDown={onKeyDown}>
          {CATEGORIES.map((c, i) => {
            const isActive = active === c.name
            /* the ivory plate: the selected wing's door — or the first door at
               rest, as the board keeps the first wing standing forward */
            const isPlate = isActive || (!active && i === 0)
            const isFocused = focusIdx === i && !active
            return (
              <motion.div
                key={c.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '0px 0px -4% 0px' }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: Math.min(i * 0.05, 0.3) }}
                className={isPlate ? 'col-span-2 md:col-span-1' : ''}
              >
                <div className={`flex flex-col items-center transition-all duration-700 ${active && !isActive ? 'opacity-25 md:opacity-30' : 'opacity-100'}`}>
                <button
                  type="button"
                  onClick={() => select(c.name)}
                  onFocus={() => !active && setFocusIdx(i)}
                  aria-pressed={isActive}
                  className={`group relative flex w-full flex-col items-center px-2 pb-2 pt-6 text-center outline-none transition-all duration-700 ${
                    isPlate
                      ? 'min-h-[clamp(10rem,22vh,13rem)] max-w-none bg-[#F8F6F2] shadow-[0_18px_44px_rgba(0,0,0,0.45)] md:min-h-[clamp(17rem,40vh,24rem)] md:max-w-[180px]'
                      : 'max-w-[150px] cursor-pointer'
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
                  />
                  {/* the plate's inner hairline — brass thread inside the ivory door */}
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-1 rounded-t-full border transition-colors duration-500 ${
                      isPlate
                        ? 'border-[#D9B978]/50'
                        : 'border-transparent'
                    }`}
                  />
                  {/* the recess — a darker opening inside the arch */}
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-x-[18%] top-[9%] bottom-[4%] rounded-t-full border transition-colors duration-500 ${
                      isPlate ? 'border-[#B89146]/25' : 'border-white/10 group-hover:border-gold/25'
                    }`}
                  />
                  <span
                    className={`relative font-mono text-[8px] uppercase tracking-[0.3em] ${
                      isPlate ? 'text-[#7C6338]' : 'text-gold'
                    }`}
                  >
                    Wing {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][i]}
                  </span>
                  <span
                    className={`relative mt-3 font-serif font-normal leading-[1.05] transition-colors duration-500 ${
                      isPlate
                        ? 'italic text-[#1E0B12]'
                        : 'text-ivory group-hover:text-gold'
                    } ${c.name === 'Stories' ? 'text-[clamp(1.4rem,1.7vw,1.7rem)]' : 'text-[clamp(1.05rem,1.3vw,1.3rem)]'}`}
                  >
                    {c.name}
                  </span>
                  <span
                    className={`relative mt-2 font-mono text-[8px] uppercase tracking-[0.28em] ${
                      isPlate ? 'text-[#2A0F18]/70' : 'text-white/55'
                    }`}
                  >
                    {c.count} folio{c.count === 1 ? '' : 's'}
                  </span>
                  {isActive && (
                    <span className="relative mt-3 font-mono text-[8px] uppercase tracking-[0.28em] text-[#7C6338]">
                      Showing ↓
                    </span>
                  )}
                </button>

                {/* ——— FRONT · the wing's folios — the selected wing's stories step forward ——— */}
                <ul
                  className={`mt-4 w-full space-y-3 border-l-2 pl-4 transition-colors duration-700 ${
                    isActive ? 'border-gold/60' : active ? 'border-white/10' : 'border-gold/20'
                  }`}
                  aria-label={`Folios in the ${c.name} wing`}
                >
                  {foliosOf(c.name).map(({ a, i }) => {
                    const author = getAuthor(a.authorId)
                    const folio = String(i + 1).padStart(2, '0')
                    const ghosted = !!active && !isActive
                    return (
                      <li key={a.id} className={`transition-opacity duration-700 ${ghosted ? 'opacity-10' : 'opacity-100'}`}>
                        <Link
                          to={ghosted ? '#' : `/article/${a.id}`}
                          onClick={(e) => { if (ghosted) e.preventDefault() }}
                          aria-label={`Folio ${folio} — ${a.title}, ${c.name}`}
                          className="group block no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold/70"
                        >
                          <span className="font-mono text-[8px] uppercase tracking-[0.28em] text-gold/90">№ {folio}</span>
                          <span className="mt-1 block font-serif text-sm leading-[1.25] text-ivory/90 transition-all duration-300 group-hover:text-gold">
                            {a.title}
                          </span>
                          <span className="mt-1 block font-mono text-[8px] uppercase tracking-[0.24em] text-white/50">
                            {c.name} · {author?.name}
                          </span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
                </div>
              </motion.div>
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
                onClick={() => setActive(null)}
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
  )
}
