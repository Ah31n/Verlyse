import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { ARTICLES, LEDGER, getAuthor, stampDate } from '../../data/content'
import { introSeen, markIntroSeen, skipIntro } from '../../lib/intro'

/**
 * First-load preloader — the entrance of the magazine, held to its budget.
 *
 * The sequence is the brief's, and nothing else: the mark sets itself in
 * type (0.15s), the issue metadata fades in as the press line settles
 * (0.95s), the tagline reveals beneath it (1.2s), and the curtain lifts at
 * 1.85s — the cover's own timeline is choreographed against this exact beat,
 * so the featured plate arrives with the curtain, not after it. The whole
 * opening stays inside ~2.6 seconds.
 *
 * It can never hold anyone: a Skip control answers instantly; reduced-motion
 * visitors skip straight to the magazine at rest; a repeat visit within the
 * session skips without being asked (sessionStorage); and a hard timer closes
 * the curtain even if any of the above fails. No counter, no shimmer, no
 * blank state — the wine hall behind the curtain is already painted.
 */
export default function Preloader() {
  // if this session has already opened the magazine (or motion is reduced),
  // the curtain never falls at all
  const reduce = useReducedMotion() === true
  const [done, setDone] = useState(() => reduce || introSeen())
  const [skipped, setSkipped] = useState(false)

  useEffect(() => {
    if (done) return
    // hard ceiling — the intro cannot outlive its own timer
    const t = setTimeout(() => { markIntroSeen(); setDone(true) }, 1900)
    return () => clearTimeout(t)
  }, [done])

  useEffect(() => {
    document.documentElement.classList.toggle('preloading', !done)
    if (done) {
      const t = setTimeout(() => document.documentElement.classList.add('loaded'), 800)
      return () => clearTimeout(t)
    }
  }, [done])

  const skip = () => {
    setSkipped(true)
    skipIntro()
    setDone(true)
  }

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[1200] flex flex-col justify-between bg-gradient-to-b from-wine-deep via-[#2B0812] to-[#22060D] px-[clamp(1.5rem,6vw,5rem)] py-[clamp(1.6rem,4vw,3rem)]"
          exit={{ y: '-101%' }}
          transition={{ duration: skipped ? 0.3 : 0.75, ease: [0.65, 0.05, 0.36, 1], delay: skipped ? 0 : 0.05 }}
          aria-label="Verlyse Media — opening the magazine"
        >
          <div className="flex items-start justify-between gap-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">
              Verlyse Media — submissions presented with care
            </p>
            <button
              type="button"
              onClick={skip}
              className="shrink-0 border border-gold/40 px-4 py-2 font-mono text-[9px] uppercase tracking-[0.28em] text-ivory/80 transition-colors duration-300 hover:border-gold hover:bg-gold hover:text-charcoal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              Skip intro →
            </button>
          </div>

          <div className="text-center">
            {/* 1 · the mark sets itself in type */}
            <p className="font-serif text-[clamp(3.2rem,9vw,6.2rem)] font-light tracking-[0.14em] text-ivory">
              {'Verlyse'.split('').map((c, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  initial={{ opacity: 0, y: '70%' }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.12 + i * 0.05 }}
                >
                  {c}
                </motion.span>
              ))}
            </p>
            {/* 2 · the issue metadata fades in — the same numbers the archive reads */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.62, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 font-mono text-[9px] uppercase tracking-[0.32em] text-white/50"
            >
              Issue № {LEDGER.issueNo} — {LEDGER.features} folios · {LEDGER.creators} creators · opened {stampDate(LEDGER.openedOn)}
            </motion.p>
            {/* 3 · the line of the magazine */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.88, ease: [0.22, 1, 0.36, 1] }}
              className="mt-5 font-mono text-[10px] uppercase tracking-[0.28em] text-gold"
            >
              Where Vision Becomes A Voice
            </motion.p>
          </div>

          {/* 4 · the plate that is about to enter — named here so the reader
              knows what the cover will open with */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.12, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-end justify-between gap-10"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">
              The feature — “{ARTICLES[0].title}” by {getAuthor(ARTICLES[0].authorId)?.name}
            </p>
            <p aria-hidden="true" className="font-serif text-[clamp(1.4rem,3vw,2rem)] font-light italic leading-none text-gold">
              est. 2026
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
