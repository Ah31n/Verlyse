
/**
 * MOTIFS — the recurring symbols of each Verlyse publication, reinterpreted
 * as living storytelling elements. Every glyph moves the way its meaning
 * moves: the clock hand turns, the waltz counts one-two-three, the flame
 * flickers, the feather sways, the steam rises, the birds cross the page.
 * Motion is never decorative — it repeats what the writing itself does.
 */

const S = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function MotifGlyph({ type, className = 'text-gold' }: { type: string; className?: string }) {
  switch (type) {
    /* 3:13 — the clock, the call, the hour; the hand keeps turning */
    case 'clock':
      return (
        <svg viewBox="0 0 48 48" className={`h-8 w-8 ${className}`} aria-hidden="true">
          <circle cx="24" cy="24" r="17" {...S} />
          <g className="animate-vm-tick" style={{ transformOrigin: '24px 24px' }}>
            <path d="M24 14v10l7 5" {...S} />
          </g>
          <path d="M24 34v4M24 10v4" {...S} strokeWidth={1} />
        </svg>
      )

    /* The Empty Waltz — one, two, three; the music that never stops */
    case 'waltz':
      return (
        <span className={`flex items-center gap-3 font-serif text-xl italic ${className}`} aria-hidden="true">
          <svg viewBox="0 0 40 20" className="h-4 w-8">
            <path d="M6 16V5" {...S} strokeWidth={1.1} className="animate-vm-breathe" />
            <path d="M20 16V5" {...S} strokeWidth={1.1} className="animate-vm-breathe" style={{ animationDelay: '0.4s' }} />
            <path d="M34 16V5" {...S} strokeWidth={1.1} className="animate-vm-breathe" style={{ animationDelay: '0.8s' }} />
          </svg>
          one, two, three.
        </span>
      )

    /* Their Voices Matter — the three lines, speaking in turn */
    case 'voices':
      return (
        <svg viewBox="0 0 64 22" className={`h-5 w-14 ${className}`} aria-hidden="true">
          <path d="M4 6h32" {...S} strokeWidth={1.1} className="animate-vm-breathe" />
          <path d="M4 12h48" {...S} strokeWidth={1.1} className="animate-vm-breathe" style={{ animationDelay: '0.5s' }} />
          <path d="M4 18h24" {...S} strokeWidth={1.1} className="animate-vm-breathe" style={{ animationDelay: '1s' }} />
        </svg>
      )

    /* Hope Becomes Mythology — the flame that never burned in another's heart */
    case 'flame':
      return (
        <svg viewBox="0 0 44 48" className={`h-8 w-7 ${className}`} aria-hidden="true">
          <path d="M22 4c7 9 13 14 13 24a13 13 0 1 1-26 0c0-10 6-15 13-24z" {...S} className="animate-vm-flicker" />
          <path d="M22 18c-4 5-7 7-7 12a7 7 0 0 0 14 0c0-5-3-7-7-12z" {...S} strokeWidth={1} className="animate-vm-flicker" style={{ animationDelay: '0.9s' }} />
        </svg>
      )

    /* A Student's Worth — the mihrab, the arch the poem returns to */
    case 'arch':
      return (
        <svg viewBox="0 0 56 30" className={`h-6 w-11 ${className}`} aria-hidden="true">
          <path d="M6 26V16a22 22 0 0 1 44 0v10" {...S} className="animate-vm-breathe" />
          <path d="M6 26h44" {...S} strokeWidth={1} />
        </svg>
      )

    /* Tasbih-e-Fatima — the beads of the tasbih, counted one by one */
    case 'beads':
      return (
        <svg viewBox="0 0 72 22" className={`h-5 w-16 ${className}`} aria-hidden="true">
          <path d="M4 14h64" {...S} strokeWidth={1} />
          {[10, 16, 22, 28, 34, 40, 46, 52, 58].map((x, i) => (
            <circle key={x} cx={x} cy="14" r="2" {...S} strokeWidth={1} className="animate-vm-breathe" style={{ animationDelay: `${i * 0.35}s` }} />
          ))}
        </svg>
      )

    /* Intellect Lost to Code — the machine's braces, and its cursor blinking */
    case 'code':
      return (
        <span className={`flex items-center gap-2 font-mono text-[11px] tracking-[0.24em] ${className}`} aria-hidden="true">
          <span className="text-base">{'{ }'}</span>
          <span className="opacity-70">// think beyond</span>
          <span className="inline-block h-3 w-px animate-vm-blink bg-current" />
        </span>
      )

    /* Forgive Me, Mother — the seal on the letter, breathing slowly */
    case 'letter':
      return (
        <svg viewBox="0 0 44 44" className={`h-8 w-8 ${className}`} aria-hidden="true">
          <circle cx="22" cy="22" r="15" {...S} className="animate-vm-breathe" />
          <path d="M22 14l8 8-8 8-8-8z" {...S} strokeWidth={1.1} className="animate-vm-breathe" style={{ animationDelay: '0.6s' }} />
        </svg>
      )

    /* Water Cat — the ripple, spreading out across the water */
    case 'ripple':
      return (
        <svg viewBox="0 0 48 40" className={`h-7 w-8 ${className}`} aria-hidden="true">
          <path d="M12 32a16 16 0 0 1 32 0" {...S} className="animate-vm-breathe" />
          <path d="M20 32a8 8 0 0 1 16 0" {...S} strokeWidth={1.1} className="animate-vm-breathe" style={{ animationDelay: '0.8s' }} />
          <path d="M28 32a3 3 0 0 1 6 0" {...S} strokeWidth={1} className="animate-vm-breathe" style={{ animationDelay: '1.6s' }} />
        </svg>
      )

    /* If Hope Were a Feather — the feather, swaying in the breeze */
    case 'feather':
      return (
        <svg viewBox="0 0 44 44" className={`h-8 w-8 ${className}`} aria-hidden="true">
          <g className="animate-vm-sway" style={{ transformOrigin: '8px 38px' }}>
            <path d="M8 38c0-18 10-30 32-34-1 22-14 30-30 34z" {...S} />
            <path d="M8 38C16 26 24 18 40 4" {...S} strokeWidth={1} />
            <path d="M14 32l14-14M20 26l12-12" {...S} strokeWidth={1} />
          </g>
        </svg>
      )

    /* The Horrors of CSA — the hand that protects, holding steady */
    case 'hand':
      return (
        <svg viewBox="0 0 44 44" className={`h-8 w-8 ${className}`} aria-hidden="true">
          <g className="animate-vm-breathe">
            <path d="M13 30v-14c0-1.6 1.2-2.8 2.8-2.8 1.6 0 2.8 1.2 2.8 2.8v12" {...S} />
            <path d="M18.6 30V16.5c0-1.6 1.2-2.8 2.8-2.8 1.6 0 2.8 1.2 2.8 2.8V28" {...S} />
            <path d="M24.2 28V15c0-1.6 1.2-2.8 2.8-2.8S29.8 13.4 29.8 15v13" {...S} />
            <path d="M29.8 28v-9c0-1.6 1.2-2.8 2.8-2.8s2.8 1.2 2.8 2.8v9c0 7-5 10-11 10s-11-3-11.4-8" {...S} />
          </g>
        </svg>
      )

    /* Khageena — the steam rising from the pan */
    case 'steam':
      return (
        <svg viewBox="0 0 52 26" className={`h-6 w-11 ${className}`} aria-hidden="true">
          <path d="M16 24c-2.5 4 2.5 6 0 10M28 24c-2.5 4 2.5 6 0 10M40 24c-2.5 4 2.5 6 0 10" {...S} strokeWidth={1.1} className="animate-vm-ascend" style={{ transformOrigin: '16px 24px', animationDelay: '0s' }} />
          <path d="M28 24c-2.5 4 2.5 6 0 10" {...S} strokeWidth={1.1} className="animate-vm-ascend" style={{ transformOrigin: '28px 24px', animationDelay: '0.9s' }} />
          <path d="M40 24c-2.5 4 2.5 6 0 10" {...S} strokeWidth={1.1} className="animate-vm-ascend" style={{ transformOrigin: '40px 24px', animationDelay: '1.8s' }} />
          <path d="M4 24h44" {...S} strokeWidth={1} />
        </svg>
      )

    /* Behind Every Headline — the dateline rule of the dispatch */
    case 'rule':
      return (
        <span className={`flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.30em] ${className}`} aria-hidden="true">
          <svg viewBox="0 0 36 16" className="h-3 w-7">
            <path d="M4 6h28" {...S} strokeWidth={1.1} className="animate-vm-breathe" />
            <path d="M4 12h20" {...S} strokeWidth={1.1} className="animate-vm-breathe" style={{ animationDelay: '0.5s' }} />
          </svg>
          dispatch
          <svg viewBox="0 0 36 16" className="h-3 w-7 -scale-x-100">
            <path d="M4 6h28" {...S} strokeWidth={1.1} className="animate-vm-breathe" />
            <path d="M4 12h20" {...S} strokeWidth={1.1} className="animate-vm-breathe" style={{ animationDelay: '0.5s' }} />
          </svg>
        </span>
      )

    /* Jaldi — the word itself, the underline re-drawing in a rush */
    case 'jaldi':
      return (
        <span className={`flex items-center gap-3 font-serif text-2xl font-light italic ${className}`} aria-hidden="true">
          jaldi
          <svg viewBox="0 0 30 12" className="h-2.5 w-6">
            <path
              d="M3 8c8-5 18-5 26-1"
              {...S}
              strokeWidth={1.2}
              strokeDasharray="120"
              className="animate-vm-write"
            />
          </svg>
        </span>
      )

    /* Failure — the steps one climbs by falling; the climb repeats */
    case 'steps':
      return (
        <svg viewBox="0 0 52 26" className={`h-6 w-12 ${className}`} aria-hidden="true">
          <path d="M4 22h14M4 22v-7h14M4 15v-7h14" {...S} strokeWidth={1.2} />
          <circle cx="18" cy="8" r="1.6" {...S} strokeWidth={1} className="animate-vm-ascend" style={{ transformOrigin: '18px 22px', animationDelay: '0.4s' }} />
        </svg>
      )

    /* My Last Breath — the cycle: flower, rain, wing, sun; birds cross */
    case 'cycle':
      return (
        <svg viewBox="0 0 120 22" className={`h-5 w-24 ${className}`} aria-hidden="true">
          <circle cx="10" cy="11" r="4" {...S} strokeWidth={1.1} />
          <path d="M6 11h8M10 7v8" {...S} strokeWidth={1} />
          <path d="M34 6l-4 8M34 6l4 8M28 12l-4 8M40 12l-4 8" {...S} strokeWidth={1} />
          <path d="M58 14c3-4 8-4 11 0M74 14c3-4 8-4 11 0" {...S} strokeWidth={1.1} className="animate-vm-breathe" />
          <circle cx="102" cy="10" r="4" {...S} strokeWidth={1.1} />
          <path d="M102 2v3M102 15v3M94 10h3M107 10h3M95.5 3.5l2 2M106.5 14.5l2 2M108.5 3.5l-2 2M97.5 14.5l-2 2" {...S} strokeWidth={1} />
        </svg>
      )

    /* The Garden Beyond My Tower — the garden she prays stays lush; petals fall */
    case 'garden':
      return (
        <svg viewBox="0 0 48 30" className={`h-6 w-10 ${className}`} aria-hidden="true">
          <path d="M24 26V13c0-4 3-6 6-6 3 0 6 2 6 6v13" {...S} className="animate-vm-breathe" />
          <path d="M24 13c-2-4-5-6-9-6" {...S} strokeWidth={1.1} />
          <path d="M24 26h16M24 13c2-4 5-6 9-6" {...S} strokeWidth={1.1} />
          <path d="M6 26h36" {...S} strokeWidth={1} />
          <circle cx="12" cy="8" r="1.4" {...S} strokeWidth={1} className="animate-vm-petal" />
        </svg>
      )

    /* The Arts Deserve Respect — the quotation, the greats' words */
    case 'quote':
      return (
        <svg viewBox="0 0 44 34" className={`h-7 w-9 ${className}`} aria-hidden="true">
          <path d="M14 10c-4 1-6 4-6 8v6h8v-8H8c0-2 1-4 4-5M32 10c-4 1-6 4-6 8v6h8v-8h-6c0-2 1-4 4-5" {...S} strokeWidth={1.2} className="animate-vm-breathe" />
        </svg>
      )

    default:
      return (
        <span aria-hidden="true" className={`text-gold ${className}`}>✦</span>
      )
  }
}

/** A quiet marginal annotation — a reader's margin note, grounded in the issue's own words. */
export const MARGINALIA: Record<string, string> = {
  clock: '3:13 AM',
  jaldi: 'jaldi — hurry',
  letter: 'read as a letter',
  cycle: 'back into the earth',
  garden: "i'll pray for her",
  code: '// the machine replies',
}

/* — the glyphs above are the only ambient; nothing drifts through reading */
