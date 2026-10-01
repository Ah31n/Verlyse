import { clsx } from 'clsx'

interface CategoryHeaderProps {
  departmentTitle?: string
  subtitle?: string
  totalCount?: number
  kicker?: string
  className?: string
}

/**
 * CategoryHeader — Distinct Editorial Department Masthead
 */
export function CategoryHeader({
  departmentTitle = 'The Wings',
  subtitle = 'Seven distinct departments of literature, criticism, and visual reflection.',
  totalCount,
  kicker = 'Curatorial Wings',
  className = '',
}: CategoryHeaderProps) {
  return (
    <header className={clsx('border-b border-gold/30 pb-8 pt-6', className)}>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-gold" />
            <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-gold">
              {kicker}
            </span>
          </div>
          <h1 className="mt-3 font-serif text-4xl md:text-6xl font-light text-ivory tracking-tight">
            {departmentTitle}
          </h1>
          <p className="mt-2 font-serif text-base md:text-lg italic text-white/70 max-w-2xl">
            {subtitle}
          </p>
        </div>

        {totalCount !== undefined && (
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-gold">
            <span className="border border-gold/30 bg-gold/10 px-3 py-1.5">
              {totalCount} Living Folio{totalCount === 1 ? '' : 's'}
            </span>
          </div>
        )}
      </div>
    </header>
  )
}
