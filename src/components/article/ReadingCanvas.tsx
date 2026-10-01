import { type ReactNode } from 'react'
import { clsx } from 'clsx'

export function ReadingCanvas({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={clsx('mx-auto max-w-[720px] px-6 sm:px-8 text-ivory/95 font-sans', className)}>
      {children}
    </div>
  )
}

export function KineticArticleTitle({
  title,
  subtitle,
  className = '',
}: {
  title: string
  subtitle?: string
  className?: string
}) {
  return (
    <header className={clsx('my-8 md:my-12 max-w-4xl', className)}>
      <h1 className="font-serif text-[clamp(2.6rem,6.5vw,5rem)] font-light leading-[1.04] text-ivory tracking-tight text-balance">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-6 font-serif text-xl md:text-2xl font-light italic leading-relaxed text-white/75 max-w-[50ch]">
          {subtitle}
        </p>
      )}
    </header>
  )
}

export function AuthorColophon({
  author,
  date,
  readingTime,
  className = '',
}: {
  author: { id: string; name: string; role: string; bio: string; portrait?: string; profilePhoto?: string }
  date?: string
  readingTime?: string
  className?: string
}) {
  const photo = author.profilePhoto ?? author.portrait
  return (
    <aside className={clsx('my-16 border-t border-b border-white/10 py-10 bg-white/[0.01]', className)} aria-label="Author note">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        {photo && (
          <img
            src={photo}
            alt={author.name}
            className="h-20 w-20 object-cover border border-gold/40 shrink-0"
            loading="lazy"
          />
        )}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-serif text-2xl font-light text-ivory">
              {author.name}
            </h3>
            <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-gold border border-gold/30 px-2 py-0.5">
              {author.role}
            </span>
          </div>
          <p className="mt-3 font-sans text-xs text-white/70 font-light leading-relaxed max-w-[60ch]">
            {author.bio}
          </p>
          <div className="mt-4 flex items-center gap-4 font-mono text-[9px] uppercase tracking-[0.24em] text-white/40">
            {date && <span>Published {date}</span>}
            {readingTime && <span>· {readingTime} read</span>}
          </div>
        </div>
      </div>
    </aside>
  )
}
