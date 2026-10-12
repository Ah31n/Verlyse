import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { folioNoOf, type Article, getAuthor } from '../../data/content'
import { handleImgError } from '../../lib/imgFallback'
import { spotlitGlide } from '../../lib/stringTune/attrs'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'
import Reveal from './Reveal'

/**
 * Gallery viewing room — for art posts and carousel-led visual features.
 * Each slide is hung as a museum plate with a subtle gold frame, plate number,
 * optional subject metadata, and a fullscreen lightbox for close viewing.
 */
export default function ArtGallery({ article }: { article: Article }) {
  const slides = article.slides ?? []
  const descriptions = article.slideDescriptions ?? []
  const author = getAuthor(article.authorId)
  const folio = folioNoOf(article.id)
  const [open, setOpen] = useState<number | null>(null)
  const openerRef = useRef<HTMLButtonElement | null>(null)
  const closeBtnRef = useRef<HTMLButtonElement | null>(null)
  useBodyScrollLock(open !== null)

  useEffect(() => {
    if (open !== null) {
      const t = window.setTimeout(() => closeBtnRef.current?.focus(), 30)
      return () => window.clearTimeout(t)
    } else if (openerRef.current) {
      const target = openerRef.current
      openerRef.current = null
      const t = window.setTimeout(() => target.focus(), 0)
      return () => window.clearTimeout(t)
    }
  }, [open])

  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
      if (e.key === 'ArrowRight') setOpen((i) => (i === null ? 0 : (i + 1) % slides.length))
      if (e.key === 'ArrowLeft') setOpen((i) => (i === null ? 0 : (i - 1 + slides.length) % slides.length))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, slides.length])

  if (slides.length === 0) return null

  const activeDesc = open !== null ? descriptions[open] : undefined

  return (
    <section
      aria-label={`${article.title} — plate sequence`}
      className="mx-auto max-w-page px-[clamp(1.5rem,5vw,4.5rem)] py-12 lg:pr-[calc(clamp(1.75rem,5.5vw,4.75rem)+256px)]"
    >
      <Reveal>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <p className="eyebrow text-gold">
              {article.editorialFormat === 'carousel-feature'
                ? 'Carousel-led visual feature · Plate sequence'
                : 'Exhibition · click any plate to view closely'}
            </p>
            <h2 className="mt-2 font-serif text-h3 font-light italic text-ivory">
              {slides.length === 1 ? 'The plate' : `The ${slides.length} plates`}
              {author ? ` — ${author.name}` : ''}
            </h2>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/60">
            {slides.length} {slides.length === 1 ? 'plate' : 'plates'} · use ← → in lightbox
          </span>
        </div>
      </Reveal>

      <div
        className={`grid gap-8 ${
          slides.length === 1
            ? 'mx-auto max-w-[680px]'
            : slides.length === 2
              ? 'md:grid-cols-2'
              : 'md:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        {slides.map((src, i) => {
          const desc = descriptions[i]
          const plateNum = String(i + 1).padStart(2, '0')
          const totalNum = String(slides.length).padStart(2, '0')
          return (
            <Reveal key={`${src}-${i}`} delay={i * 0.06}>
              <figure className="group flex h-full flex-col">
                <button
                  type="button"
                  onClick={(e) => {
                    openerRef.current = e.currentTarget
                    setOpen(i)
                  }}
                  aria-label={
                    desc
                      ? `Inspect Plate ${plateNum} of ${totalNum}: ${desc.subject}`
                      : `View plate ${i + 1} of ${slides.length} of ${article.title}`
                  }
                  {...spotlitGlide('restrained')}
                  className="st-spotlit relative block w-full overflow-hidden border border-gold/30 bg-wine-deep/60 p-3 text-left transition-all duration-700 hover:border-gold hover:shadow-[0_24px_70px_-20px_rgba(0,0,0,0.8)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
                >
                  <div className="img-frame aspect-[4/5] overflow-hidden bg-charcoal">
                    <img
                      src={src}
                      alt={
                        desc
                          ? `${article.title} — Plate ${plateNum}: ${desc.subject}`
                          : `${article.title} — plate ${i + 1} of ${slides.length}`
                      }
                      loading="lazy"
                      decoding="async"
                      onError={(e) => handleImgError(e, `${article.title} — Plate ${plateNum}`, `${folio} · ${plateNum}`)}
                      className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.03]"
                    />
                  </div>
                </button>
                <figcaption className="mt-3 flex flex-col gap-1.5 px-1">
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-white/65">
                    <span>
                      Plate {plateNum} / {totalNum}
                      {desc ? ` · ${desc.subject}` : ''}
                    </span>
                    <span className="text-gold transition-transform duration-300 group-hover:translate-x-0.5">
                      ✦ Inspect
                    </span>
                  </div>
                  {desc && (
                    <>
                      <p className="font-serif text-[15px] italic leading-[1.55] text-ivory/80">
                        {desc.note}
                      </p>
                      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/50">
                        {desc.assetPath}
                        {desc.status === 'pending-source-binary' ? ' · pending source binary' : ''}
                      </p>
                    </>
                  )}
                </figcaption>
              </figure>
            </Reveal>
          )
        })}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {open !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            role="dialog"
            aria-modal="true"
            aria-label={`${article.title} — plate ${open + 1} of ${slides.length}`}
            onClick={() => setOpen(null)}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-charcoal/95 p-4 backdrop-blur-md md:p-10"
          >
            <button
              ref={closeBtnRef}
              type="button"
              onClick={() => setOpen(null)}
              aria-label="Close lightbox"
              className="fixed right-6 top-6 z-10 border border-white/25 bg-charcoal/80 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ivory transition-colors hover:border-gold hover:text-gold"
            >
              Close · Esc
            </button>

            {slides.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setOpen((open - 1 + slides.length) % slides.length)
                  }}
                  aria-label="Previous plate"
                  className="fixed left-4 top-1/2 z-10 -translate-y-1/2 border border-white/25 bg-charcoal/80 px-4 py-3 font-mono text-xs text-ivory transition-colors hover:border-gold hover:text-gold md:left-8"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setOpen((open + 1) % slides.length)
                  }}
                  aria-label="Next plate"
                  className="fixed right-4 top-1/2 z-10 -translate-y-1/2 border border-white/25 bg-charcoal/80 px-4 py-3 font-mono text-xs text-ivory transition-colors hover:border-gold hover:text-gold md:right-8"
                >
                  →
                </button>
              </>
            )}

            <motion.figure
              key={open}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="flex max-h-[90vh] max-w-[90vw] flex-col items-center"
            >
              <img
                src={slides[open]}
                alt={
                  activeDesc
                    ? `${article.title} — Plate ${activeDesc.plate}: ${activeDesc.subject}`
                    : `${article.title} — plate ${open + 1}`
                }
                decoding="async"
                onError={(e) =>
                  handleImgError(e, `${article.title} — Plate ${String(open + 1).padStart(2, '0')}`, folio)
                }
                className="max-h-[78vh] w-auto border border-gold/40 object-contain shadow-[0_30px_90px_rgba(0,0,0,0.9)]"
              />
              <figcaption className="mt-4 text-center">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-gold">
                  {article.title} · Plate {String(open + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
                  {activeDesc ? ` — ${activeDesc.subject}` : ''}
                </p>
                {activeDesc && (
                  <p className="mt-1.5 max-w-[54ch] font-serif text-sm italic text-ivory/80">
                    {activeDesc.note}
                  </p>
                )}
              </figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
