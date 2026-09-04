import { Link, useParams } from 'react-router-dom'
import type { ReactNode } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ARTICLES, getAuthor } from '../../data/content'

/**
 * THE READING ROOM — the Penpot Phase-25 composition around the canonical
 * article route. The canonical reading implementation (ArticleDetail) is
 * protected and renders unchanged inside this shell. Three planes:
 *
 *   BACK   — a deep wine architectural room: lamp glow, dark floor, faint
 *            brass wall rules, a distant ghost folio numeral behind the column.
 *   MID    — the folio's shelf marks: vertical ledger (THE READING ROOM —
 *            FOLIO № NN), the folio index (CATEGORY · № NN / 19), corner
 *            registration ticks, a brass thread with a reader-position mark,
 *            and the Up Next folio waiting in the right gutter on desktop.
 *   FRONT  — the canonical article, always the focus.
 *
 * Depth is paper-in-a-room, not spectacle; the article column never moves.
 * Reduced motion collapses every plane to a quiet static composition (thread
 * full and still, Up Next visible, no reader-position mark). No WebGL, no
 * canvas, no new dependencies.
 */
export default function ReadingRoom({ children }: { children: ReactNode }) {
  const { id } = useParams<{ id: string }>()
  const reduce = useReducedMotion() === true
  const idx = ARTICLES.findIndex((a) => a.id === id)
  const folio = idx >= 0 ? String(idx + 1).padStart(2, '0') : null
  const article = idx >= 0 ? ARTICLES[idx] : null
  /* Reading order is the publication's registry order, not semantic relatedness:
     every folio opens the next numbered article and the final folio wraps to №01. */
  const upNext = article ? ARTICLES[(idx + 1) % ARTICLES.length] : undefined
  const upNextFolio = upNext ? String(ARTICLES.findIndex((a) => a.id === upNext.id) + 1).padStart(2, '0') : null
  const upNextAuthor = upNext ? getAuthor(upNext.authorId)?.name : undefined

  const { scrollY, scrollYProgress } = useScroll()
  /* restrained camera through the room — none under reduced motion */
  const backY = useTransform(scrollY, (v) => (reduce ? 0 : Math.min(v, 1600) * 0.07))
  const markY = useTransform(scrollY, (v) => (reduce ? 0 : Math.min(v, 1600) * 0.03))

  /* the thread — draws down the folio as the reader advances; static full
     under reduced motion; never more than a hairline. */
  const threadScale = useTransform(scrollYProgress, (v) => (reduce ? 1 : Math.min(1, Math.max(0, (v - 0.04) / 0.8))))

  /* the reader-position mark — a brass dot on the thread; absent under reduced
     motion (the Penpot reduced-motion board omits it). */
  const dotTop = useTransform(scrollYProgress, (v) => `${Math.max(5, Math.min(90, 8 + v * 80))}%`)

  /* the Up Next folio in the right gutter — a real link; fades as the reader
     nears the article's own Up Next section; static full under reduced motion. */
  const upNextOpacity = useTransform(scrollYProgress, (v) => (reduce ? 1 : Math.max(0, 1 - (v - 0.55) / 0.4)))

  const E = [0.22, 1, 0.36, 1] as const

  return (
    <div className="relative">
      {/* ============ BACK — the room's architecture (fixed, decorative only) ============ */}
      <motion.div
        aria-hidden="true"
        style={reduce ? undefined : { y: backY }}
        className="pointer-events-none fixed inset-0 z-0"
      >
        {/* the wine room — a lamp overhead, a dark floor: the field the folio hangs in */}
        <div className="absolute inset-0 bg-[radial-gradient(110%_75%_at_50%_-8%,rgba(92,18,36,0.30),transparent_58%),radial-gradient(90%_55%_at_50%_118%,rgba(18,4,9,0.55),transparent_62%),linear-gradient(180deg,#3B0D17_0%,#2A0F18_55%,#1C070E_100%)]" />
        {/* faint brass architectural rules — the room's walls */}
        <div className="absolute inset-y-0 left-[clamp(1.75rem,5.5vw,4.75rem)] hidden w-px bg-gradient-to-b from-transparent via-[#D9B978]/16 to-transparent lg:block" />
        <div className="absolute inset-y-0 right-[clamp(1.75rem,5.5vw,4.75rem)] hidden w-px bg-gradient-to-b from-transparent via-[#D9B978]/16 to-transparent lg:block" />
        <div className="absolute inset-x-0 top-[79%] hidden h-px bg-gradient-to-r from-transparent via-[#D9B978]/10 to-transparent lg:block" />
      </motion.div>

      {/* ============ MID — the folio's shelf marks ============ */}
      <motion.div
        aria-hidden="true"
        style={reduce ? undefined : { y: markY }}
        className="pointer-events-none fixed inset-0 z-[1] hidden lg:block"
      >
        {/* left ledger — the room's name and this folio's number, vertical */}
        <span className="absolute left-[clamp(1.75rem,5.5vw,4.75rem)] top-32 [writing-mode:vertical-rl] font-mono text-[10px] uppercase tracking-[0.34em] text-gold/50">
          THE READING ROOM — FOLIO № {folio ?? '—'}
        </span>
        {/* right index — where this folio sits in the issue */}
        <span className="absolute right-[clamp(1.75rem,5.5vw,4.75rem)] top-[46%] [writing-mode:vertical-rl] font-mono text-[9px] uppercase tracking-[0.34em] text-white/30">
          {article ? `${article.category.toUpperCase()} · № ${folio} / 19` : 'VERLYSE MEDIA'}
        </span>
        {/* corner registration ticks — the plate is held inside this field */}
        <span className="absolute left-[clamp(1.75rem,5.5vw,4.75rem)] top-24 h-3 w-px bg-[#D9B978]/35" />
        <span className="absolute left-[clamp(1.75rem,5.5vw,4.75rem)] top-24 h-px w-3 bg-[#D9B978]/35" />
        <span className="absolute right-[clamp(1.75rem,5.5vw,4.75rem)] top-24 h-3 w-px bg-[#D9B978]/35" />
        <span className="absolute right-[clamp(1.75rem,5.5vw,4.75rem)] top-24 h-px w-3 bg-[#D9B978]/35" />
        {/* the thread — a brass hairline drawing down the page toward the ending */}
        <motion.div
          style={{ scaleY: threadScale }}
          className="absolute left-[clamp(1.75rem,5.5vw,4.75rem)] top-28 bottom-10 w-px origin-top bg-gradient-to-b from-[#D9B978]/40 via-[#D9B978]/25 to-transparent"
        />
        {/* the reader-position mark — where the reader stands on the thread */}
        {!reduce && (
          <motion.span
            style={{ top: dotTop }}
            className="absolute left-[clamp(1.75rem,5.5vw,4.75rem)] h-[7px] w-[7px] -translate-x-[3px] rounded-full bg-[#D9B978]"
          />
        )}

        {/* the Up Next folio — another folio waiting in the room, right gutter */}
        {upNext && (
          <div
            className="absolute right-[clamp(1.75rem,5.5vw,4.75rem)] top-[9%] hidden w-[230px]"
          >
            <motion.div style={{ opacity: upNextOpacity }} className="relative">
              <div aria-hidden="true" className="absolute -bottom-1 -right-1 h-full w-full border border-[#E7DCC8] bg-[#EFE8DD]" />
              <Link
                to={`/article/${upNext.id}`}
                aria-label={`Open folio ${upNextFolio} — ${upNext.title} — up next`}
                className="pointer-events-auto group relative block border border-[#7C6338]/70 bg-[#EFE8DD] px-5 py-5 no-underline transition-transform duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold/80 hover:-translate-y-1"
              >
                <div aria-hidden="true" className="pointer-events-none absolute inset-1.5 border border-[#D9B978]/50" />
                <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-[#7C6338]">
                  Up Next — № {upNextFolio}
                </p>
                <p className="mt-3 font-serif text-[clamp(1.05rem,1.4vw,1.25rem)] font-semibold leading-[1.15] text-[#241D18] transition-colors group-hover:text-[#5C1224]">
                  “{upNext.title}”
                </p>
                <div aria-hidden="true" className="mt-3 h-0.5 w-[50px] bg-[#B89146]" />
                <p className="mt-3 font-mono text-[9px] font-medium uppercase tracking-[0.1em] leading-[1.8] text-[#241D18]/85">
                  {upNext.category}
                  <br />
                  {upNext.readingTime}
                  {upNextAuthor ? <> · {upNextAuthor.toUpperCase()}</> : null}
                </p>
                <p className="mt-4 inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5C1224] transition-all group-hover:gap-3">
                  Open folio <span aria-hidden="true">→</span>
                </p>
              </Link>
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* ============ TABLET — the simplified room: a single wall rule ============ */}
      <div aria-hidden="true" className="relative mx-auto hidden w-full max-w-page px-[clamp(1.25rem,4vw,4.75rem)] pt-[clamp(5.5rem,12vh,9rem)] md:block lg:hidden">
        <div className="h-[46vh] w-px bg-gradient-to-b from-transparent via-[#D9B978]/20 to-transparent" />
      </div>

      {/* ============ MOBILE — the quiet room: faint rule + small ghost numeral
          + thread stub. The actionable Up Next folio is rendered directly
          below; there is no duplicate decorative label in the top-right. ============ */}
      <div className="relative mx-auto w-full max-w-page px-[clamp(1.25rem,4vw,4.75rem)] pt-[clamp(4.5rem,11vh,7rem)] md:hidden">
        {/* faint rule — a hairline across the room's top */}
        <div aria-hidden="true" className="h-px bg-[linear-gradient(90deg,transparent,rgba(217,185,120,0.25),transparent)]" />
        <div className="mt-6 flex items-end">
          {/* thread stub — the reading thread's stub, hanging from the rule */}
          <span aria-hidden="true" className="block h-[3.25rem] w-px bg-gradient-to-b from-[#D9B978]/45 to-transparent" />
          {/* the small ghost folio — the numeral of the folio in hand */}
          {folio && (
            <span aria-hidden="true" className="ml-auto block select-none font-serif text-[2.4rem] font-semibold leading-none text-transparent [-webkit-text-stroke:1px_rgba(184,145,70,0.28)]">
              № {folio}
            </span>
          )}
        </div>
        {/* Mobile keeps the same real Up Next folio as desktop. Previously only
            the decorative cue survived below the fold, so there was no mobile
            OPEN FOLIO action for readers to continue the sequence. */}
        {upNext && (
          <Link
            to={`/article/${upNext.id}`}
            aria-label={`Open folio ${upNextFolio} — ${upNext.title} — up next`}
            className="group relative mt-8 block border border-[#7C6338]/70 bg-[#EFE8DD] px-5 py-5 text-[#241D18] no-underline shadow-[0_16px_30px_rgba(0,0,0,0.22)] transition-transform duration-500 hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold md:hidden"
          >
            <span aria-hidden="true" className="pointer-events-none absolute inset-1.5 border border-[#D9B978]/50" />
            <span className="relative block font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-[#7C6338]">
              Up Next — № {upNextFolio}
            </span>
            <span className="relative mt-3 block font-serif text-[clamp(1.25rem,6vw,1.6rem)] font-semibold leading-[1.12] text-[#241D18] transition-colors group-hover:text-[#5C1224]">
              “{upNext.title}”
            </span>
            <span aria-hidden="true" className="relative mt-3 block h-0.5 w-[50px] bg-[#B89146]" />
            <span className="relative mt-3 block font-mono text-[9px] font-medium uppercase tracking-[0.12em] leading-[1.8] text-[#241D18]/80">
              {upNext.category} · {upNext.readingTime}
              {upNextAuthor ? <> · {upNextAuthor.toUpperCase()}</> : null}
            </span>
            <span className="relative mt-4 inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5C1224] transition-all group-hover:gap-3">
              Open folio <span aria-hidden="true">→</span>
            </span>
          </Link>
        )}
      </div>

      {/* ============ FRONT — the canonical article, always the focus ============ */}
      <div className="pointer-events-none relative z-[2]">
        <motion.div className="pointer-events-auto"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reduce ? undefined : { duration: 0.9, delay: 0.35, ease: E }}
        >
          {children}
        </motion.div>
        {/* Desktop continuation card lives in the front layer so it is above
            the article hit-surface and remains a real clickable link. */}
        {upNext && (
          <div className="pointer-events-auto fixed right-[clamp(1.75rem,5.5vw,4.75rem)] top-[clamp(9rem,18vh,13rem)] z-[1100] hidden w-[230px] lg:block">
            <Link
              to={`/article/${upNext.id}`}
              aria-label={`Open folio ${upNextFolio} — ${upNext.title} — up next`}
              className="group relative block border border-[#7C6338]/70 bg-[#EFE8DD] px-5 py-5 text-[#241D18] no-underline shadow-[0_16px_30px_rgba(0,0,0,0.25)] transition-transform duration-500 hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
              <span aria-hidden="true" className="pointer-events-none absolute inset-1.5 border border-[#D9B978]/50" />
              <span className="relative block font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-[#7C6338]">Up Next — № {upNextFolio}</span>
              <span className="relative mt-3 block font-serif text-[clamp(1.05rem,1.4vw,1.25rem)] font-semibold leading-[1.15] text-[#241D18] transition-colors group-hover:text-[#5C1224]">“{upNext.title}”</span>
              <span aria-hidden="true" className="relative mt-3 block h-0.5 w-[50px] bg-[#B89146]" />
              <span className="relative mt-3 block font-mono text-[9px] font-medium uppercase tracking-[0.1em] leading-[1.8] text-[#241D18]/85">
                {upNext.category}<br />{upNext.readingTime}{upNextAuthor ? <> · {upNextAuthor.toUpperCase()}</> : null}
              </span>
              <span className="relative mt-4 inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5C1224] transition-all group-hover:gap-3">Open folio <span aria-hidden="true">→</span></span>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
