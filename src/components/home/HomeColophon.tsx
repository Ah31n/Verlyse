import { Link } from 'react-router-dom'
import { clsx } from 'clsx'

interface HomeColophonProps {
  className?: string
}

/**
 * HomeColophon — Publication Footnote & Institutional Anchor
 */
export function HomeColophon({ className = '' }: HomeColophonProps) {
  return (
    <footer
      className={clsx(
        'mt-32 border-t border-gold/30 bg-[#120207] py-16 px-4 md:px-12 text-ivory/80',
        className
      )}
    >
      <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Monogram Colophon Column */}
        <div className="md:col-span-2">
          <span className="font-serif text-2xl font-light text-ivory">
            Verlyse <em className="italic text-gold">Media</em>
          </span>
          <p className="mt-3 max-w-md font-serif text-sm italic leading-relaxed text-white/60">
            A literary publication and spatial archive dedicated to giving voice to emerging writers, poets, and artists worldwide.
          </p>
          <div className="mt-6 font-mono text-[9px] uppercase tracking-[0.22em] text-gold/80">
            Lahore, Pakistan · Global Circulation · MMXXVI
          </div>
        </div>

        {/* Directory Links */}
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-gold">
            Navigation
          </span>
          <ul className="mt-4 space-y-2.5 font-mono text-xs text-white/70">
            <li><Link to="/articles" className="hover:text-gold transition-colors">The Folio Shelf</Link></li>
            <li><Link to="/categories" className="hover:text-gold transition-colors">The Wings</Link></li>
            <li><Link to="/creators" className="hover:text-gold transition-colors">Contributor Wall</Link></li>
            <li><Link to="/room" className="hover:text-gold transition-colors">The Keeping Room</Link></li>
          </ul>
        </div>

        {/* Institutional Links */}
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-gold">
            Editorial Desks
          </span>
          <ul className="mt-4 space-y-2.5 font-mono text-xs text-white/70">
            <li><Link to="/submit" className="hover:text-gold transition-colors">Submit Manuscript</Link></li>
            <li><Link to="/about" className="hover:text-gold transition-colors">The Colophon</Link></li>
            <li><Link to="/ambassadors" className="hover:text-gold transition-colors">Ambassadors Guild</Link></li>
            <li><Link to="/contact" className="hover:text-gold transition-colors">Correspondence</Link></li>
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-6xl mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between font-mono text-[9px] uppercase tracking-[0.2em] text-white/40 gap-4">
        <span>© MMXXVI Verlyse Media. All Rights Reserved.</span>
        <span>Crafted with Cormorant Garamond & IBM Plex Mono</span>
      </div>
    </footer>
  )
}
