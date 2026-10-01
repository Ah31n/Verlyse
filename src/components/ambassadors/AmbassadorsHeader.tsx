import { clsx } from 'clsx'

interface AmbassadorsHeaderProps {
  className?: string
}

/**
 * AmbassadorsHeader — The Guild Masthead
 */
export function AmbassadorsHeader({ className = '' }: AmbassadorsHeaderProps) {
  return (
    <header className={clsx('border-b border-gold/30 pb-8 pt-6', className)}>
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-gold" />
        <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-gold">
          The Guild Network
        </span>
      </div>
      <h1 className="mt-3 font-serif text-4xl md:text-6xl font-light text-ivory tracking-tight">
        Ambassadors & Advocates
      </h1>
      <p className="mt-2 font-serif text-base md:text-lg italic text-white/70 max-w-2xl">
        The individuals championing Verlyse Media across campuses, literary societies, and creative networks worldwide.
      </p>
    </header>
  )
}
