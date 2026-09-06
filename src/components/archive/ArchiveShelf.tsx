// VerlyseWorld — the archive shelf. One reusable spatial stage: a brass thread,
// folio plates in deterministic depth, keyboard attention (← → choose, Enter
// pull, Esc return), reduced-motion and no-WebGL safe. This is the connective
// tissue between /articles, /categories, /creators and /ambassadors.
import { useEffect, useMemo, useRef, type KeyboardEvent } from 'react'
import { useReducedMotion } from 'framer-motion'
import FolioPlate from './FolioPlate'
import { ARTICLES } from '../../data/content'
import {
  shelfStyle, shelfStageHeight, SHELF_ROWS,
  type ArchiveLayout, type ShelfContext,
} from '../../lib/archive/geometry'

interface Props {
  /** the articles presented on the shelf (registry order preserved) */
  articles: typeof ARTICLES
  focus: number
  onFocusChange: (i: number) => void
  layout: ArchiveLayout
  /** optional spatial filter — members brighten, others recede */
  context?: ShelfContext
  /** how many neighbours stay visible around the focused plate */
  visibility?: number
  /** compact variant (used inside category/creator pages) */
  compact?: boolean
}

export default function ArchiveShelf({
  articles, focus, onFocusChange, layout, context = {}, visibility, compact = false,
}: Props) {
  const reduced = useReducedMotion() === true
  const stageRef = useRef<HTMLDivElement>(null)
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const count = articles.length

  // registry folio number for each presented article (stable even when filtered)
  const registryFolio = useMemo(
    () => articles.map((a) => ARTICLES.findIndex((x) => x.id === a.id) + 1),
    [articles],
  )

  // clamp focus if the list shrinks
  useEffect(() => {
    if (focus >= count) onFocusChange(Math.max(0, count - 1))
  }, [count, focus, onFocusChange])

  const horizontal = layout !== 'mobile'
  const stageH = shelfStageHeight(layout, reduced)

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      const nf = Math.min(count - 1, focus + 1)
      onFocusChange(nf)
      linkRefs.current[nf]?.focus()
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      const nf = Math.max(0, focus - 1)
      onFocusChange(nf)
      linkRefs.current[nf]?.focus()
    } else if (e.key === 'Escape') {
      stageRef.current?.blur()
    }
  }

  const isDesktopStacks = layout === 'desktop' && !reduced

  return (
    <div className={compact ? '' : 'relative overflow-hidden'}>
      {/* the brass thread — on tablet as a horizontal rail, on mobile as the
          vertical thread beneath the plate in hand. Desktop is the stacks. */}
      {!isDesktopStacks && (
        <div
          aria-hidden
          className={`pointer-events-none absolute left-1/2 top-1/2 ${
            horizontal
              ? 'h-px w-[min(920px,88vw)] bg-gradient-to-r from-transparent via-[#D9B978]/80 to-transparent'
              : 'h-[56vh] w-px bg-gradient-to-b from-transparent via-[#D9B978]/70 to-transparent'
          }`}
          style={{ transform: 'translate(-50%,-50%)' }}
        />
      )}

      {/* the stage */}
      <div
        ref={stageRef}
        tabIndex={0}
        role="group"
        aria-label={`The archive — ${count} folios ${isDesktopStacks ? 'across three shelves' : 'on the thread'}`}
        onKeyDown={onKey}
        className="relative outline-none"
        style={{
          height: stageH,
          perspective: reduced ? undefined : '1400px',
        }}
      >
        {/* the stacks' back wall — a faint wine glow settling behind the shelves */}
        {isDesktopStacks && (
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[1100px]"
            style={{
              transform: 'translate(-50%,-50%)',
              background:
                'radial-gradient(60% 55% at 50% 45%, rgba(92,18,36,0.28), rgba(22,5,10,0.32) 70%, transparent 100%)',
            }}
          />
        )}

        {/* the three shelf boards — brass hairlines where each shelf runs */}
        {isDesktopStacks && (
          <div aria-hidden className="pointer-events-none absolute inset-0">
            {SHELF_ROWS.map((r) => (
              <div
                key={r.y}
                className="absolute left-1/2 h-px w-[1040px] bg-gradient-to-r from-transparent via-[#7C6338]/75 to-transparent"
                style={{ transform: `translate(-50%, calc(-50% + ${r.y + 152}px))` }}
              />
            ))}
            {/* a second, fainter board line — the shelf's front edge */}
            {SHELF_ROWS.map((r) => (
              <div
                key={`${r.y}-b`}
                className="absolute left-1/2 h-px w-[1040px] bg-gradient-to-r from-transparent via-[#D9B978]/25 to-transparent"
                style={{ transform: `translate(-50%, calc(-50% + ${r.y + 158}px))` }}
              />
            ))}
          </div>
        )}

        <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
          {articles.map((a, i) => (
            <FolioPlate
              key={a.id}
              article={a}
              folio={registryFolio[i]}
              total={ARTICLES.length}
              focused={i === focus}
              style={shelfStyle(i, focus, layout, reduced, { ...context, visibility })}
              reduced={reduced}
              onFocusChange={onFocusChange}
              linkRef={(el) => { linkRefs.current[i] = el }}
            />
          ))}
        </div>
      </div>

      {/* the vocabulary — one quiet line */}
      <p className="mt-1 text-center font-mono text-[10px] uppercase tracking-[0.26em] text-ivory/55">
        <span className="hidden md:inline">
          {isDesktopStacks
            ? `← → choose a folio · Enter pulls · three shelves · №01 — №${String(ARTICLES.length).padStart(2, '0')}`
            : `← → choose a folio · Enter pulls · the thread runs №01 — №${String(ARTICLES.length).padStart(2, '0')}`}
        </span>
        <span className="md:hidden">Tap a folio · the thread runs №01 — №{String(ARTICLES.length).padStart(2, '0')}</span>
      </p>
    </div>
  )
}
