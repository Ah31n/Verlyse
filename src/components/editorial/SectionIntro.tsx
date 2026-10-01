import { type ReactNode } from 'react'
import { clsx } from 'clsx'

export function SectionIntro({
  eyebrow,
  title,
  italicTitle,
  description,
  ghostNumber,
  align = 'left',
  className = '',
}: {
  eyebrow?: string
  title: string
  italicTitle?: string
  description?: string
  ghostNumber?: string
  align?: 'left' | 'center'
  className?: string
}) {
  return (
    <header
      className={clsx(
        'relative mb-12 md:mb-16',
        align === 'center' ? 'text-center mx-auto max-w-3xl' : 'text-left max-w-4xl',
        className
      )}
    >
      {ghostNumber && (
        <span
          aria-hidden="true"
          className="ghost-num pointer-events-none absolute -top-14 left-0 z-0 select-none font-serif text-[clamp(6rem,14vw,11rem)] leading-none"
        >
          {ghostNumber}
        </span>
      )}
      {eyebrow && (
        <p className="eyebrow relative z-10 mb-4">{eyebrow}</p>
      )}
      <h2 className="relative z-10 font-serif text-[clamp(2.2rem,5vw,3.8rem)] font-light leading-[1.08] text-ivory tracking-tight">
        {title}{' '}
        {italicTitle && <em className="italic text-gold">{italicTitle}</em>}
      </h2>
      {description && (
        <p className="relative z-10 mt-5 font-serif text-lg md:text-xl font-light italic leading-relaxed text-white/70 max-w-[55ch]">
          {description}
        </p>
      )}
    </header>
  )
}

export function PullQuote({
  quote,
  attribution,
  role,
  className = '',
}: {
  quote: string
  attribution?: string
  role?: string
  className?: string
}) {
  return (
    <figure className={clsx('my-12 md:my-16 border-l-2 border-gold pl-6 md:pl-10 py-2', className)}>
      <blockquote className="font-serif text-[clamp(1.5rem,3.2vw,2.4rem)] font-light italic leading-[1.35] text-ivory">
        "{quote}"
      </blockquote>
      {attribution && (
        <figcaption className="mt-5 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-gold/80">
          <span className="font-semibold text-gold">{attribution}</span>
          {role && (
            <>
              <span className="text-white/30" aria-hidden="true">·</span>
              <span className="text-white/50">{role}</span>
            </>
          )}
        </figcaption>
      )}
    </figure>
  )
}

export function FigCaption({
  caption,
  plateNumber,
  credit,
  className = '',
}: {
  caption: string
  plateNumber?: string | number
  credit?: string
  className?: string
}) {
  return (
    <figcaption className={clsx('mt-3.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 font-mono text-[9px] uppercase tracking-[0.26em] text-white/50', className)}>
      <div className="flex items-center gap-2">
        {plateNumber && (
          <span className="text-gold font-semibold">FIG. {String(plateNumber).padStart(2, '0')}</span>
        )}
        <span className="text-ivory/70">{caption}</span>
      </div>
      {credit && <span className="text-white/40 font-light">[{credit}]</span>}
    </figcaption>
  )
}

export function DropCapText({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={clsx('drop-cap font-sans text-base md:text-lg leading-[1.8] text-ivory/90 font-light', className)}>
      {children}
    </div>
  )
}
