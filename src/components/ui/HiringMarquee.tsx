import { useReducedMotion } from 'motion/react'
import { BRAND } from '../../data/content'
import { Magnetic, MaskReveal } from '../cinematic'
import Reveal from './Reveal'

const MARQUEE_PHRASES = [
  { text: 'Researchers wanted', italicWord: 'Researchers' },
  { text: 'Palette Designers wanted', italicWord: 'Palette Designers' },
  { text: 'Content Writers wanted', italicWord: 'Content Writers' },
  { text: 'The next byline could be yours', italicWord: 'next byline' },
] as const

function renderPhrase({ text, italicWord }: (typeof MARQUEE_PHRASES)[number]) {
  const idx = text.indexOf(italicWord)
  if (idx < 0) return <span>{text}</span>
  const before = text.slice(0, idx)
  const after = text.slice(idx + italicWord.length)
  return (
    <span className="font-serif text-[clamp(1.35rem,2.8vw,2.35rem)] font-light tracking-[-0.01em] text-ivory">
      {before}
      <em className="italic text-gold">{italicWord}</em>
      {after}
    </span>
  )
}

/**
 * THE NEXT BYLINE — Founder-requested editorial hiring experience & marquee.
 *
 * Three layers:
 *   Layer A — Editorial introduction ("VERLYSE MEDIA / OPEN CALL 2026",
 *             "The next voice could be yours.", supporting & experience copy)
 *   Layer B — Seamless CSS typographic marquee ("RESEARCHERS WANTED ·
 *             PALETTE DESIGNERS WANTED · CONTENT WRITERS WANTED · THE NEXT
 *             BYLINE COULD BE YOURS") with static reduced-motion alternative
 *             and screen-reader deduplication, plus the three role plates.
 *   Layer C — Explicit application invitation ("Explore the roles & apply ↗")
 *             linking directly to the official Google Forms application.
 */
export default function HiringMarquee({
  className = '',
  scale = 'full',
}: {
  className?: string
  /** 'muted' steps the classified down so it reads as the middle beat of a
   *  closing cadence rather than a third full-scale ending. Home passes it;
   *  /about and /ambassadors close ON this section, so they keep 'full'. */
  scale?: 'full' | 'muted'
}) {
  const reduce = useReducedMotion() === true
  const { hiring, hiringForm } = BRAND

  return (
    <section
      aria-labelledby="hiring-next-byline-heading"
      data-hiring-section="the-next-byline"
      className={`relative overflow-hidden border-t border-white/10 bg-[radial-gradient(95%_70%_at_50%_0%,rgba(92,18,36,0.34),transparent_65%),linear-gradient(180deg,#260812_0%,#1A050B_100%)] ${
        scale === 'muted' ? 'py-[clamp(3.5rem,8vh,6rem)]' : 'py-[clamp(5.5rem,12vh,9.5rem)]'
      } ${className}`}
    >
      {/* Subtle architectural hairlines */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-[clamp(1.75rem,5.5vw,4.75rem)] hidden w-px bg-gradient-to-b from-transparent via-gold/15 to-transparent lg:block"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-[clamp(1.75rem,5.5vw,4.75rem)] hidden w-px bg-gradient-to-b from-transparent via-gold/15 to-transparent lg:block"
      />

      {/* ============ LAYER A — Editorial Introduction ============ */}
      <div className="relative z-10 mx-auto max-w-page px-[clamp(1.75rem,5.5vw,4.75rem)]">
        <Reveal>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gold/25 pb-4">
            <p className="inline-flex items-center gap-3 font-mono text-[10px] font-semibold uppercase tracking-[0.32em] text-gold">
              <span aria-hidden="true" className="h-px w-8 bg-gold" />
              {hiring.kicker}
            </p>
            <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-white/55">
              {hiring.rolesMicrocopy}
            </p>
          </div>
        </Reveal>

        <div className="mt-8 grid grid-cols-1 items-end gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          <div>
            <Reveal delay={0.05}>
              <MaskReveal>
                <h2
                  id="hiring-next-byline-heading"
                  className={`max-w-[18ch] pb-2 font-serif font-light leading-[1.06] tracking-[-0.02em] text-ivory ${
                    scale === 'muted'
                      ? 'text-[clamp(1.9rem,3.6vw,3rem)]'
                      : 'text-[clamp(2.5rem,5.4vw,4.6rem)]'
                  }`}
                >
                  The next voice <em className="italic text-gold">could be yours.</em>
                </h2>
              </MaskReveal>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-5 max-w-[54ch] font-serif text-[clamp(1.15rem,1.8vw,1.4rem)] font-light italic leading-[1.65] text-ivory/85">
                “{hiring.subcopy}”
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.18}>
            <div className="border-l border-gold/45 bg-[#F8F6F2]/[0.03] py-4 pl-5 pr-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-gold-lit/90">
                Open to new voices
              </p>
              <p className="mt-2 max-w-[44ch] text-sm leading-[1.75] text-white/70">
                {hiring.experienceNote}
              </p>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ============ LAYER B — The Animated Marquee ============ */}
      <div className="vm-marquee-band relative z-10 mt-10 border-y border-gold/35 bg-[#130307]/90 py-5">
        {/* Single screen-reader announcement so assistive technology never hears duplicated marquee text */}
        <p className="sr-only">
          Open call for Verlyse Media: Researchers wanted, Palette Designers wanted, Content Writers wanted — the next byline could be yours.
        </p>

        {reduce ? (
          /* Calm static alternative when prefers-reduced-motion is active */
          <div
            aria-hidden="true"
            className="mx-auto flex max-w-page flex-wrap items-center justify-center gap-x-6 gap-y-3 px-[clamp(1.75rem,5.5vw,4.75rem)] text-center"
          >
            {MARQUEE_PHRASES.map((item, i) => (
              <span key={item.text} className="inline-flex items-center gap-6">
                {renderPhrase(item)}
                {i < MARQUEE_PHRASES.length - 1 && (
                  <span className="font-serif text-base text-gold-lit/80">✦</span>
                )}
              </span>
            ))}
          </div>
        ) : (
          /* Seamless dual-segment CSS marquee loop (aria-hidden because .sr-only above provides the single announcement) */
          <div aria-hidden="true" className="overflow-hidden">
            <div className="vm-marquee-track items-center">
              {[0, 1].map((copyIdx) => (
                <div
                  key={copyIdx}
                  className="flex shrink-0 items-center gap-8 pr-8 md:gap-12 md:pr-12"
                >
                  {MARQUEE_PHRASES.map((item) => (
                    <span key={`${copyIdx}-${item.text}`} className="inline-flex items-center gap-8 whitespace-nowrap md:gap-12">
                      {renderPhrase(item)}
                      <span className="font-serif text-lg text-gold-lit/80">✦</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ============ Three Open Roles + LAYER C — Clear Application Invitation ============ */}
      <div className="relative z-10 mx-auto mt-10 max-w-page px-[clamp(1.75rem,5.5vw,4.75rem)]">
        {/* Three editorial role cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {hiring.roles.map((r, i) => (
            <Reveal key={r.title} delay={0.06 * (i + 1)}>
              <div className="relative flex h-full flex-col justify-between border border-gold/25 bg-[#F8F6F2]/[0.03] p-6 transition-colors duration-500 hover:border-gold/55 hover:bg-[#F8F6F2]/[0.05]">
                <div>
                  <div className="border-b border-white/10 pb-3">
                    <span className="font-mono text-[9px] uppercase tracking-[0.26em] text-gold">
                      {r.focus}
                    </span>
                  </div>
                  <h3 className="mt-4 font-serif text-2xl font-normal leading-snug text-ivory">
                    {r.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-[1.75] text-white/70">
                    {r.summary}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Layer C — Application CTA bar */}
        <Reveal delay={0.22}>
          <div className="mt-8 flex flex-col items-start justify-between gap-6 border border-gold/40 bg-[#EFE8DD] px-6 py-6 text-[#241D18] shadow-[0_18px_44px_rgba(0,0,0,0.35)] sm:flex-row sm:items-center md:px-8 md:py-7">
            <div className="min-w-0">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.26em] text-[#7C6338]">
                {hiring.rolesMicrocopy}
              </p>
              <p className="mt-1.5 font-serif text-lg italic leading-snug text-[#241D18]/85">
                Apply through the official Verlyse Media open call — role-specific questions and shared availability in one form.
              </p>
            </div>
            <Magnetic className="w-full shrink-0 sm:w-auto">
              <a
                href={hiringForm}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Explore the roles and apply to Verlyse Media (Researcher, Palette Designer, Content Writer)"
                className="group/cta inline-flex min-h-[48px] w-full shrink-0 items-center justify-center gap-3 border border-[#3B0D17] bg-[#3B0D17] px-6 py-3.5 text-center font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-[#F8F6F2] no-underline transition-colors duration-300 hover:border-[#5C1224] hover:bg-[#5C1224] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B0D17] sm:w-auto sm:px-7 sm:tracking-[0.22em]"
              >
                <span>Explore the roles &amp; apply</span>
                <span
                  aria-hidden="true"
                  className="inline-block transition-transform duration-300 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5"
                >
                  ↗
                </span>
              </a>
            </Magnetic>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
