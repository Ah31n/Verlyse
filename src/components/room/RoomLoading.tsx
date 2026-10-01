import { Link } from 'react-router-dom'
import { clsx } from 'clsx'

interface RoomLoadingProps {
  className?: string
}

/**
 * RoomLoading — Archival Paper Loading Shell
 *
 * Keeps user informed while 3D assets and shaders calibrate,
 * while always providing a visible exit link.
 */
export function RoomLoading({ className = '' }: RoomLoadingProps) {
  return (
    <div
      className={clsx(
        'relative flex min-h-screen w-full flex-col items-center justify-center bg-[#120207] p-6 text-ivory',
        className
      )}
    >
      <div className="flex max-w-sm flex-col items-center text-center">
        {/* Archival Monogram Loader */}
        <div className="relative mb-6 flex h-20 w-20 items-center justify-center border border-gold/40">
          <div className="absolute inset-1 border border-dashed border-gold/20 animate-spin [animation-duration:12s]" />
          <svg
            viewBox="0 0 40 40"
            aria-hidden="true"
            className="h-10 w-10 text-gold animate-pulse"
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
        </div>

        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-gold">
          The Keeping Room
        </span>
        <h2 className="mt-2 font-serif text-2xl font-light text-ivory">
          Calibrating Spatial Cylinders…
        </h2>
        <p className="mt-2 font-serif text-sm italic text-white/60">
          Positioning 19 archival folios along the brass focal meridian.
        </p>

        {/* Progress bar */}
        <div className="mt-6 h-0.5 w-48 overflow-hidden bg-white/10">
          <div className="h-full bg-gold animate-[pulse_1.5s_ease-in-out_infinite] w-full" />
        </div>

        <div className="mt-8">
          <Link
            to="/articles"
            className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40 hover:text-gold transition-colors"
          >
            Skip to 2D Editorial Archive →
          </Link>
        </div>
      </div>
    </div>
  )
}
