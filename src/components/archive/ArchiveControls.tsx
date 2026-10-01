import { clsx } from 'clsx'

interface CategoryItem {
  id: string | null
  label: string
  count: number
}

interface ArchiveControlsProps {
  categories: CategoryItem[]
  selectedCategory: string | null
  onSelectCategory: (cat: string | null) => void
  searchQuery: string
  onSearchChange: (q: string) => void
  className?: string
}

/**
 * ArchiveControls — Category Filter Segment & Live Search Input
 */
export function ArchiveControls({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  className = '',
}: ArchiveControlsProps) {
  return (
    <div
      className={clsx(
        'my-8 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between',
        className
      )}
    >
      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id
          return (
            <button
              key={cat.id ?? 'all'}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={clsx(
                'flex items-center gap-1.5 px-3.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold',
                isActive
                  ? 'border border-gold bg-gold text-charcoal font-semibold shadow-md shadow-gold/20'
                  : 'border border-white/15 bg-[#160309] text-white/70 hover:border-gold/60 hover:text-ivory'
              )}
              aria-pressed={isActive}
            >
              <span>{cat.label}</span>
              <span className={clsx('text-[8px]', isActive ? 'text-charcoal/80' : 'text-white/40')}>
                ({cat.count})
              </span>
            </button>
          )
        })}
      </div>

      {/* Search Input */}
      <div className="w-full lg:w-72">
        <input
          type="search"
          placeholder="Search by title, author, topic…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Filter archive folios"
          className="w-full border border-white/20 bg-black/40 px-3.5 py-2 font-mono text-xs text-ivory placeholder-white/40 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
        />
      </div>
    </div>
  )
}
