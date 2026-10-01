import { clsx } from 'clsx'

interface AboutHeaderProps {
  className?: string
}

/**
 * AboutHeader — The Colophon & Institutional Record Masthead
 */
export function AboutHeader({ className = '' }: AboutHeaderProps) {
  return (
    <header className={clsx('border-b border-gold/30 pb-8 pt-6', className)}>
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-gold" />
        <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-gold">
          The Colophon & Record
        </span>
      </div>
      <h1 className="mt-3 font-serif text-4xl md:text-6xl font-light text-ivory tracking-tight">
        About Verlyse Media
      </h1>
      <p className="mt-2 font-serif text-base md:text-lg italic text-white/70 max-w-2xl">
        Founded in 2026 by Alina Javed. Dedicated to cultivating literary and visual excellence through deliberate curation and spatial experiences.
      </p>
    </header>
  )
}

export function FoundingPrinciples({ className = '' }: { className?: string }) {
  const principles = [
    { num: 'I', title: 'Authentic Authorship', desc: 'Every word, verse, and visual work belongs truthfully to its creator. We credit every writer and artist by name and handle.' },
    { num: 'II', title: 'Tactile Digital Curation', desc: 'Digital reading should feel as warm and deliberate as fine paper, quiet ink, and aged brass.' },
    { num: 'III', title: 'Global Circulation', desc: 'Literature knows no borders. We elevate voices across continents and cultural traditions.' },
  ]

  return (
    <section className={clsx('my-16 border-t border-gold/20 pt-12', className)}>
      <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-gold">
        Editorial Ethos
      </span>
      <h2 className="mt-2 font-serif text-3xl font-light text-ivory">
        Founding Principles
      </h2>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {principles.map((p) => (
          <div key={p.num} className="border border-white/10 bg-[#160309] p-6">
            <span className="font-serif text-2xl font-light text-gold">{p.num}</span>
            <h3 className="mt-3 font-serif text-xl font-light text-ivory">{p.title}</h3>
            <p className="mt-2 font-serif text-xs italic leading-relaxed text-white/70">{p.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
