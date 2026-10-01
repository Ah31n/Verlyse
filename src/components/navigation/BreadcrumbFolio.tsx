import { Link } from 'react-router-dom'
import { clsx } from 'clsx'

export function BreadcrumbFolio({
  category,
  categorySlug,
  folioNumber,
  title,
  className = '',
}: {
  category?: string
  categorySlug?: string
  folioNumber?: string | number
  title?: string
  className?: string
}) {
  return (
    <nav aria-label="Breadcrumb" className={clsx('flex items-center gap-2.5 font-mono text-[9px] uppercase tracking-[0.24em] text-white/50 select-none', className)}>
      <Link to="/" className="text-white/60 hover:text-gold transition-colors no-underline">
        Archive
      </Link>
      <span className="text-white/30" aria-hidden="true">/</span>
      {category && (
        <>
          <Link
            to={categorySlug ? `/categories?room=${categorySlug}` : '/categories'}
            className="text-gold hover:text-ivory transition-colors no-underline"
          >
            {category}
          </Link>
          <span className="text-white/30" aria-hidden="true">/</span>
        </>
      )}
      {folioNumber && (
        <span className="text-gold/80 font-semibold">
          FOLIO № {String(folioNumber).padStart(2, '0')}
        </span>
      )}
      {title && (
        <>
          <span className="text-white/30" aria-hidden="true">·</span>
          <span className="text-white/70 max-w-[28ch] truncate hidden sm:inline">{title}</span>
        </>
      )}
    </nav>
  )
}

export function FolioPagination({
  prevArticle,
  nextArticle,
  className = '',
}: {
  prevArticle?: { id: string; title: string; category: string; folio: number } | null
  nextArticle?: { id: string; title: string; category: string; folio: number } | null
  className?: string
}) {
  return (
    <div className={clsx('flex flex-col sm:flex-row items-stretch justify-between gap-6 border-t border-b border-white/10 py-8 my-14', className)}>
      {prevArticle ? (
        <Link
          to={`/article/${prevArticle.id}`}
          className="group flex-1 flex flex-col gap-1 p-5 border border-white/10 bg-white/[0.02] hover:border-gold/40 hover:bg-gold/[0.04] transition-all no-underline"
        >
          <span className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.26em] text-gold">
            <span>← Previous Folio</span>
            <span>№ {String(prevArticle.folio).padStart(2, '0')}</span>
          </span>
          <span className="font-serif text-lg font-light text-ivory group-hover:text-gold transition-colors">
            {prevArticle.title}
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/50">
            {prevArticle.category}
          </span>
        </Link>
      ) : (
        <div className="flex-1" />
      )}

      {nextArticle ? (
        <Link
          to={`/article/${nextArticle.id}`}
          className="group flex-1 flex flex-col items-end gap-1 p-5 border border-white/10 bg-white/[0.02] hover:border-gold/40 hover:bg-gold/[0.04] transition-all no-underline text-right"
        >
          <span className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.26em] text-gold">
            <span>Next Folio</span>
            <span>№ {String(nextArticle.folio).padStart(2, '0')}</span>
            <span>→</span>
          </span>
          <span className="font-serif text-lg font-light text-ivory group-hover:text-gold transition-colors">
            {nextArticle.title}
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/50">
            {nextArticle.category}
          </span>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </div>
  )
}
