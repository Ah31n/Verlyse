import { clsx } from 'clsx'

interface ArchiveEmptyStateProps {
  query?: string
  category?: string | null
  onReset?: () => void
  className?: string
}

/**
 * ArchiveEmptyState — Designed No-Results Archival State
 */
export function ArchiveEmptyState({
  query,
  category,
  onReset,
  className = '',
}: ArchiveEmptyStateProps) {
  return (
    <div
      className={clsx(
        'my-16 flex flex-col items-center justify-center border border-dashed border-white/20 bg-[#160309]/50 p-12 text-center text-ivory',
        className
      )}
    >
      <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-gold/80">
        Archival Notice
      </span>
      <h3 className="mt-3 font-serif text-2xl font-light text-ivory">
        No Matching Folios Found
      </h3>
      <p className="mt-2 max-w-md font-serif text-sm italic text-white/60">
        {query
          ? `No recorded manuscripts match the query “${query}”.`
          : category
          ? `The “${category}” department is currently curating new accessions.`
          : 'No folios match your current filter parameters.'}
      </p>

      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="mt-6 border border-gold/40 bg-gold/10 px-5 py-2 font-mono text-[9px] uppercase tracking-[0.2em] text-gold hover:bg-gold hover:text-charcoal transition-all"
        >
          Reset Filters & View All 19 Folios
        </button>
      )}
    </div>
  )
}
