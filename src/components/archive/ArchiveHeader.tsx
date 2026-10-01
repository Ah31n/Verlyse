import { clsx } from 'clsx'

interface ArchiveHeaderProps {
  totalCount: number
  activeCount: number
  selectedCategory?: string | null
  className?: string
}

/**
 * ArchiveHeader — Master Ledger & Archival Registry Header
 */
export function ArchiveHeader({
  totalCount = 19,
  activeCount = 19,
  selectedCategory,
  className = '',
}: ArchiveHeaderProps) {
  return (
    <header className={clsx('border-b border-gold/30 pb-8 pt-6', className)}>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
            <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-gold">
              Complete Editorial Ledger
            </span>
          </div>
          <h1 className="mt-3 font-serif text-4xl md:text-6xl font-light text-ivory tracking-tight">
            The Folio Shelf
          </h1>
          <p className="mt-2 font-serif text-base md:text-lg italic text-white/70 max-w-2xl">
            {selectedCategory
              ? `Displaying folios registered under the “${selectedCategory}” department.`
              : 'Nineteen living folios spanning fiction, poetry, critical essays, and visual arts.'}
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-white/60">
          <span className="border border-gold/30 bg-gold/10 px-3 py-1.5 text-gold">
            {activeCount} of {totalCount} Folios
          </span>
        </div>
      </div>
    </header>
  )
}
