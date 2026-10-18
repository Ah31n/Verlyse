import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { folioNoOf, type Article, getAuthor } from '../../data/content'
import { trapFocus } from '../../lib/focus'
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
  const reduced = useReducedMotion() === true
  const [open, setOpen] = useState<number | null>(null)
  const [failedSlides, setFailedSlides] = useState<Record<number, boolean>>({})
  const openerRef = useRef<HTMLButtonElement | null>(null)
  const closeBtnRef = useRef<HTMLButtonElement | null>(null)
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const galleryContentRef = useRef<HTMLDivElement | null>(null)
  useBodyScrollLock(open !== null)

  useEffect(() => {
    setOpen(null)
  }, [article.id])

  useEffect(() => {
    if (open === null) return undefined
    const rootEl = document.getElementById('root')
    const bgNodes = rootEl
      ? [rootEl]
      : [
          ...(galleryContentRef.current ? [galleryContentRef.current] : []),
          ...Array.from(
            document.querySelectorAll<HTMLElement>(
              'header, footer, nav[aria-label="Primary mobile"], main a, main button',
            ),
          ).filter((el) => !dialogRef.current?.contains(el)),
        ]
    bgNodes.forEach((el) => {
      el.setAttribute('inert', '')
      el.setAttribute('aria-hidden', 'true')
    })
    return () => {
      bgNodes.forEach((el) => {
        el.removeAttribute('inert')
        el.removeAttribute('aria-hidden')
      })
    }
  }, [open])

  useEffect(() => {
    if (open === null || !dialogRef.current) return undefined
    return trapFocus(dialogRef.current)
  }, [open])

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
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(null)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        setOpen((i) => (i === null ? 0 : (i + 1) % slides.length))
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setOpen((i) => (i === null ? 0 : (i - 1 + slides.length) % slides.length))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, slides.length])

  if (slides.length === 0) return null

  const activeDesc = open !== null ? descriptions[open] : undefined

  return (
    <section
      aria-label={`${article.title} — plate sequence`}
      className="mx-auto max-w-page px-[clamp(1.75rem,5.5vw,4.75rem)] py-12"
    >
      <div ref={galleryContentRef} aria-hidden={open !== null ? 'true' : undefined}>
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
            {article.credit && (
              <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.26em] text-gold/85">
                {article.credit}
              </p>
            )}
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/60">
            {slides.length} {slides.length === 1 ? 'plate' : 'plates'} · use ← → in lightbox
          </span>
        </div>
        {descriptions.some((d) => d.status === 'pending-source-binary') && (
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border border-gold/30 bg-[#1B060D]/80 px-4 py-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-gold">
              Archival Specimen Edition · Folio № {folio}
            </p>
            <p className="font-serif text-sm italic text-ivory/75">
              All {slides.length} carousel plates are catalogued from the source publication and rendered as typographic archival plates while original slide binaries await attachment.
            </p>
          </div>
        )}
      </Reveal>

      <div
        className={`grid gap-8 ${
          slides.length === 1
            ? 'mx-auto max-w-[680px]'
            : slides.length === 2 || slides.length === 4
              ? 'grid-cols-1 sm:grid-cols-2'
              : slides.length === 5
                ? 'grid-cols-1 sm:grid-cols-6'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        {slides.map((src, i) => {
          const desc = descriptions[i]
          const plateNum = String(i + 1).padStart(2, '0')
          const totalNum = String(slides.length).padStart(2, '0')
          const spanCls =
            slides.length === 5
              ? i < 3
                ? 'sm:col-span-3 lg:col-span-2'
                : i === 3
                  ? 'sm:col-span-3 lg:col-span-3'
                  : 'sm:col-span-6 lg:col-span-3'
              : slides.length % 2 === 1 && slides.length !== 5 && i === slides.length - 1
                ? 'sm:col-span-2 lg:col-span-1'
                : ''
          return (
            <Reveal key={`${src}-${i}`} delay={i * 0.06} className={spanCls}>
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
                  className="st-spotlit relative block w-full overflow-hidden border border-gold/30 bg-wine-deep/60 p-3 text-left transition-[border-color,box-shadow] duration-700 hover:border-gold hover:shadow-[0_24px_70px_-20px_rgba(0,0,0,0.8)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold motion-reduce:transition-none"
                >
                  <div
                    className={`img-frame overflow-hidden bg-charcoal ${desc?.width && desc?.height ? '' : 'aspect-[4/5]'}`}
                    style={desc?.width && desc?.height ? { aspectRatio: `${desc.width} / ${desc.height}` } : undefined}
                  >
                    <img
                      src={src}
                      alt={
                        desc?.alt
                          ? desc.alt
                          : desc
                            ? `${article.title} — Plate ${plateNum}: ${desc.subject}`
                            : `${article.title} — plate ${i + 1} of ${slides.length}`
                      }
                      width={desc?.width}
                      height={desc?.height}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        setFailedSlides((prev) => ({ ...prev, [i]: true }))
                        handleImgError(e, `${article.title} — Plate ${plateNum}`, `${folio} · ${plateNum}`)
                      }}
                      className={`h-full w-full ${desc?.width && desc?.height ? 'object-contain' : 'object-cover'} transition-transform duration-[1400ms] ease-out group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100`}
                    />
                  </div>
                </button>
                <figcaption className="mt-3 flex flex-col gap-1.5 px-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.22em] text-white/65">
                    <span>
                      Plate {plateNum} / {totalNum}
                      {desc ? ` · ${desc.subject}` : ''}
                    </span>
                    <span className="shrink-0 text-gold transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none">
                      ✦ Inspect
                    </span>
                  </div>
                  {desc && (
                    <p className="font-serif text-[15px] italic leading-[1.55] text-ivory/80">
                      {desc.note}
                    </p>
                  )}
                </figcaption>
              </figure>
            </Reveal>
          )
        })}
      </div>
      </div>

      {/* Lightbox */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {open !== null && (
              <motion.div
                ref={dialogRef}
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduced ? undefined : { opacity: 0 }}
                transition={{ duration: reduced ? 0 : 0.3 }}
                role="dialog"
                aria-modal="true"
                aria-label={`${article.title} — plate ${open + 1} of ${slides.length}`}
                onClick={() => setOpen(null)}
                className="fixed inset-0 z-[1250] flex flex-col items-center justify-between overflow-y-auto bg-charcoal/95 px-[max(1rem,env(safe-area-inset-left))] pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-md md:justify-center md:p-10"
              >
                {/* Top bar on mobile / fixed corner button on desktop */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex w-full shrink-0 items-center justify-between gap-3 md:contents"
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold md:hidden">
                    Plate {String(open + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
                  </span>
                  <button
                    ref={closeBtnRef}
                    type="button"
                    onClick={() => setOpen(null)}
                    aria-label="Close lightbox"
                    className="border border-white/25 bg-charcoal/85 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-ivory transition-colors hover:border-gold hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold md:fixed md:right-6 md:top-6 md:z-10"
                  >
                    Close · Esc
                  </button>
                </div>

                <motion.figure
                  key={open}
                  initial={reduced ? false : { opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduced ? undefined : { opacity: 0, scale: 0.96 }}
                  transition={{ duration: reduced ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
                  onClick={(e) => e.stopPropagation()}
                  className="my-auto flex max-h-[82vh] w-full max-w-[92vw] flex-col items-center py-3 md:max-h-[90vh] md:max-w-[82vw] md:py-0"
                >
                  <img
                    src={slides[open]}
                    alt={
                      activeDesc?.alt
                        ? activeDesc.alt
                        : activeDesc
                          ? `${article.title} — Plate ${activeDesc.plate}: ${activeDesc.subject}`
                          : `${article.title} — plate ${open + 1}`
                    }
                    width={activeDesc?.width}
                    height={activeDesc?.height}
                    decoding="async"
                    onError={(e) => {
                      setFailedSlides((prev) => ({ ...prev, [open]: true }))
                      handleImgError(e, `${article.title} — Plate ${String(open + 1).padStart(2, '0')}`, folio)
                    }}
                    className="max-h-[60vh] w-auto max-w-full border border-gold/40 object-contain shadow-[0_30px_90px_rgba(0,0,0,0.9)] md:max-h-[76vh]"
                  />
                  <figcaption className="mt-4 px-2 text-center">
                    <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-gold">
                      {article.title} · Plate {String(open + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
                      {activeDesc ? ` — ${activeDesc.subject}` : ''}
                    </p>
                    {activeDesc && (
                      <p className="mt-1.5 max-w-[54ch] font-serif text-sm italic text-ivory/80">
                        {activeDesc.note}
                      </p>
                    )}
                    {failedSlides[open] && (
                      <p role="status" className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-white/60">
                        Displaying archival typographic plate
                      </p>
                    )}
                  </figcaption>
                </motion.figure>

                {slides.length > 1 && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex w-full shrink-0 items-center justify-between gap-4 pt-2 md:contents"
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setOpen((open - 1 + slides.length) % slides.length)
                      }}
                      aria-label="Previous plate"
                      className="border border-white/25 bg-charcoal/85 px-4 py-3 font-mono text-xs text-ivory transition-colors hover:border-gold hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold md:fixed md:left-8 md:top-1/2 md:z-10 md:-translate-y-1/2"
                    >
                      <span aria-hidden="true">←</span>
                      <span className="ml-2 text-[10px] uppercase tracking-[0.2em] md:sr-only">Prev</span>
                    </button>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60 md:hidden">
                      {open + 1} of {slides.length}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setOpen((open + 1) % slides.length)
                      }}
                      aria-label="Next plate"
                      className="border border-white/25 bg-charcoal/85 px-4 py-3 font-mono text-xs text-ivory transition-colors hover:border-gold hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold md:fixed md:right-8 md:top-1/2 md:z-10 md:-translate-y-1/2"
                    >
                      <span className="mr-2 text-[10px] uppercase tracking-[0.2em] md:sr-only">Next</span>
                      <span aria-hidden="true">→</span>
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </section>
  )
}
