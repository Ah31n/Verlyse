import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { clsx } from 'clsx'
import { ArchivalSeal } from '../editorial/GenerativeGraphics'

export function SpatialLink({
  className = '',
  label = 'Enter The Keeping Room',
  sublabel = 'A 3D spatial archive of living works',
}: {
  className?: string
  label?: string
  sublabel?: string
}) {
  const navigate = useNavigate()
  const reduce = useReducedMotion() === true
  const [transitioning, setTransitioning] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (reduce) {
      navigate('/room')
      return
    }
    setTransitioning(true)
    setTimeout(() => {
      navigate('/room')
    }, 750)
  }

  return (
    <>
      {transitioning && (
        <motion.div
          aria-hidden="true"
          className="fixed inset-0 z-[2000] bg-[#160408] flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <ArchivalSeal size={72} className="mx-auto text-gold animate-pulse" />
            </motion.div>
            <motion.p
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="mt-4 font-mono text-[10px] uppercase tracking-[0.32em] text-gold"
            >
              Opening the vault…
            </motion.p>
          </div>
        </motion.div>
      )}

      <a
        href="/room"
        onClick={handleClick}
        className={clsx(
          'group relative block border border-gold/40 bg-gradient-to-r from-[#20050C] via-[#350A15] to-[#20050C] p-8 md:p-12 text-center no-underline overflow-hidden transition-all duration-700 hover:border-gold hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold active:scale-[0.98]',
          className
        )}
        data-cursor="room"
        data-cursor-label="ENTER"
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
            Enter the room →
          </span>
        </div>
      </a>
    </>
  )
}
