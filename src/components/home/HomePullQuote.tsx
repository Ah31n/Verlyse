import { clsx } from 'clsx'

interface HomePullQuoteProps {
  quote: string
  attribution?: string
  role?: string
  className?: string
}

/**
 * HomePullQuote — Literary Interlude & Philosophical Pause
 */
export function HomePullQuote({
  quote = 'Every story begins as a whisper in a silent room before it finds the courage to become a voice.',
  attribution = 'Alina Javed',
  role = 'Founder & Editor-in-Chief',
  className = '',
}: HomePullQuoteProps) {
  return (
    <aside
      className={clsx(
        'relative my-24 md:my-36 overflow-hidden border-y border-gold/30 bg-[#160309]/60 px-6 py-16 md:px-16 md:py-24 text-center',
        className
      )}
    >
      <div className="mx-auto max-w-3xl">
        <span className="font-serif text-5xl md:text-7xl text-gold/30 block select-none leading-none">
          “
        </span>
        <blockquote className="font-serif text-2xl md:text-4xl font-light italic leading-relaxed text-ivory">
          {quote}
        </blockquote>
        <div className="mt-8 flex flex-col items-center gap-1 font-mono text-[10px] uppercase tracking-[0.24em]">
          <span className="text-gold">{attribution}</span>
          {role && <span className="text-white/40">{role}</span>}
        </div>
      </div>
    </aside>
  )
}
