import { type ReactNode } from 'react'
import { clsx } from 'clsx'

/**
 * EditorialLabel — kicker, eyebrow, marginalia tags with house letterpress styling.
 */
export function EditorialLabel({
  children,
  variant = 'eyebrow',
  accent = true,
  className = '',
}: {
  children: ReactNode
  variant?: 'eyebrow' | 'kicker' | 'marginalia' | 'stamp'
  accent?: boolean
  className?: string
}) {
  if (variant === 'eyebrow') {
    return (
      <span className={clsx('eyebrow', className)}>
        {children}
      </span>
    )
  }

  if (variant === 'kicker') {
    return (
      <span className={clsx('kicker inline-flex items-center gap-2', className)}>
        {accent && <span className="h-1 w-1 rounded-full bg-gold inline-block" aria-hidden="true" />}
        {children}
      </span>
    )
  }

  if (variant === 'stamp') {
    return (
      <span className={clsx('inline-flex items-center border border-gold/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.28em] text-gold', className)}>
        {children}
      </span>
    )
  }

  // marginalia
  return (
    <span className={clsx('font-mono text-[9px] uppercase tracking-[0.3em] text-white/50', className)}>
      {children}
    </span>
  )
}

/**
 * EditorialFolio — archival folio number plate (e.g. № 01 · ISSUE 01).
 */
export function EditorialFolio({
  number,
  issue = 'ISSUE 01',
  date,
  className = '',
}: {
  number: string | number
  issue?: string
  date?: string
  className?: string
}) {
  const numStr = String(number).padStart(2, '0')

  return (
    <div className={clsx('inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.28em] text-gold/80', className)}>
      <span className="font-semibold text-gold">FOLIO № {numStr}</span>
      <span className="text-white/30" aria-hidden="true">/</span>
      <span>{issue}</span>
      {date && (
        <>
          <span className="text-white/30" aria-hidden="true">·</span>
          <span className="text-white/50">{date}</span>
        </>
      )}
    </div>
  )
}

/**
 * EditorialRule — brass rules, ink lines, fleuron ornaments.
 */
export function EditorialRule({
  variant = 'brass',
  fleuron = false,
  className = '',
}: {
  variant?: 'brass' | 'hairline' | 'gradient' | 'faint'
  fleuron?: boolean
  className?: string
}) {
  const styles = {
    brass: 'bg-gold/40',
    hairline: 'bg-white/10',
    gradient: 'bg-gradient-to-r from-transparent via-[#D9B978]/50 to-transparent',
    faint: 'bg-white/5',
  }

  if (fleuron) {
    return (
      <div className={clsx('relative my-8 flex items-center justify-center', className)}>
        <div className={clsx('h-px flex-1', styles[variant])} />
        <span className="px-4 font-serif text-sm italic text-gold" aria-hidden="true">
          ✦ ❖ ✦
        </span>
        <div className={clsx('h-px flex-1', styles[variant])} />
      </div>
    )
  }

  return <div className={clsx('h-px w-full my-6', styles[variant], className)} aria-hidden="true" />
}
