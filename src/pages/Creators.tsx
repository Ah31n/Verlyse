import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useSeo } from '../hooks/useSeo'
import { ARTICLES, AUTHORS, authorPhoto } from '../data/content'

/** The folios a creator holds in the archive — their own entries. */
function foliosOf(authorId: string) {
  return ARTICLES.filter((a) => a.authorId === authorId)
}

/** The monogram — initials from the name (AJ for Alina Javed). */
function monogram(name: string) {
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * THE CONTRIBUTOR WALL — from the approved Penpot board P27 / THE WALL.
 *
 * BACK  · wine wall + brass rules
 * MID   · sixteen names — the wall of voices (real names, handles, folio counts)
 * FRONT · the focused contributor steps forward into a dossier plate
 *        (monogram, record № / 16, name, role, folios, OPEN THE DOSSIER →)
 *
 * States: REST · FOCUS · SELECTED · DOSSIER OPENS · RETURN
 * Not a grid of profile cards: a wall whose names step forward.
 * Keyboard: names are real buttons; ← → move · Enter selects · Esc returns.
 */
export default function Creators() {
  useSeo({
    path: '/creators',
    title: 'Featured Creators',
    description: 'The creators featured by Verlyse Media — sixteen names, credited by name and handle on every feature.',
  })
  const reduced = useReducedMotion() === true
  const [selectedId, setSelectedId] = useState<string>(AUTHORS[0]?.id ?? 'alina-javed')
  const [resting, setResting] = useState(false)

  const selected = useMemo(() => AUTHORS.find((a) => a.id === selectedId) ?? AUTHORS[0], [selectedId])
  const folios = useMemo(() => foliosOf(selected.id), [selected])
  const recordNo = AUTHORS.findIndex((a) => a.id === selected.id) + 1
  const folioNums = folios
    .map((f) => `№ ${String(ARTICLES.findIndex((x) => x.id === f.id) + 1).padStart(2, '0')}`)
    .join(' · ')

  const select = (id: string) => {
    setSelectedId(id)
    setResting(false)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    const n = AUTHORS.length
    const pos = AUTHORS.findIndex((a) => a.id === selectedId)
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault()
        setSelectedId(AUTHORS[(pos + 1) % n].id)
        setResting(false)
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault()
        setSelectedId(AUTHORS[(pos - 1 + n) % n].id)
        setResting(false)
        break
      case 'Escape':
        /* RETURN — the wall at rest, dossier steps back */
        e.preventDefault()
        setResting(true)
        break
    }
  }

  return (
    <div className="relative overflow-hidden bg-wine-deep">
      {/* ——— BACK · wine wall with brass rules ——— */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,rgba(92,18,36,0.38),transparent_62%),radial-gradient(90%_70%_at_90%_100%,rgba(184,145,70,0.10),transparent_60%),linear-gradient(170deg,#4A1120_0%,#3B0D17_52%,#1A070E_100%)]" />
        {[0.2, 0.4, 0.6, 0.8].map((t, i) => (
          <div key={i} className="absolute inset-x-0 h-px" style={{ top: `${t * 100}%`, background: 'linear-gradient(90deg, transparent, rgba(217,185,120,0.08), transparent)' }} />
        ))}
      </div>

      <div onKeyDown={onKeyDown} className="relative mx-auto max-w-[1440px] px-[clamp(1.25rem,4vw,4.75rem)] pb-[clamp(4rem,9vh,7rem)] pt-[clamp(7rem,15vh,9.5rem)]">
        {/* ——— MID · header — ghost CONTRIBUTORS + real subtitle ——— */}
        <div className="text-center">
          <h1 className="relative font-serif text-[clamp(2.8rem,8vw,6.5rem)] font-light leading-[0.9] tracking-[-0.02em] text-ivory">
            <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none font-serif text-[clamp(4rem,12vw,9.5rem)] font-semibold leading-none text-transparent [-webkit-text-stroke:1px_rgba(184,145,70,0.14)]">
              CONTRIBUTORS
            </span>
            <span className="relative">The wall <em className="italic text-gold">of names</em></span>
          </h1>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.34em] text-gold/85">
            The contributor wall — {AUTHORS.length} voices · {ARTICLES.length} folios
          </p>
        </div>

        {/* ——— FRONT · the dossier plate — the focused contributor steps forward ——— */}
        <div className="mt-[clamp(2.5rem,6vh,4rem)]">
          <AnimatePresence mode="wait">
            {!resting && (
              <motion.article
                key={selected.id}
                initial={reduced ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: -12 }}
                transition={{ duration: reduced ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative border border-gold/25 bg-[#2A0F18]/70 p-6 md:p-8"
                aria-label={`Dossier — ${selected.name}`}
              >
                <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[minmax(0,1fr)_auto]">
                  <div className="min-w-0">
                    {/* name — the primary object on the wall */}
                    <h2 className="font-serif text-[clamp(2.4rem,6vw,4.2rem)] font-semibold leading-[0.95] tracking-[-0.01em] text-ivory">
                      {selected.name.toUpperCase()}
                    </h2>
                    <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.3em] text-white/60">
                      {selected.handle} · {folios.length} folio{folios.length === 1 ? '' : 's'}
                    </p>

                    <div className="mt-6 h-px w-24 bg-gold" aria-hidden />
                    <p className="mt-4 max-w-[56ch] font-serif text-xl font-light italic leading-[1.6] text-ivory/80">
                      {selected.role}
                    </p>
                    <p className="mt-2 max-w-[56ch] font-mono text-[10px] uppercase tracking-[0.26em] text-gold/90">
                      {folios.length} folio{folios.length === 1 ? '' : 's'} in the archive — {folioNums}
                    </p>

                    <div className="mt-7 flex flex-wrap items-center gap-6">
                      <Link to={`/creator/${selected.id}`} className="btn btn-gold">
                        Open the dossier →
                      </Link>
                      <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/45">
                        Record {String(recordNo).padStart(2, '0')} / {AUTHORS.length}
                      </p>
                    </div>
                  </div>

                  {/* portrait / monogram plate */}
                  <div className="img-frame relative flex aspect-[3/4] w-full max-w-[190px] items-center justify-center overflow-hidden bg-[#F2EADA] p-3">
                    {selected.portrait || selected.profilePhoto ? (
                      <img
                        src={authorPhoto(selected.id)}
                        alt={`${selected.name} — photograph`}
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                        className="block max-h-[260px] w-full object-contain shadow-[0_4px_14px_rgba(0,0,0,0.3)]"
                      />
                    ) : (
                      <span className="font-serif text-6xl font-semibold italic text-[#2A0F18]">
                        {monogram(selected.name)}
                      </span>
                    )}
                    <span aria-hidden className="absolute inset-2 border border-gold/40" />
                    <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#1C0509] px-2 py-1 font-mono text-[8px] uppercase tracking-[0.24em] text-ivory">
                      Portrait · Plate 01
                    </span>
                  </div>
                </div>

                {/* their folios — real links into the archive */}
                {folios.length > 0 && (
                  <ul className="mt-7 grid grid-cols-1 gap-2 sm:grid-cols-2" aria-label={`Folios by ${selected.name}`}>
                    {folios.map((f) => {
                      const fnum = String(ARTICLES.findIndex((x) => x.id === f.id) + 1).padStart(2, '0')
                      return (
                        <li key={f.id}>
                          <Link
                            to={`/article/${f.id}`}
                            className="group flex items-baseline gap-3 border border-ivory/10 bg-[#F8F6F2]/[0.04] px-4 py-3 no-underline transition-colors duration-300 hover:border-gold/40"
                          >
                            <span className="font-mono text-[10px] text-gold">№{fnum}</span>
                            <span className="flex-1 font-serif text-base text-ivory/90 transition-colors group-hover:text-gold">
                              “{f.title}”
                            </span>
                            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/45">{f.category}</span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </motion.article>
            )}
          </AnimatePresence>
        </div>

        {/* ——— MID · the wall of names — the other fifteen, architectural ——— */}
        <div className="mt-[clamp(3rem,8vh,5rem)] border-t border-white/10 pt-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold/80">
            {resting ? 'The wall — choose a name' : 'The wall — sixteen names, every credit real'}
          </p>
          <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-[clamp(1.4rem,3vh,2rem)] sm:grid-cols-2 lg:grid-cols-4">
            {AUTHORS.map((a) => {
              const isSel = a.id === selected.id
              const n = foliosOf(a.id).length
              const faded = !resting && !isSel
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => select(a.id)}
                  onFocus={() => !resting && setSelectedId(a.id)}
                  aria-pressed={!resting && isSel}
                  className={`group relative border-l-2 py-3 pl-5 text-left transition-all duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold/70 ${
                    !resting && isSel
                      ? 'border-gold bg-gradient-to-r from-gold/[0.08] to-transparent'
                      : 'border-white/10 hover:border-gold/50'
                  } ${faded ? 'opacity-60' : 'opacity-100'} ${resting ? 'hover:opacity-100' : ''}`}
                >
                  <span className={`block font-serif text-[clamp(1.3rem,1.9vw,1.65rem)] font-normal leading-[1.1] transition-all duration-500 ${
                    !resting && isSel ? 'italic text-gold' : 'text-ivory/90 group-hover:text-gold'
                  }`}>
                    {a.name}
                  </span>
                  <span className="mt-1.5 block font-mono text-[9px] uppercase tracking-[0.22em] text-white/50">
                    {a.handle} · {n} folio{n === 1 ? '' : 's'}
                  </span>
                  {!resting && isSel && (
                    <span aria-hidden="true" className="mt-2 block h-px w-full max-w-[3rem] bg-gold/50" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ——— RETURN + the growing wall CTA ——— */}
        <div className="mt-[clamp(3rem,7vh,5rem)] flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 font-mono text-[9px] uppercase tracking-[0.3em] text-white/55">
          <span>Focus a name → it steps forward · the dossier opens the record</span>
          <div className="flex items-center gap-6">
            {!resting && (
              <button
                type="button"
                onClick={() => setResting(true)}
                className="border-b border-gold/60 pb-0.5 font-mono text-[9px] uppercase tracking-[0.3em] text-gold no-underline transition-colors hover:text-ivory"
              >
                Esc · return to the wall
              </button>
            )}
            <Link to="/submit" className="border-b border-gold/60 pb-0.5 font-mono text-[9px] uppercase tracking-[0.3em] text-gold no-underline transition-colors hover:text-ivory">
              The wall grows with every feature →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
