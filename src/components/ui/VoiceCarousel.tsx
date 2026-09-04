import { COMMUNITY_VOICES } from '../../data/content'
import Reveal from './Reveal'

/**
 * THE LETTERS — the real comments beneath the features, set as a magazine's
 * letters page. No rotation, no dots: every voice is printed, alternating
 * across the measure like letters to the editor, each signed with its handle.
 */
export default function VoiceCarousel() {
  return (
    <section className="border-t border-white/10 bg-wine-deep py-[clamp(6rem,14vh,11rem)]">
      <div className="mx-auto max-w-[980px] px-[clamp(1.75rem,5.5vw,4.75rem)]">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-8">
            <p className="kicker mb-0">The letters</p>
            <p className="font-mono text-[9px] uppercase tracking-[0.30em] text-white/60">
              real comments beneath the features — read, all of them
            </p>
          </div>
        </Reveal>

        <div className="mt-4">
          {COMMUNITY_VOICES.map((v, i) => {
            const alt = i % 2 === 1
            return (
              <Reveal key={v.handle + v.text.slice(0, 8)} delay={Math.min(i * 0.06, 0.3)}>
                <div className={`grid grid-cols-1 gap-4 border-b border-white/10 py-10 md:grid-cols-[1fr_240px] md:items-baseline md:gap-12 ${alt ? 'md:grid-cols-[240px_1fr]' : ''}`}>
                  <blockquote
                    className={`pull-quote font-serif text-[clamp(1.3rem,2.4vw,1.9rem)] font-light italic leading-[1.45] text-ivory/90 ${
                      alt ? 'md:order-2' : 'md:order-1'
                    } ${alt ? 'md:text-left' : 'md:text-right'}`}
                  >
                    “{v.text}”
                  </blockquote>
                  <cite
                    className={`not-italic ${
                      alt ? 'md:order-1' : 'md:order-2'
                    } ${alt ? 'md:text-right' : 'md:text-left'} md:pt-1`}
                  >
                    <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-gold">{v.handle}</span>
                    <span className="mt-1.5 block font-mono text-[9px] uppercase tracking-[0.30em] text-white/60">
                      beneath “{v.post}”
                    </span>
                  </cite>
                </div>
              </Reveal>
            )
          })}
        </div>

        <Reveal delay={0.15}>
          <p className="mt-12 text-center font-serif text-lg font-light italic leading-[1.7] text-white/55">
            Every one of these is a real comment from beneath a real feature — the room answers in its own words.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
