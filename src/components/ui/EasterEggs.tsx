import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

/**
 * EASTER EGGS — small rewards for exploration, placed sparingly.
 * A marginal note, an ink blot, a bookmark, an old library card, a hidden
 * quote, and the reading progress drawn like turning pages. None of them
 * shout; they wait to be found.
 */

/* ------------------------------------------------------------------ */
/* The marginal note — a tiny handwritten aside, faded like ink on      */
/* old paper. Only the curious will read it.                            */
/* ------------------------------------------------------------------ */
export function Bookmark({ className = '', delay = 0 }: { className?: string; delay?: number }) {
  return (
    <span aria-hidden="true" className={`pointer-events-none absolute ${className}`}>
      <motion.svg
        viewBox="0 0 18 52"
        className="h-[52px] w-[18px]"
        initial={{ opacity: 0, y: -14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '0px 0px -10% 0px' }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay }}
      >
        <path d="M2 2h14v48l-7-9-7 9z" fill="#B89146" opacity="0.75" />
        <path d="M2 2h14v10H2z" fill="#D8B36A" opacity="0.8" />
      </motion.svg>
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* The library card — an old catalogue card, found in the colophon.    */
/* Reveals the magazine's shelf history on hover.                       */
/* ------------------------------------------------------------------ */
export function LibraryCard() {
  const [open, setOpen] = useState(false)
  const reduce = useReducedMotion()
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="The library card"
        className="group relative inline-flex items-center gap-3 border border-gold/30 bg-[#17060B] px-5 py-3 font-mono text-[9px] uppercase tracking-[0.30em] text-ivory/60 transition-colors duration-500 hover:border-gold/60 hover:text-ivory"
      >
        <span aria-hidden="true" className="h-3 w-2 rounded-[2px] border border-gold/50 bg-[#3B0D17]" />
        Library card — the shelf
        <span aria-hidden="true" className="text-gold">{open ? '−' : '+'}</span>
      </button>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: -8, rotateX: 90 }}
        animate={open ? { opacity: 1, y: 0, rotateX: 0, display: 'block' } : { opacity: 0, y: -8, rotateX: 90, display: 'none' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformPerspective: 600, transformOrigin: 'top center' }}
        className="absolute right-0 top-full z-20 mt-3 w-[300px] max-w-[calc(100vw-2.5rem)] origin-top border border-gold/30 bg-[#17060B] p-5 shadow-[0_18px_50px_rgba(6,1,4,0.6)]"
        aria-hidden={!open}
      >
        <p className="font-mono text-[9px] uppercase tracking-[0.30em] text-gold">Dewey — 808.8</p>
        <p className="mt-4 font-serif text-xl italic text-ivory/90">Verlyse Media</p>
        <p className="mt-2 text-sm leading-relaxed text-white/60">
          Nineteen features, fifteen writers, one room. The shelf grows one voice at a time — and the next card could be yours.
        </p>
        <div className="mt-4 space-y-1 border-t border-white/10 pt-3 font-mono text-[9px] uppercase tracking-[0.30em] text-white/60">
          <p>Accession — 2026 · 01 — 19</p>
          <p>Last borrowed — the room writes back</p>
        </div>
      </motion.div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* The hidden quote — a line revealed on hover, like a pencil note.    */
/* ------------------------------------------------------------------ */
export function HiddenQuote({ quote, className = '' }: { quote: string; className?: string }) {
  const [see, setSee] = useState(false)
  const [side, setSide] = useState<'center' | 'left' | 'right'>('center')
  const probe = (el: HTMLElement) => {
    const r = el.getBoundingClientRect()
    const M = 120 /* half the tooltip width + breathing room */
    setSide(r.left < M ? 'left' : window.innerWidth - r.right < M ? 'right' : 'center')
  }
  return (
    <span
      onMouseEnter={(e) => { setSee(true); probe(e.currentTarget) }}
      onMouseLeave={() => setSee(false)}
      className={`relative inline-block cursor-help border-b border-dotted border-gold/40 pb-0.5 transition-colors duration-500 hover:border-gold ${className}`}
      aria-label={quote}
    >
      <span className="text-ivory/80">{'✦'}</span>
      <motion.span
        initial={false}
        animate={{ opacity: see ? 1 : 0, y: see ? 0 : 6, x: side === 'center' ? '-50%' : '0%', display: see ? 'block' : 'none' }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`pointer-events-none absolute bottom-full z-30 w-52 max-w-[calc(100vw-1.5rem)] border border-gold/30 bg-[#17060B] p-3 text-center shadow-[0_10px_30px_rgba(6,1,4,0.5)] ${
          side === 'left' ? 'left-0' : side === 'right' ? 'right-0' : 'left-1/2'
        }`}
      >
        <span className="font-serif text-sm italic leading-snug text-ivory/90">{quote}</span>
      </motion.span>
    </span>
  )
}
