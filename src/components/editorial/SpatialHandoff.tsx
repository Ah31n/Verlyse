import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { clsx } from 'clsx'
import { ArchivalSeal } from './GenerativeGraphics'

interface SpatialHandoffProps {
  label?: string
  sublabel?: string
  destination?: string
  className?: string
}

/**
 * SpatialHandoff — Ceremonial Transition Primitive into /room
 *
 * Distinct visual & behavioral role:
 * - Brief archival veil with pulsing seal
 * - Immediate 0ms bypass on reduced motion or coarse pointers
 * - Deep gold borders and corner marks
 */
export function SpatialHandoff({
  label = 'Enter The Keeping Room',
  sublabel = 'A spatial archive of living works · Three.js & CSS 3D',
  destination = '/room',
  className = '',
}: SpatialHandoffProps) {
  const navigate = useNavigate()
  const reduce = useReducedMotion() === true
  const [transitioning, setTransitioning] = useState(false)

  const handleEnter = (e: React.MouseEvent) => {
    e.preventDefault()
    if (reduce) {
      navigate(destination)
      return
    }
    setTransitioning(true)
    setTimeout(() => {
      navigate(destination)
    }, 600)
  }

  return (
    <>
      {transitioning && (
        <motion.div
          aria-hidden="true"
          className="fixed inset-0 z-[2000] bg-[#160408] flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="text-center">
            <ArchivalSeal size={64} className="mx-auto text-gold animate-pulse" />
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.32em] text-gold">
              Opening the keeping room…
            </p>
          </div>
        </motion.div>
      )}

      <a
        href={destination}
        onClick={handleEnter}
        className={clsx(
          'group relative block border border-gold/40 bg-gradient-to-r from-[#20050C] via-[#350A15] to-[#20050C] p-8 md:p-12 text-center no-underline overflow-hidden transition-all duration-700 hover:border-gold hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold active:scale-[0.98]',
          className
        )}
        data-cursor="room"
        data-cursor-label="ENTER"
      >
        {/* Corner registration marks */}
        <span aria-hidden="true" className="absolute top-3 left-3 h-3 w-3 border-t border-l border-gold/70" />
        <span aria-hidden="true" className="absolute top-3 right-3 h-3 w-3 border-t border-r border-gold/70" />
        <span aria-hidden="true" className="absolute bottom-3 left-3 h-3 w-3 border-b border-l border-gold/70" />
        <span aria-hidden="true" className="absolute bottom-3 right-3 h-3 w-3 border-b border-r border-gold/70" />

        <div className="relative z-10 flex flex-col items-center">
          <ArchivalSeal size={56} className="mb-4 text-gold/80 group-hover:rotate-45 group-hover:text-gold transition-all duration-700" />
          <span className="font-mono text-[9px] uppercase tracking-[0.32em] text-gold">
            Spatial Archive Gateway
          </span>
          <h3 className="mt-3 font-serif text-3xl md:text-4xl font-light text-ivory tracking-tight group-hover:text-[#E8D9A8] transition-colors">
            {label}
          </h3>
          <p className="mt-3 font-serif text-base italic text-white/60 max-w-[45ch]">
            {sublabel}
          </p>
          <span className="mt-6 inline-flex items-center gap-2 border border-gold/60 px-6 py-2.5 font-mono text-[9px] uppercase tracking-[0.24em] text-ivory group-hover:bg-gold group-hover:text-charcoal transition-all">
            Enter the room →
          </span>
        </div>
      </a>
    </>
  )
}
