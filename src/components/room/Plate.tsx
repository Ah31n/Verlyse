// The Keeping Room — an editorial plate.
// Matte ivory card with a brass hairline, ghost folio numeral, serif title,
// mono metadata. This is the unit of the archive. When a folio is PULLED
// (focus / settle / next) the same plate turns face-on and enlarges into the
// full editorial face — excerpt, byline, metadata and the ENTER / RETURN
// decisions live ON the plate, exactly as in the Penpot frames (03 / 04 / 08).
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import type { PlateTransform } from '../../lib/room/geometry'
import type { Folio } from '../../lib/room/folios'
import type { RoomState } from '../../lib/room/state'

interface Props {
  folio: Folio
  state: RoomState
  transform: PlateTransform
  reduced: boolean
  read?: boolean
  onSelect: (index: number) => void
  onEnter: (index: number) => void
  /** focus → settle (the physical PULL) */
  onPull: () => void
  /** settle → back to focus / discovery */
  onBack: () => void
}

const min = (rt: string) => rt.replace(' min read', ' MIN').replace(' min', ' MIN').toUpperCase()

export default function Plate({
  folio, state, transform, reduced, read = false, onSelect, onEnter, onPull, onBack,
}: Props) {
  const presenting =
    transform.focused && (state === 'focus' || state === 'settle' || state === 'next')
  const isOrg = /media|verlyse|editor/i.test(folio.author)

  // A11y: when a plate is PULLED into its full editorial face, move focus to its
  // primary action so keyboard readers keep a visible focus anchor (the window
  // keydown listener continues to drive the flow either way).
  const presentingRef = useRef<HTMLElement | null>(null)
  useEffect(() => {
    if (!presenting) return
    const t = window.setTimeout(() => {
      presentingRef.current?.querySelector('button')?.focus({ preventScroll: true })
    }, 120)
    return () => window.clearTimeout(t)
  }, [presenting])

  return (
    <motion.div
      className="absolute left-1/2 top-1/2"
      style={{
        transform: transform.transform,
        opacity: transform.opacity,
        zIndex: transform.zIndex,
        pointerEvents: transform.pointerEvents,
        transformStyle: 'preserve-3d',
        transition: reduced
          ? 'transform 1ms linear, opacity 200ms linear'
          : 'transform 900ms cubic-bezier(0.22,1,0.36,1), opacity 600ms ease',
      }}
    >
      {presenting ? (
        /* ---------- full editorial face (frames 03 / 04 / 08) ---------- */
        <article
          ref={presentingRef}
          aria-label={`Folio ${folio.folio}: ${folio.title} by ${folio.author}`}
          className="relative flex h-[452px] w-[300px] flex-col overflow-hidden rounded-[3px] border border-[#7C6338] bg-[#F8F6F2] p-7 text-left shadow-[0_40px_90px_rgba(0,0,0,0.6)] md:h-[560px] md:w-[452px] md:p-12"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-8 -right-3 select-none font-serif text-[150px] font-semibold leading-none text-[#161412] opacity-[0.05] md:text-[190px]"
          >
            {folio.folio}
          </span>

          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[#7C6338] md:text-[12px]">
            Folio №{folio.folio}
          </p>

          <h2 className="mt-5 font-serif text-[30px] font-semibold leading-[1.04] text-[#241D18] md:mt-7 md:text-[46px]">
            {folio.title}
          </h2>

          <span className="mt-6 block h-px w-full bg-[#B89146] md:mt-8" aria-hidden />

          <p className="mt-5 font-serif text-[15px] italic leading-snug text-[#463F38] md:mt-7 md:text-[19px] md:leading-relaxed">
            {folio.excerpt}
          </p>

          <div className="mt-auto">
            {isOrg ? (
              <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.18em] text-[#5C1224] md:text-[13px]">
                {folio.author}
              </p>
            ) : (
              <p className="font-serif text-[20px] font-medium text-[#5C1224] md:text-[24px]">
                {folio.author}
              </p>
            )}
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#8A8178] md:text-[11px]">
              {folio.category.toUpperCase()}
              {state === 'settle' ? ` · ${folio.date}` : ''} · {min(folio.readingTime)}
            </p>

            <div className="mt-6 flex items-center gap-7 md:mt-8">
              {state === 'focus' && (
                <button
                  type="button"
                  onClick={onPull}
                  className="font-mono text-[12px] font-medium uppercase tracking-[0.22em] text-[#B89146] transition-colors hover:text-[#7C6338] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B89146]"
                >
                  Pull the plate
                </button>
              )}
              {state === 'settle' && (
                <>
                  <button
                    type="button"
                    onClick={() => onEnter(folio.index)}
                    className="font-mono text-[12px] font-medium uppercase tracking-[0.22em] text-[#B89146] transition-colors hover:text-[#7C6338] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B89146]"
                  >
                    Enter →
                  </button>
                  <button
                    type="button"
                    onClick={onBack}
                    className="font-mono text-[12px] uppercase tracking-[0.22em] text-[#8A8178] transition-colors hover:text-[#241D18] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8A8178]"
                  >
                    Return ←
                  </button>
                </>
              )}
              {state === 'next' && (
                <button
                  type="button"
                  onClick={() => onEnter(folio.index)}
                  className="font-mono text-[12px] font-medium uppercase tracking-[0.22em] text-[#B89146] transition-colors hover:text-[#7C6338] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B89146]"
                >
                  Read folio {folio.folio} →
                </button>
              )}
            </div>
          </div>

          {(folio.newest || read) && (
            <span className="absolute right-7 top-7 flex flex-col items-end gap-1.5 md:right-12 md:top-12">
              {folio.newest && (
                <span className="rounded-full bg-[#B89146] px-2 py-0.5 font-mono text-[9px] font-medium uppercase tracking-[0.16em] text-[#1E0B12]">
                  Newest
                </span>
              )}
              {read && (
                <span className="rounded-full border border-[#B89146] bg-[#F8F6F2] px-2 py-0.5 font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-[#7C6338]">
                  Read ✓
                </span>
              )}
            </span>
          )}
        </article>
      ) : (
        /* ---------- small shelf card (discovery / arrival / layers) ---------- */
        <motion.button
          type="button"
          aria-label={`Folio ${folio.folio}: ${folio.title} by ${folio.author}. ${
            transform.focused ? 'Press enter to read.' : 'Select this plate.'
          }`}
          aria-current={transform.focused ? 'true' : undefined}
          tabIndex={transform.pointerEvents === 'auto' ? 0 : -1}
          onClick={() => onSelect(folio.index)}
          onFocus={() => onSelect(folio.index)}
          className="room-plate group relative block h-[300px] w-[218px] rounded-[3px] border border-[#7C6338] bg-[#F8F6F2] text-left shadow-[0_30px_60px_rgba(0,0,0,0.55)] outline-none focus-visible:shadow-[0_0_0_2px_#161412,0_0_0_4px_#D9B978,0_30px_60px_rgba(0,0,0,0.6)]"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-5 -right-2 select-none font-serif text-[120px] font-semibold leading-none text-[#161412] opacity-[0.06]"
          >
            {folio.folio}
          </span>

          <span className="absolute left-5 top-4 font-serif text-[24px] italic text-[#7C6338]">№</span>
          <span className="absolute right-5 top-5 font-mono text-[15px] font-medium tracking-wide text-[#7C6338]">
            {folio.folio}
          </span>

          <span className="absolute left-5 right-5 top-[86px] font-serif text-[23px] font-semibold leading-[1.08] text-[#241D18]">
            {folio.title}
          </span>

          {transform.focused && (
            <span className="absolute left-5 right-5 top-[168px] border-t border-[#B89146]" aria-hidden />
          )}

          <span className="absolute bottom-5 left-5 right-5">
            <span className="block font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[#B89146]">
              {folio.category}
            </span>
            <span className="mt-1 block truncate font-sans text-[11px] text-[#5b544b]">{folio.author}</span>
          </span>

          {folio.newest && (
            <span className="absolute -top-3 left-4 rounded-full bg-[#B89146] px-2 py-0.5 font-mono text-[9px] font-medium uppercase tracking-[0.16em] text-[#1E0B12]">
              Newest
            </span>
          )}
          {read && (
            <span className="absolute -top-3 right-4 rounded-full border border-[#B89146] bg-[#161412]/80 px-2 py-0.5 font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-[#D9B978]">
              Read ✓
            </span>
          )}
        </motion.button>
      )}
    </motion.div>
  )
}
