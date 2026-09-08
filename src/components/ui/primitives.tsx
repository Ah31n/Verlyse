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

/* ---------- Meta row: category ✦ author ✦ reading time ---------- */
export function MetaRow({ category, author, readingTime, className = '' }: { category: string; author?: string; readingTime?: string; className?: string }) {
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
        <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-[0.32] bg-gold transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
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
