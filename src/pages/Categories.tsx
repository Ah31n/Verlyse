import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { useSeo } from '../hooks/useSeo'
import { getAuthor, ARTICLES, CATEGORIES, LEDGER } from '../data/content'
import { ImmersiveShell, BrassThread } from '../components/immersive'
import { DepartmentDoor } from '../components/editorial'

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
  const navigate = useNavigate()
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
    hallRef.current?.focus()
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
          <h1
            string="split"
            string-id="categories-title"
            className="relative font-serif text-[clamp(3.4rem,10vw,8rem)] font-light leading-[0.85] tracking-[-0.02em] text-ivory"
          >
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
              : `Seven doors — ${LEDGER.features} folios · choose your department`}
          </h2>
        </div>

        {/* ——— MID · the seven wing-doors — the active wing becomes a solid
            ivory door plate that steps forward (P27 board: tall ivory arch,
            gold ghost doors); the others recede. ——— */}
        <div className="mt-[clamp(3rem,8vh,5rem)] grid grid-cols-2 items-start gap-x-4 gap-y-10 md:grid-cols-4 xl:grid-cols-7 xl:[perspective:1500px]" onKeyDown={onKeyDown}>
          {CATEGORIES.map((c, i) => {
            const isActive = active === c.name
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
                  <DepartmentDoor
                    category={c}
                    index={i}
                    isActive={isActive}
                    isFocused={isFocused}
                    onClick={() => select(c.name)}
                  />

                  {/* ——— FRONT · the wing's folios — the selected wing's stories step forward ——— */}
                  <ul
                    className={`mt-4 w-full space-y-3 border-l-2 pl-4 transition-colors duration-700 ${
                      isActive ? 'border-gold/60' : active ? 'border-white/10' : 'border-gold/20'
                    }`}
                    aria-label={`Folios in the ${c.name} wing`}
                  >
                    {foliosOf(c.name).map(({ a, i: fIdx }) => {
                      const author = getAuthor(a.authorId)
                      const folio = String(fIdx + 1).padStart(2, '0')
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
