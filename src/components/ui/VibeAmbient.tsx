import type { Vibe } from '../../data/content'

/**
 * VibeAmbient — the atmosphere each feature carries with it.
 * Everything here is still or breathing: light, frames, a single label.
 * Nothing floats, nothing pulses, nothing competes with the words.
 * Decorative, aria-hidden, and strictly inside the house palette.
 */

export default function VibeAmbient({ vibe, section }: { vibe: Vibe; section: 'hero' | 'body' }) {
  if (section === 'body') {
    /* the body is the writer's — no ambience at all, only the world's
       drawn texture (WorldTexture) and the words themselves */
    return null
  }

  switch (vibe) {
    case 'horror':
      /* a slow, breathing dark vignette — the room at 3:13 */
      return (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 animate-vm-breathe bg-[radial-gradient(125%_100%_at_50%_38%,transparent_52%,rgba(6,1,4,0.6))]" />
      )
    case 'gallery':
      /* an inner frame, like a painting hung on a wall */
      return <div aria-hidden="true" className="pointer-events-none absolute inset-5 border border-gold/25 md:inset-8" />
    case 'serene':
      /* a still gold hairline — the light of the room, unmoving */
      return (
        <div aria-hidden="true" className="pointer-events-none absolute bottom-24 left-[clamp(1.75rem,5.5vw,4.75rem)] h-px w-44 bg-[linear-gradient(90deg,transparent,#B89146,transparent)]" />
      )
    case 'mechanical':
      return (
        <span aria-hidden="true" className="pointer-events-none absolute right-[clamp(1.75rem,5.5vw,4.75rem)] top-28 hidden font-mono text-[10px] uppercase tracking-[0.28em] text-white/55 md:inline">
          Think beyond
        </span>
      )
    case 'newsprint':
      return (
        <span aria-hidden="true" className="pointer-events-none absolute right-[clamp(1.75rem,5.5vw,4.75rem)] top-28 hidden rotate-90 font-mono text-[10px] uppercase tracking-[0.28em] text-white/55 md:inline">
          AsiaNews dispatch
        </span>
      )
    case 'urgent':
      /* a still gold rule — urgency by line, not by pulse */
      return (
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
      )
    default:
      return null
  }
}
