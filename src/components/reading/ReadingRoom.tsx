import { Link, useParams } from 'react-router-dom'
import type { ReactNode } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ARTICLES, getAuthor, relatedArticles } from '../../data/content'

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
  const upNext = article ? relatedArticles(article)[0] : undefined
  const upNextFolio = upNext ? String(ARTICLES.findIndex((a) => a.id === upNext.id) + 1).padStart(2, '0') : null
  const upNextAuthor = upNext ? getAuthor(upNext.authorId)?.name : undefined

  const { scrollY, scrollYProgress } = useScroll()
  /* restrained camera through the room — none under reduced motion */
  const backY = useTransform(scrollY, (v) => (reduce ? 0 : Math.min(v, 1600) * 0.07))
  const ghostY = useTransform(scrollY, (v) => (reduce ? 0 : Math.min(v, 1600) * 0.11))
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
        {/* distant folio reference — the numeral of the folio the reader holds */}
        {folio && (
          <motion.div
            style={reduce ? undefined : { y: ghostY }}
            className="absolute left-1/2 top-[34%] hidden -translate-x-1/2 select-none lg:block"
          >
            <span className="block whitespace-nowrap font-serif text-[clamp(13rem,26vw,24rem)] font-semibold leading-[0.8] text-transparent [-webkit-text-stroke:1px_rgba(184,145,70,0.11)]">
              № {folio}
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* ============ MID — the folio's shelf marks ============ */}
      <motion.div
        aria-hidden="true"
        style={reduce ? undefined : { y: markY }}
        className="pointer-events-none fixed inset-0 z-40 hidden lg:block"
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
            className="absolute right-[clamp(1.75rem,5.5vw,4.75rem)] top-[9%] hidden w-[230px] xl:block"
          >
            <motion.div style={{ opacity: upNextOpacity }} className="relative">
              <div aria-hidden="true" className="absolute -bottom-1 -right-1 h-full w-full border border-[#E7DCC8] bg-[#EFE8DD]" />
              <Link
                to={`/article/${upNext.id}`}
                aria-label={`Open folio ${upNextFolio} — ${upNext.title} — up next`}
                className="group relative block border border-[#7C6338]/70 bg-[#EFE8DD] px-5 py-5 no-underline transition-transform duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold/80 hover:-translate-y-1"
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
          + thread stub + the fold cue for Up Next (decorative, in flow) ============ */}
      <div aria-hidden="true" className="relative mx-auto w-full max-w-page px-[clamp(1.25rem,4vw,4.75rem)] pt-[clamp(4.5rem,11vh,7rem)] md:hidden">
        {/* faint rule — a hairline across the room's top */}
        <div className="h-px bg-[linear-gradient(90deg,transparent,rgba(217,185,120,0.25),transparent)]" />
        <div className="mt-6 flex items-end justify-between">
          {/* thread stub — the reading thread's stub, hanging from the rule */}
          <span className="block h-[3.25rem] w-px bg-gradient-to-b from-[#D9B978]/45 to-transparent" />
          <span className="flex flex-col items-end gap-2">
            {/* the small ghost folio — the numeral of the folio in hand */}
            {folio && (
              <span className="block select-none font-serif text-[2.4rem] font-semibold leading-none text-transparent [-webkit-text-stroke:1px_rgba(184,145,70,0.28)]">
                № {folio}
              </span>
            )}
            {/* the fold cue — a dog-eared corner, the Up Next awaits below */}
            <span className="flex items-center gap-2">
              <span className="block h-4 w-4 bg-[linear-gradient(135deg,#D9B978,transparent_50%)]" />
              <span className="font-mono text-[8px] uppercase tracking-[0.28em] text-white/45">Up next ↓</span>
            </span>
          </span>
        </div>
      </div>

      {/* ============ FRONT — the canonical article, always the focus ============ */}
      <div className="relative z-[2]">
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reduce ? undefined : { duration: 0.9, delay: 0.35, ease: E }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}
