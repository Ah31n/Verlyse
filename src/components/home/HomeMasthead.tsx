import { Link } from 'react-router-dom'
import { clsx } from 'clsx'

interface HomeMastheadProps {
  className?: string
}

/**
 * HomeMasthead — Publication Cover Masthead
 *
 * Establishes Verlyse Media brand identity and edition volume.
 */
export function HomeMasthead({ className = '' }: HomeMastheadProps) {
  return (
    <header className={clsx('relative z-20 flex flex-col items-center justify-between border-b border-gold/20 pb-6 pt-4 text-center md:flex-row md:text-left', className)}>
      <div className="flex items-center gap-3">
        <Link to="/" className="group flex items-center gap-2.5 text-ivory no-underline" aria-label="Verlyse Media Cover">
          <svg
            viewBox="0 0 40 40"
            aria-hidden="true"
            className="h-8 w-8 text-gold transition-transform duration-700 ease-out group-hover:rotate-90"
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
            <span className="font-serif text-2xl font-light tracking-tight text-ivory">
              Verlyse <em className="italic text-gold">Media</em>
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.26em] text-gold/80">
              Where Vision Becomes A Voice
            </span>
          </div>
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white/70 md:mt-0">
        <span className="border-r border-white/15 pr-4">Edition MMXXVI · Vol. I</span>
        <span className="border-r border-white/15 pr-4 text-gold">19 Living Folios</span>
        <span className="text-white/50">Lahore / Global</span>
      </div>
    </header>
  )
}
