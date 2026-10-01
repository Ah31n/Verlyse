import { clsx } from 'clsx'
import type { SpatialArchiveItem } from '../../lib/room/folios'

interface StatusRailProps {
  currentIndex: number
  totalItems: number
  selectedItem: SpatialArchiveItem | null
  activeCategory: string | null
  interactionPrompt?: string
  className?: string
}

/**
 * StatusRail — Live Editorial Status Bar
 *
 * Shows:
 * - Current Folio Accession Index (`FOLIO 01 / 19`)
 * - Current Collection/Department
 * - Dynamic navigational hints
 */
export function StatusRail({
  currentIndex,
  totalItems,
  selectedItem,
  activeCategory,
  interactionPrompt = 'Drag horizontally or use ← → arrows to rotate · Click folio to inspect',
  className = '',
}: StatusRailProps) {
  const formattedIndex = String(currentIndex + 1).padStart(2, '0')
  const formattedTotal = String(totalItems).padStart(2, '0')

  return (
    <div
      className={clsx(
        'pointer-events-none fixed inset-x-0 bottom-24 md:bottom-20 z-[400] flex justify-center px-4',
        className
      )}
    >
      <div className="flex max-w-2xl items-center gap-3 border border-white/10 bg-[#1A040B]/85 px-4 py-2 backdrop-blur-md text-[10px] md:text-xs text-white/70 shadow-2xl">
        {/* Folio Counter */}
        <div className="flex items-center gap-1.5 font-mono text-gold font-medium shrink-0">
          <span className="text-[8px] uppercase tracking-widest text-white/40">FOLIO</span>
          <span>
            {formattedIndex} / {formattedTotal}
          </span>
        </div>

        <span className="text-white/20">|</span>

        {/* Current Active Category / Folio Title */}
        <div className="truncate font-mono text-[9px] md:text-[10px] uppercase tracking-wider text-ivory/90 shrink-0">
          {selectedItem ? (
            <span className="text-gold font-serif normal-case italic text-xs tracking-normal">
              "{selectedItem.title}"
            </span>
          ) : activeCategory ? (
            <span>Wing: {activeCategory}</span>
          ) : (
            <span>All Folios</span>
          )}
        </div>

        <span className="hidden sm:inline text-white/20">|</span>

        {/* Contextual Interaction Hint */}
        <div className="hidden sm:inline truncate font-mono text-[9px] text-white/50 tracking-wide">
          {interactionPrompt}
        </div>
      </div>
    </div>
  )
}
