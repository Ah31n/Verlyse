import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import { ArchivalSeal } from '../editorial/GenerativeGraphics'

export function SpatialLink({
  className = '',
  label = 'Enter The Keeping Room',
  sublabel = 'A 3D archival cylinder of living works',
}: {
  className?: string
  label?: string
  sublabel?: string
}) {
  return (
    <Link
      to="/room"
      className={clsx(
        'group relative block border border-gold/40 bg-gradient-to-r from-[#20050C] via-[#350A15] to-[#20050C] p-8 md:p-12 text-center no-underline overflow-hidden transition-all duration-700 hover:border-gold hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold',
        className
      )}
      data-cursor="room"
      data-cursor-label="ENTER 3D"
    >
      {/* Corner registration marks */}
      <span className="absolute top-3 left-3 h-3 w-3 border-t border-l border-gold/70" />
      <span className="absolute top-3 right-3 h-3 w-3 border-t border-r border-gold/70" />
      <span className="absolute bottom-3 left-3 h-3 w-3 border-b border-l border-gold/70" />
      <span className="absolute bottom-3 right-3 h-3 w-3 border-b border-r border-gold/70" />

      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,185,120,0.12),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center">
        <ArchivalSeal size={64} className="mb-4 text-gold/80 group-hover:rotate-45 group-hover:text-gold transition-all duration-700" />
        <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-gold">
          Spatial Archive · Three.js
        </span>
        <h3 className="mt-3 font-serif text-3xl md:text-4xl font-light text-ivory tracking-tight group-hover:text-[#E8D9A8] transition-colors">
          {label}
        </h3>
        <p className="mt-3 font-serif text-base italic text-white/60 max-w-[45ch]">
          {sublabel}
        </p>
        <span className="mt-6 inline-flex items-center gap-2 border border-gold/60 px-6 py-2.5 font-mono text-[9px] uppercase tracking-[0.24em] text-ivory group-hover:bg-gold group-hover:text-charcoal transition-all">
          Pull the first plate →
        </span>
      </div>
    </Link>
  )
}
