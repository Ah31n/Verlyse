import { clsx } from 'clsx'

interface NavigationControlsProps {
  onPrev: () => void
  onNext: () => void
  onReset: () => void
  onFocusSelected: () => void
  hasSelected: boolean
  className?: string
}

/**
 * NavigationControls — Tactile spatial steering controls
 *
 * Provides physical click/tap targets for orbiting, stepping, and inspecting.
 */
export function NavigationControls({
  onPrev,
  onNext,
  onReset,
  onFocusSelected,
  hasSelected,
  className = '',
}: NavigationControlsProps) {
  return (
    <div
      className={clsx(
        'pointer-events-auto flex items-center justify-center gap-2 p-2 border border-white/10 bg-[#1A040B]/90 backdrop-blur-md shadow-2xl',
        className
      )}
    >
      {/* Step Left / Previous */}
      <button
        type="button"
        onClick={onPrev}
        className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center border border-white/15 bg-white/5 text-ivory/80 transition-all hover:border-gold/60 hover:bg-gold/10 hover:text-gold active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold"
        aria-label="Previous folio (Left Arrow)"
        title="Previous Folio (←)"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-4 w-4 fill-none stroke-current [stroke-width:1.5] [stroke-linecap:round] [stroke-linejoin:round]"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {/* Focus / Inspect current or return */}
      <button
        type="button"
        onClick={onFocusSelected}
        className={clsx(
          'flex h-10 sm:h-11 items-center gap-2 px-3.5 sm:px-4 font-mono text-[9px] uppercase tracking-[0.2em] transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold',
          hasSelected
            ? 'border border-gold bg-gold text-charcoal font-semibold shadow-lg shadow-gold/20'
            : 'border border-gold/40 bg-gold/10 text-gold hover:bg-gold hover:text-charcoal'
        )}
        aria-label={hasSelected ? 'Close Dossier' : 'Inspect Folio'}
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-3.5 w-3.5 fill-none stroke-current [stroke-width:1.5] [stroke-linecap:round] [stroke-linejoin:round]"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <span>{hasSelected ? 'Deselect' : 'Inspect (Enter)'}</span>
      </button>

      {/* Reset Camera View */}
      <button
        type="button"
        onClick={onReset}
        className="flex h-10 sm:h-11 items-center gap-1.5 px-3 border border-white/15 bg-white/5 font-mono text-[9px] uppercase tracking-[0.18em] text-white/70 transition-all hover:border-gold/60 hover:bg-gold/10 hover:text-gold active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold"
        aria-label="Reset Camera (Escape)"
        title="Reset Camera (Esc)"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-3.5 w-3.5 fill-none stroke-current [stroke-width:1.5] [stroke-linecap:round] [stroke-linejoin:round]"
        >
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
        <span className="hidden sm:inline">Reset</span>
      </button>

      {/* Step Right / Next */}
      <button
        type="button"
        onClick={onNext}
        className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center border border-white/15 bg-white/5 text-ivory/80 transition-all hover:border-gold/60 hover:bg-gold/10 hover:text-gold active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold"
        aria-label="Next folio (Right Arrow)"
        title="Next Folio (→)"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-4 w-4 fill-none stroke-current [stroke-width:1.5] [stroke-linecap:round] [stroke-linejoin:round]"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  )
}
