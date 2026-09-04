// VerlyseWorld — the shared spatial archive geometry.
// One deterministic placement system reused by /articles and /categories.
// The archive is a physical stacks environment:
//   desktop  → three shelves receding in depth, folios standing on them
//   tablet   → portrait editorial shelf (two-column stagger, horizontal thread)
//   mobile   → one plate in hand, vertical thread
// All transforms are deterministic (registry order), keyboard-safe, and
// collapse to a quiet responsive arrangement under prefers-reduced-motion.
export type ArchiveLayout = 'mobile' | 'tablet' | 'desktop'

export function archiveLayoutForWidth(w: number): ArchiveLayout {
  if (w < 560) return 'mobile'
  if (w < 1024) return 'tablet'
  return 'desktop'
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))
// Every plate is anchored at left:50% / top:50%, so each transform begins by
// shifting back half its size before the spatial placement.
const C = (inner: string) => `translate(-50%, -50%) ${inner}`

/** Desktop stacks — three shelves. y = shelf height, z = depth, base = resting
 *  opacity of the folios on that shelf. Exported so the stage can draw the
 *  shelf boards in exactly the same place. */
export const SHELF_ROWS = [
  { y: -156, z: -260, base: 0.6 },   // far shelf
  { y: 0, z: -130, base: 0.7 },      // mid shelf
  { y: 156, z: 10, base: 0.82 },     // near shelf
] as const
export const SHELF_SPACING = 176

/** Which shelf an index stands on (7 · 7 · 5 across the stacks). */
export const shelfRowOf = (i: number) => (i < 7 ? 0 : i < 14 ? 1 : 2)

export interface PlateStyle {
  transform: string
  opacity: number
  zIndex: number
  pointerEvents: 'auto' | 'none'
}

export interface ShelfContext {
  /** indices (into the presented list) belonging to the active filter — the
   *  archive reorganizes: members brighten/approach, others recede. */
  memberSet?: Set<number>
  /** plates further than this offset fully recede (one-plate-in-hand model).
   *  Only applies when no filter is active. */
  visibility?: number
}

/** Position one plate on the desktop stacks (shelf row, column, depth). */
function desktopShelf(
  i: number,
  isFocus: boolean,
  hidden: boolean,
  abs: number,
  filterActive: boolean,
): PlateStyle {
  const row = shelfRowOf(i)
  const r = SHELF_ROWS[row]
  const inRow = row < 2 ? i - row * 7 : i - 14
  const cols = row < 2 ? 7 : 5
  const x = (inRow - (cols - 1) / 2) * SHELF_SPACING
  const z = r.z + (isFocus ? 150 : 0)
  const y = r.y + (isFocus ? -22 : 0)
  const ry = isFocus ? 0 : inRow % 2 ? 4 : -4
  const opacity = isFocus
    ? 1
    : filterActive
      ? clamp(r.base + 0.06 - abs * 0.05, 0.42, 0.9)
      : hidden
        ? 0.05
        : clamp(r.base - abs * 0.06, 0.14, r.base)
  return {
    transform: C(`translate3d(${x}px, ${y}px, ${z}px) rotateY(${ry}deg)`),
    opacity,
    zIndex: isFocus ? 200 : 90 + row,
    pointerEvents: hidden ? 'none' : 'auto',
  }
}

export function shelfStyle(
  i: number,
  focus: number,
  layout: ArchiveLayout,
  reduced: boolean,
  extra: ShelfContext = {},
): PlateStyle {
  const offset = i - focus
  const abs = Math.abs(offset)
  const isFocus = offset === 0
  const filterActive = !!extra.memberSet
  const member = filterActive ? extra.memberSet!.has(i) : true
  const vis = extra.visibility ?? 99
  const hidden = abs > vis

  // --- A filter is active: the archive reorganizes itself. Members stay
  // bright and approach (never hidden by visibility); non-members recede to
  // ghosts. This is a spatial filter — never a list. ---
  if (filterActive) {
    if (!member) {
      return {
        transform: C(`translate3d(${offset * 40}px, ${abs * 26}px, -640px)`),
        opacity: 0.05,
        zIndex: 1,
        pointerEvents: 'none',
      }
    }
    // member — bright, keeps its place on the shelves, approaches a little
    if (reduced) {
      return {
        transform: C(`translate3d(0px, ${offset * 92}px, 0)`),
        opacity: isFocus ? 1 : clamp(0.9 - abs * 0.08, 0.4, 0.9),
        zIndex: 100 - abs,
        pointerEvents: 'auto',
      }
    }
    if (layout === 'mobile') {
      const dy = offset * 88
      return {
        transform: C(`translate3d(${offset * 7}px, ${dy}px, ${-abs * 120}px) rotateZ(${offset % 2 ? 1.4 : -1.4}deg)`),
        opacity: isFocus ? 1 : clamp(0.85 - abs * 0.09, 0.4, 0.85),
        zIndex: 100 - abs,
        pointerEvents: 'auto',
      }
    }
    if (layout === 'tablet') {
      const col = offset % 2 === 0 ? -1 : 1
      const row = Math.floor(abs / 2)
      const x = col * 235
      const y = row * 104 + (isFocus ? -8 : 0)
      const z = isFocus ? 70 : -row * 130 - (offset % 2 ? 30 : 0)
      return {
        transform: C(`translate3d(${x}px, ${y}px, ${z}px) rotateY(${isFocus ? 0 : col * -5}deg)`),
        opacity: isFocus ? 1 : clamp(0.85 - row * 0.12, 0.4, 0.85),
        zIndex: isFocus ? 200 : 100 - row,
        pointerEvents: 'auto',
      }
    }
    // desktop member — on the stacks, brighter floor
    return desktopShelf(i, isFocus, hidden, abs, true)
  }

  // --- No filter: the plain archive. ---
  if (reduced) {
    // The same publication, no depth: a quiet responsive arrangement.
    if (layout === 'mobile') {
      return {
        transform: C(`translate3d(0px, ${offset * 92}px, 0)`),
        opacity: isFocus ? 1 : clamp(0.8 - abs * 0.16, 0.35, 0.8),
        zIndex: 100 - abs,
        pointerEvents: 'auto',
      }
    }
    if (layout === 'tablet') {
      const col = i % 2 === 0 ? -1 : 1
      const row = Math.floor(i / 2)
      return {
        transform: C(`translate3d(${col * 190}px, ${row * 132}px, 0)`),
        opacity: isFocus ? 1 : clamp(0.8 - row * 0.09, 0.4, 0.8),
        zIndex: 100 - row,
        pointerEvents: 'auto',
      }
    }
    const span = 232
    return {
      transform: C(`translate3d(${offset * span}px, 0, 0)`),
      opacity: isFocus ? 1 : clamp(0.85 - abs * 0.11, 0.4, 0.85),
      zIndex: 100 - abs,
      pointerEvents: 'auto',
    }
  }

  if (layout === 'mobile') {
    // One plate in hand; the thread runs vertical beneath it.
    const dy = offset * 88
    const z = -abs * 150
    const rz = offset % 2 ? 1.4 : -1.4
    return {
      transform: C(`translate3d(${offset * 7}px, ${dy}px, ${z}px) rotateZ(${rz}deg)`),
      opacity: isFocus ? 1 : hidden ? 0.05 : clamp(0.62 - abs * 0.12, 0.1, 0.5),
      zIndex: 100 - abs,
      pointerEvents: hidden ? 'none' : 'auto',
    }
  }

  if (layout === 'tablet') {
    // Portrait editorial shelf: a two-column stagger along a horizontal thread.
    const col = offset % 2 === 0 ? -1 : 1
    const row = Math.floor(abs / 2)
    const x = col * 235
    const y = row * 104 + (isFocus ? -8 : 0)
    const z = isFocus ? 70 : -row * 130 - (offset % 2 ? 30 : 0)
    const ry = isFocus ? 0 : col * -5
    return {
      transform: C(`translate3d(${x}px, ${y}px, ${z}px) rotateY(${ry}deg)`),
      opacity: isFocus ? 1 : hidden ? 0.06 : clamp(0.72 - row * 0.14, 0.16, 0.6),
      zIndex: isFocus ? 200 : 100 - row,
      pointerEvents: hidden ? 'none' : 'auto',
    }
  }

  // Desktop — the stacks: three shelves receding in depth, folios standing
  // on them; the focused folio comes forward and lifts off its shelf.
  return desktopShelf(i, isFocus, hidden, abs, false)
}

/** Stage height per layout — the archive frame the plates live in. */
export function shelfStageHeight(layout: ArchiveLayout, reduced: boolean): number {
  if (layout === 'mobile') return reduced ? 820 : 620
  if (layout === 'tablet') return reduced ? 1100 : 720
  return reduced ? 460 : 640
}
