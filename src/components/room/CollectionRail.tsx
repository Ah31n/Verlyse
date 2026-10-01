import { clsx } from 'clsx'

interface CategoryCount {
  id: string | null
  label: string
  count: number
}

interface CollectionRailProps {
  categories: CategoryCount[]
  activeCategory: string | null
  onSelectCategory: (categoryId: string | null) => void
  className?: string
}

/**
 * CollectionRail — Segmented Wing & Department Filter
 *
 * Allows jumping across specific wings of the spatial collection.
 */
export function CollectionRail({
  categories,
  activeCategory,
  onSelectCategory,
  className = '',
}: CollectionRailProps) {
  return (
    <nav
      aria-label="Room Wings and Departments"
      className={clsx(
        'pointer-events-auto flex items-center justify-start md:justify-center overflow-x-auto no-scrollbar gap-1.5 p-1 border border-white/10 bg-[#1A040B]/90 backdrop-blur-md max-w-full',
        className
      )}
    >
      {categories.map((cat) => {
        const isActive = activeCategory === cat.id
        return (
          <button
            key={cat.id ?? 'all'}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className={clsx(
              'group relative flex items-center gap-1.5 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold',
              isActive
                ? 'bg-gold/15 text-gold border border-gold/60 font-semibold'
                : 'text-white/60 hover:text-ivory hover:bg-white/5 border border-transparent'
            )}
            aria-pressed={isActive}
          >
            {isActive && (
              <span className="h-1.5 w-1.5 rounded-full bg-gold inline-block mr-0.5" />
            )}
            <span>{cat.label}</span>
            <span
              className={clsx(
                'text-[8px] transition-colors',
                isActive ? 'text-gold/90' : 'text-white/30 group-hover:text-white/50'
              )}
            >
              ({cat.count})
            </span>
          </button>
        )
      })}
    </nav>
  )
}
