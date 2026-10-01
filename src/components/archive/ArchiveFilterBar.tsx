import { clsx } from 'clsx'

export function ArchiveFilterBar({
  categories,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  totalCount,
}: {
  categories: string[]
  activeCategory: string
  onSelectCategory: (cat: string) => void
  searchQuery: string
  onSearchChange: (q: string) => void
  totalCount: number
}) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-white/10 pb-8 mb-12">
      {/* Category filter pills with roving state */}
      <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Filter archive by category">
        <button
          type="button"
          role="tab"
          aria-selected={activeCategory === 'ALL'}
          onClick={() => onSelectCategory('ALL')}
          className={clsx(
            'border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.24em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold',
            activeCategory === 'ALL'
              ? 'border-gold bg-gold text-charcoal font-semibold'
              : 'border-white/15 bg-transparent text-white/70 hover:border-gold/60 hover:text-ivory'
          )}
        >
          All Folios ({totalCount})
        </button>

        {categories.map((cat) => {
          const isSelected = activeCategory === cat
          return (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onSelectCategory(cat)}
              className={clsx(
                'border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.24em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold',
                isSelected
                  ? 'border-gold bg-gold text-charcoal font-semibold'
                  : 'border-white/15 bg-transparent text-white/70 hover:border-gold/60 hover:text-ivory'
              )}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* Inline archive search filter */}
      <div className="relative w-full md:w-64">
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter titles or writers..."
          className="w-full bg-white/[0.04] border border-white/15 px-4 py-2 text-xs font-sans text-ivory placeholder:text-white/40 placeholder:italic focus:border-gold focus:outline-none focus:bg-white/[0.07] transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-white/40 hover:text-ivory"
            aria-label="Clear filter"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
