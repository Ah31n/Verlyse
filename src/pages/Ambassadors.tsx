import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useSeo } from '../hooks/useSeo'
import Reveal from '../components/ui/Reveal'
import { SectionHead } from '../components/ui/primitives'
import { BRAND } from '../data/content'

type Member = (typeof BRAND.team)[number]

/** The people of Verlyse Media, grouped by the work they do. */
const T = (name: string) => BRAND.team.find((m) => m.name === name)!

/** The people of Verlyse Media — the three clusters of the approved Penpot
 *  PEOPLE board: Leadership · Editorial & Creative · Programs & Craft. */
const CLUSTERS: { label: string; caption: string; members: Member[] }[] = [
  {
    label: 'I — Leadership',
    caption: 'ANA FATIMA · HOORIA MAQSOOD · HAIDAR ALI · LIBA ADEEL',
    members: [T('Ana Fatima'), T('Hooria Maqsood'), T('Haidar Ali'), T('Liba Adeel')],
  },
  {
    label: 'II — Editorial & Creative',
    caption: 'ZAINAB FAISAL RAO · AMNA RAO · HAIQA NAFEES · ZUHA FARHAN',
    members: [T('Zainab Faisal Rao'), T('Amna Rao'), T('Haiqa Nafees'), T('Zuha Farhan')],
  },
  {
    label: 'III — Programs & Craft',
    caption: 'JAVERIA KARIM · MANHA · AHSAN ASHFAQ · ZAINAB KHAN',
    members: [T('Javeria Karim'), T('Manha'), T('Ahsan Ashfaq'), T('Zainab Khan')],
  },
]

const ALL_MEMBERS = BRAND.team
const initialsOf = (n: string) => n.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()

/**
 * The People — the magazine's people, kept as an archival gallery.
 * Each name is a numbered diamond medallion (the same diamond that signs
 * every feature), grouped spatially by the work they do. Choosing a medallion
 * focuses it and opens the person's record. The thirteenth seat is drawn open,
 * waiting for the first ambassador the program brings.
 */
export default function Ambassadors() {
  useSeo({
    path: '/ambassadors',
    title: 'Brand Ambassador',
    description: 'The Verlyse Media Brand Ambassador program — application open, as announced on the profile.',
  })
  const reduced = useReducedMotion() === true
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selected = selectedId ? ALL_MEMBERS.find((m) => m.name === selectedId) ?? null : null
  const selectedNo = selected ? ALL_MEMBERS.findIndex((m) => m.name === selected.name) + 1 : 0
  const close = () => setSelectedId(null)

  // keep the dialog focused and escapable — the record behaves like a drawer
  const dialogRef = useRef<HTMLDivElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)
  useEffect(() => {
    if (!selected) return
    openerRef.current = document.activeElement as HTMLElement
    const t = setTimeout(() => dialogRef.current?.querySelector<HTMLElement>('button[aria-label="Close the record"]')?.focus(), 60)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      else if (e.key === 'Tab' && dialogRef.current) {
        const f = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'))
        if (!f.length) return
        const first = f[0], last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', onKey)
      openerRef.current?.focus?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])

  return (
    <>
      <section className="relative overflow-hidden border-b border-white/10 bg-wine-deep pb-14 pt-[clamp(7rem,16vh,10rem)]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,rgba(92,18,36,0.38),transparent_62%),radial-gradient(90%_70%_at_90%_100%,rgba(184,145,70,0.10),transparent_60%),linear-gradient(170deg,#4A1120_0%,#3B0D17_52%,#1A070E_100%)]" />
        </div>
        <div className="relative mx-auto w-full max-w-page px-[clamp(1.25rem,4vw,4.75rem)] text-center">
          <h1 className="relative font-serif text-[clamp(2.8rem,8vw,6.5rem)] font-light leading-[0.9] tracking-[-0.02em] text-ivory">
            <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none font-serif text-[clamp(4rem,12vw,9.5rem)] font-semibold leading-none text-transparent [-webkit-text-stroke:1px_rgba(184,145,70,0.14)]">
              PEOPLE
            </span>
            <span className="relative">The people <em className="italic text-gold">in the room</em></span>
          </h1>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.34em] text-gold/85">
            The people — ambassadors · team · the open seat
          </p>
          <Reveal delay={0.2}>
            <p className="mx-auto mt-6 max-w-[52ch] text-lg leading-[1.8] text-white/70">
              Twelve credited in the room today, each a numbered medallion. Choose one to open the record. The thirteenth diamond is drawn open, waiting for the ambassador the program brings.
            </p>
          </Reveal>
        </div>
      </section>

      {/* the people — an archival gallery of diamond medallions */}
      <section className="border-t border-white/10 py-[clamp(5rem,10vh,8rem)]">
        <div className="mx-auto max-w-page px-[clamp(1.75rem,5.5vw,4.75rem)]">
          {CLUSTERS.map((cluster) => (
            <div key={cluster.label} className="border-t border-white/10 py-10 first:border-t-0 first:pt-0">
              <div className="mb-6 border-b border-white/10 pb-4">
                <h2 className="font-serif text-[clamp(1.6rem,3vw,2.4rem)] font-light text-ivory">{cluster.label}</h2>
                <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.28em] text-white/50">{cluster.caption}</p>
              </div>

              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {cluster.members.map((m) => {
                  const no = ALL_MEMBERS.findIndex((x) => x.name === m.name) + 1
                  const isSel = selectedId === m.name
                  const mono = initialsOf(m.name)
                  return (
                    <button
                      key={m.name}
                      type="button"
                      onClick={() => setSelectedId(isSel ? null : m.name)}
                      aria-expanded={isSel}
                      aria-label={`№${String(no).padStart(2, '0')} — ${m.name}, ${m.role}${isSel ? '. Record open.' : ''}`}
                      className={`group relative flex flex-col items-center px-2 pb-5 text-center transition-transform duration-500 ${
                        isSel ? 'z-10 -translate-y-2' : 'hover:-translate-y-1'
                      }`}
                    >
                      {/* the numbered diamond medallion — the same diamond that signs each feature */}
                      <span className="relative grid h-[104px] w-[104px] place-items-center" aria-hidden="true">
                        <span
                          className={`absolute inset-0 rotate-45 border transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                            isSel ? 'border-gold bg-[#2A0F18]' : 'border-gold/40 bg-transparent group-hover:border-gold/80 group-hover:bg-[#2A0F18]/60'
                          }`}
                        />
                        <span className={`absolute inset-[7px] rotate-45 border transition-colors duration-700 ${isSel ? 'border-gold/50' : 'border-gold/15 group-hover:border-gold/35'}`} />
                        <span className="relative font-serif text-2xl italic text-gold">{mono}</span>
                        {/* the number — riveted at the diamond's corner */}
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-wine-deep px-1.5 font-mono text-[9px] tracking-[0.2em] text-gold">
                          №{String(no).padStart(2, '0')}
                        </span>
                      </span>

                      <span className={`mt-4 font-serif text-lg leading-tight transition-colors duration-300 ${isSel ? 'italic text-gold' : 'text-ivory group-hover:text-gold'}`}>
                        {m.name}
                      </span>
                      <span className="mt-1 font-mono text-[8.5px] uppercase tracking-[0.22em] text-white/50">
                        {m.role}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {/* the open seat — the next ambassador */}
          <div className="mt-4 border border-dashed border-gold/40 bg-[#2A0F18]/60 p-8 md:p-10">
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
              <span aria-hidden="true" className="relative grid h-[104px] w-[104px] shrink-0 place-items-center">
                <span className="absolute inset-0 rotate-45 border border-dashed border-gold/60" />
                <span className="relative font-serif text-2xl italic text-gold/70">13</span>
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#2A0F18] px-1.5 font-mono text-[9px] tracking-[0.2em] text-gold">№13</span>
              </span>
              <div className="flex-1">
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-gold">The open seat</p>
                <h2 className="mt-1.5 font-serif text-[clamp(1.6rem,3vw,2.4rem)] font-light italic text-ivory">The next ambassador</h2>
                <p className="mt-2 max-w-[58ch] text-sm leading-[1.75] text-white/65">
                  The profile announces it plainly: “{BRAND.ambassadorNote}” — the program is led by {BRAND.team.find((t) => t.role === 'Head of Brand Ambassador')?.name}. The application form is open, one ambassador per campus.
                </p>
              </div>
              <a href={BRAND.ambassadorForm} target="_blank" rel="noopener noreferrer" className="btn btn-gold shrink-0">
                Apply as an ambassador
              </a>
            </div>
          </div>

          <Reveal className="mt-10">
            <p className="max-w-[58ch] text-sm leading-[1.8] text-white/55">
              The room as it stands today — every role above belongs to the people who make Verlyse Media. Where a handle is public, it sits beside the name; where a portrait is published, it will hang on the diamond. Nothing here is invented.
            </p>
          </Reveal>
        </div>
      </section>

      {/* the focused record — a person's dossier, opened from a medallion */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={reduced ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.4 }}
            ref={dialogRef}
            className="fixed inset-0 z-[1200] flex items-center justify-center bg-[#161412]/80 p-4 backdrop-blur-[2px] md:p-8"
            role="dialog"
            aria-modal="true"
            aria-label={`№${String(selectedNo).padStart(2, '0')} — ${selected.name}, ${selected.role}`}
            onClick={close}
          >
            <motion.div
              initial={reduced ? false : { scale: 0.96, y: 14 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ duration: reduced ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-2xl border border-gold/30 bg-[#2A0F18] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.55)] md:p-12"
              onClick={(e) => e.stopPropagation()}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -right-2 -top-8 select-none font-serif text-[9rem] font-semibold leading-none text-transparent [-webkit-text-stroke:1px_rgba(184,145,70,0.16)]"
              >
                {String(selectedNo).padStart(2, '0')}
              </span>

              <div className="relative flex items-start gap-6">
                <span aria-hidden="true" className="relative grid h-[88px] w-[88px] shrink-0 place-items-center">
                  <span className="absolute inset-0 rotate-45 border border-gold/60" />
                  <span className="absolute inset-[6px] rotate-45 border border-gold/20" />
                  <span className="relative font-serif text-xl italic text-gold">{initialsOf(selected.name)}</span>
                </span>
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold">{selected.role}</p>
                  <h2 className="mt-1.5 font-serif text-[clamp(1.8rem,3.6vw,2.8rem)] font-semibold leading-tight text-ivory">{selected.name}</h2>
                  {selected.handle && (
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-white/55">{selected.handle}</p>
                  )}
                </div>
              </div>

              <div className="relative mt-7 h-px w-24 bg-gold" aria-hidden="true" />
              <p className="relative mt-5 max-w-[58ch] text-[15px] leading-[1.8] text-white/75">{selected.description}</p>

              <p className="relative mt-6 font-mono text-[9px] uppercase tracking-[0.24em] text-white/45">
                №{String(selectedNo).padStart(2, '0')} of {ALL_MEMBERS.length} — the room of people, Verlyse Media
              </p>

              <button
                type="button"
                onClick={close}
                className="absolute right-5 top-5 grid h-10 w-10 place-items-center border border-ivory/20 font-mono text-sm text-ivory/70 transition-colors hover:border-gold hover:text-gold"
                aria-label="Close the record"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* the program — the application, word for word */}
      <section className="border-t border-white/10 py-[clamp(5rem,10vh,8rem)]">
        <div className="mx-auto max-w-page px-[clamp(1.75rem,5.5vw,4.75rem)]">
          <SectionHead eyebrow="The program" page="P. 02" ghost="02" />
          <Reveal className="border border-gold/25 bg-gradient-to-b from-wine-deep to-[#2A0811] p-12 text-center md:p-16">
            <p className="font-serif text-[clamp(2rem,4vw,3.4rem)] font-light text-ivory">The application is open</p>
            <p className="mx-auto mt-5 max-w-[46ch] [overflow-wrap:anywhere] font-serif text-xl font-light italic leading-[1.6] text-white/60">
              “Brand Ambassador &amp; submission application now open” — the announcement on the profile, word for word. The application form is open — <a href={BRAND.ambassadorForm} target="_blank" rel="noopener noreferrer" className="font-mono text-[11px] tracking-[0.08em] text-gold underline decoration-gold/40 underline-offset-4 transition-colors hover:text-ivory">apply now →</a>
            </p>
            <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.28em] text-gold">
              Questions? Write to us at {BRAND.handle} on Instagram
            </p>
            <Link to="/submit" className="btn btn-ghost mt-6">or send your work →</Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}
