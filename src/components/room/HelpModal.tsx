import { useEffect, useRef } from 'react'
import { clsx } from 'clsx'

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
  className?: string
}

/**
 * HelpModal — Archival Navigation Manual & Shortcuts
 */
export function HelpModal({ isOpen, onClose, className = '' }: HelpModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const shortcuts = [
    { key: '← / →', desc: 'Rotate through cylindrical folios' },
    { key: 'Enter / Space', desc: 'Pull & inspect focused folio dossier' },
    { key: 'Esc', desc: 'Deselect folio or reset camera perspective' },
    { key: '/', desc: 'Open global spatial archive search' },
    { key: 'Drag / Swipe', desc: 'Orbit along the archival arc' },
    { key: 'Scroll Wheel', desc: 'Step forward and backward through plates' },
  ]

  return (
    <div
      className={clsx(
        'fixed inset-0 z-[700] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md',
        className
      )}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-label="Navigation Guide & Shortcuts"
        aria-modal="true"
        className="w-full max-w-lg border border-gold/40 bg-[#160309] p-6 md:p-8 text-ivory shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gold/30 pb-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
            <h2 className="font-serif text-xl tracking-tight text-ivory">
              The Keeping Room · Navigation Manual
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center border border-white/20 text-white/60 hover:border-gold hover:text-gold"
            aria-label="Close help modal"
          >
            ✕
          </button>
        </div>

        <p className="mt-4 font-serif text-sm leading-relaxed text-white/80">
          The Keeping Room arranges Verlyse’s 19 published folios along a parametric cylindrical arc.
          Interact via fine pointer drag, keyboard shortcuts, or tactile touch controls.
        </p>

        <div className="mt-6 space-y-3">
          <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-gold">
            Keyboard & Pointer Controls
          </span>
          <dl className="divide-y divide-white/10 border-y border-white/10">
            {shortcuts.map((sc) => (
              <div key={sc.key} className="flex items-center justify-between py-2.5">
                <dt className="font-mono text-xs text-gold bg-gold/10 px-2 py-0.5 border border-gold/30">
                  {sc.key}
                </dt>
                <dd className="font-serif text-sm text-white/80">{sc.desc}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-gold px-5 py-2 font-mono text-[10px] uppercase tracking-[0.2em] font-semibold text-charcoal hover:bg-gold/90"
          >
            Understood (Esc)
          </button>
        </div>
      </div>
    </div>
  )
}
