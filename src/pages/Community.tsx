import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSeo } from '../hooks/useSeo'
import { ARTICLES, BRAND, COMMUNITY_STATS, COMMUNITY_VOICES, type Article } from '../data/content'

/** The perforated rail of the film strip — sprocket holes, punched in the dark. */
function FilmRail() {
  return (
    <div
      aria-hidden="true"
      className="h-[10px] w-full bg-[repeating-linear-gradient(90deg,#14060B_0px,#14060B_6px,#0A0306_6px,#0A0306_26px)]"
    />
  )
}

/** One frame of the reel — a cover, its folio, and the title beneath it. */
function FilmFrame({ article, folio }: { article: Article; folio: string }) {
  return (
    <Link to={`/article/${article.id}`} className="group block w-[220px] shrink-0 no-underline md:w-[248px]">
      <div className="img-frame relative aspect-[4/5] overflow-hidden border border-white/12 transition-colors duration-700 group-hover:border-gold/50">
        <img
          src={article.cover}
          alt={`${article.title} — cover`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.1]"
        />
        <span aria-hidden="true" className="absolute left-3 top-3 border border-gold/60 bg-[#14060B]/60 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.26em] text-ivory opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          Watch the feature →
        </span>
      </div>
      <p className="mt-2.5 font-mono text-[8px] uppercase tracking-[0.28em] text-gold/90">№ {folio}</p>
      <p className="mt-1 font-serif text-[15px] font-light italic leading-snug text-ivory/80 transition-colors duration-500 group-hover:text-[#E8D9A8]">
        “{article.title}”
      </p>
      <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.26em] text-white/60">{article.category}</p>
    </Link>
  )
}

/**
 * THE COMMONS — the inhabited hall of the publication, from the approved
 * Penpot board P27 / THE COMMONS.
 *
 * BACK  · the hall (wine falloff, warm light)
 * MID   · film strip 01 → 19 — all nineteen real covers on a reel, held not
 *         driven (drag to move it, like a strip of film)
 * FRONT · the ledger in numbers (19 · 1281 · 585 · 15, read from the feed),
 *         a real community voice (@marziaontop on №12), and the letter from
 *         the desk → send your work
 *
 * Not a dashboard: an inhabited hall with a counter and a wall of voices.
 * States: HABITAT · READ · RETURN. Reduced motion: reel stays still and
 * fully present.
 */
export default function Community() {
  useSeo({
    path: '/community',
    title: 'Community',
    description: 'The Verlyse Media community — 19 features, 1281 appreciations, 585 conversations, and a rule of transparency.',
  })

  const covers = ARTICLES
  const folioOf = (id: string) => String(ARTICLES.findIndex((a) => a.id === id) + 1).padStart(2, '0')
  const featureVoice = COMMUNITY_VOICES.find((v) => v.handle === '@marziaontop') ?? COMMUNITY_VOICES[0]
  const otherVoices = COMMUNITY_VOICES.filter((v) => v !== featureVoice)

  /* the reel is held, not driven: drag to move it, like a strip of film */
  const reelRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; l: number } | null>(null)
  const dragged = useRef(false)
  const startDrag = (e: React.PointerEvent) => {
    const el = reelRef.current
    if (!el) return
    dragged.current = false
    drag.current = { x: e.clientX, l: el.scrollLeft }
    el.classList.add('is-dragging')
    try { el.setPointerCapture(e.pointerId) } catch { /* noop */ }
  }
  const moveDrag = (e: React.PointerEvent) => {
    const el = reelRef.current
    const d = drag.current
    if (!el || !d) return
    const dx = e.clientX - d.x
    if (Math.abs(dx) > 4) dragged.current = true
    if (dragged.current) el.scrollLeft = d.l - dx
  }
  const endDrag = () => {
    drag.current = null
    reelRef.current?.classList.remove('is-dragging')
  }
  const swallowClickAfterDrag = (e: React.MouseEvent) => {
    if (dragged.current) {
      e.preventDefault()
      e.stopPropagation()
      dragged.current = false
    }
  }

  return (
    <div className="relative overflow-hidden bg-wine-deep">
      {/* ——— BACK · the hall ——— */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,rgba(92,18,36,0.38),transparent_62%),radial-gradient(90%_70%_at_90%_100%,rgba(184,145,70,0.10),transparent_60%),linear-gradient(170deg,#4A1120_0%,#3B0D17_52%,#1A070E_100%)]" />
      </div>

      <div className="relative mx-auto max-w-[1440px] px-[clamp(1.25rem,4vw,4.75rem)] pb-[clamp(4rem,9vh,7rem)] pt-[clamp(7rem,15vh,9.5rem)]">
        {/* ——— header — ghost COMMONS + the reel's promise ——— */}
        <div className="text-center">
          <h1 className="relative font-serif text-[clamp(2.8rem,8vw,6.5rem)] font-light leading-[0.9] tracking-[-0.02em] text-ivory">
            <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none font-serif text-[clamp(4rem,12vw,9.5rem)] font-semibold leading-none text-transparent [-webkit-text-stroke:1px_rgba(184,145,70,0.14)]">
              COMMONS
            </span>
            <span className="relative">The <em className="italic text-gold">commons</em></span>
          </h1>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.34em] text-gold/85">
            The feed in pictures — all nineteen covers, held not driven
          </p>
        </div>

        {/* ——— MID · the film strip — all nineteen real covers, in order ——— */}
        <section aria-label="The feed in pictures — nineteen covers" className="mt-[clamp(2.5rem,7vh,4.5rem)]">
          <FilmRail />
          <div
            ref={reelRef}
            onPointerDown={startDrag}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
            onClick={swallowClickAfterDrag}
            className="vm-film-scroll flex gap-6 overflow-x-auto overscroll-x-contain py-8"
            tabIndex={0}
            aria-label="Nineteen covers in publication order — scroll or drag to move the reel"
          >
            {covers.map((a) => (
              <motion.div key={a.id} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '0px 0px -4% 0px' }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
                <FilmFrame article={a} folio={folioOf(a.id)} />
              </motion.div>
            ))}
          </div>
          <FilmRail />
          <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.28em] text-white/45">
            № 01 — “Their Voices Matter” → № 19 — “Mir Raza Ali” · drag the reel, don’t drive it
          </p>
        </section>

        {/* ——— FRONT · the ledger — real numbers, engraved not estimated ——— */}
        <section aria-label="The commons in numbers" className="mt-[clamp(3.5rem,9vh,6rem)] border-t border-white/10 pt-10">
          <p className="text-center font-mono text-[10px] uppercase tracking-[0.3em] text-gold/85">
            The commons in numbers — read from the feed, nothing invented
          </p>
          <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
            {COMMUNITY_STATS.map((st) => (
              <motion.div
                key={st.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '0px 0px -6% 0px' }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative border-l border-gold/30 pl-5"
              >
                <span aria-hidden="true" className="pointer-events-none absolute -right-1 -top-3 select-none font-serif text-[clamp(3.5rem,7vw,6rem)] font-semibold leading-none text-transparent [-webkit-text-stroke:1px_rgba(184,145,70,0.16)]">
                  {st.value}
                </span>
                <p className="font-serif text-[clamp(2.6rem,5vw,4.2rem)] font-light leading-[0.95] text-ivory">{st.value}</p>
                <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.28em] text-gold/90">{st.label}</p>
                <p className="mt-3 max-w-[30ch] text-sm leading-[1.7] text-white/60">{st.note}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ——— FRONT · a real community voice — @marziaontop on №12 ——— */}
        <section aria-label="A voice in the commons" className="mt-[clamp(3.5rem,9vh,6rem)] border-t border-white/10 pt-12 text-center">
          <span aria-hidden="true" className="flex items-center justify-center gap-4">
            <span className="h-px w-14 bg-gold/40" />
            <span className="font-serif text-2xl leading-none text-gold">“</span>
            <span className="h-px w-14 bg-gold/40" />
          </span>
          <blockquote className="mx-auto mt-8 max-w-[820px]">
            <p className="font-serif text-[clamp(1.6rem,3.6vw,2.6rem)] font-light italic leading-[1.3] text-ivory">
              “{featureVoice.text}”
            </p>
            <cite className="mt-6 block font-mono text-[10px] uppercase tracking-[0.28em] text-gold not-italic">
              {featureVoice.handle} — beneath №12 · {featureVoice.post}
            </cite>
          </blockquote>

          {/* more real voices — the feed answers the writers */}
          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {otherVoices.map((v) => (
              <p key={v.handle + v.text.slice(0, 8)} className="border border-white/10 bg-[#2A0F18]/50 px-5 py-4 text-left">
                <span className="block font-serif text-sm italic leading-[1.55] text-ivory/80">“{v.text}”</span>
                <span className="mt-2 block font-mono text-[8px] uppercase tracking-[0.24em] text-white/50">
                  {v.handle} · beneath “{v.post}”
                </span>
              </p>
            ))}
          </div>
        </section>

        {/* ——— FRONT · the letter from the desk ——— */}
        <section className="mt-[clamp(3.5rem,9vh,6rem)] border-t border-white/10 pt-12">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold">A letter from the desk</p>
            <p className="mt-5 max-w-[52ch] font-serif text-lg font-light italic leading-[1.8] text-ivory/80">
              {BRAND.disclosure}
            </p>
            <Link to="/submit" className="btn btn-gold mt-8">
              Send your work →
            </Link>
            <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.3em] text-white/50">
              {BRAND.handle} — the conversation is the magazine · the desk writes back
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
