import { clsx } from 'clsx'

interface PullQuotePlateProps {
  quote: string
  attribution?: string
  role?: string
  folioRef?: string
  variant?: 'wine' | 'paper' | 'minimal'
  className?: string
}

/**
 * PullQuotePlate — Archival Pull-Quote Plate
 * Features:
 * - Architectural quotation marks in Cormorant Garamond
 * - 1px brass registration line
 * - Tabular mono attribution metadata
 */
export function PullQuotePlate({
  quote,
  attribution,
  role,
  folioRef,
  variant = 'wine',
  className = '',
}: PullQuotePlateProps) {
  if (variant === 'minimal') {
    return (
      <blockquote className={clsx('my-8 border-l-2 border-gold/70 pl-6 py-2', className)}>
        <p className="font-serif text-xl md:text-2xl font-light italic leading-relaxed text-ivory">
          "{quote}"
        </p>
        {(attribution || role) && (
          <footer className="mt-3 font-mono text-[9px] uppercase tracking-[0.24em] text-gold/80">
            {attribution && <span className="font-semibold text-gold">{attribution}</span>}
            {role && <span className="text-white/40"> — {role}</span>}
          </footer>
        )}
      </blockquote>
    )
  }

  const isWine = variant === 'wine'

  return (
    <figure
      className={clsx(
        'relative my-10 overflow-hidden border p-8 md:p-10 transition-all duration-500',
        isWine
          ? 'border-gold/30 bg-[#25070F]/90 text-ivory shadow-[0_16px_40px_rgba(0,0,0,0.5)]'
          : 'border-[#7C6338]/40 bg-[#F8F6F2] text-[#241D18] shadow-[0_16px_40px_rgba(0,0,0,0.1)]',
        className
      )}
    >
      {/* Decorative Archival Watermark Quote Mark */}
      <span
        aria-hidden="true"
        className={clsx(
          'pointer-events-none absolute -top-4 left-4 select-none font-serif text-[120px] font-bold leading-none',
          isWine ? 'text-gold/[0.07]' : 'text-[#7C6338]/[0.08]'
        )}
      >
        “
      </span>

      <div className="relative z-10">
        {folioRef && (
          <div className={clsx('mb-4 font-mono text-[9px] uppercase tracking-[0.28em]', isWine ? 'text-gold/70' : 'text-[#7C6338]')}>
            {folioRef}
          </div>
        )}

        <blockquote className="font-serif text-2xl md:text-3xl font-light italic leading-snug">
          "{quote}"
        </blockquote>

        {(attribution || role) && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-gold/20 pt-4">
            <figcaption className="flex items-center gap-2">
              {attribution && (
                <span className={clsx('font-serif text-base', isWine ? 'text-gold' : 'text-[#5C1224]')}>
                  {attribution}
                </span>
              )}
              {role && (
                <span className={clsx('font-mono text-[9px] uppercase tracking-[0.2em]', isWine ? 'text-white/40' : 'text-[#8A8178]')}>
                  / {role}
                </span>
              )}
            </figcaption>
            <span className={clsx('font-mono text-[8px] uppercase tracking-[0.3em]', isWine ? 'text-white/30' : 'text-[#8A8178]/60')}>
              Verlyse Record
            </span>
          </div>
        )}
      </div>
    </figure>
  )
}
