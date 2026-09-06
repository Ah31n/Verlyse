import { Link, useParams } from 'react-router-dom'
import { useEffect, useState, lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useArticleSeo } from '../hooks/useSeo'
import Reveal from '../components/ui/Reveal'
import SplitText from '../components/ui/SplitText'
import { MetaRow } from '../components/ui/primitives'
import ShareButtons from '../components/ui/ShareButtons'
import { getArticle, getAuthor, relatedArticles, type Vibe , AUTHORS , authorPhoto } from '../data/content'
import { AuthorPhoto } from '../components/ui/AuthorFrame'
import { ArticleEnding, MotifDivider, Signature, WritersNoteClosing } from '../components/ui/ArticleClosing'
import { MARGINALIA } from '../components/ui/Motifs'
import VibeAmbient from '../components/ui/VibeAmbient'
import { WorldTexture, worldBodyClass } from '../components/ui/ArticleWorld'
import { ReflectionLine } from '../components/ui/ScrollBeat'
import { InkSpread, EditorialWipe } from '../components/ui/MotionMoves'
import ArticleSignature from '../components/ui/ArticleSignature'
// The story-ending spatial atmosphere is loaded on demand (three is heavy).
const StoryEnding3D = lazy(() => import('../components/spatial/StoryEnding3D'))
import { isSaved, toggleSaved } from '../components/layout/SavedDrawer'
import { useReadingMode } from '../components/ui/ReadingMode'

/* ------------------------------------------------------------------ */
/* Every feature carries its own temperament — motion and finish      */
/* follow the writing, inside the house palette of wine, ivory, gold. */
/* ------------------------------------------------------------------ */
const EASE = [0.22, 1, 0.36, 1] as const

interface VibeSpec {
  overlay: string
  titleClass: string
  glyph: string
  reveal: 'fade' | 'blur' | 'drift' | 'rise' | 'crisp' | 'slow' | 'urgent'
  figMotion: string
  figFrame: string
  bodyClass: string
}

const VIBES: Record<Vibe, VibeSpec> = {
  horror: {
    overlay: 'bg-[linear-gradient(180deg,rgba(10,2,6,0.78),rgba(10,2,6,0.45)_38%,rgba(8,2,5,0.96))]',
    titleClass: '',
    glyph: '✕',
    reveal: 'urgent',
    figMotion: '',
    figFrame: 'border-white/10',
    bodyClass: 'bg-[#1F060E]'
  },
  vintage: {
    overlay: 'bg-[linear-gradient(180deg,rgba(30,10,8,0.66),rgba(40,18,10,0.35)_40%,rgba(24,8,8,0.94))]',
    titleClass: '',
    glyph: '✦',
    reveal: 'slow',
    figMotion: '',
    figFrame: 'border-gold/30',
    bodyClass: 'bg-[linear-gradient(180deg,rgba(92,18,36,0.35),transparent_45%)]'
  },
  solemn: {
    overlay: 'bg-[linear-gradient(180deg,rgba(20,5,10,0.55),rgba(20,5,10,0.25)_40%,rgba(18,4,9,0.92))]',
    titleClass: '',
    glyph: '✦',
    reveal: 'fade',
    figMotion: '',
    figFrame: 'border-white/10',
    bodyClass: ''
  },
  academic: {
    overlay: 'bg-[linear-gradient(180deg,rgba(16,4,9,0.72),rgba(16,4,9,0.4)_40%,rgba(14,3,8,0.94))]',
    titleClass: '',
    glyph: '❖',
    reveal: 'fade',
    figMotion: '',
    figFrame: 'border-white/10',
    bodyClass: 'bg-[linear-gradient(180deg,rgba(92,18,36,0.22),transparent_35%)]'
  },
  dreamy: {
    overlay: 'bg-[linear-gradient(180deg,rgba(20,5,10,0.5),rgba(26,8,14,0.28)_42%,rgba(18,4,9,0.9))]',
    titleClass: '',
    glyph: '✧',
    reveal: 'blur',
    figMotion: '',
    figFrame: 'border-gold/25',
    bodyClass: 'bg-[radial-gradient(75%_45%_at_50%_0%,rgba(184,145,70,0.07),transparent_62%)]'
  },
  gallery: {
    overlay: 'bg-[linear-gradient(180deg,rgba(12,3,7,0.62),rgba(12,3,7,0.3)_40%,rgba(10,3,6,0.92))]',
    titleClass: '',
    glyph: '✦',
    reveal: 'fade',
    figMotion: '',
    figFrame: 'border-gold/40',
    bodyClass: 'bg-[linear-gradient(180deg,rgba(10,3,6,0.5),transparent_35%)]'
  },
  serene: {
    overlay: 'bg-[linear-gradient(180deg,rgba(14,4,8,0.6),rgba(14,4,8,0.28)_40%,rgba(12,3,7,0.92))]',
    titleClass: '',
    glyph: '❖',
    reveal: 'slow',
    figMotion: '',
    figFrame: 'border-gold/30',
    bodyClass: 'bg-[radial-gradient(65%_45%_at_50%_0%,rgba(184,145,70,0.055),transparent_65%)]'
  },
  mechanical: {
    overlay: 'bg-[linear-gradient(180deg,rgba(16,4,9,0.75),rgba(16,4,9,0.42)_40%,rgba(14,3,8,0.95))]',
    titleClass: '',
    glyph: '✦',
    reveal: 'crisp',
    figMotion: '',
    figFrame: 'border-white/10',
    bodyClass: 'bg-[linear-gradient(180deg,rgba(16,4,9,0.4),transparent_30%)]'
  },
  letter: {
    overlay: 'bg-[linear-gradient(180deg,rgba(20,5,10,0.58),rgba(20,5,10,0.3)_40%,rgba(18,4,9,0.92))]',
    titleClass: '',
    glyph: '✦',
    reveal: 'rise',
    figMotion: '',
    figFrame: 'border-white/10',
    bodyClass: 'bg-[linear-gradient(180deg,rgba(248,246,242,0.03),transparent_20%)]'
  },
  playful: {
    overlay: 'bg-[linear-gradient(180deg,rgba(16,5,9,0.5),rgba(16,5,9,0.25)_40%,rgba(14,4,8,0.9))]',
    titleClass: '',
    glyph: '✤',
    reveal: 'fade',
    figMotion: '',
    figFrame: 'border-gold/40',
    bodyClass: 'bg-[radial-gradient(65%_45%_at_50%_0%,rgba(184,145,70,0.07),transparent_62%)]'
  },
  airy: {
    overlay: 'bg-[linear-gradient(180deg,rgba(20,5,10,0.48),rgba(24,8,13,0.26)_42%,rgba(18,4,9,0.9))]',
    titleClass: '',
    glyph: '✧',
    reveal: 'drift',
    figMotion: '',
    figFrame: 'border-white/10',
    bodyClass: 'bg-[radial-gradient(75%_45%_at_50%_0%,rgba(184,145,70,0.05),transparent_60%)]'
  },
  urgent: {
    overlay: 'bg-[linear-gradient(180deg,rgba(12,3,7,0.82),rgba(12,3,7,0.5)_40%,rgba(10,2,6,0.96))]',
    titleClass: '',
    glyph: '✦',
    reveal: 'urgent',
    figMotion: '',
    figFrame: 'border-white/10',
    bodyClass: 'bg-[#210610]'
  },
  warm: {
    overlay: 'bg-[linear-gradient(180deg,rgba(30,10,8,0.6),rgba(44,18,10,0.3)_40%,rgba(26,8,8,0.92))]',
    titleClass: '',
    glyph: '✦',
    reveal: 'fade',
    figMotion: '',
    figFrame: 'border-gold/30',
    bodyClass: 'bg-[radial-gradient(85%_50%_at_50%_0%,rgba(184,145,70,0.09),transparent_62%)]'
  },
  newsprint: {
    overlay: 'bg-[linear-gradient(180deg,rgba(12,3,7,0.68),rgba(12,3,7,0.35)_40%,rgba(10,3,6,0.93))]',
    titleClass: '',
    glyph: '✦',
    reveal: 'fade',
    figMotion: '',
    figFrame: 'border-white/15',
    bodyClass: 'bg-[linear-gradient(180deg,rgba(28,28,28,0.5),transparent_35%)]'
  },
}

const REVEAL_VARIANTS: Record<VibeSpec['reveal'], { initial: Record<string, number | string>; animate: Record<string, number | string>; duration: number; delay?: number }> = {
  fade: { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, duration: 0.9 },
  blur: { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, duration: 1.1 },
  drift: { initial: { opacity: 0, y: 38 }, animate: { opacity: 1, y: 0 }, duration: 1.2 },
  rise: { initial: { opacity: 0, y: 18, x: -6 }, animate: { opacity: 1, y: 0, x: 0 }, duration: 0.95 },
  crisp: { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, duration: 0.6 },
  slow: { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, duration: 1.15 },
  urgent: { initial: { opacity: 0, y: 26 }, animate: { opacity: 1, y: 0 }, duration: 0.7 },
}

function BookmarkBtn({ id, title, category, author }: { id: string; title: string; category: string; author?: string }) {
  const [on, setOn] = useState(false)
  useEffect(() => { setOn(isSaved(id)) }, [id])
  return (
    <button
      type="button"
      onClick={() => { const now = toggleSaved({ id, title, category, author }); setOn(now) }}
      aria-pressed={on}
      aria-label={on ? `Remove ${title} from saved` : `Save ${title}`}
      className={`inline-flex items-center gap-2 border-y px-4 py-2 font-mono text-[10px] uppercase tracking-[0.28em] transition-colors max-[767px]:py-3 ${on ? 'border-gold bg-gold text-charcoal' : 'border-gold/45 text-ivory/80 hover:text-gold'}`}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5 fill-none stroke-current [stroke-width:1.5]"><path d="M6 3.5h12v17L12 16.8 6 20.5z" /></svg>
      {on ? 'Saved' : 'Save'}
    </button>
  )
}


/** A second creator credited in the caption (e.g. “Poem written by @mochjixx”).
    Rendered with the house quiet: a hairline, small caps, and a linked handle. */
function CreditLine({ credit }: { credit: string }) {
  const parts = credit.split(/@([a-zA-Z0-9_.]+)/)
  return (
    <p className="mt-5 border-t border-white/10 pt-4 font-mono text-[9px] uppercase tracking-[0.30em] leading-[2] text-white/55">
      {parts.map((part, i) => {
        if (i % 2 === 1) {
          const au = AUTHORS.find((a) => a.handle.toLowerCase() === `@${part.toLowerCase()}`)
          return au ? (
            <Link key={i} to={`/creator/${au.id}`} className="text-gold no-underline transition-colors hover:text-ivory">
              @{part}
            </Link>
          ) : (
            <span key={i} className="text-gold">@{part}</span>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </p>
  )
}

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>()
  const { on: reading, toggle: toggleReading, off: offReading } = useReadingMode()

  useEffect(() => {
    if (!reading) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') offReading()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [reading, offReading])
  const article = id ? getArticle(id) : undefined

  useArticleSeo(
    article
      ? {
          title: article.title,
          excerpt: article.excerpt,
          date: article.date,
          readingTime: article.readingTime,
          category: article.category,
          author: getAuthor(article.authorId)?.name ?? '',
          tags: article.tags,
          cover: article.cover,
        }
      : { title: 'Not found', excerpt: '', date: '', readingTime: '', category: '', author: '', tags: [], cover: '/img/poster-3-13-1.webp' },
  )

  if (!article) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center px-6 text-center">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-gold">The archive — misplaced</p>
          <h1 className="display mt-6 text-[clamp(2.4rem,5vw,4rem)]">This feature isn’t on the shelf</h1>
          <p className="mx-auto mt-5 max-w-[40ch] font-serif text-lg font-light italic leading-[1.7] text-white/65">
            It may have been misfiled, or the address was written down wrong. The archive keeps everything else.
          </p>
          <p className="mt-9 font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">
            <Link to="/articles" className="text-gold no-underline transition-colors hover:text-ivory">Back to the archive →</Link>
          </p>
        </div>
      </section>
    )
  }

  const author = getAuthor(article.authorId)
  const related = relatedArticles(article)
  const vibe = VIBES[article.vibe ?? 'solemn']
  const v = REVEAL_VARIANTS[vibe.reveal]
  const figures = article.figures ?? []
  const isVerse = article.body.length > 1 && article.body.reduce((a, p) => a + p.length, 0) / article.body.length < 135
  /* the golden point — a line from the feature itself, lifted mid-story */
  const pullIndex = Math.floor(article.body.length * 0.55)
  const pull =
    !isVerse && article.body.length > 3 && article.excerpt !== article.body[0]
      ? article.excerpt
      : undefined

  return (
    <>
      {/* the library lamp — enter / leave the quiet reading room */}
      <button
        type="button"
        onClick={toggleReading}
        aria-pressed={reading}
        aria-label={reading ? 'Leave reading mode' : 'Enter reading mode'}
        title={reading ? 'Leave the reading room' : 'The reading room'}
        className={`fixed right-6 top-24 z-[1200] flex items-center gap-2 border px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.30em]  transition-all duration-700 ${
          reading
            ? 'border-gold/60 bg-[#1C0509]/80 text-gold'
            : 'border-white/15 bg-[#1C0509]/40 text-ivory/70 hover:border-gold/50 hover:text-gold'
        }`}
      >
        <span aria-hidden="true" className={`text-sm leading-none ${reading ? 'text-gold' : 'text-ivory/60'}`}>☙</span>
        {reading ? 'The reading room' : 'Read quietly'}
      </button>

      {/* ---------- Hero — framed by the publication's world ---------- */}
      {article.heroMode === 'quiet' ? (
        /* ——— QUIET: the poem as a letterhead — no bleed image, all type ——— */
        <section className="relative flex min-h-[72svh] items-end overflow-hidden border-b border-white/10 bg-wine-deep pt-36">
          <WorldTexture world={article.world} />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(62%_55%_at_50%_6%,rgba(184,145,70,0.05),transparent_74%)]" />
          <div className="relative z-[2] mx-auto w-full max-w-page px-[clamp(1.75rem,5.5vw,4.75rem)] pb-16">
            <Reveal><p className="kicker">Verlyse Media presents — a submission by {author?.name}</p></Reveal>
            <InkSpread className={`${vibe.titleClass} inline-block`} origin="50% 80%">
              <SplitText as="h1" text={`“${article.title}”`} className="mt-6 max-w-[18ch] text-[clamp(3rem,8vw,7.5rem)]" />
            </InkSpread>
            <Reveal delay={0.2} className="mt-8">
              <MetaRow category={article.category} author={author?.name} readingTime={article.readingTime} />
            </Reveal>
            <Reveal delay={0.3}>
              <div className="mt-8 flex max-w-[560px] items-center justify-between border-t border-white/15 pt-4 font-mono text-[9px] uppercase tracking-[0.30em] text-white/55">
                <span>Issue — {article.date.split('-').reverse().join('.')}</span>
                <span className="flex items-center gap-2"><span className="text-gold">✦</span>{article.motif ?? 'a verlyse feature'}</span>
              </div>
            </Reveal>
          </div>
        </section>
      ) : article.heroMode === 'documentary' ? (
        /* ——— DOCUMENTARY: the dispatch — dateline, stronger type, the cover as a
            framed plate (fixed aspect ratio, object-contain — never a stretched
            full-bleed banner, never cropped) ——— */
        <section className="relative flex min-h-[86svh] items-center overflow-hidden border-b border-white/10 bg-wine-deep pt-36">
          <WorldTexture world={article.world} />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(62%_55%_at_50%_6%,rgba(184,145,70,0.05),transparent_74%)]" />
          <div className="relative z-[2] mx-auto flex w-full max-w-page flex-col items-center px-[clamp(1.75rem,5.5vw,4.75rem)] pb-14 text-center">
            <div className="w-full max-w-[820px]">
              <Reveal>
                <p className="mb-6 flex items-center justify-center gap-4 font-mono text-[9px] uppercase tracking-[0.30em] text-gold">
                  <span className="h-px w-10 bg-gold/60" aria-hidden="true" />
                  Dispatch — {article.date.split('-').reverse().join('.')}
                </p>
              </Reveal>
              <Reveal><p className="kicker">Verlyse Media presents — a submission by {author?.name}</p></Reveal>
              <div className={`${vibe.titleClass} inline-block`}>
                <SplitText as="h1" text={`“${article.title}”`} className="mx-auto mt-5 max-w-[20ch] text-[clamp(2.8rem,6.8vw,6.4rem)]" />
              </div>
              <Reveal delay={0.2} className="mt-8 flex justify-center">
                <MetaRow category={article.category} author={author?.name} readingTime={article.readingTime} />
              </Reveal>
              <Reveal delay={0.3}>
                <p className="mx-auto mt-6 max-w-[58ch] font-serif text-lg font-light italic leading-[1.7] text-white/70">{article.excerpt}</p>
              </Reveal>
            </div>
            <Reveal delay={0.25}>
              <figure className="relative mx-auto mt-12 w-full max-w-[640px] max-sm:w-[88%]">
                <div className="img-frame relative overflow-hidden border border-white/15">
                  {/* the cover plate — the frame takes the photograph's own
                      ratio (aspect-[3/4] default), object-contain keeps the
                      entire original visible. On phones it is scaled down so
                      the title and metadata stay the focal point. */}
                  <img
                    src={article.cover}
                    alt=""
                    className="aspect-[4/5] w-full object-contain"
                    loading="lazy"
                  />
                  <span aria-hidden="true" className="absolute inset-2 border border-gold/30" />
                </div>
                <figcaption className="mt-3 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.30em] text-white/50">
                  <span>Plate 01 — the cover</span>
                  <span className="text-gold">✦</span>
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </section>
      ) : article.heroMode === 'gallery' ? (
        /* ——— GALLERY: the artwork itself is the hero — the plate, framed ——— */
        <section className="relative flex min-h-[80svh] items-end overflow-hidden border-b border-white/10 bg-wine-deep pt-36">
          <WorldTexture world={article.world} />
          <div className="relative z-[2] mx-auto w-full max-w-page px-[clamp(1.75rem,5.5vw,4.75rem)] pb-16">
            <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-[1fr_auto]">
              <div>
                <Reveal><p className="kicker">Verlyse Media presents — a submission by {author?.name}</p></Reveal>
                <div className={`${vibe.titleClass} inline-block`}>
                  <SplitText as="h1" text={`“${article.title}”`} className="mt-5 max-w-[18ch] text-[clamp(2.8rem,7vw,6.6rem)]" />
                </div>
                <Reveal delay={0.2} className="mt-7">
                  <MetaRow category={article.category} author={author?.name} readingTime={article.readingTime} />
                </Reveal>
              </div>
              <Reveal delay={0.25}>
                <figure className="relative w-full max-w-[300px]">
                  <div aria-hidden="true" className="absolute -inset-3 translate-x-3 translate-y-3 border border-gold/35" />
                  <div className="img-frame relative overflow-hidden border border-gold/25">
                    <img src={article.cover} alt="" className="aspect-[4/5] w-full object-cover" loading="lazy" />
                    <span aria-hidden="true" className="absolute inset-2 border border-gold/40" />
                  </div>
                  <figcaption className="mt-3 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.30em] text-white/50">
                    <span>Plate 01 — the work</span>
                    <span className="text-gold">✦ view the gallery</span>
                  </figcaption>
                </figure>
              </Reveal>
            </div>
          </div>
        </section>
      ) : (
        /* ——— CINEMATIC: the default full-bleed ——— */
        <section className="relative flex min-h-[92svh] items-end overflow-hidden pt-36">
          <div aria-hidden="true" className="absolute inset-0">
            <img src={article.cover} alt="" className="h-full w-full object-cover" />
          </div>
          <div aria-hidden="true" className={`absolute inset-0 ${vibe.overlay}`} />
          <VibeAmbient vibe={article.vibe ?? 'solemn'} section="hero" />
          <div className="relative z-[2] mx-auto w-full max-w-page px-[clamp(1.75rem,5.5vw,4.75rem)] pb-12">
            <Reveal><p className="kicker">Verlyse Media presents — a submission by {author?.name}</p></Reveal>
            <InkSpread className={`${vibe.titleClass} inline-block`} origin="50% 80%">
              <SplitText as="h1" text={`“${article.title}”`} className="mt-6 max-w-[20ch] text-[clamp(2.8rem,7vw,6.6rem)]" />
            </InkSpread>
            <Reveal delay={0.2} className="mt-8">
              <div className="flex flex-wrap items-center gap-5">
                <MetaRow category={article.category} author={author?.name} readingTime={article.readingTime} />
                <span aria-hidden="true" className="hidden font-mono text-xs text-gold md:inline">{vibe.glyph}</span>
              </div>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="mt-8 flex max-w-[560px] items-center justify-between border-t border-white/15 pt-4 font-mono text-[9px] uppercase tracking-[0.30em] text-white/55">
                <span>Issue — {article.date.split('-').reverse().join('.')}</span>
                <span className="flex items-center gap-2">
                  <span className="text-gold">✦</span>
                  {article.motif ? article.motif : 'a verlyse feature'}
                </span>
              </div>
            </Reveal>
          </div>
        </section>
      )}

{/* ---------- Body — inside the publication's world ---------- */}
      <section className={`relative border-t border-white/10 py-[clamp(6rem,14vh,11rem)] transition-colors duration-1000 ${worldBodyClass(article.world)} ${vibe.bodyClass} ${reading ? 'bg-wine-deep' : ''}`}>
        <WorldTexture world={article.world} />
        {article.motif && MARGINALIA[article.motif] && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-4 top-64 hidden select-none items-center gap-3 [writing-mode:vertical-rl] font-mono text-[9px] uppercase tracking-[0.30em] text-white/55 xl:flex"
          >
            <span className="text-gold">✦</span>
            {MARGINALIA[article.motif]}
          </span>
        )}
        <div className={`relative mx-auto px-[clamp(1.75rem,5.5vw,4.75rem)] transition-all duration-1000 ${reading ? 'max-w-[680px]' : 'max-w-[720px]'}`}>
          {/* The contributor — the monogram stands for the writer (no photograph
              exists in the dataset); the signature draws beneath the name. */}
          <Reveal>
            <div className="relative border-b border-white/10 py-8">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '0px 0px -8% 0px' }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-6"
              >
                {author?.portrait && !author.hideArticlePhoto ? (
                  <span className="block h-16 shrink-0">
                    <AuthorPhoto src={author.profilePhoto ?? authorPhoto(author.id)} alt={`${author.name} — photograph`} className="h-16 w-auto object-contain" />
                  </span>
                ) : (
                  <span aria-hidden="true" className="relative grid h-16 w-16 shrink-0 place-items-center">
                    <span className="absolute inset-0 rotate-45 border border-gold/50" />
                    <span className="font-serif text-2xl italic text-gold">
                      {author?.name.split(' ').map((n) => n[0]).join('')}
                    </span>
                  </span>
                )}
                <div>
                  <p className="font-serif text-2xl font-light tracking-[-0.01em] text-ivory">{author?.name}</p>
                  <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.28em] text-white/50">{author?.handle} · {author?.role}</p>
                </div>
              </motion.div>
              {author && <Signature name={author.name} delay={0.3} />}
              {author && (
                <Link
                  to={`/creator/${author.id}`}
                  className="mt-5 inline-flex items-center gap-2 border-b border-gold/50 pb-1 font-mono text-[10px] uppercase tracking-[0.28em] text-gold no-underline transition-colors hover:text-ivory max-[767px]:py-2"
                >
                  About the writer <span aria-hidden="true">→</span>
                </Link>
              )}
              {/* a second creator, credited by the caption itself */}
              {article.credit && <CreditLine credit={article.credit} />}
            </div>
          </Reveal>

          {/* Body — prose or verse, set with care, moved by the feature's vibe */}
          <article>
            {article.body.map((p, i) => (
              <motion.div
                key={i}
                initial={v.initial}
                whileInView={v.animate}
                viewport={{ once: true, margin: '0px 0px -10% 0px' }}
                transition={{ duration: v.duration, ease: EASE, delay: Math.min(i * 0.04, 0.3) }}
              >
                {p.startsWith('NEWS UPDATE') ? (
                  /* The news card as it appeared on the post's slide */
                  <div className="my-12 border border-white/15 bg-white/[0.03] px-7 py-6">
                    <p className="kicker !mb-3">News update</p>
                    <p className="font-serif text-xl font-light italic leading-relaxed text-gold md:text-2xl">{p.replace(/^NEWS UPDATE —\s*/, '')}</p>
                  </div>
                ) : isVerse ? (
                  <p className={`mx-auto text-center font-serif font-light italic transition-all duration-1000 ${reading ? 'max-w-[36ch] text-[clamp(1.4rem,2.1vw,1.85rem)] leading-[2.05] text-ivory/92' : 'max-w-[42ch] text-[clamp(1.35rem,2vw,1.75rem)] leading-[1.9] text-ivory/90'}`}>
                    {p}
                  </p>
                ) : (
                  <>
                    <p className={`transition-all duration-1000 font-serif ${reading ? 'mt-11 text-[clamp(1.28rem,1.75vw,1.5rem)] leading-[2.05] text-ivory/90' : 'mt-9 text-[clamp(1.2rem,1.6vw,1.4rem)] leading-[1.9] text-ivory/88'} ${i === 0 ? 'drop-cap' : ''}`}>
                      {p}
                    </p>
                    {/* the golden point — the story's own line, lifted as a pull-quote */}
                    {i === pullIndex && pull && (
                      <motion.blockquote
                        initial={{ opacity: 0, y: 26 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '0px 0px -12% 0px' }}
                        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                        className="relative my-16 border-y border-gold/25 py-12"
                      >
                        <span aria-hidden="true" className="absolute -top-5 left-0 flex items-center gap-3">
                          <span className="h-px w-10 bg-gold/50" />
                          <span className="font-serif text-2xl leading-none text-gold">“</span>
                        </span>
                        <p className="pull-quote mx-auto max-w-[30ch] text-[clamp(1.6rem,2.8vw,2.4rem)] leading-[1.4] text-ivory">
                          {pull}
                        </p>
                        <span aria-hidden="true" className="absolute -bottom-5 right-0 flex items-center gap-3">
                          <span className="font-serif text-2xl leading-none text-gold">”</span>
                          <span className="h-px w-10 bg-gold/50" />
                        </span>
                      </motion.blockquote>
                    )}
                  </>
                )}
              </motion.div>
            ))}
          </article>

          {/* ---------- Within the post — the pictures inside the slides ---------- */}
          {figures.length > 0 && (
            <>
            <MotifDivider label="Within the post" motif={article.motif} />
            <Reveal className="mt-4">
              <div className="border-t border-white/10 pt-8">
                <p className="kicker mb-8">Within the post</p>
                <div className={`grid grid-cols-1 gap-10 ${figures.length > 1 ? 'sm:grid-cols-2' : ''}`}>
                  {figures.map((f, i) => (
                    <figure key={f.src}>
                      <div className={`img-frame relative overflow-hidden border ${vibe.figFrame}`}>
                        <img
                          src={f.src}
                          alt={`${f.label} — ${article.title}`}
                          loading="lazy"
                          className={`h-full w-full object-cover ${vibe.figMotion}`}
                        />
                        <span aria-hidden="true" className="pointer-events-none absolute inset-3 border border-gold/40" />
                      </div>
                      <figcaption className="mt-4">
                        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-gold">
                          {f.label} <span className="text-white/55">— {String(i + 1).padStart(2, '0')} / {figures.length}</span>
                        </p>
                        <p className="mt-2 max-w-[44ch] text-sm leading-relaxed text-white/60">{f.caption}</p>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            </Reveal>
            </>
          )}

          {/* Tags */}
          <Reveal className="mt-14">
            <div className="flex flex-wrap gap-3">
              {article.tags.map((t) => (
                <span key={t} className="border-y border-white/15 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.28em] text-white/60">{t}</span>
              ))}
            </div>
          </Reveal>

          {/* Save + Share — a quiet hairline block */}
          <Reveal className="mt-14">
            <div className="flex flex-wrap items-center justify-between gap-5 border-t border-white/10 pt-6">
              <div className="flex flex-wrap items-center gap-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">Save this story</span>
                <BookmarkBtn id={article.id} title={article.title} category={article.category} author={author?.name} />
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">Share</span>
                <ShareButtons title={`“${article.title}”`} />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* the moment of reflection before the ending */}
      {article.reflection && (
        <section aria-hidden="true" className="relative py-[clamp(5rem,10vh,8rem)]">
          <div className="mx-auto max-w-[640px] px-[clamp(1.75rem,5.5vw,4.75rem)] text-center">
            <ReflectionLine>
              <p className="font-serif text-[clamp(1.5rem,2.6vw,2.2rem)] font-light italic leading-[1.6] text-ivory/75">
                {article.reflection}
              </p>
            </ReflectionLine>
          </div>
        </section>
      )}

      {/* ---------- The ending — the story closes, the credits follow ---------- */}
      <MotifDivider label="The ending" motif={article.motif} />
      <section id="ending" className="relative border-t border-white/10 py-[clamp(6rem,14vh,11rem)]">
        {/* the bounded spatial atmosphere — sits BEHIND the canonical signature
            and closing copy, which always render as semantic HTML on top. */}
        <Suspense fallback={null}>
          <StoryEnding3D article={article} />
        </Suspense>
        <div className="relative z-[1] mx-auto max-w-page px-[clamp(1.75rem,5.5vw,4.75rem)]">
          {/* The closing — the publication's own last slide */}
          <ArticleEnding article={article} />

          {/* The writer's note — the credits, set as the final page of a book */}
          {article.note && (
            <div className="mx-auto mt-20 max-w-[720px]">
              <WritersNoteClosing paragraphs={[article.note]} author={author?.name} portrait={author?.portrait && !author?.hideArticlePhoto ? (author.profilePhoto ?? authorPhoto(author.id)) : undefined} />
            </div>
          )}
        </div>
      </section>

      {/* The signature — the final shot, unique to this publication */}
      <ArticleSignature article={article} />

      {/* ---------- Conversations — the real comments ---------- */}
      {article.voices && article.voices.length > 0 && (
        <section className="border-t border-white/10 py-[clamp(5rem,10vh,8rem)]">
          <div className="mx-auto max-w-[720px] px-[clamp(1.75rem,5.5vw,4.75rem)]">
            <EditorialWipe>
              <p className="kicker">Conversations</p>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">
                {article.comments} comments beneath this feature — all of them read
              </p>
            </EditorialWipe>
            <div className="mt-8 border-t border-white/10">
              {article.voices.map((v, i) => (
                <Reveal key={i} delay={i * 0.05}>
                  <div className="flex gap-4 border-b border-white/10 py-5">
                    <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center border border-gold/40 font-serif text-sm italic text-gold">
                      {v.handle.replace('@', '').slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-gold">{v.handle}</p>
                      <p className="mt-1 leading-relaxed text-white/70">{v.text}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Related ---------- */}
      <section className="border-t border-white/10 py-[clamp(6rem,14vh,11rem)]">
        <div className="mx-auto max-w-page px-[clamp(1.75rem,5.5vw,4.75rem)]">
          {/* ——— the page turn — the next feature, full-bleed ——— */}
          {related.length > 0 && (
            <Reveal className="mb-24">
              <div className="relative overflow-hidden border border-gold/20">
                {/* the next cover, breathing slowly */}
                <div aria-hidden="true" className="absolute inset-0">
                  <img
                    src={related[0].cover}
                    alt=""
                    className="h-full w-full object-cover opacity-40 animate-vm-kenburns"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1C0509] via-[#1C0509]/60 to-[#1C0509]/20" />
                </div>

                <div className="relative px-[clamp(1.75rem,5.5vw,4.75rem)] py-[clamp(5rem,10vh,8rem)] text-center">
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-gold">Up next — the same room, another voice</p>
                  <span aria-hidden="true" className="mt-6 flex items-center justify-center gap-4">
                    <span className="h-px w-16 bg-gold/40" />
                    <span className="text-gold">✦</span>
                    <span className="h-px w-16 bg-gold/40" />
                  </span>
                  <Link to={`/article/${related[0].id}`} className="group mt-8 block no-underline">
                    <h2 className="mx-auto max-w-[18ch] font-serif text-[clamp(2.6rem,5.6vw,4.8rem)] font-light leading-[1.04] tracking-[-0.02em] text-ivory transition-all duration-700 group-hover:italic group-hover:text-[#E8D9A8]">
                      “{related[0].title}”
                    </h2>
                  </Link>
                  <div className="mt-6 flex justify-center">
                    <MetaRow
                      category={related[0].category}
                      author={getAuthor(related[0].authorId)?.name}
                      readingTime={related[0].readingTime}
                    />
                  </div>
                  <p className="mx-auto mt-5 max-w-[46ch] font-serif text-lg font-light italic leading-[1.7] text-white/70">
                    {related[0].excerpt}
                  </p>
                  <Link to={`/article/${related[0].id}`} className="btn btn-gold mt-10">
                    Read the next feature
                  </Link>
                </div>
              </div>
            </Reveal>
          )}

          {/* ——— also in this issue — the rest, quietly ——— */}
          {related.length > 1 && (
            <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
              {related.slice(1).map((a) => {
                const au = getAuthor(a.authorId)
                return (
                  <Reveal key={a.id}>
                    <Link to={`/article/${a.id}`} className="group flex items-center gap-6 border-t border-white/10 pt-6 no-underline">
                      <div className="img-frame relative h-24 w-20 shrink-0 overflow-hidden">
                        <img src={a.cover} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.1]" />
                      </div>
                      <div>
                        <MetaRow category={a.category} author={au?.name} readingTime={a.readingTime} />
                        <h3 className="mt-2 font-serif text-xl font-normal leading-tight text-ivory transition-all duration-700 group-hover:italic group-hover:text-[#E8D9A8]">
                          “{a.title}”
                        </h3>
                      </div>
                      <span aria-hidden="true" className="ml-auto shrink-0 font-serif text-xl text-gold opacity-0 transition-opacity duration-500 group-hover:opacity-100">→</span>
                    </Link>
                  </Reveal>
                )
              })}
            </div>
          )}

          {related.length === 0 && (
            <Reveal className="border border-dashed border-white/15 p-10 text-center">
              <p className="font-serif text-xl font-light italic text-ivory/70">
                The archive is young, and the next feature has not been written yet. When it is, it will sit beside this one.
              </p>
              <Link to="/submit" className="btn btn-ghost mt-8">Send your work</Link>
            </Reveal>
          )}
        </div>
      </section>
    </>
  )
}
