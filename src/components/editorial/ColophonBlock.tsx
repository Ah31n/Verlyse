import { clsx } from 'clsx'
import { BRAND, LEDGER } from '../../data/content'

interface ColophonBlockProps {
  className?: string
  showFounder?: boolean
  showMetrics?: boolean
}

/**
 * ColophonBlock — Institutional Record & Colophon Primitive
 * Used on /about, / (homepage footer), and institutional routes.
 */
export function ColophonBlock({
  className = '',
  showFounder = true,
  showMetrics = true,
}: ColophonBlockProps) {
  return (
    <div
      className={clsx(
        'relative border border-white/10 bg-[#160408]/90 p-8 md:p-12 text-ivory overflow-hidden',
        className
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Colophon Text */}
        <div className="lg:col-span-7">
          <p className="font-mono text-[9px] uppercase tracking-[0.32em] text-gold">
            The Colophon · Institutional Record
          </p>
          <h3 className="mt-3 font-serif text-2xl md:text-3xl font-light text-ivory">
            {BRAND.tagline}
          </h3>
          <p className="mt-4 font-serif text-sm font-light text-white/70 leading-relaxed max-w-[55ch]">
            Verlyse Media is a literary archive and cultural publication dedicated to authored longform essays, short stories, poetry, and contemplative arts. Every feature is preserved in the physical registry, accredited to its author, and read with intention.
          </p>

          {showMetrics && (
            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
              <div>
                <span className="font-mono text-[8px] uppercase tracking-[0.24em] text-white/40 block">Features</span>
                <span className="font-serif text-2xl font-light text-gold">{LEDGER.features}</span>
              </div>
              <div>
                <span className="font-mono text-[8px] uppercase tracking-[0.24em] text-white/40 block">Creators</span>
                <span className="font-serif text-2xl font-light text-gold">{LEDGER.creators}</span>
              </div>
              <div>
                <span className="font-mono text-[8px] uppercase tracking-[0.24em] text-white/40 block">Wings</span>
                <span className="font-serif text-2xl font-light text-gold">{LEDGER.departments}</span>
              </div>
            </div>
          )}
        </div>

        {/* Founder note / Legal */}
        <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-8">
          {showFounder && (
            <div>
              <p className="font-mono text-[8px] uppercase tracking-[0.28em] text-gold/80">
                Founder & Editor-in-Chief
              </p>
              <p className="mt-1 font-serif text-lg font-normal text-ivory">
                Alina Javed
              </p>
              <p className="mt-2 font-serif text-xs italic text-white/60 leading-relaxed">
                "Where Vision Becomes A Voice — giving human experience the permanence of the printed and digital page."
              </p>
            </div>
          )}

          <div className="mt-6 font-mono text-[8px] uppercase tracking-[0.2em] text-white/40 leading-relaxed">
            <p>© {new Date().getFullYear()} Verlyse Media.</p>
            <p className="mt-1">Set in Cormorant Garamond, Inter & IBM Plex Mono.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
