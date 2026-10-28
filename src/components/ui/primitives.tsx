import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import Reveal from './Reveal'

/* ---------- Section head with ghost numeral + page number ---------- */
export function SectionHead({
  eyebrow,
  page,
  ghost,
}: {
  eyebrow: string
  page?: string
  ghost?: string
}) {
  return (
    <Reveal as="header" className="relative mb-14 flex items-center justify-between gap-8 md:mb-20">
      {ghost && (
        <span
          aria-hidden="true"
          className="ghost-num pointer-events-none absolute -top-16 left-0 z-0 select-none font-serif text-[clamp(6rem,15vw,13rem)] leading-none"
        >
          {ghost}
        </span>
      )}
      <p className="eyebrow relative z-10">{eyebrow}</p>
      {page && <span className="relative z-10 font-mono text-[11px] tracking-[0.24em] text-white/55">{page}</span>}
    </Reveal>
  )
}

/* ---------- R09 · THE CHAPTER OPENER ----------------------------------
 * The single owner for how a section announces itself across the
 * publication. Replaces the ad-hoc "mono kicker + h2" that each page
 * had hand-rolled, so every route opens with the same printed-journal
 * masthead: a brass numeral in the gutter, a double rule, an oversized
 * Cormorant title with one italic accent word, and a deck held to a
 * reading measure.
 *
 * `title` accepts a ReactNode so a page can mark its accent word with
 * <em>, which the .chapter-title rule renders in italic brass.
 * -------------------------------------------------------------------- */
export function ChapterOpener({
  num,
  label,
  title,
  deck,
  aside,
  as: As = 'h2',
  id,
  className = '',
}: {
  /** Section numeral, e.g. "03" — set in the left gutter on desktop. */
  num?: string
  /** Short standfirst above the title, e.g. "The feed · Issue № 01". */
  label?: string
  title: ReactNode
  deck?: ReactNode
  /** Optional right-aligned counter, e.g. "21 folios". */
  aside?: ReactNode
  as?: 'h1' | 'h2'
  id?: string
  className?: string
}) {
  return (
    <Reveal as="header" className={`chapter ${className}`}>
      {num && (
        <span aria-hidden="true" className="chapter-num mb-3 lg:mb-0">
          § {num}
        </span>
      )}
      <span aria-hidden="true" className="chapter-rule" />
      {/* running head: the label and its counter share one line, the way a
          printed page carries folio and section together. */}
      {(label || aside) && (
        <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1.5 md:mt-6">
          {label && (
            <p className="font-mono text-[9px] uppercase tracking-[0.34em] text-gold-lit/90 md:text-[10px]">
              {label}
            </p>
          )}
          {aside && (
            <p className="font-mono text-[9px] uppercase tracking-[0.26em] text-ivory/65">
              {aside}
            </p>
          )}
        </div>
      )}
      <As id={id} className="chapter-title mt-3.5">
        {title}
      </As>
      {deck && <p className="chapter-deck mt-5 md:mt-6">{deck}</p>}
    </Reveal>
  )
}

/* ---------- R09 · the mark that closes a chapter ---------- */
export function ChapterClose({ mark = '✦', className = '' }: { mark?: string; className?: string }) {
  return (
    <div aria-hidden="true" className={`chapter-close ${className}`}>
      <span className="text-[11px] leading-none">{mark}</span>
    </div>
  )
}

/* ---------- Meta row: category ✦ author ✦ reading time ✦ date ---------- */
export function MetaRow({ category, author, readingTime, date, className = '' }: { category: string; author?: string; readingTime?: string; date?: string; className?: string }) {
  return (
    <p className={`flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/60 sm:gap-3 sm:text-[11px] sm:tracking-[0.24em] ${className}`}>
      <span className="text-gold">{category}</span>
      {author && (
        <>
          <i aria-hidden="true" className="text-[0.6em] not-italic text-gold">✦</i>
          <span>{author}</span>
        </>
      )}
      {readingTime && readingTime !== '—' && (
        <>
          <i aria-hidden="true" className="text-[0.6em] not-italic text-gold">✦</i>
          <span>{readingTime}</span>
        </>
      )}
      {date && (
        <>
          <i aria-hidden="true" className="text-[0.6em] not-italic text-gold">✦</i>
          <span>{date}</span>
        </>
      )}
    </p>
  )
}

/* ---------- Magnetic-ish underline link ---------- */
export function UnderlineLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="group inline-flex items-center gap-3 pb-2 font-sans text-xs font-medium uppercase tracking-[0.22em] text-ivory no-underline max-[767px]:py-2.5"
    >
      <span className="relative">
        {children}
        <span aria-hidden="true" className="absolute -bottom-1.5 inset-x-0 h-px bg-gold/30 transition-colors duration-500 group-hover:bg-gold/50" />
        <span aria-hidden="true" className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-100 bg-gold/75 transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:bg-gold" />
      </span>
      <span aria-hidden="true" className="text-gold transition-transform duration-[700ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2">→</span>
    </Link>
  )
}

/* ---------- Vertical folio rail for page heroes ---------- */
export function PageRail({ text }: { text: string }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute left-7 top-1/2 hidden -translate-y-1/2 items-center gap-5 [writing-mode:vertical-rl] lg:flex"
    >
      <span className="h-14 w-px bg-gold/50" />
      <span className="font-mono text-[9px] uppercase tracking-[0.44em] text-white/55">{text}</span>
    </span>
  )
}
