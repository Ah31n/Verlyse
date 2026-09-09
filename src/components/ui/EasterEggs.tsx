import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Link } from 'react-router-dom'
import { LEDGER, stampDate, writtenDate } from '../../data/content'

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
/* The library card — an old catalogue card kept in the colophon.       */
/* Ivory stock, wine ink, brass punch; every field on it is read from   */
/* the ledger, right down to the last date the shelf was stamped.        */
/* ------------------------------------------------------------------ */
export function LibraryCard({ to = '/about', linkLabel = 'Read the colophon →' }: { to?: string; linkLabel?: string }) {
  const [open, setOpen] = useState(false)
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : { rotate: -1.4 }}
      whileHover={reduce ? undefined : { rotate: 0, y: -3 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-[min(21rem,calc(100vw-2.5rem))]"
    >
      {/* the index-card ruling, faint under the text */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(180deg,transparent,transparent_27px,rgba(92,18,36,0.10)_27px,rgba(92,18,36,0.10)_28px)]"
      />
      <div className="relative border border-[#B89146]/60 bg-[#F2EADA] p-5 shadow-[0_16px_40px_rgba(6,1,4,0.45)]">
        <span aria-hidden="true" className="grain-paper pointer-events-none absolute inset-0 opacity-[0.3]" />
        {/* the brass punch-hole, top-left, as on real catalogue cards */}
        <span aria-hidden="true" className="absolute left-4 top-3 h-2 w-2 rounded-full border border-[#2A0F18]/30 bg-[#E6DCC8]" />
        <div className="relative flex items-center justify-between gap-3">
          <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-[#7C6338]">Verlyse Media · shelf register</p>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="library-card-detail"
            aria-label={open ? 'Close the library card' : 'Turn the library card over'}
            className="shrink-0 border border-[#2A0F18]/30 px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.24em] text-[#2A0F18] transition-colors duration-300 hover:border-[#7C6338] hover:text-[#7C6338] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#7C6338]"
          >
            {open ? 'face −' : 'reverse +'}
          </button>
        </div>
        <p className="relative mt-3 font-serif text-[1.65rem] font-semibold leading-none tracking-[0.06em] text-[#2A0F18]">VERLYSE <em className="font-light italic text-[#7C6338]">MEDIA</em></p>
        <p className="relative mt-1.5 font-mono text-[9px] uppercase tracking-[0.26em] text-[#2A0F18]/70">Where Vision Becomes A Voice</p>
        <div className="relative mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-[#2A0F18]/15 pt-3 font-mono text-[9px] uppercase leading-[1.7] tracking-[0.18em] text-[#2A0F18]/75">
          <p>Dewey <span className="text-[#7C6338]">808.8</span></p>
          <p>Accession <span className="text-[#7C6338]">VM · {stampDate(LEDGER.openedOn).slice(-4)} · 01–{LEDGER.features}</span></p>
          <p>Issue № {LEDGER.issueNo} — opened {stampDate(LEDGER.openedOn)}</p>
          <p>Latest folio {stampDate(LEDGER.latestOn)}</p>
        </div>
        <motion.div
          id="library-card-detail"
          initial={false}
          animate={open ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden"
          aria-hidden={!open}
        >
          <div className="mt-3 border-t border-[#2A0F18]/15 pt-3 font-mono text-[9px] uppercase leading-[2] tracking-[0.18em] text-[#2A0F18]/70">
            <p>Last borrowed — never overdue · {LEDGER.features} of {LEDGER.features} pages read</p>
            <p>{LEDGER.creators} writers credited · {LEDGER.appreciations.toLocaleString('en-US')} appreciations · {LEDGER.conversations} conversations</p>
            <p>Notarised {writtenDate(LEDGER.openedOn)} — the shelf grows one voice at a time</p>
            <p className="mt-2 font-serif text-sm normal-case italic tracking-normal text-[#5C1224]">
              {LEDGER.features} features, {LEDGER.creators} writers, one room — and the next card could be yours.
            </p>
            <Link to={to} className="mt-3 inline-block border-b border-[#7C6338] pb-0.5 font-mono text-[9px] uppercase tracking-[0.24em] text-[#7C6338] no-underline transition-colors hover:text-[#2A0F18]">
              {linkLabel}
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
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
      onFocus={() => setSee(true)}
      onBlur={() => setSee(false)}
      tabIndex={0}
      role="note"
      className={`relative inline-block cursor-help border-b border-dotted border-gold/40 pb-0.5 transition-colors duration-500 hover:border-gold focus-visible:outline focus-visible:outline-1 focus-visible:outline-gold ${className}`}
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
