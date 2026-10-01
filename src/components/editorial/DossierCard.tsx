import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import type { Author } from '../../data/content'
import { RoleBadge } from '../contributors/RoleBadge'
import { ArchivalMonogramSeal } from '../contributors/InteractivePortrait'
import { SpotlightCard } from '../interaction/SpotlightCard'

interface DossierCardProps {
  author: Author
  recordNumber?: number
  folioCount?: number
  isSelected?: boolean
  onClick?: () => void
  className?: string
}

/**
 * DossierCard — Creator Profile & Monograph Object
 *
 * Distinct visual & behavioral role:
 * - Clear role, name, handle, and work relationship
 * - Archival monogram seal for creators without portraits
 * - Single disciplined spotlight / fine-pointer interaction
 * - Touch-friendly link to author monograph page (`/creator/:id`)
 */
export function DossierCard({
  author,
  recordNumber,
  folioCount = 0,
  isSelected = false,
  onClick,
  className = '',
}: DossierCardProps) {
  const rNum = recordNumber !== undefined ? String(recordNumber).padStart(2, '0') : undefined

  return (
    <div
      className={clsx(
        'group relative transition-all duration-500',
        isSelected ? 'scale-[1.02] z-10' : 'opacity-90 hover:opacity-100',
        className
      )}
    >
      <SpotlightCard
        theme="dark"
        borderHighlight={isSelected}
        className={clsx(
          'border p-6 transition-all duration-500 bg-[#25070F]/80',
          isSelected ? 'border-gold shadow-[0_16px_36px_rgba(0,0,0,0.6)]' : 'border-white/10 hover:border-gold/40'
        )}
      >
        <div className="flex items-start gap-4">
          {/* Portrait or Archival Monogram */}
          <div className="relative h-16 w-16 shrink-0 overflow-hidden border border-gold/40 bg-[#160408]">
            {author.profilePhoto ? (
              <img
                src={author.profilePhoto}
                alt={author.name}
                width={64}
                height={64}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#2D0A14] to-[#140207]">
                <ArchivalMonogramSeal name={author.name} role={author.role} />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              {rNum && (
                <span className="font-mono text-[8px] uppercase tracking-[0.24em] text-gold/80">
                  REC № {rNum}
                </span>
              )}
              {folioCount > 0 && (
                <span className="font-mono text-[8px] tracking-[0.2em] text-white/40">
                  {folioCount} {folioCount === 1 ? 'folio' : 'folios'}
                </span>
              )}
            </div>

            <h3 className="mt-1 font-serif text-xl font-normal text-ivory group-hover:text-gold transition-colors truncate">
              {author.name}
            </h3>

            {author.handle && (
              <p className="font-mono text-[9px] text-white/50 tracking-[0.14em] truncate">
                {author.handle}
              </p>
            )}

            {author.role && (
              <div className="mt-2.5">
                <RoleBadge role={author.role} />
              </div>
            )}
          </div>
        </div>

        {author.bio && (
          <p className="mt-4 border-t border-white/5 pt-3 font-serif text-xs font-light italic text-white/65 line-clamp-2 leading-relaxed">
            "{author.bio}"
          </p>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
          <Link
            to={`/creator/${author.id}`}
            className="font-mono text-[8px] uppercase tracking-[0.24em] text-gold hover:text-ivory transition-colors"
          >
            Open Dossier →
          </Link>
          {onClick && (
            <button
              type="button"
              onClick={onClick}
              className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/40 hover:text-white/80 transition-colors"
            >
              Focus on wall
            </button>
          )}
        </div>
      </SpotlightCard>
    </div>
  )
}
