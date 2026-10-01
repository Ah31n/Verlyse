import { clsx } from 'clsx'

/**
 * ArchivalMonogramSeal — An authentic engraved stamp plate for contributors without photographic portraits.
 * Materiality: Hand-struck letterpress seal with brass registration marks, embossed typography,
 * and institutional accession numbering.
 */
export function ArchivalMonogramSeal({
  name,
  role,
  philosophy,
  className = '',
}: {
  name: string
  role?: string
  philosophy?: string
  className?: string
}) {
  const initials = name
    .split(' ')
    .map((w) => w.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div
      className={clsx(
        'relative h-full w-full flex flex-col justify-between p-6 bg-[#22060D] border border-gold/30 text-center select-none overflow-hidden',
        className
      )}
      aria-hidden="true"
    >
      {/* Engraved archival border & corner brackets */}
      <div className="absolute inset-2 border border-gold/20 pointer-events-none" />
      <span className="absolute top-3 left-3 font-mono text-[9px] text-gold/60">⌜</span>
      <span className="absolute top-3 right-3 font-mono text-[9px] text-gold/60">⌝</span>
      <span className="absolute bottom-3 left-3 font-mono text-[9px] text-gold/60">⌞</span>
      <span className="absolute bottom-3 right-3 font-mono text-[9px] text-gold/60">⌟</span>

      {/* Top Ledger Header */}
      <div className="relative z-10 pt-1">
        <span className="font-mono text-[8px] uppercase tracking-[0.32em] text-gold/70 block">
          Verlyse Guild
        </span>
        <span className="font-mono text-[7px] uppercase tracking-[0.24em] text-white/30 block mt-0.5">
          Archival Monogram
        </span>
      </div>

      {/* Center Engraved Seal Monogram */}
      <div className="relative z-10 my-auto py-2">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gold/40 bg-wine-deep/90 shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)]">
          <span className="font-serif text-3xl font-light text-gold tracking-widest">
            {initials}
          </span>
        </div>
        {philosophy && (
          <p className="mt-3 px-2 font-serif text-[11px] italic font-light leading-relaxed text-white/60 line-clamp-2">
            “{philosophy}”
          </p>
        )}
      </div>

      {/* Bottom Contributor Stamp */}
      <div className="relative z-10 pb-1 border-t border-gold/20 pt-2">
        <span className="font-serif text-xs text-gold block truncate">
          {name}
        </span>
        {role && (
          <span className="font-mono text-[7.5px] uppercase tracking-[0.2em] text-white/40 block mt-0.5 truncate">
            {role}
          </span>
        )}
      </div>
    </div>
  )
}

export function InteractivePortrait({
  src,
  alt,
  role,
  philosophy,
  className = '',
  aspect = 'aspect-[3/4]',
}: {
  src?: string
  alt: string
  role?: string
  philosophy?: string
  className?: string
  aspect?: string
}) {
  return (
    <div className={clsx('relative group overflow-hidden border border-gold/40 bg-[#160408]', aspect, className)}>
      {/* Archival corner registration marks */}
      <span className="absolute top-2 left-2 h-2.5 w-2.5 border-t border-l border-gold/70 z-10 pointer-events-none" />
      <span className="absolute top-2 right-2 h-2.5 w-2.5 border-t border-r border-gold/70 z-10 pointer-events-none" />
      <span className="absolute bottom-2 left-2 h-2.5 w-2.5 border-b border-l border-gold/70 z-10 pointer-events-none" />
      <span className="absolute bottom-2 right-2 h-2.5 w-2.5 border-b border-r border-gold/70 z-10 pointer-events-none" />

      {src ? (
        <>
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
            loading="lazy"
          />
          {/* Atmospheric vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#140307]/85 via-transparent to-transparent pointer-events-none" />
        </>
      ) : (
        <ArchivalMonogramSeal name={alt} role={role} philosophy={philosophy} />
      )}

      {src && role && (
        <div className="absolute bottom-3 left-3 right-3 z-10">
          <span className="inline-block font-mono text-[9px] uppercase tracking-[0.24em] text-gold/90 bg-[#1B0610]/85 backdrop-blur-sm px-2.5 py-1 border border-gold/30">
            {role}
          </span>
        </div>
      )}
    </div>
  )
}
