import { clsx } from 'clsx'

interface AccessionLabelProps {
  folioNumber: number | string
  category?: string
  date?: string
  readingTime?: string
  department?: string
  variant?: 'inline' | 'stacked' | 'badge'
  className?: string
}

/**
 * AccessionLabel — Archival Registration & Metadata Primitive
 * Formats accession metadata according to Verlyse liturgical archive standards.
 */
export function AccessionLabel({
  folioNumber,
  category,
  date,
  readingTime,
  department,
  variant = 'inline',
  className = '',
}: AccessionLabelProps) {
  const fNum = typeof folioNumber === 'number' ? String(folioNumber).padStart(2, '0') : folioNumber

  if (variant === 'stacked') {
    return (
      <div className={clsx('flex flex-col gap-1 font-mono text-[9px] uppercase tracking-[0.24em]', className)}>
        <span className="text-gold font-medium">№ {fNum} · REGISTRY</span>
        {category && <span className="text-white/60">{category}</span>}
        {(date || readingTime) && (
          <span className="text-white/40">{[date, readingTime].filter(Boolean).join(' · ')}</span>
        )}
      </div>
    )
  }

  if (variant === 'badge') {
    return (
      <div
        className={clsx(
          'inline-flex items-center gap-2 border border-gold/40 bg-[#20050C]/90 px-3 py-1 font-mono text-[8px] uppercase tracking-[0.22em] text-gold',
          className
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
        <span>№ {fNum}</span>
        {category && (
          <>
            <span className="text-gold/40">/</span>
            <span className="text-ivory">{category}</span>
          </>
        )}
      </div>
    )
  }

  return (
    <div className={clsx('flex flex-wrap items-center gap-2.5 font-mono text-[9px] uppercase tracking-[0.24em] text-gold', className)}>
      <span className="font-semibold">№ {fNum}</span>
      {category && (
        <>
          <span className="text-white/30" aria-hidden="true">·</span>
          <span className="text-ivory/80">{category}</span>
        </>
      )}
      {department && (
        <>
          <span className="text-white/30" aria-hidden="true">·</span>
          <span className="text-white/50">{department}</span>
        </>
      )}
      {readingTime && (
        <>
          <span className="text-white/30" aria-hidden="true">·</span>
          <span className="text-white/40">{readingTime}</span>
        </>
      )}
    </div>
  )
}
