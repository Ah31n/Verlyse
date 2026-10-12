import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { createPortal } from 'react-dom'
import type { Article } from '../../data/content'
import { folioNoOf } from '../../data/content'
import { handleImgError } from '../../lib/imgFallback'

const FOCUSABLE = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * THE GALLERY — for publications that are artworks. The slides become a
 * hushed viewing room: a grid of plates, and a lightbox that opens with a
 * slow settle. Source dimensions preserve original artwork proportions.
 */
export default function ArtGallery({ article }: { article: Article }) {
  const [open, setOpen] = useState<number | null>(null)
  const reduce = useReducedMotion()
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  const slides = article.slides ?? []
  const isOpen = open !== null
  const titleId = `art-gallery-title-${article.id}`
  const descriptionId = `art-gallery-description-${article.id}`

  // Lock background scrolling only for the modal's open/close transition, not
  // while changing plates. Restore both the previous lock state and trigger focus.
  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    const appRoot = document.getElementById('root')
    const previousInert = appRoot?.inert ?? false
    const active = document.activeElement
    triggerRef.current = active instanceof HTMLElement ? active : null
    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus())
    document.body.style.overflow = 'hidden'
    if (appRoot) appRoot.inert = true

    return () => {
      window.cancelAnimationFrame(focusFrame)
      document.body.style.overflow = previousOverflow
      if (appRoot) appRoot.inert = previousInert
      const trigger = triggerRef.current
      if (trigger?.isConnected) {
        window.requestAnimationFrame(() => trigger.focus({ preventScroll: true }))
      }
    }
  }, [isOpen])

  // Escape closes the modal; arrows move through the original slide sequence;
  // Tab and Shift+Tab remain inside the modal while it is open.
  useEffect(() => {
    if (open === null) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(null)
        return
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        setOpen((value) => (value === null ? value : (value + 1) % slides.length))
        return
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        setOpen((value) => (value === null ? value : (value - 1 + slides.length) % slides.length))
        return
      }
      if (event.key !== 'Tab') return

      const dialog = dialogRef.current
      if (!dialog) return
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE))
        .filter((element) => element.getClientRects().length > 0)
      if (focusable.length === 0) {
        event.preventDefault()
        dialog.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const current = document.activeElement
      if (!dialog.contains(current)) {
        event.preventDefault()
        ;(event.shiftKey ? last : first).focus()
      } else if (event.shiftKey && (current === first || current === dialog)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && current === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, slides.length])

  return (
    <>
      {/* the viewing room — plates on the wall */}
      <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 ${slides.length > 2 ? 'lg:grid-cols-3' : ''}`}>
        {slides.map((src, i) => {
          const dimensions = article.slideDimensions?.[i]
          const alt = article.slideAlts?.[i] ?? `${article.title} — plate ${i + 1}`
          return (
            <motion.button
              key={src + i}
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`View plate ${i + 1} of ${slides.length}: ${alt}`}
              initial={reduce ? false : { opacity: 0, y: 26 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -8% 0px' }}
              transition={{ duration: reduce ? 0 : 0.9, ease: [0.16, 1, 0.3, 1], delay: reduce ? 0 : Math.min(i * 0.07, 0.3) }}
              className="group relative block w-full cursor-zoom-in overflow-hidden border border-white/10 bg-transparent p-0 text-left transition-colors duration-700 hover:border-gold/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
              <div
                className={`img-frame relative overflow-hidden ${dimensions ? '' : 'aspect-[4/5]'}`}
                style={dimensions ? { aspectRatio: `${dimensions.width} / ${dimensions.height}` } : undefined}
              >
                <img
                  src={src}
                  alt={alt}
                  width={dimensions?.width}
                  height={dimensions?.height}
                  loading="lazy"
                  decoding="async"
                  onError={(event) => handleImgError(event, article.title, folioNoOf(article.id))}
                  className={`h-full w-full ${dimensions ? 'object-contain' : 'object-cover'} ${reduce ? '' : 'transition-transform duration-[1600ms] ease-out group-hover:scale-[1.06]'}`}
                />
                <span aria-hidden="true" className="absolute inset-3 border border-gold/30 transition-colors duration-500 group-hover:border-gold/60" />
                <span aria-hidden="true" className="absolute bottom-3 right-3 bg-[#1C0509]/70 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.30em] text-ivory">
                  {String(i + 1).padStart(2, '0')} / {slides.length}
                </span>
              </div>
            </motion.button>
          )
        })}
      </div>
      <p className="mt-6 font-mono text-[9px] uppercase tracking-[0.30em] text-white/55">
        The work as presented — select a plate to view it closely
      </p>

      {/* accessible modal lightbox */}
      {createPortal(<AnimatePresence>
        {open !== null && slides[open] && (
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            tabIndex={-1}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.5 }}
            className="fixed inset-0 z-[1400] flex items-center justify-center bg-[#14040A]/95 p-4 md:p-10"
            onClick={(event) => {
              if (event.target === event.currentTarget) setOpen(null)
            }}
          >
            <h2 id={titleId} className="sr-only">
              {article.title} — plate {open + 1} of {slides.length}
            </h2>
            <p id={descriptionId} className="sr-only">
              Use the left and right arrow keys to browse the plates. Press Escape to close this artwork view.
            </p>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setOpen(null)}
              aria-label="Close the gallery"
              className="absolute right-4 top-4 grid h-12 w-12 place-items-center border border-gold/50 font-serif text-xl text-gold transition-colors hover:bg-gold hover:text-charcoal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ivory md:right-6 md:top-6"
            >
              ✕
            </button>
            <motion.figure
              key={open}
              initial={reduce ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: reduce ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="max-h-[84vh] w-full max-w-[640px]"
            >
              <img
                src={slides[open]}
                alt={article.slideAlts?.[open] ?? `${article.title} — plate ${open + 1}`}
                width={article.slideDimensions?.[open]?.width}
                height={article.slideDimensions?.[open]?.height}
                decoding="async"
                onError={(event) => handleImgError(event, article.title, folioNoOf(article.id))}
                className="mx-auto max-h-[70vh] max-w-full border border-gold/40 object-contain"
              />
              <figcaption className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                <span className="font-mono text-[9px] uppercase tracking-[0.30em] text-white/55">
                  {String(open + 1).padStart(2, '0')} / {slides.length}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.30em] text-gold">✦ the work</span>
              </figcaption>
            </motion.figure>
            {slides.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setOpen((value) => value === null ? value : (value - 1 + slides.length) % slides.length)}
                  aria-label="Previous plate"
                  className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center border border-gold/40 font-serif text-xl text-ivory transition-colors hover:bg-gold hover:text-charcoal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ivory md:left-6"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => setOpen((value) => value === null ? value : (value + 1) % slides.length)}
                  aria-label="Next plate"
                  className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center border border-gold/40 font-serif text-xl text-ivory transition-colors hover:bg-gold hover:text-charcoal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ivory md:right-6"
                >
                  →
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>, document.body)}
    </>
  )
}
