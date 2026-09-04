import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { Article } from '../../data/content'

/**
 * THE GALLERY — for publications that are artworks. The slides become a
 * hushed viewing room: a grid of plates, and a lightbox that opens with a
 * slow settle. Click, look, move on — like walking a small exhibition.
 */
export default function ArtGallery({ article }: { article: Article }) {
  const [open, setOpen] = useState<number | null>(null)
  const reduce = useReducedMotion()

  const slides = article.slides ?? []

  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
      if (e.key === 'ArrowRight') setOpen((v) => (v === null ? v : (v + 1) % slides.length))
      if (e.key === 'ArrowLeft') setOpen((v) => (v === null ? v : (v - 1 + slides.length) % slides.length))
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = open === null ? '' : 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, slides.length])

  return (
    <>
      {/* the viewing room — plates on the wall */}
      <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 ${slides.length > 2 ? 'lg:grid-cols-3' : ''}`}>
        {slides.map((src, i) => (
          <motion.button
            key={src + i}
            type="button"
            onClick={() => setOpen(i)}
            aria-label={`View plate ${i + 1} of ${slides.length}`}
            initial={reduce ? false : { opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -8% 0px' }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: Math.min(i * 0.07, 0.3) }}
            className="group relative block w-full cursor-zoom-in overflow-hidden border border-white/10 bg-transparent p-0 text-left transition-colors duration-700 hover:border-gold/50"
          >
            <div className="img-frame relative aspect-[4/5] overflow-hidden">
              <img
                src={src}
                alt={`${article.title} — plate ${i + 1}`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-[1.06]"
              />
              <span aria-hidden="true" className="absolute inset-3 border border-gold/30 transition-colors duration-500 group-hover:border-gold/60" />
              <span
                aria-hidden="true"
                className="absolute bottom-3 right-3 bg-[#1C0509]/70 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.30em] text-ivory "
              >
                {String(i + 1).padStart(2, '0')} / {slides.length}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
      <p className="mt-6 font-mono text-[9px] uppercase tracking-[0.30em] text-white/55">
        The work as presented — select a plate to view it closely
      </p>

      {/* the lightbox */}
      <AnimatePresence>
        {open !== null && slides[open] && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${article.title} — plate ${open + 1}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[1400] flex items-center justify-center bg-[#14040A]/95 p-4  md:p-10"
            onClick={() => setOpen(null)}
          >
            <button
              type="button"
              onClick={() => setOpen(null)}
              aria-label="Close the gallery"
              className="absolute right-6 top-6 grid h-12 w-12 place-items-center border border-gold/50 font-serif text-xl text-gold transition-colors hover:bg-gold hover:text-charcoal"
            >
              ✕
            </button>
            <motion.figure
              key={open}
              initial={reduce ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="max-h-[88vh] max-w-[640px]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={slides[open]}
                alt={`${article.title} — plate ${open + 1}`}
                className="max-h-[76vh] w-auto border border-gold/40 object-contain"
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
                  onClick={(e) => { e.stopPropagation(); setOpen((open - 1 + slides.length) % slides.length) }}
                  aria-label="Previous plate"
                  className="absolute left-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center border border-gold/40 font-serif text-xl text-ivory transition-colors hover:bg-gold hover:text-charcoal"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setOpen((open + 1) % slides.length) }}
                  aria-label="Next plate"
                  className="absolute right-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center border border-gold/40 font-serif text-xl text-ivory transition-colors hover:bg-gold hover:text-charcoal"
                >
                  →
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
