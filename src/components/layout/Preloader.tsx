import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ARTICLES, getAuthor } from '../../data/content'

/**
 * First-load preloader: the word sets itself in type, then the curtain
 * lifts. No counter, no shimmer — the quiet of a press starting.
 */
export default function Preloader() {
  const [done, setDone] = useState(false)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (reduce) {
      setDone(true)
      return
    }
    const t = setTimeout(() => setDone(true), 1500)
    return () => clearTimeout(t)
  }, [reduce])

  useEffect(() => {
    document.documentElement.classList.toggle('preloading', !done)
    if (done) {
      const t = setTimeout(() => document.documentElement.classList.add('loaded'), 1200)
      return () => clearTimeout(t)
    }
  }, [done])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[1200] flex flex-col justify-between bg-gradient-to-b from-wine-deep via-[#2B0812] to-[#22060D] px-[clamp(1.5rem,6vw,5rem)] py-[clamp(1.6rem,4vw,3rem)]"
          exit={{ y: '-101%' }}
          transition={{ duration: 1, ease: [0.65, 0.05, 0.36, 1], delay: 0.1 }}
          aria-hidden="true"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">Verlyse Media — submissions presented with care</p>
          <div className="text-center">
            <p className="font-serif text-[clamp(3.2rem,9vw,6.2rem)] font-light tracking-[0.14em] text-ivory">
              {'Verlyse'.split('').map((c, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  initial={{ opacity: 0, y: '70%' }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1], delay: 0.15 + i * 0.06 }}
                >
                  {c}
                </motion.span>
              ))}
            </p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.9 }}
              className="mt-5 font-mono text-[10px] uppercase tracking-[0.28em] text-gold"
            >
              Where Vision Becomes A Voice
            </motion.p>
          </div>
          <div className="flex items-end justify-between gap-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">Feature — “{ARTICLES[0].title}” by {getAuthor(ARTICLES[0].authorId)?.name}</p>
            <p aria-hidden="true" className="font-serif text-[clamp(1.4rem,3vw,2rem)] font-light italic leading-none text-gold">
              est. 2026
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
