// The Keeping Room — plate placement for the CSS-3D archive.
// Plates sit on a restrained arc in depth. Discovery arrays the whole archive
// around the set centre; focus isolates one plate. All transforms are
// deterministic, keyboard-safe, and bake in the element centering.
import type { RoomState } from './state'

export interface PlateTransform {
  transform: string
  opacity: number
  zIndex: number
  pointerEvents: 'auto' | 'none'
  focused: boolean
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

export type Layout = 'mobile' | 'tablet' | 'desktop'

export function layoutForWidth(w: number): Layout {
  if (w < 560) return 'mobile'
  if (w < 1024) return 'tablet'
  return 'desktop'
}

// Every plate is anchored at left:50% / top:50% with its own top-left at the
// stage centre, so each transform begins by shifting back by half its size.
const C = (inner: string) => `translate(-50%, -50%) ${inner}`

/** Context for the discovery-layer states (category filter, creator dossier). */
export interface RoomTransformContext {
  /** folio indices belonging to the active category filter */
  categorySet?: Set<number>
  /** folio indices belonging to the dossier creator */
  authorSet?: Set<number>
  /** rank of each author folio within the creator's shelf */
  authorRank?: Record<number, number>
  authorCount?: number
}

function discoveryPlacement(
  offset: number, i: number, isFocus: boolean, layout: Layout,
): PlateTransform {
  if (layout === 'mobile') {
    const z = -Math.abs(offset) * 150
    return {
      transform: C(`translate3d(${offset * 10}px, ${offset * 24}px, ${z}px) rotateZ(${offset % 2 ? 0.6 : -0.6}deg)`),
      opacity: isFocus ? 1 : clamp(0.55 - Math.abs(offset) * 0.06, 0.12, 0.5),
      zIndex: 100 - Math.abs(offset),
      pointerEvents: 'auto',
      focused: isFocus,
    }
  }
  const angStep = layout === 'tablet' ? 0.17 : 0.14
  const R = layout === 'tablet' ? 720 : 1000
  const ang = offset * angStep
  const x = Math.sin(ang) * R
  const z = (Math.cos(ang) - 1) * R
  const ry = (-ang * 180) / Math.PI
  const lifted = isFocus ? -30 : (i % 2 ? 10 : -10)
  const opacity = isFocus ? 1 : clamp(0.9 - Math.abs(ang) * 0.62, 0.26, 0.82)
  return {
    transform: C(`translate3d(${x.toFixed(1)}px, ${lifted}px, ${z.toFixed(1)}px) rotateY(${ry.toFixed(1)}deg) rotateZ(${offset % 2 ? -0.7 : 0.7}deg)`),
    opacity,
    zIndex: isFocus ? 200 : 100 - Math.abs(offset),
    pointerEvents: 'auto',
    focused: isFocus,
  }
}

export function plateTransform(
  state: RoomState,
  i: number,
  focus: number,
  count: number,
  layout: Layout,
  extra: RoomTransformContext = {},
): PlateTransform {
  const offset = i - focus
  const abs = Math.abs(offset)
  const isFocus = offset === 0

  if (state === 'discovery') {
    return discoveryPlacement(offset, i, isFocus, layout)
  }

  if (state === 'return') {
    // The story is back in its place: plates stand face-on in a neat restored
    // row (Penpot frame 09) — no fan, no carousel, the read plate brightest.
    const span = layout === 'mobile' ? 230 : layout === 'tablet' ? 300 : 380
    const x = offset * span
    const z = isFocus ? 40 : -Math.min(160, Math.abs(offset) * 42)
    const opacity = isFocus ? 1 : clamp(0.62 - Math.abs(offset) * 0.07, 0.22, 0.55)
    return {
      transform: C(`translate3d(${x.toFixed(1)}px, ${isFocus ? -12 : 6}px, ${z}px)`),
      opacity,
      zIndex: isFocus ? 200 : 100 - Math.abs(offset),
      pointerEvents: 'auto',
      focused: isFocus,
    }
  }

  if (state === 'category') {
    // Filtered archive: matching plates keep their place on the arc and brighten;
    // the rest recede almost fully. Stays spatial — never a list.
    const base = discoveryPlacement(offset, i, isFocus, layout)
    const member = extra.categorySet?.has(i) ?? true
    return member
      ? { ...base, opacity: 1, zIndex: 150 - Math.abs(offset) }
      : { ...base, opacity: 0.05, pointerEvents: 'none' }
  }

  if (state === 'dossier') {
    // A creator's folios gathered in a small focused shelf; others fall away.
    const member = extra.authorSet?.has(i) ?? false
    if (!member) {
      return {
        transform: C(`translate3d(${offset * 620}px,0,-820px) rotateY(${clamp(offset * 16, -60, 60)}deg)`),
        opacity: 0, zIndex: 1, pointerEvents: 'none', focused: false,
      }
    }
    const rank = extra.authorRank?.[i] ?? 0
    const total = extra.authorCount ?? 1
    const dx = (rank - (total - 1) / 2) * (layout === 'mobile' ? 200 : 300)
    const lift = rank === 0 ? 0 : 30
    return {
      transform: C(`translate3d(${dx}px, ${lift}px, ${rank === 0 ? 240 : 60}px) rotateY(${(rank - (total - 1) / 2) * -6}deg)`),
      opacity: 1,
      zIndex: rank === 0 ? 200 : 150 - rank,
      pointerEvents: 'auto',
      focused: rank === 0,
    }
  }

  if (state === 'focus' || state === 'settle' || state === 'next') {
    // One plate is pulled off the thread and stands face-on, large and bright;
    // its neighbours mute to flanking blocks. In NEXT the offered plates stay
    // a little more visible (frame 08); in FOCUS / SETTLE they fall very dark.
    const focusZ = state === 'settle' ? 300 : 260
    const fan = layout === 'mobile' ? 300 : layout === 'tablet' ? 430 : 600
    const x = offset * fan
    const z = isFocus ? focusZ : -Math.max(260, 520 - abs * 30) - abs * 90
    const ry = isFocus ? 0 : clamp(offset * (layout === 'mobile' ? 22 : 12), -50, 50)
    const neighbourOpacity = state === 'next' ? 0.4 : 0.12
    const opacity = isFocus ? 1 : clamp(neighbourOpacity - (abs - 1) * 0.03, 0.05, neighbourOpacity)
    return {
      transform: C(`translate3d(${x.toFixed(1)}px, 0px, ${z.toFixed(1)}px) rotateY(${ry.toFixed(1)}deg)`),
      opacity,
      zIndex: isFocus ? 220 : 100 - abs,
      pointerEvents: isFocus ? 'auto' : 'none',
      focused: isFocus,
    }
  }

  if (state === 'arrival') {
    const edge = i < 2 ? -1 : i > count - 3 ? 1 : 0
    const x = edge * 620
    return {
      transform: C(`translate3d(${x}px, 150px, -760px) rotateY(${edge * 16}deg) rotateZ(${edge * 4}deg)`),
      opacity: edge === 0 ? 0 : 0.14,
      zIndex: 1,
      pointerEvents: 'none',
      focused: false,
    }
  }

  if (state === 'ending') {
    // The room dims to the wine threshold; plates retreat behind the closing
    // screen (Penpot frame 07 is an editorial wine card, not the plates).
    return {
      transform: C('translate3d(0px, 0px, -900px)'),
      opacity: 0,
      zIndex: 1,
      pointerEvents: 'none',
      focused: false,
    }
  }

  // entry: the wine threshold fills the screen before handing to reading
  return {
    transform: isFocus ? C('translate3d(0,0,-600px)') : C('translate3d(0,0,-900px)'),
    opacity: 0,
    zIndex: 1,
    pointerEvents: 'none',
    focused: false,
  }
}
