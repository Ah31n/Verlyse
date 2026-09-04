import { motion } from 'framer-motion'
import { BRAND, type Article, type Closing , getAuthor , authorPhoto } from '../../data/content'
import { MotifGlyph } from './Motifs'
import Reveal from './Reveal'

/**
 * The closing of every article — the post's final slide (About Us card,
 * writer's note, artist's note, or a unique ending) rendered as a designed,
 * animated editorial block that matches the site's language.
 * Each feature closes with its own ending; nothing is a raw pasted image.
 */

const EASE = [0.22, 1, 0.36, 1] as const

/** Animated gold rule that draws itself in. */
function DrawRule({ delay = 0, className = '' }: { delay?: number; className?: string }) {
  return (
    <motion.span
      aria-hidden="true"
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 1.1, ease: EASE, delay }}
      className={`block h-px w-24 origin-left bg-gold ${className}`}
    />
  )
}

/** A floating ✦ ornament. */
function Ornament({ delay = 0 }: { delay?: number }) {
  return (
    <motion.span
      aria-hidden="true"
      initial={{ opacity: 0, rotate: -30, scale: 0.6 }}
      whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.9, ease: EASE, delay }}
      className="inline-block text-gold"
    >
      ✦
    </motion.span>
  )
}

/** Small mono label above a closing block. */
function Kicker({ text, dark = true, delay = 0 }: { text: string; dark?: boolean; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.7, ease: EASE, delay }}
      className="flex items-center gap-4"
    >
      <DrawRule delay={delay + 0.1} />
      <span className={`font-mono text-[10px] uppercase tracking-[0.28em] ${dark ? 'text-gold' : 'text-charcoal/60'}`}>
        {text}
      </span>
      <Ornament delay={delay + 0.25} />
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/* The signature — the recurring “— Name” becomes a hand-drawn mark.  */
/* Every writer who signs a note gets the flourish; the name sits in  */
/* italic serif, slightly rotated, and the line draws itself in like  */
/* pen on paper.                                                      */
/* ------------------------------------------------------------------ */
export function Signature({ name, delay = 0.35, align = 'left' }: { name: string; delay?: number; align?: 'left' | 'center' }) {
  const plain = name.replace(/^—\s*/, '').trim()
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.7, delay }}
      className={`${align === 'center' ? 'flex flex-col items-center' : ''} mt-7`}
    >
      <motion.p
        initial={{ opacity: 0, x: align === 'left' ? -6 : 0 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '0px 0px -8% 0px' }}
        transition={{ duration: 0.8, ease: EASE, delay: delay + 0.15 }}
        className="inline-block font-serif text-3xl font-light italic text-gold"
        style={{ transform: 'rotate(-1.5deg)' }}
      >
        {plain}
      </motion.p>
      <svg
        viewBox="0 0 220 22"
        fill="none"
        aria-hidden="true"
        className={`mt-0.5 block h-[22px] w-48 overflow-visible ${align === 'center' ? 'mx-auto' : ''}`}
      >
        {/* the ink dot where the pen first touches the paper */}
        <motion.circle
          cx="8"
          cy="13"
          r="1.6"
          fill="#B89146"
          stroke="none"
          initial={{ opacity: 0, scale: 0.4 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '0px 0px -8% 0px' }}
          transition={{ duration: 0.5, ease: EASE, delay: delay + 0.15 }}
        />
        {/* the main stroke — the pen's first pass */}
        <motion.path
          d="M8 13 C 42 5, 120 18, 212 9"
          stroke="#B89146"
          strokeWidth="1.6"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, margin: '0px 0px -8% 0px' }}
          transition={{ duration: 1.2, ease: 'easeInOut', delay: delay + 0.35 }}
        />
        {/* the second pass — a lighter, quicker stroke, like real ink */}
        <motion.path
          d="M20 14 C 70 10, 130 17, 196 11"
          stroke="#B89146"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.45"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, margin: '0px 0px -8% 0px' }}
          transition={{ duration: 0.9, ease: 'easeInOut', delay: delay + 0.7 }}
        />
      </svg>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/* The recurring ✦-between-rules — the magazine's section transition. */
/* Used between the body, the plates, and the ending so the ornament   */
/* becomes the reader's cue that one movement of the story has closed. */
/* ------------------------------------------------------------------ */
export function MotifDivider({ label, motif }: { label?: string; motif?: string }) {
  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.9, ease: EASE }}
      className="my-16 flex flex-col items-center gap-4"
    >
      <div className="flex items-center gap-4">
        <motion.span
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: '0px 0px -10% 0px' }}
          transition={{ duration: 1.1, ease: EASE, delay: 0.1 }}
          className="h-px w-16 origin-right bg-gold/40 md:w-20"
        />
        <motion.span
          initial={{ opacity: 0, scale: 0.7 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '0px 0px -10% 0px' }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.3 }}
        >
          <MotifGlyph type={motif ?? '✦'} />
        </motion.span>
        <motion.span
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: '0px 0px -10% 0px' }}
          transition={{ duration: 1.1, ease: EASE, delay: 0.1 }}
          className="h-px w-16 origin-left bg-gold/40 md:w-20"
        />
      </div>
      {label && (
        <motion.span
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '0px 0px -10% 0px' }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.5 }}
          className="font-mono text-[9px] uppercase tracking-[0.30em] text-white/50"
        >
          {label}
        </motion.span>
      )}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/* The About Us card — closes the features whose last slide is the     */
/* platform's mission card.                                            */
/* ------------------------------------------------------------------ */
export function MissionClosing({ kicker = 'About us' }: { kicker?: string }) {
  const sentences = BRAND.mission.split('. ').filter(Boolean)
  return (
    <Reveal className="mt-24">
      <div className="relative overflow-hidden border border-gold/25 bg-gradient-to-b from-wine-deep to-[#2A0811] px-8 py-12 md:px-14 md:py-16">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(62%_55%_at_50%_6%,rgba(184,145,70,0.1),transparent_74%)]" />

        <div className="relative">
          <Kicker text={kicker} />

          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
            className="mt-6 max-w-[24ch] font-serif text-3xl font-light leading-[1.12] text-ivory md:text-4xl"
          >
            Every post is a <em className="italic text-gold">story</em>, an emotion, and a voice worth sharing.
          </motion.h2>

          <div className="mt-8 max-w-[58ch]">
            {sentences.map((sentence, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '0px 0px -8% 0px' }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.15 + i * 0.1 }}
                className="mt-3 max-w-[56ch] text-[15px] leading-[1.9] text-white/65"
              >
                {sentence}.
              </motion.p>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '0px 0px -8% 0px' }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="mt-8 max-w-[52ch] font-serif text-base font-light italic leading-relaxed text-gold/90"
          >
            {BRAND.submitCta}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '0px 0px -8% 0px' }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10 flex flex-wrap items-center gap-5"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/50">{BRAND.handle}</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">·</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/50">{BRAND.email}</span>
          </motion.div>
        </div>
      </div>
    </Reveal>
  )
}

/* ------------------------------------------------------------------ */
/* The writer's / artist's note — closes the features whose final      */
/* slide is the creator's note. The signoff becomes a signature.       */
/* ------------------------------------------------------------------ */
function authorPhotoOf(article: Article): string | undefined {
  const au = getAuthor(article.authorId)
  if (!au?.portrait || au.hideArticlePhoto) return undefined
  return au.profilePhoto ?? authorPhoto(au.id)
}

export function WritersNoteClosing({
  paragraphs,
  title,
  kicker = 'Writer’s note',
  author,
  portrait,
}: {
  paragraphs: string[]
  title?: string
  kicker?: string
  author?: string
  /** the writer's photograph, when their post carries one */
  portrait?: string
}) {
  return (
    <Reveal className="mt-20">
      {/* the final page of a printed book — the note, framed, signed */}
      <div className="relative border border-gold/25 bg-[#17060B] px-7 py-10 md:px-12 md:py-12">
        {/* corner ticks, like the plate marks on a book's last page */}
        <span aria-hidden="true" className="absolute -left-2 -top-2 h-4 w-4 border-l border-t border-gold" />
        <span aria-hidden="true" className="absolute -right-2 -top-2 h-4 w-4 border-r border-t border-gold" />
        <span aria-hidden="true" className="absolute -bottom-2 -left-2 h-4 w-4 border-b border-l border-gold" />
        <span aria-hidden="true" className="absolute -bottom-2 -right-2 h-4 w-4 border-b border-r border-gold" />

        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <DrawRule />
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-gold">{kicker}</span>
            <Ornament delay={0.2} />
          </div>
          {portrait && (
            <span className="hidden max-h-24 max-w-24 shrink-0 border border-gold/30 bg-[#F8F6F2] p-1 shadow-[0_10px_24px_rgba(0,0,0,0.35)] sm:block" style={{ transform: 'rotate(-1.2deg)' }}>
              <img src={portrait} alt="" aria-hidden="true" className="block h-auto w-auto max-h-20 max-w-20 object-contain object-center" />
            </span>
          )}
        </div>

        {title && (
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.12 }}
            className="mt-6 font-serif text-2xl font-light text-ivory md:text-3xl"
          >
            {title}
          </motion.h2>
        )}
        {paragraphs.map((note, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.1 + i * 0.12 }}
            className={`pull-quote ${title ? 'mt-5' : 'mt-6'} text-[clamp(1.3rem,2vw,1.6rem)] leading-[1.75] text-ivory/90`}
          >
            {note}
          </motion.p>
        ))}
        {author && <Signature name={author} />}

        {/* the colophon line — this note closes the feature */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '0px 0px -8% 0px' }}
          transition={{ duration: 0.9, delay: 0.6 }}
          className="mt-10 flex items-center gap-4 border-t border-white/10 pt-5"
        >
          <span className="h-px w-12 bg-gold/40" aria-hidden="true" />
          <span className="font-mono text-[9px] uppercase tracking-[0.30em] text-white/55">the writer’s note — it closes the feature</span>
        </motion.div>
      </div>
    </Reveal>
  )
}

/* ------------------------------------------------------------------ */
/* The artwork reveal — the piece itself completes the story.          */
/* The artist's note first, then the work arrives like a plate being   */
/* lifted from the paper, with a slow settle.                          */
/* ------------------------------------------------------------------ */
export function ArtworkClosing({
  closing,
  article,
}: {
  closing: Closing
  article: Article
}) {
  const work = article.figures?.[0]
  return (
    <Reveal className="mt-24">
      <div className="relative">
        <div className="mx-auto max-w-[640px]">
          <Kicker text={closing.kicker} />
          {closing.title && (
            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -10% 0px' }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.12 }}
              className="mt-5 font-serif text-2xl font-light text-ivory md:text-3xl"
            >
              {closing.title}
            </motion.h2>
          )}
          {closing.paragraphs?.map((p, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -10% 0px' }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.1 + i * 0.12 }}
              className="pull-quote mt-6 text-[clamp(1.3rem,2vw,1.6rem)] leading-[1.7] text-ivory/90"
            >
              {p}
            </motion.p>
          ))}
          <div className="mt-8 flex items-center justify-center gap-6">
            {closing.signoff && <Signature name={closing.signoff} align="center" />}
          </div>
        </div>

        {/* the work itself — revealed last, like the final plate */}
        {work && (
          <motion.figure
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            transition={{ duration: 1.1, ease: EASE, delay: 0.35 }}
            className="relative mx-auto mt-16 max-w-[620px]"
          >
            <div aria-hidden="true" className="absolute -inset-5 translate-x-5 translate-y-5 border border-gold/30" />
            <div className="img-frame relative overflow-hidden border border-gold/30">
              <img
                src={work.src}
                alt={`${work.label} — ${article.title}`}
                loading="lazy"
                className="h-full w-full object-cover animate-vm-kenburns"
              />
              <span aria-hidden="true" className="pointer-events-none absolute inset-3 border border-gold/40" />
            </div>
            <figcaption className="mt-5 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="fig-cap text-white/50">{work.label}</span>
              <span className="fig-cap text-gold">✦ the work</span>
            </figcaption>
          </motion.figure>
        )}
      </div>
    </Reveal>
  )
}

/* ------------------------------------------------------------------ */
/* “Their Voices Matter” — the founder's three lines, animated.        */
/* ------------------------------------------------------------------ */
export function VoicesClosing({ closing }: { closing: Closing }) {
  const lines = closing.lines ?? []
  const paragraphs = closing.paragraphs ?? []
  return (
    <Reveal className="mt-24">
      <div className="relative overflow-hidden border border-gold/25 bg-gradient-to-b from-wine-deep to-[#2A0811] px-8 py-16 text-center md:py-20">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(62%_55%_at_50%_6%,rgba(184,145,70,0.1),transparent_74%)]" />
        <DrawRule delay={0.1} className="mx-auto" />
        <div className="mt-8">
          {lines.map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -8% 0px' }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.15 + i * 0.18 }}
              className="font-serif text-3xl font-light leading-[1.25] text-ivory md:text-5xl"
            >
              {line}
            </motion.p>
          ))}
        </div>
        {paragraphs.map((p, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '0px 0px -8% 0px' }}
            transition={{ duration: 0.8, delay: 0.7 + i * 0.15 }}
            className="pull-quote mx-auto mt-8 max-w-[38ch] text-[clamp(1.15rem,1.7vw,1.35rem)] text-white/60"
          >
            {p}
          </motion.p>
        ))}
        {closing.signoff && (
          <div className="mt-10">
            <Signature name={closing.signoff} align="center" delay={0.85} />
          </div>
        )}
      </div>
    </Reveal>
  )
}

/* ------------------------------------------------------------------ */
/* “About the Work” — a gallery label for Tasbih-e-Fatima.             */
/* ------------------------------------------------------------------ */
export function AboutWorkClosing({ closing }: { closing: Closing }) {
  return (
    <Reveal className="mt-24">
      <div className="relative overflow-hidden border border-gold/25 bg-[#17060B] px-8 py-12 md:px-14 md:py-14">
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -right-24 h-72 w-72 bg-[radial-gradient(75%_75%_at_75%_25%,rgba(184,145,70,0.05),transparent_72%)]" />
        <div className="relative max-w-[58ch]">
          <Kicker text={closing.kicker} />
          {closing.paragraphs?.map((p, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -8% 0px' }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.12 + i * 0.1 }}
              className="mt-6 text-[15px] leading-[1.9] text-white/70"
            >
              {p}
            </motion.p>
          ))}
          {closing.quote && (
            <motion.blockquote
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -8% 0px' }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.35 }}
              className="mt-10 border-y border-gold/30 py-8"
            >
              <p className="pull-quote text-[clamp(1.6rem,2.6vw,2.2rem)] text-gold">“{closing.quote}”</p>
            </motion.blockquote>
          )}
          {closing.meta && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '0px 0px -8% 0px' }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3"
            >
              {closing.meta.map((m, i) => (
                <span key={i} className="flex items-center gap-5">
                  {i > 0 && <span className="text-gold/50">✦</span>}
                  <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">{m}</span>
                </span>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </Reveal>
  )
}

/* ------------------------------------------------------------------ */
/* The final stanza — closes “Forgive Me, Mother.”                     */
/* ------------------------------------------------------------------ */
export function VerseClosing({ lines, kicker, vibe }: { lines: string[]; kicker: string; vibe?: string }) {
  return (
    <Reveal className="mt-24">
      <div className="mx-auto max-w-[46ch] text-center">
        <Kicker text={kicker} delay={0.1} />
        <div className="mt-10">
          {lines.map((line, i) => (
            <motion.p
              key={i}
              initial={vibe === 'letter' ? { opacity: 0, x: -12 } : { opacity: 0, y: 22 }}
              whileInView={vibe === 'letter' ? { opacity: 1, x: 0 } : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -8% 0px' }}
              transition={{ duration: vibe === 'letter' ? 0.8 : 0.9, ease: EASE, delay: 0.15 + i * 0.16 }}
              className={`font-serif font-light italic leading-[1.8] ${i === lines.length - 1 ? 'text-[clamp(1.6rem,2.6vw,2.1rem)] text-gold' : 'text-[clamp(1.35rem,2vw,1.7rem)] text-ivory/92'}`}
            >
              {line}
            </motion.p>
          ))}
        </div>
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '0px 0px -8% 0px' }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-10 inline-block h-px w-16 bg-gold/60"
        />
      </div>
    </Reveal>
  )
}

/* ------------------------------------------------------------------ */
/* The closing passage — closes “The Arts Deserve Respect.”            */
/* ------------------------------------------------------------------ */
export function PassageClosing({ paragraphs, kicker }: { paragraphs: string[]; kicker: string }) {
  return (
    <Reveal className="mt-24">
      <div className="mx-auto max-w-[64ch]">
        <Kicker text={kicker} />
        <div className="mt-10 space-y-7">
          {paragraphs.map((p, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -8% 0px' }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.15 + i * 0.12 }}
              className="font-serif text-[clamp(1.4rem,2.2vw,1.9rem)] font-light leading-[1.65] text-ivory/90"
            >
              {p}
            </motion.p>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '0px 0px -8% 0px' }}
          transition={{ duration: 0.8, delay: 0.55 }}
          className="mt-10 flex items-center gap-4"
        >
          <span className="h-px w-16 bg-gold/60" />
          <span className="text-gold">✦</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/50">The essay ends</span>
        </motion.div>
      </div>
    </Reveal>
  )
}

/* ------------------------------------------------------------------ */
/* The story's end — closes “3:13” on the whisper.                     */
/* ------------------------------------------------------------------ */
export function StoryEndClosing({ closing, vibe }: { closing: Closing; vibe?: string }) {
  const lines = closing.lines ?? []
  const horror = vibe === 'horror'
  return (
    <Reveal className="mt-24">
      <div className="relative overflow-hidden border border-gold/25 bg-gradient-to-b from-wine-deep to-[#2A0811] px-8 py-16 text-center md:py-20">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(62%_55%_at_50%_6%,rgba(184,145,70,0.1),transparent_74%)]" />
        <div className="relative">
          <Kicker text={closing.kicker} delay={0.1} />
          <div className="mt-10">
            {lines.map((line, i) => {
              const last = i === lines.length - 1
              return (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '0px 0px -8% 0px' }}
                  transition={{ duration: 0.9, ease: EASE, delay: 0.15 + i * 0.22 }}
                  className={`mx-auto max-w-[44ch] font-serif font-light leading-[1.6] ${last ? 'mt-4 text-[clamp(1.8rem,3.2vw,2.6rem)] italic text-gold' : 'text-[clamp(1.15rem,1.7vw,1.4rem)] text-ivory/80'}`}
                >
                  {line}
                </motion.p>
              )
            })}
          </div>
          {closing.meta && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '0px 0px -8% 0px' }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="mx-auto mt-12 max-w-[40ch] space-y-1 border-t border-gold/20 pt-8"
            >
              {closing.meta.map((m, i) => (
                <p key={i} className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">{m}</p>
              ))}
              <p className="pt-4 font-mono text-[10px] uppercase tracking-[0.28em] text-gold">{horror ? '✕ end of story ✕' : '· end of story ·'}</p>
            </motion.div>
          )}
        </div>
      </div>
    </Reveal>
  )
}

/* ------------------------------------------------------------------ */
/* Dispatcher — every article ends with its own block.                 */
/* ------------------------------------------------------------------ */
export function ArticleEnding({ article }: { article: Article }) {
  const c = article.closing
  if (!c) return null
  switch (c.kind) {
    case 'voices':
      return <VoicesClosing closing={c} />
    case 'mission':
      return <MissionClosing kicker={c.kicker} />
    case 'note':
      return (
        <WritersNoteClosing
          paragraphs={c.paragraphs ?? []}
          title={c.title}
          kicker={c.kicker}
          author={c.signoff}
          portrait={authorPhotoOf(article)}
        />
      )
    case 'artwork':
      return <ArtworkClosing closing={c} article={article} />
    case 'about-work':
      return <AboutWorkClosing closing={c} />
    case 'final-verse':
      return <VerseClosing lines={c.lines ?? []} kicker={c.kicker} vibe={article.vibe} />
    case 'passage':
      return <PassageClosing paragraphs={c.paragraphs ?? []} kicker={c.kicker} />
    case 'story-end':
      return <StoryEndClosing closing={c} vibe={article.vibe} />
    default:
      return null
  }
}
