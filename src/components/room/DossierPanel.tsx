import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import type { SpatialArchiveItem } from '../../lib/room/folios'
import { RoleBadge } from '../contributors/RoleBadge'

interface DossierPanelProps {
  item: SpatialArchiveItem | null
  onClose: () => void
  className?: string
}

/**
 * DossierPanel — Selected Object Monograph & Accession Card
 *
 * Appears when a reader selects/pulls a folio in /room.
 * Provides deep editorial context and direct action to the full reading view.
 */
export function DossierPanel({
  item,
  onClose,
  className = '',
}: DossierPanelProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Focus management
  useEffect(() => {
    if (item) {
      closeButtonRef.current?.focus()
    }
  }, [item])

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && item) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [item, onClose])

  if (!item) return null

  return (
    <aside
      role="dialog"
      aria-label={`Dossier: ${item.title}`}
      aria-modal="false"
      className={clsx(
        'fixed z-[600] flex flex-col justify-between overflow-y-auto no-scrollbar border border-gold/40 bg-[#160309]/95 text-ivory backdrop-blur-xl shadow-2xl transition-all duration-300',
        // Desktop: Right side panel
        'right-4 top-20 bottom-24 w-[380px] lg:w-[440px] max-w-[calc(100vw-2rem)] p-6 lg:p-8',
        // Mobile / Small screen: Bottom sheet
        'max-md:inset-x-0 max-md:bottom-0 max-md:top-auto max-md:max-h-[85vh] max-md:w-full max-md:rounded-t-2xl max-md:border-b-0 max-md:p-5',
        className
      )}
    >
      {/* Archival Header & Monogram Seal */}
      <div>
        <div className="flex items-center justify-between border-b border-gold/25 pb-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 bg-gold" />
            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-gold">
              Accession № {item.accession}
            </span>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center border border-white/20 text-white/60 transition-colors hover:border-gold hover:text-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold"
            aria-label="Close dossier panel"
          >
            ✕
          </button>
        </div>

        {/* Category & Status */}
        <div className="mt-4 flex items-center justify-between">
          <span className="border border-gold/30 bg-gold/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-gold">
            {item.category}
          </span>
          {item.featured && (
            <span className="font-mono text-[8px] uppercase tracking-widest text-gold/80">
              Lead Folio
            </span>
          )}
        </div>

        {/* Title */}
        <h2 className="mt-4 font-serif text-2xl lg:text-3xl font-light leading-snug tracking-tight text-ivory">
          {item.title}
        </h2>

        {/* Author / Creator Monograph */}
        <div className="mt-3 flex items-center gap-2.5">
          <span className="font-serif text-sm italic text-ivory/80">by {item.author}</span>
          {item.authorRole && <RoleBadge role={item.authorRole} />}
        </div>

        {/* Cover Preview Image */}
        {item.coverImage && (
          <div className="mt-5 relative aspect-[16/10] w-full overflow-hidden border border-white/15 bg-black/40">
            <img
              src={item.coverImage}
              alt={item.title}
              className="h-full w-full object-cover grayscale-[30%] contrast-[1.1] transition-all hover:grayscale-0 hover:scale-105 duration-700"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#160309] via-transparent to-transparent opacity-60 pointer-events-none" />
          </div>
        )}

        {/* Excerpt / Summary */}
        <p className="mt-4 font-serif text-sm lg:text-base leading-relaxed text-white/80 italic">
          "{item.excerpt}"
        </p>

        {/* Archival metadata ledger */}
        <dl className="mt-5 grid grid-cols-2 gap-3 border-y border-white/10 py-3 font-mono text-[9px] uppercase tracking-wider text-white/60">
          <div>
            <dt className="text-white/40">Registered Date</dt>
            <dd className="mt-0.5 text-ivory/90">{item.accessionDate || 'Autumn MMXXVI'}</dd>
          </div>
          <div>
            <dt className="text-white/40">Reading Time</dt>
            <dd className="mt-0.5 text-gold">{item.readingTime || '5 min'}</dd>
          </div>
        </dl>
      </div>

      {/* Primary Action Button Bar */}
      <div className="mt-6 flex flex-col gap-2.5 pt-2">
        <Link
          to={`/article/${item.id}`}
          className="group relative flex h-12 w-full items-center justify-center gap-2 bg-gold px-6 font-mono text-xs uppercase tracking-[0.24em] font-semibold text-charcoal transition-all hover:bg-gold/90 hover:shadow-lg hover:shadow-gold/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          <span>Read Full Piece</span>
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-4 w-4 fill-none stroke-current [stroke-width:2] [stroke-linecap:round] [stroke-linejoin:round] transition-transform duration-300 group-hover:translate-x-1"
          >
            <path d="M5 12h14" />
            <path d="M12 5l7 7-7 7" />
          </svg>
        </Link>

        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-full items-center justify-center border border-white/20 font-mono text-[10px] uppercase tracking-[0.2em] text-white/70 transition-all hover:border-gold hover:text-ivory focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold"
        >
          Return to Spatial Room
        </button>
      </div>
    </aside>
  )
}
