import { Link } from 'react-router-dom'
import { clsx } from 'clsx'

interface RoomMastheadProps {
  onOpenSearch: () => void
  onOpenHelp: () => void
  className?: string
}

/**
 * RoomMasthead — Persistent Quiet Top Navigation Layer for /room
 *
 * Distinct visual & behavioral role:
 * - Brand identity: Verlyse Media monogram + "THE KEEPING ROOM"
 * - Clear exit path: "← Return to archive" linking to /articles
 * - Global actions: Search (/), Help (?)
 * - Never obstructs central 3D focal point
 */
export function RoomMasthead({
  onOpenSearch,
  onOpenHelp,
  className = '',
}: RoomMastheadProps) {
  return (
    <header
      className={clsx(
        'pointer-events-none fixed inset-x-0 top-0 z-[500] flex items-center justify-between p-4 md:p-6 lg:px-10',
        className
      )}
    >
      {/* Brand & Room Title */}
      <div className="pointer-events-auto flex items-center gap-3 md:gap-4">
        <Link
          to="/"
          className="group flex items-center gap-2.5 text-ivory no-underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold"
          aria-label="Verlyse Media — Home"
        >
          <svg
            viewBox="0 0 40 40"
            aria-hidden="true"
            className="h-7 w-7 text-gold transition-transform duration-700 ease-out group-hover:rotate-90"
          >
            <circle cx="20" cy="20" r="18.5" fill="none" stroke="currentColor" strokeWidth="1" />
            <path
              d="M12.5 14.5 L20 27 L27.5 14.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="flex flex-col">
            <span className="font-serif text-lg md:text-xl leading-none text-ivory">
              Verlyse <em className="italic text-gold not-italic md:italic">Media</em>
            </span>
            <span className="font-mono text-[8px] uppercase tracking-[0.28em] text-gold/80 mt-0.5">
              The Keeping Room
            </span>
          </div>
        </Link>
      </div>

      {/* Center status badge (desktop only) */}
      <div className="hidden lg:flex pointer-events-auto items-center gap-2 border border-gold/30 bg-[#25070F]/80 px-4 py-1.5 backdrop-blur-md">
        <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
        <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-ivory/90">
          Spatial Archive · 19 Living Folios
        </span>
      </div>

      {/* Right Action Rail */}
      <div className="pointer-events-auto flex items-center gap-2 md:gap-3">
        {/* Search button */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex h-9 items-center gap-2 border border-white/15 bg-[#25070F]/80 px-3 font-mono text-[9px] uppercase tracking-[0.2em] text-white/80 transition-all hover:border-gold/60 hover:text-ivory focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold"
          aria-label="Search the archive"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-3.5 w-3.5 fill-none stroke-current [stroke-width:1.5] [stroke-linecap:round] [stroke-linejoin:round]"
          >
            <circle cx="11" cy="11" r="6.5" />
            <path d="M16 16l5 5" />
          </svg>
          <span className="hidden sm:inline">Search (/)</span>
        </button>

        {/* Help button */}
        <button
          type="button"
          onClick={onOpenHelp}
          className="flex h-9 w-9 items-center justify-center border border-white/15 bg-[#25070F]/80 font-mono text-xs text-white/80 transition-all hover:border-gold/60 hover:text-ivory focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold"
          aria-label="Keyboard shortcuts and navigation guide"
          title="Navigation Guide (?)"
        >
          ?
        </button>

        {/* Return to full archive */}
        <Link
          to="/articles"
          className="flex h-9 items-center gap-2 border border-gold/50 bg-[#350A15]/90 px-3.5 font-mono text-[9px] uppercase tracking-[0.22em] text-gold transition-all hover:bg-gold hover:text-charcoal focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold"
        >
          <span>← Archive</span>
        </Link>
      </div>
    </header>
  )
}
