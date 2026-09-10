import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useEffect, useRef, useState, lazy, Suspense, Component, type ReactNode } from 'react'
import type { SpatialState } from '../lib/three/spatialState'
import { useSeo } from '../hooks/useSeo'
import Reveal from '../components/ui/Reveal'
import CountUp from '../components/ui/CountUp'
import VoiceCarousel from '../components/ui/VoiceCarousel'
import { MotifDivider } from '../components/ui/ArticleClosing'
import { AnticipatedTitle, ReflectionLine } from '../components/ui/ScrollBeat'
import { LibraryCard, HiddenQuote } from '../components/ui/EasterEggs'
import { MetaRow, SectionHead, UnderlineLink } from '../components/ui/primitives'
import { ImmersiveShell, BrassThread } from '../components/immersive'
import { Magnetic, MaskReveal, Tilt3D, Slate } from '../components/cinematic'
import SaveButton from '../components/ui/SaveButton'
import { ARTICLES, BRAND, CATEGORIES, LEDGER, folioNoOf, getAuthor } from '../data/content'
import { handleImgError } from '../lib/imgFallback'
import { useWebGLSupport } from '../lib/three/useWebGLSupport'
import { introSeen, onIntroResolved } from '../lib/intro'
// The spatial engine is loaded on demand so its heavy chunk (three) never
// ships with the initial publication shell.
const SpatialArchive = lazy(() => import('../components/spatial/SpatialArchive'))

/**
 * The entrance must survive any WebGL edge case — if the spatial layer ever
 * fails at render time, it recedes entirely and the layered gradients behind
 * the masthead remain the fallback. The publication never blanks.
 */
class SpatialBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { /* the gradients remain the fallback — no console noise needed */ }
  render() { return this.state.failed ? null : this.props.children }
}

/**
 * Home — the cover of the magazine.
 * Typographic masthead over brand atmosphere, a feature card, a live ledger
 * of real numbers, and a strip of the platform's actual featured works.
 */


/** The cover: masthead + breathing headline + ledger + feature card. */
function Cover({ selectedId, state }: { selectedId: string | null; state: SpatialState }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const feature = ARTICLES[0]
  const author = getAuthor(feature.authorId)!
  const E = [0.22, 1, 0.36, 1] as const
  /* The entrance rides the preloader curtain: the cover's own elements
     begin as the curtain starts to lift (1.85s), so the whole opening —
     curtain in, threshold up, plate landed — stays inside ~2.7 seconds.
     Once the intro is resolved (skip pressed, reduced motion, or a repeat
     visit in the same session) every delay collapses to stillness and the
     cover simply presents itself, already open. */
  const [instant, setInstant] = useState(() => reduce === true || introSeen())
  useEffect(() => onIntroResolved(() => setInstant(true)), [])
  const T = instant
    ? { mast: 0.02, rule: 0.08, h1a: 0.1, plate: 0.16, deck: 0.24, cta: 0.3 }
    : { mast: 1.35, rule: 1.45, h1a: 1.5, plate: 1.55, deck: 2.0, cta: 2.1 }
  /* skipping resolves the timeline mid-flight: every not-yet-run entrance
     must land at once, so the reader who skipped never watches a half-lit
     hall — delays are already collapsed above; durations collapse here */
  const D = (base: number) => (instant ? 0.01 : base)

  /* controlled parallax — a depth hierarchy: far planes lag the scroll the
     most, near planes barely lag, and the feature plate drifts a touch faster
     so it reads as coming toward the reader. Reduced motion collapses every
     plane to stillness (same composition, no movement). */
  const { scrollY } = useScroll()
  const pAtmo = useTransform(scrollY, (v) => (reduce ? 0 : Math.min(v, 900) * 0.36))
  const pGhost = useTransform(scrollY, (v) => (reduce ? 0 : Math.min(v, 900) * 0.24))
  const pFolio = useTransform(scrollY, (v) => (reduce ? 0 : Math.min(v, 900) * 0.11))
  const pCopy = useTransform(scrollY, (v) => (reduce ? 0 : Math.min(v, 900) * 0.1))

  /* ——— PENPOT BOARD: P27 / THE ENTRANCE — DESKTOP
       BACK  · wine architectural hall (pilasters, warm key-light, vignette)
       MID   · ghost VERLYSE / MEDIA engraving (static brass 4–6%, never
               animated) · oversized folio № 01 · ISSUE № 01 line · brass
               registration marks
       FRONT · tagline “Where Vision Becomes A Voice” · VERLYSE MEDIA
               PRESENTS · THE FEATURE — FOLIO № 01 “Their Voices Matter” ·
               metadata · ENTER THE ARCHIVE → · supporting line
       States · STATE · ARRIVAL
       Responsive: tablet = portrait intermediate, two pilasters, feature 60%;
       mobile = single column mark → tagline → feature → action.
       Reduced = same composition, zero movement. ——— */

  return (
    <section ref={ref} className="relative flex min-h-[100svh] items-end overflow-hidden border-b border-white/10 bg-wine-deep">
      {/* ——— BACK · Layer 1 · the wine hall (slowest plane) ——— */}
      <motion.div style={{ y: pAtmo }} className="absolute inset-x-0 -top-[10%] bottom-[-10%] z-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,rgba(92,18,36,0.38),transparent_62%),radial-gradient(90%_70%_at_90%_100%,rgba(184,145,70,0.12),transparent_60%),linear-gradient(170deg,#4A1120_0%,#3B0D17_52%,#1A070E_100%)]" />
      </motion.div>

      {/* ——— BACK · pilasters — the hall's architectural ribs; a restrained
          dolly on scroll, collapsed entirely under reduced motion ——— */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-[clamp(2rem,6vw,5.5rem)] z-[1] hidden w-px bg-gradient-to-b from-transparent via-[#D9B978]/30 to-transparent md:block" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-[clamp(2rem,6vw,5.5rem)] z-[1] hidden w-px bg-gradient-to-b from-transparent via-[#D9B978]/30 to-transparent md:block" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-[clamp(3.5rem,9vw,8rem)] z-[1] hidden w-px bg-gradient-to-b from-transparent via-[#D9B978]/15 to-transparent lg:block" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-[clamp(3.5rem,9vw,8rem)] z-[1] hidden w-px bg-gradient-to-b from-transparent via-[#D9B978]/15 to-transparent lg:block" />

      {/* ——— BACK · clean atmospheric light — a soft top glow and a warm floor ——— */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(85%_45%_at_50%_0%,rgba(248,246,242,0.045),transparent_60%),radial-gradient(70%_45%_at_88%_100%,rgba(184,145,70,0.07),transparent_62%)]" />

      {/* ——— BACK · the grain — one still film over the hall, so the wine
          reads as stock rather than as a CSS colour. Static by design: it
          never animates, never catches the cursor, and is simply gone in print. ——— */}
      <div aria-hidden="true" className="grain pointer-events-none absolute inset-0 z-[2] hidden opacity-[0.28] md:block" />

      {/* ——— MID · print registration — brass crop marks at the field's corners,
          like the registration marks of a press sheet ——— */}
      {[
        'left-[clamp(1.75rem,5.5vw,4.75rem)] top-[86px]',
        'right-[clamp(1.75rem,5.5vw,4.75rem)] top-[86px]',
        'left-[clamp(1.75rem,5.5vw,4.75rem)] bottom-[3.5rem]',
        'right-[clamp(1.75rem,5.5vw,4.75rem)] bottom-[3.5rem]',
      ].map((pos) => (
        <div key={pos} aria-hidden="true" className={`pointer-events-none absolute z-[2] hidden lg:block ${pos}`}>
          <span className="absolute left-0 top-0 h-3 w-px bg-[#D9B978]/45" />
          <span className="absolute left-0 top-0 h-px w-3 bg-[#D9B978]/45" />
        </div>
      ))}

      {/* ——— MID · the brass thread — the left registration edge draws itself
          as the threshold is read, so the press sheet closes before the cover
          leaves. It is the same brass as the crop marks and sits on the same
          left measure, which makes it read as part of the registration rather
          than a new ornament.

          Drawn by the shared shell's scroll progress (band 0 → 0.12, the
          threshold's own travel), so it adds no second scroll listener.
          Decorative: aria-hidden, no pointer events. Under reduced motion the
          shell freezes progress, so the thread renders fully drawn. ——— */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[3.5rem] left-[clamp(1.75rem,5.5vw,4.75rem)] top-[86px] z-[2] hidden lg:block"
      >
        <BrassThread height="100%" from={0} to={0.12} stroke="#D9B978" />
      </div>

      {/* ——— MID · ghost wordmark — STATIC engraved brass 4–6%, never animated.
          It drifts only with the mid-plane parallax; there is no entrance
          animation on the word itself (Penpot ANN · ghost word = static
          engraved brass 4–5% · never animated) ——— */}
      <motion.div style={{ y: pGhost }} aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[10%] z-0 flex flex-col items-center">
        <p className="select-none whitespace-nowrap text-center font-serif text-[clamp(7rem,22vw,20rem)] font-semibold leading-[0.86] text-transparent [-webkit-text-stroke:1px_rgba(184,145,70,0.30)]">
          VERLYSE
        </p>
        <p className="select-none whitespace-nowrap text-center font-serif text-[clamp(7rem,22vw,20rem)] font-semibold leading-[0.86] text-transparent [-webkit-text-stroke:1px_rgba(184,145,70,0.30)]">
          MEDIA
        </p>
      </motion.div>

      {/* ——— MID · the publication mark — ghost V above the issue line ——— */}
      <motion.div style={{ y: pGhost }} aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[86px] z-[2] flex justify-center">
        <span className="font-serif text-4xl italic text-gold/50 md:text-5xl">V</span>
      </motion.div>

      {/* ——— MID · issue line + tagline — the editorial threshold, centred.
          Pinned by an explicit top so the threshold sits in the upper-middle
          of the hall (board ghost zone), independent of the flex stack. ——— */}
      <motion.div style={{ y: pFolio }} className="absolute inset-x-0 top-[clamp(6.5rem,12vh,8.5rem)] z-[2] px-6 text-center">
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: D(1), delay: T.mast, ease: E }}
          className="font-mono text-[9px] uppercase tracking-[0.34em] text-gold/85 md:text-[10px]"
        >
          Issue № {LEDGER.issueNo} — {LEDGER.features} folios · {LEDGER.creators} creators · {LEDGER.departments} departments
        </motion.p>
        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: D(1.2), delay: T.h1a, ease: E }}
          className="mx-auto mt-5 max-w-[18ch] font-serif text-[clamp(2rem,6.4vw,4.4rem)] font-light leading-[1.06] tracking-[-0.015em] text-ivory"
        >
          “Where Vision <em className="italic text-gold">Becomes</em> A Voice”
        </motion.h1>
        <Slate move="crash zoom" className="mt-6" />
      </motion.div>

      {/* ——— MID · ghost folio — № 01 engraved behind the threshold ——— */}
      <motion.div style={{ y: pFolio }} aria-hidden="true" className="pointer-events-none absolute left-[clamp(1.75rem,5.5vw,4.75rem)] top-[34%] z-[1] hidden select-none lg:block">
        <span className="block whitespace-nowrap font-serif text-[clamp(7rem,16vw,16rem)] font-semibold leading-[0.85] text-transparent [-webkit-text-stroke:1px_rgba(184,145,70,0.16)]">
          № 01
        </span>
      </motion.div>

      {/* ——— The spatial archive — a bounded three.js layer behind the threshold.
          A threshold-only atmosphere: it holds the feature “selected” until the
          reader first engages the selector below, then keeps the chosen folio
          raised while the hall reads. Recedes entirely under reduced-motion /
          no-WebGL, where the layered gradients above remain the fallback. ——— */}
      <div className="pointer-events-none absolute inset-0 z-[1] [&_canvas]:mix-blend-lighten" aria-hidden="true">
        <SpatialBoundary>
          <Suspense fallback={null}>
            <SpatialArchive selectedId={selectedId} state={state} />
          </Suspense>
        </SpatialBoundary>
      </div>

      {/* ——— FRONT · the feature plate — registry №01, left-of-centre on
          desktop, centred on tablet, single column on mobile.
          P27 entrance board: the feature sits on a solid ivory editorial sheet
          (wine text, brass hairline) floating on the wine hall; CTA + deck
          below the sheet on the wine. ——— */}
      <motion.div style={{ y: pCopy }} className="relative z-[3] mx-auto w-full max-w-page px-[clamp(1.75rem,5.5vw,4.75rem)] pb-[clamp(1.75rem,4vh,3rem)] pt-[clamp(2.25rem,6vh,3.5rem)]">
        <div className="mx-auto w-full max-w-[min(36rem,88vw)] md:max-w-[min(31rem,80vw)] lg:max-w-[min(38rem,80vw)]">
          {/* ——— short brass rule above the sheet — the board's plate rule ——— */}
          <span aria-hidden="true" className="mx-auto mb-6 block h-px w-[clamp(4rem,10vw,7.5rem)] bg-[#B89146]/60" />
          {/* ——— the ivory feature sheet — the plate enters with the paper:
                a deep-wine backing card sits behind it, a second hairline
                card sits offset, and a still grain rides the surface, so the
                sheet reads as three sheets squared on the hall floor rather
                than one flat panel. ——— */}
          <Tilt3D>
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: D(1), delay: T.plate, ease: E }}
            className="relative border border-gold/40 bg-[#F8F6F2] p-5 md:px-7 md:py-10 lg:px-8 lg:py-8"
          >
            {/* the backing card — the sheet's shadow drawn as a real second sheet */}
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 translate-x-1.5 translate-y-1.5 border border-[#1C0509]/40 bg-[#2A0F18]/60" />
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 translate-x-2 translate-y-2 border border-gold/25" />
            <span aria-hidden="true" className="grain-paper pointer-events-none absolute inset-0 opacity-[0.18]" />
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: D(0.9), delay: T.plate + 0.05, ease: E }}
              className="relative flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.3em] text-[#7C6338]"
            >
              <span aria-hidden="true" className="h-px w-8 bg-[#B89146]/70" />
              Verlyse Media presents
            </motion.p>
            <motion.p
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: D(0.9), delay: T.plate + 0.1, ease: E }}
              className="relative mt-4 font-mono text-[9px] uppercase tracking-[0.3em] text-[#2A0F18]/55"
            >
              The feature — Folio № 01
            </motion.p>
            {/* the plate itself — the feature's own cover, cropped 16:10 like
                a still pulled from the issue; loads with the sheet, never after */}
            <motion.div
              initial={reduce ? false : { opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: D(1.1), delay: T.plate + 0.12, ease: E }}
              className="img-frame relative mt-4 aspect-[16/9] overflow-hidden border border-[#B89146]/50"
            >
              <img
                src={feature.cover}
                alt={`Cover plate — “${feature.title}”`}
                width={1280}
                height={720}
                decoding="async"
                onError={(e) => handleImgError(e, feature.title, folioNoOf(feature.id))}
                className="h-full w-full object-cover"
              />
              <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(28,5,9,0.55))] " />
              <span aria-hidden="true" className="absolute bottom-2 left-3 font-mono text-[8px] uppercase tracking-[0.3em] text-ivory/85">
                Plate № 01 — as published in the issue
              </span>
            </motion.div>
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: D(1), delay: T.plate + 0.15, ease: E }}
              className="relative mt-4"
            >
              <Link
                to={`/article/${feature.id}`}
                className="block font-serif text-[clamp(1.6rem,3.6vw,2.3rem)] font-light leading-[1.12] text-[#1E0B12] transition-colors hover:text-[#7C6338]"
              >
                “{feature.title}”
              </Link>
              <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.3em] text-[#2A0F18]/75">
                {author.name} · {author.handle}
              </p>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.3em] text-[#2A0F18]/55">
                {feature.category} · {feature.readingTime} · {feature.date}
              </p>
            </motion.div>
            <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#B89146]/60 to-transparent" />
          </motion.div>
          </Tilt3D>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: D(1), delay: T.cta, ease: E }}
            className="mt-8 flex flex-wrap items-center gap-7"
          >
            <Magnetic>
              <Link to="/articles" className="btn btn-gold">
                Enter the archive →
              </Link>
            </Magnetic>
            <UnderlineLink to={`/article/${feature.id}`}>Read the current feature — folio № 01</UnderlineLink>
          </motion.div>

          <motion.p
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: D(0.9), delay: T.cta + 0.12, ease: E }}
            className="mt-5 font-mono text-[9px] uppercase leading-[2] tracking-[0.28em] text-ivory/55"
          >
            Submissions for Issue № 02 are open —{' '}
            <Link to="/submit" className="border-b border-gold/50 pb-0.5 text-gold no-underline transition-colors hover:text-ivory">
              send your work →
            </Link>
          </motion.p>

          <motion.p
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: D(1), delay: T.deck, ease: E }}
            className="mt-6 max-w-[44ch] text-sm leading-[1.85] text-ivory/70"
          >
            A student-led publication — poetry, essays, art and the issues that matter. {LEDGER.features} features · {LEDGER.creators} creators · {LEDGER.departments} departments.
          </motion.p>
        </div>
      </motion.div>

      {/* ——— folio bar — the threshold's base, real marks only ——— */}
      <div className="absolute inset-x-0 bottom-0 z-[2]" aria-hidden="true">
        <motion.div
          initial={reduce ? false : { y: 12 }}
          animate={{ y: 0 }}
          transition={{ duration: D(1.2), delay: instant ? 0.4 : 1.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mx-auto flex max-w-page items-center justify-between border-t border-white/15 px-[clamp(1.75rem,5.5vw,4.75rem)] py-4 font-mono text-[9px] uppercase tracking-[0.34em] text-white/65">
            <span>Verlyse Media presents — Issue № 01</span>
            <span className="hidden sm:inline">The first feature — “{feature.title}” · {feature.date}</span>
            <span className="hidden text-gold/80 lg:inline">↓ the archive opens below</span>
            <span>{BRAND.handle}</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function IssueBand() {
  /* every figure here is read from the ledger — the one page the magazine
     keeps its totals on; no band, page or plate states a number of its own */
  return (
    <section className="border-b border-white/10 bg-wine py-7" aria-label="The magazine in numbers">
      <div className="mx-auto flex max-w-page flex-wrap items-center justify-center gap-x-10 gap-y-3 px-[clamp(1.75rem,5.5vw,4.75rem)] font-serif text-xl font-light italic leading-none text-ivory/85 md:text-2xl">
        <span>{LEDGER.features} features</span>
        <i aria-hidden="true" className="text-[0.7em] not-italic text-gold">✦</i>
        <span>{LEDGER.creators} creators</span>
        <i aria-hidden="true" className="text-[0.7em] not-italic text-gold">✦</i>
        <span><span className="tnum not-italic">{LEDGER.appreciations.toLocaleString('en-US')}</span> appreciations</span>
        <i aria-hidden="true" className="text-[0.7em] not-italic text-gold">✦</i>
        <span><span className="tnum not-italic">{LEDGER.conversations}</span> conversations</span>
        <i aria-hidden="true" className="text-[0.7em] not-italic text-gold">✦</i>
        <span className="text-ivory/60">one room</span>
        <i aria-hidden="true" className="text-[0.7em] not-italic text-gold">✦</i>
        <span className="text-gold/90">and the next one could be yours</span>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Featured stories — the latest issue, set like a magazine spread.   */
/* ------------------------------------------------------------------ */
type StorySize = 'cover' | 'stack' | 'spread' | 'bottom'

const STORY_IMAGE: Record<StorySize, string> = {
  cover: 'aspect-[4/5]',
  stack: 'aspect-[3/4]',
  spread: 'aspect-[3/4]',
  bottom: 'aspect-[16/10]',
}
const STORY_TITLE: Record<StorySize, string> = {
  cover: 'text-[clamp(2.1rem,3.6vw,3.4rem)]',
  stack: 'text-xl md:text-2xl',
  spread: 'text-xl md:text-2xl',
  bottom: 'text-2xl md:text-3xl',
}

function StoryCard({
  work,
  size = 'spread',
  showExcerpt = false,
}: {
  work: (typeof ARTICLES)[number]
  size?: StorySize
  showExcerpt?: boolean
}) {
  const au = getAuthor(work.authorId)
  const cover = size === 'cover'
  /* the plate carries its real registry number — the same № every other
     surface in the magazine reads, never a second, display-only numbering */
  const folioNo = String(ARTICLES.findIndex((x) => x.id === work.id) + 1).padStart(2, '0')
  return (
    <div className="group/card relative">
      {/* the save mark sits above the plate, never inside the link — a card
          is one action for reading and one for keeping */}
      <SaveButton
        id={work.id}
        title={work.title}
        category={work.category}
        author={au?.name}
        compact
        className="absolute left-4 top-4 z-[3] md:opacity-0 md:transition-opacity md:duration-500 md:group-hover/card:opacity-100 md:focus-within:opacity-100"
      />
      <Link
        to={`/article/${work.id}`}
        className={`group block no-underline outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold ${cover ? 'lg:flex lg:h-full lg:flex-col' : ''}`}
        aria-label={`Read “${work.title}”`}
      >
      <div
        className={`img-frame relative overflow-hidden border border-white/10 transition-colors duration-700 group-hover:border-gold/45 ${
          cover ? 'aspect-[4/5] lg:aspect-auto lg:flex-1' : STORY_IMAGE[size]
        }`}
      >
        <img
          src={work.cover}
          alt={`${work.title} — ${work.category}`}
          loading="lazy"
          decoding="async"
          onError={(e) => handleImgError(e, work.title, folioNoOf(work.id))}
          className={`h-full w-full object-cover ${cover ? 'animate-vm-kenburns' : 'transition-transform duration-[1800ms] ease-out group-hover:scale-[1.06]'}`}
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#1C0509]/70 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gold transition-transform duration-700 ease-out group-hover:scale-x-100" />

        {cover && (
          <span
            aria-hidden="true"
            className="absolute left-5 top-1/2 hidden -translate-y-1/2 -rotate-90 origin-left whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.42em] text-gold/90 md:block"
          >
            The cover of the issue — Verlyse Media
          </span>
        )}

        <span
          aria-hidden="true"
          className="absolute right-4 top-4 translate-y-1 border border-gold/70 bg-[#1C0509]/55 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.30em] text-ivory opacity-0  transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100"
        >
          Read feature →
        </span>

        <span
          aria-hidden="true"
          className={`absolute font-mono uppercase tracking-[0.26em] transition-colors duration-500 group-hover:text-gold ${cover ? 'bottom-5 right-5 text-[10px] text-white/70' : 'bottom-3 right-3 text-[9px] text-white/70'}`}
        >
          № {folioNo}
        </span>
      </div>

      <div className="mt-5">
        <MetaRow category={work.category} author={au?.name} readingTime={work.readingTime} date={work.date} />
        <h3 className={`mt-3 font-serif font-normal leading-[1.12] text-ivory transition-all duration-700 group-hover:italic group-hover:text-[#E8D9A8] ${STORY_TITLE[size]}`}>
          {cover ? (
            <>
              <span aria-hidden="true" className="mr-3 font-mono text-[0.42em] font-normal tracking-[0.3em] text-gold not-italic">№ {folioNo}</span>
              “{work.title}”
            </>
          ) : (
            <>“{work.title}”</>
          )}
        </h3>
        {au && (
          <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.26em] text-white/45">by {au.name} {au.handle}</p>
        )}
        {showExcerpt && (
          <p className="mt-4 max-w-[46ch] text-[15px] leading-[1.8] text-white/60">{work.excerpt}</p>
        )}
        <p className="mt-5">
          <span className="border-b border-gold/60 pb-1 font-mono text-[10px] uppercase tracking-[0.28em] text-gold transition-colors duration-500 group-hover:text-ivory">
            Read feature <span aria-hidden="true">→</span>
          </span>
        </p>
      </div>
      </Link>
    </div>
  )
}

function WorksStrip() {
  const works = ARTICLES.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8)
  const [cover, s1, s2, ...rest] = works
  const spread = rest.slice(0, 3)
  const bottom = rest.slice(3, 5)

  return (
    <section className="border-t border-white/10 py-[clamp(6rem,14vh,11rem)]">
      <div className="mx-auto max-w-page px-[clamp(1.75rem,5.5vw,4.75rem)]">
        {/* ——— the contents page ——— */}
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-white/10 pb-10">
            <div>
              <p className="kicker mb-5">The feed — issue № {String(LEDGER.issueNo).padStart(2, '0')}</p>
              <AnticipatedTitle className="max-w-[18ch]">
                <h2 className="font-serif text-[clamp(2.4rem,4.8vw,4.2rem)] font-light leading-[1.02] text-ivory">
                  In this <em className="italic text-gold">issue</em>
                </h2>
              </AnticipatedTitle>
            </div>
            <div className="text-right">
              <p className="font-mono text-[9px] uppercase tracking-[0.30em] text-white/55">The eight newest folios · June–August 2026</p>
              <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.30em] text-white/55">{LEDGER.features} features · {LEDGER.creators} creators · {LEDGER.appreciations.toLocaleString('en-US')} appreciations</p>
              <p className="mt-3 max-w-[30ch] font-serif text-base font-light italic leading-[1.6] text-ivory/70">
                The next issue could begin with your name.
              </p>
              <div className="mt-4">
                <UnderlineLink to="/articles">All {LEDGER.features} works</UnderlineLink>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ——— the cover story + supporting stack ——— */}
        <div className="mt-16 grid grid-cols-1 gap-x-14 gap-y-16 lg:grid-cols-12">
          <Reveal className="lg:col-span-7 lg:h-full">
            <StoryCard work={cover} size="cover" showExcerpt />
          </Reveal>

          <div className="flex flex-col gap-y-14 lg:col-span-5">
            <Reveal>
              <StoryCard work={s1} size="stack" />
            </Reveal>

            {/* the issue note — a quiet interlude between the stack stories */}
            <Reveal delay={0.06} className="border-y border-gold/20 py-8">
              <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.3em] text-gold/80">Pull — the issue note</p>
              <p className="pull-quote text-[clamp(1.15rem,1.7vw,1.4rem)] leading-[1.6] text-ivory/80">
                Every feature in this issue begins the same way — a submission, read carefully, credited fully, and presented with care.
              </p>
              <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.30em] text-white/55">— the desk, Verlyse Media</p>
            </Reveal>

            <Reveal delay={0.1} className="lg:mt-10">
              <StoryCard work={s2} size="stack" />
            </Reveal>
          </div>
        </div>

        {/* ——— the spread — three supporting stories, the middle floating lower ——— */}
        <div className="mt-20 grid grid-cols-1 gap-x-12 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {spread.map((w, i) => (
            <Reveal key={w.id} delay={i * 0.07} className={i === 1 ? 'lg:mt-20' : ''}>
              <StoryCard work={w} size="spread" />
            </Reveal>
          ))}
        </div>

        {/* ——— the closing duo — wide crops, set lower like the back pages ——— */}
        <div className="mt-6 grid grid-cols-1 gap-x-12 gap-y-16 md:grid-cols-2">
          <Reveal className="md:mt-24">
            <StoryCard work={bottom[0]} size="bottom" />
          </Reveal>
          <Reveal delay={0.08}>
            <StoryCard work={bottom[1]} size="bottom" />
          </Reveal>
        </div>

        {/* ——— end of the issue ——— */}
        <Reveal className="mt-24">
          <div className="flex flex-col items-center gap-5">
            <span aria-hidden="true" className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/50">End of the issue</span>
            <span aria-hidden="true" className="flex items-center gap-4">
              <span className="h-px w-24 bg-gold/40" />
              <span className="text-gold">✦</span>
              <span className="h-px w-24 bg-gold/40" />
            </span>
            <p className="pull-quote text-lg text-ivory/60">
              The archive continues — every feature, every creator, every page.
            </p>
            <UnderlineLink to="/articles">Browse the full archive</UnderlineLink>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/** The current feature — three plates in a staggered editorial composition. */
function FeatureSection({ feature, authorName }: { feature: (typeof ARTICLES)[number]; authorName: string }) {
  const plates = feature.slides ?? []
  return (
    <section className="border-t border-white/10 py-[clamp(8rem,16vh,12rem)]">
      <div className="mx-auto max-w-page px-[clamp(1.75rem,5.5vw,4.75rem)]">
        <SectionHead eyebrow="The first feature" page="P. 02" ghost="02" />
        <div className="grid grid-cols-1 items-center gap-[clamp(3rem,7vw,8rem)] lg:grid-cols-[1.02fr_0.98fr]">
          <Reveal>
            <div className="grid grid-cols-3 items-start gap-3">
              {plates.map((src, i) => (
                <figure key={src} className={`img-frame overflow-hidden border border-white/10 ${i === 1 ? 'mt-12' : i === 2 ? 'mt-6' : ''}`}>
                  <img
                    src={src}
                    alt={`${feature.title} — plate ${i + 1} of ${plates.length}`}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => handleImgError(e, feature.title, folioNoOf(feature.id))}
                    className="aspect-[4/5] w-full object-cover transition-transform duration-[1400ms] ease-out hover:scale-[1.07]"
                  />
                  <figcaption className="border-t border-white/10 px-2 py-2 font-mono text-[8px] uppercase tracking-[0.26em] text-white/50">
                    {String(i + 1).padStart(2, '0')} / {plates.length}
                  </figcaption>
                </figure>
              ))}
            </div>
            <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.28em] text-white/50">
              The feature as presented — {plates.length} plates, 4:5 · as published on the feed
            </p>
          </Reveal>

          <div>
            <Reveal>
              <p className="kicker">Feature — presented by Verlyse Media</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-6 font-serif text-[clamp(2.9rem,6.2vw,5.6rem)] font-light leading-[1.02] tracking-[-0.02em]">
                “{feature.title}”
              </h2>
            </Reveal>
            <Reveal delay={0.14} className="mt-6">
              <MetaRow category={feature.category} author={authorName} readingTime={feature.readingTime} />
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-7 max-w-[54ch] leading-[1.85] text-white/70">{feature.excerpt}</p>
            </Reveal>
            <Reveal delay={0.26}>
              <p className="mt-5 font-serif text-lg font-light italic text-ivory/85">
                By {authorName} — {getAuthor(feature.authorId)?.handle}
              </p>
            </Reveal>
            <Reveal delay={0.32} className="mt-9">
              <UnderlineLink to={`/article/${feature.id}`}>Read the full feature</UnderlineLink>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}


/** The community ledger — the magazine's own numbers, set like marginalia. */
function Pulse() {
  return (
    <section className="border-t border-white/10 bg-wine-deep py-[clamp(6rem,14vh,11rem)]">
      <div className="mx-auto max-w-page px-[clamp(1.75rem,5.5vw,4.75rem)]">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-white/10 pb-10">
            <p className="kicker mb-5">Community pulse</p>
            <p className="max-w-[36ch] text-right font-serif text-base font-light italic leading-[1.7] text-white/60">
              The room is young, and it grows one voice at a time.
            </p>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          <Reveal className="border-t border-white/15 pt-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">Features presented</p>
            <p className="mt-4 font-serif text-[clamp(6rem,13vw,11rem)] font-light leading-[0.9] tracking-[-0.02em] text-ivory">{LEDGER.features}</p>
            <p className="mt-6 max-w-[34ch] text-base leading-[1.8] text-white/65">
              Every post on the feed — from the founder’s call for women’s rights to the Mir Raza Ali memorial.
            </p>
            <p className="mt-6 font-mono text-[9px] uppercase leading-[2] tracking-[0.26em] text-white/40">
              Archive data — read from the published feed of June–August 2026. Not live counts.
            </p>
          </Reveal>
          <div className="border-t border-white/15">
            {[
              [String(LEDGER.appreciations), 'Appreciations', 'Likes across the feed — each of them an answer to a writer.'],
              [String(LEDGER.conversations), 'Conversations', 'Conversations beneath the features, all of them read.'],
              [String(LEDGER.creators), 'Creators credited', 'Every feature names its writer, by name and handle.'],
            ].map(([v, l, n], i) => (
              <Reveal key={l} delay={0.1 + i * 0.08}>
                <div className="flex items-baseline justify-between gap-6 border-b border-white/10 py-7">
                  <CountUp value={parseInt(v, 10)} className="font-serif text-3xl font-light text-ivory md:text-4xl" />
                  <span className="text-right">
                    <span className="block font-mono text-[10px] uppercase tracking-[0.28em] text-white/50">{l}</span>
                    <span className="mt-2 block max-w-[30ch] text-sm leading-relaxed text-white/60">{n}</span>
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/** Departments — an index of rooms. */
/** Departments — the rooms, set like an open house: each one a possibility. */
function Departments() {
  return (
    <section className="border-t border-white/10 py-[clamp(8rem,16vh,12rem)]">
      <div className="mx-auto max-w-page px-[clamp(1.75rem,5.5vw,4.75rem)]">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-white/10 pb-10">
            <div>
              <p className="kicker mb-5">Departments — the rooms</p>
              <MaskReveal>
                <h2 className="max-w-[18ch] font-serif text-[clamp(2.4rem,4.8vw,4.2rem)] font-light leading-[1.02] text-ivory">
                  Seven rooms, <em className="italic text-gold">all of them open</em>
                </h2>
              </MaskReveal>
            </div>
            <p className="max-w-[32ch] text-right font-serif text-base font-light italic leading-[1.7] text-white/60">
              Each one was opened by a writer who sent their work in. Yours could open the next.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 border-t border-white/10">
          {CATEGORIES.map((c, i) => (
            <Reveal key={c.slug} delay={Math.min(i * 0.05, 0.25)}>
              <Link
                to={`/categories/${c.slug}`}
                aria-label={`Enter the ${c.name} room — ${c.count} feature${c.count === 1 ? '' : 's'}`}
                className="group grid grid-cols-1 items-center gap-3 border-b border-white/10 py-8 no-underline transition-all duration-700 hover:bg-white/[0.04] md:grid-cols-[4rem_1fr_auto] md:px-5 md:py-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-gold"
              >
                <span aria-hidden="true" className="flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-gold md:flex-col md:items-start md:gap-2">
                  {String(i + 1).padStart(2, '0')}
                  <span className="text-lg leading-none transition-transform duration-700 group-hover:-translate-y-0.5" style={{ color: c.accent }}>{c.motif}</span>
                </span>
                <div>
                  <h3 className="font-serif text-[clamp(2rem,3.8vw,3.4rem)] font-normal leading-[1.04] text-ivory transition-all duration-700 group-hover:translate-x-3 group-hover:italic">
                    {c.name}
                  </h3>
                  <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-white/60">{c.blurb}</p>
                </div>
                <p className="text-left font-mono text-[10px] uppercase tracking-[0.28em] text-white/60 md:text-right">
                  {c.count} feature{c.count === 1 ? '' : 's'} · Browse <span aria-hidden="true">→</span>
                </p>
              </Link>
            </Reveal>
          ))}
          {/* the invitation, set apart — it is not an eighth room; it is the
              door the next writer opens, so it carries no folio number */}
          <Reveal delay={0.18}>
            <Link to="/submit" className="group grid grid-cols-1 items-center gap-3 border-b border-dashed border-gold/30 py-8 no-underline transition-all duration-700 hover:bg-gold/[0.05] md:grid-cols-[4rem_1fr_auto] md:px-5 md:py-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-gold">
              <span aria-hidden="true" className="flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-gold md:flex-col md:items-start md:gap-2">
                ✦
                <span className="text-[9px] uppercase leading-none tracking-[0.24em]">Open</span>
              </span>
              <div>
                <h3 className="font-serif text-[clamp(2rem,3.8vw,3.4rem)] font-normal italic leading-[1.04] text-white/60 transition-all duration-700 group-hover:translate-x-3 group-hover:text-ivory">
                  Your department — a submission invitation
                </h3>
                <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-white/60">
                  Every room on this page was opened — or will be opened — by a writer who sent their work in. Yours could open the next one.
                </p>
              </div>
              <p className="text-left font-mono text-[10px] uppercase tracking-[0.28em] text-gold/90 md:text-right">
                Send your work <span aria-hidden="true">→</span>
              </p>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function Invitation() {
  return (
    <section className="border-t border-white/10 py-[clamp(8rem,16vh,12rem)]">
      <div className="mx-auto grid max-w-page grid-cols-1 items-center gap-[clamp(3rem,7vw,8rem)] px-[clamp(1.75rem,5.5vw,4.75rem)] lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal className="relative">
          <figure className="img-frame aspect-[4/5] max-w-[88%] overflow-hidden">
            <img
              src="/img/poster-3-13-3.webp"
              alt="Plate III — “3:13” by Anshujit Singh"
              loading="lazy"
              decoding="async"
              onError={(e) => handleImgError(e, '3:13', folioNoOf('3-13'))}
              className="h-full w-full object-cover"
            />
          </figure>
          <figcaption className="mt-4 font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">
            Plate III — “3:13” · the call is always you
          </figcaption>
          <div aria-hidden="true" className="absolute -bottom-7 -left-7 -right-7 top-7 border border-gold/50" />
        </Reveal>

        <div>
          <Reveal>
            <p className="kicker">Submissions — open</p>
          </Reveal>
          <Reveal delay={0.1}>
            <MaskReveal>
              <h2 className="mt-6 max-w-[16ch] font-serif text-[clamp(2.6rem,5.4vw,4.6rem)] font-light leading-[1.04] tracking-[-0.02em] text-ivory">
                Have something worth sharing?
              </h2>
            </MaskReveal>
          </Reveal>
          <Reveal delay={0.18}>
            <p className="mt-7 max-w-[54ch] leading-[1.85] text-white/70">
              Every feature on Verlyse Media begins the same way: someone sends a story in. If you have written one — a story, a poem, an essay — we would like to read it. That is the whole of the magazine, and the beginning of the next feature.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <p className="mt-5 max-w-[54ch] text-sm leading-[1.85] text-white/55">{BRAND.disclosure}</p>
          </Reveal>
          <Reveal delay={0.3} className="mt-10 flex flex-wrap items-center gap-8">
            <Link to="/submit" className="btn btn-gold">Send your work</Link>
            <span className="font-serif text-lg font-light italic text-ivory/70">— The Desk, Verlyse Media</span>
            <HiddenQuote quote="Every feature begins as a kept page — including the next one." />
          </Reveal>
          <ReflectionLine className="mt-20 max-w-[40ch]">
            <p className="font-serif text-[clamp(1.4rem,2.4vw,2rem)] font-light italic leading-[1.6] text-ivory/70">
              Every story in this magazine began as a kept page. The next one is still in someone's hands — and it might be in yours.
            </p>
          </ReflectionLine>
        </div>
      </div>
    </section>
  )
}

/** The colophon teaser. */
function Colophon() {
  return (
    <section className="border-t border-white/10 bg-charcoal py-[clamp(6rem,14vh,11rem)]">
      <div className="mx-auto max-w-page px-[clamp(1.75rem,5.5vw,4.75rem)]">
        <div className="grid grid-cols-1 items-center gap-[clamp(3rem,7vw,8rem)] lg:grid-cols-[1fr_1fr]">
          <div>
            <Reveal><p className="kicker">About Verlyse Media</p></Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-6 font-serif text-[clamp(2.6rem,5.4vw,4.8rem)] font-light leading-[1.04] tracking-[-0.02em]">
                Where <em className="italic text-gold">vision</em> becomes a voice
              </h2>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-7 max-w-[52ch] leading-[1.85] text-white/70">
                A platform for artists, writers and storytellers — where every meaningful creation gets an audience, a credit, and a room of its own. The feed opened on the twenty-sixth of June 2026 with the founder’s call for Afghan women’s rights, “Their Voices Matter” — and has presented {LEDGER.features} features since.
              </p>
            </Reveal>
            <Reveal delay={0.24} className="mt-9">
              <UnderlineLink to="/about">Read the story</UnderlineLink>
            </Reveal>
          </div>
          <Reveal className="relative">
            <div className="img-frame aspect-[4/5] max-w-[92%]">
              <img src="/img/works/DaDY7WRkw0y-2.webp" alt="Plate II of the first feature, “Their Voices Matter”" className="h-full w-full object-cover" loading="lazy" decoding="async" onError={(e) => handleImgError(e, 'Their Voices Matter', folioNoOf('their-voices-matter'))} />
            </div>
            <div aria-hidden="true" className="absolute -bottom-7 -left-7 -right-7 top-7 border border-gold/50" />
          </Reveal>
          <div className="mt-10 flex justify-end">
            <LibraryCard />
          </div>
        </div>
      </div>
    </section>
  )
}

/** The four initial spatial-reading works — sourced from the article registry. */
const SPATIAL_PICKS = ['their-voices-matter', '3-13', 'the-garden-beyond-my-tower', 'behind-every-headline']

/**
 * Spatial reading — an accessible plate selector that drives the archive
 * scene behind the masthead. The tabs move the atmosphere; the plate panel
 * shows what was chosen: the real cover, a crossfade between picks, the
 * folio's own excerpt, and one clear road into the full feature.
 *
 * Keyboard: ← → Home End move between plates (automatic activation, as the
 * ARIA tab pattern prescribes). Touch: a horizontal swipe turns the plate.
 * Reduced motion: every transition collapses to a cut; nothing else changes.
 */
function SpatialReading({ pickIdx, onSelect }: { pickIdx: number; onSelect: (i: number) => void }) {
  const reduce = useReducedMotion() === true
  /* whether the WebGL hall is actually alive behind the cover — the panel's
     marginal note may only claim the hall is leaning when it truly is */
  const { supported: glSupported } = useWebGLSupport()
  const hallLive = glSupported && !reduce
  const picks = SPATIAL_PICKS.map((id) => ARTICLES.find((x) => x.id === id)).filter(Boolean) as typeof ARTICLES
  const active = picks[pickIdx] ?? picks[0]
  const au = getAuthor(active.authorId)
  const folio = String(ARTICLES.findIndex((x) => x.id === active.id) + 1).padStart(2, '0')
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const touch = useRef<{ x: number; y: number } | null>(null)

  const move = (from: number, dir: 1 | -1) => {
    const n = picks.length
    const target = ((from + dir) % n + n) % n
    onSelect(target)
    tabRefs.current[target]?.focus()
  }

  const onTabKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); move(pickIdx, 1) }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); move(pickIdx, -1) }
    else if (e.key === 'Home') { e.preventDefault(); onSelect(0); tabRefs.current[0]?.focus() }
    else if (e.key === 'End') { e.preventDefault(); onSelect(picks.length - 1); tabRefs.current[picks.length - 1]?.focus() }
  }

  /* swipe — horizontal intent only (a vertical scroll must never turn a plate) */
  const onTouchStart = (e: React.TouchEvent) => {
    touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current) return
    const dx = e.changedTouches[0].clientX - touch.current.x
    const dy = e.changedTouches[0].clientY - touch.current.y
    if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.6) {
      const n = picks.length
      onSelect(((pickIdx + (dx < 0 ? 1 : -1)) % n + n) % n) // wrap, exactly like the arrows
    }
    touch.current = null
  }

  return (
    <section className="relative border-t border-white/10 py-[clamp(5rem,10vh,8rem)]" aria-labelledby="spatial-reading-title">
      <div className="mx-auto max-w-page px-[clamp(1.75rem,5.5vw,4.75rem)]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="kicker">Optional spatial reading</p>
            <h2 id="spatial-reading-title" className="mt-5 max-w-[22ch] font-serif text-[clamp(2.2rem,4.6vw,4rem)] font-light leading-[1.05] text-ivory">
              Read a plate. <em className="italic text-gold">Shift the atmosphere.</em>
            </h2>
          </div>
          {/* progress — the plate index, the travel, and a brass measure */}
          <div className="flex items-center gap-4" aria-hidden="true">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">
              <span className="text-gold">№ {String(pickIdx + 1).padStart(2, '0')}</span> / {String(picks.length).padStart(2, '0')}
            </span>
            <span className="relative block h-px w-[clamp(6rem,14vw,12rem)] bg-white/15">
              <motion.span
                className="absolute left-0 top-0 h-px bg-gold"
                animate={{ width: `${((pickIdx + 1) / picks.length) * 100}%` }}
                transition={{ duration: reduce ? 0 : 0.7, ease: [0.16, 1, 0.3, 1] }}
              />
            </span>
            {/* next / previous — quiet, square, labelled */}
            <span className="flex gap-1">
              <button
                type="button"
                onClick={() => onSelect(pickIdx - 1)}
                aria-label="Previous plate"
                className="grid h-9 w-9 place-items-center border border-gold/40 text-ivory transition-colors duration-300 hover:border-gold hover:bg-gold hover:text-charcoal"
              >←</button>
              <button
                type="button"
                onClick={() => onSelect(pickIdx + 1)}
                aria-label="Next plate"
                className="grid h-9 w-9 place-items-center border border-gold/40 text-ivory transition-colors duration-300 hover:border-gold hover:bg-gold hover:text-charcoal"
              >→</button>
            </span>
          </div>
        </div>
        <p className="mt-5 max-w-[44ch] font-serif text-lg font-light italic leading-[1.7] text-ivory/65">
          Choose a feature and the archive leans in to meet it. The full story is always one tap away on its own page.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-[0.92fr_1.08fr]">
          {/* the selector — a vertical stack of plates, tab pattern with roving focus */}
          <div role="tablist" aria-label="Spatial reading options" aria-orientation="vertical" onKeyDown={onTabKey} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {picks.map((a, i) => {
                const author = getAuthor(a.authorId)
                const activeSel = i === pickIdx
                return (
                  <button
                    key={a.id}
                    ref={(el) => { tabRefs.current[i] = el }}
                    type="button"
                    role="tab"
                    id={`spatial-tab-${a.id}`}
                    aria-selected={activeSel}
                    aria-controls="spatial-plate-panel"
                    tabIndex={activeSel ? 0 : -1}
                    onClick={() => onSelect(i)}
                    className={`group flex items-start gap-5 border px-6 py-5 text-left no-underline transition-colors duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
                      activeSel ? 'border-gold/70 bg-gold/5' : 'border-white/15 hover:border-gold/40'
                    }`}
                  >
                    <span aria-hidden="true" className={`mt-1 font-serif text-2xl leading-none ${activeSel ? 'text-gold' : 'text-white/40'}`}>✦</span>
                    <span className="flex-1">
                      <span className={`block font-serif text-xl leading-tight ${activeSel ? 'text-ivory' : 'text-ivory/80'} transition-colors group-hover:text-ivory`}>
                        “{a.title}”
                      </span>
                      <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">
                        № {String(ARTICLES.findIndex((x) => x.id === a.id) + 1).padStart(2, '0')} · {a.category} · {author?.name}
                      </span>
                    </span>
                    <span aria-hidden="true" className={`ml-auto self-center font-serif text-lg transition-opacity duration-500 ${activeSel ? 'text-gold opacity-100' : 'text-gold opacity-0 group-hover:opacity-100'}`}>
                      →
                    </span>
                  </button>
                )
              })}
            </div>
            {/* dots — the small map of where the plate stands */}
            <div className="mt-6 flex items-center gap-3" aria-hidden="true">
              {picks.map((a, i) => (
                <span key={a.id} className={`h-1.5 w-1.5 rotate-45 border transition-colors duration-500 ${i === pickIdx ? 'border-gold bg-gold' : 'border-white/30 bg-transparent'}`} />
              ))}
              <span className="ml-3 font-mono text-[9px] uppercase tracking-[0.24em] text-white/40">swipe or use ← → on a plate</span>
            </div>
          </div>

          {/* the plate itself — one panel that all tabs control; the image
              crossfades under reduced motion to a plain cut, nothing else */}
          <div
            role="tabpanel"
            id="spatial-plate-panel"
            aria-labelledby={`spatial-tab-${active.id}`}
            tabIndex={0}
            className="relative min-h-[420px] border border-white/12 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold lg:min-h-[480px]"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={reduce ? false : { opacity: 0, scale: 1.015 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0"
              >
                <img
                  src={active.cover}
                  alt={`Selected plate — “${active.title}” by ${au?.name}`}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => handleImgError(e, active.title, folio)}
                  className="h-full w-full object-cover"
                />
                <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(28,5,9,0.06)_36%,rgba(20,5,9,0.9))]" />
                <span aria-hidden="true" className="grain absolute inset-0 opacity-20" />
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                  <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-gold">
                    Folio № {folio} · {active.category} · {active.readingTime} · {active.date}
                  </p>
                  <p className="mt-3 line-clamp-2 max-w-[46ch] text-sm leading-[1.8] text-white/70">{active.excerpt}</p>
                  <p className="mt-4 font-serif text-base italic text-ivory/85">By {au?.name} — {au?.handle}</p>
                  <div className="mt-6 flex flex-wrap items-center gap-6">
                    <Link to={`/article/${active.id}`} className="btn btn-gold !px-7 !py-3">
                      Open the full feature →
                    </Link>
                    <span className="font-mono text-[9px] uppercase tracking-[0.26em] text-white/45">
                      {hallLive
                        ? 'The hall above is leaning toward this plate'
                        : 'This reader keeps the hall still — the plate still turns'}
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  useSeo({
    title: 'Where Vision Becomes A Voice',
    description: 'Verlyse Media — a student-led platform sharing youth perspectives on culture, global issues and creativity.',
  })
  const feature = ARTICLES[0]
  const author = getAuthor(feature.authorId)!
  /* the plate carousel owns the index; the atmosphere follows only once the
     reader has actually chosen — the hall stays at threshold until then, so
     the untouched cover is never biased toward a plate nobody picked */
  const [pickIdx, setPickIdx] = useState(0)
  const [touched, setTouched] = useState(false)
  const [spatialState, setSpatialState] = useState<SpatialState>('threshold')
  const selectedId = touched ? SPATIAL_PICKS[pickIdx] ?? null : null

  const select = (idx: number) => {
    const n = SPATIAL_PICKS.length
    setPickIdx(((idx % n) + n) % n)
    setTouched(true)
    setSpatialState('selected')
  }

  return (
    /* One choreography model for the whole entrance: every immersive component
       below reads the same scroll progress and the same phase from this shell,
       so no section invents its own scroll system. The wrapper is a plain div
       with no styling of its own, so the existing board composition, borders
       and stacking are untouched.

       Engine ownership is unchanged: motion/react keeps the parallax planes and
       the entrance timeline, R3F keeps SpatialArchive's camera, anime.js keeps
       its isolated SVG ornament, and the shell only supplies progress. */
    <ImmersiveShell>
      <Cover selectedId={selectedId} state={spatialState} />
      <IssueBand />
      <WorksStrip />
      <MotifDivider label="The feature" motif="quote" />
      <FeatureSection feature={feature} authorName={author.name} />
      <SpatialReading pickIdx={pickIdx} onSelect={select} />
      <MotifDivider label="The room" motif="voices" />
      <Pulse />
      <Departments />
      <VoiceCarousel />
      <MotifDivider label="The invitation" motif="feather" />
      <Invitation />
      <Colophon />
    </ImmersiveShell>
  )
}
