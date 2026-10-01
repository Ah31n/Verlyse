import { Link } from 'react-router-dom'
import { clsx } from 'clsx'

interface HomeSpatialHandoffProps {
  className?: string
}

/**
 * HomeSpatialHandoff — Gateway into The Keeping Room
 */
export function HomeSpatialHandoff({ className = '' }: HomeSpatialHandoffProps) {
  return (
    <section
      className={clsx(
        'relative my-24 md:my-32 overflow-hidden border border-gold/40 bg-gradient-to-b from-[#2A0F18] to-[#120207] p-8 md:p-16 lg:p-20 text-center shadow-2xl',
        className
      )}
    >
      <div className="mx-auto max-w-2xl">
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-gold">
          Spatial Archive Experience
        </span>
        <h2 className="mt-4 font-serif text-3xl md:text-5xl font-light leading-tight text-ivory">
          The Keeping Room
        </h2>
        <p className="mt-4 font-serif text-base md:text-lg italic leading-relaxed text-white/80">
          Step into our 3D parametric cylindrical archive. 19 living folios arranged along a quiet brass meridian.
        </p>

        <div className="mt-8 flex justify-center">
          <Link
            to="/room"
            className="group relative flex h-13 items-center justify-center gap-3 bg-gold px-8 font-mono text-xs uppercase tracking-[0.24em] font-semibold text-charcoal shadow-xl transition-all hover:bg-gold/90 hover:scale-105 active:scale-95"
          >
            <span>Enter The Keeping Room</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
