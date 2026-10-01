import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import type { Article } from '../../data/content'

interface HomeFolioSequenceProps {
  articles: Article[]
  className?: string
}

/**
 * HomeFolioSequence — Curated Sequential Folio Plates
 */
export function HomeFolioSequence({ articles, className = '' }: HomeFolioSequenceProps) {
  return (
    <section className={clsx('mt-20 md:mt-32', className)}>
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gold/30 pb-4">
        <div>
          <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-gold">
            Newest Accessions
          </span>
          <h2 className="mt-2 font-serif text-3xl md:text-4xl font-light text-ivory">
            The Living Folio Shelf
          </h2>
        </div>
        <Link
          to="/articles"
          className="mt-4 md:mt-0 font-mono text-[10px] uppercase tracking-[0.2em] text-gold hover:underline flex items-center gap-1.5"
        >
          <span>View Complete Catalog (19)</span>
          <span>→</span>
        </Link>
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.slice(1, 4).map((art, idx) => (
          <article
            key={art.id}
            string="spotlight"
            string-id={`home-folio-${art.id}`}
            className="group flex flex-col justify-between border border-white/15 bg-[#18040B] p-6 transition-all duration-500 hover:border-gold/60 hover:bg-[#20050E]"
          >
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="font-mono text-[9px] uppercase tracking-widest text-gold">
                  № {String(idx + 2).padStart(2, '0')}
                </span>
                <span className="font-mono text-[8px] uppercase tracking-wider text-white/50">
                  {art.category}
                </span>
              </div>

              <div className="mt-4 aspect-[16/10] overflow-hidden border border-white/10 bg-black/40">
                <img
                  src={art.cover}
                  alt={art.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover grayscale-[25%] transition-transform duration-700 group-hover:scale-105 group-hover:grayscale-0"
                />
              </div>

              <h3 className="mt-5 font-serif text-2xl font-light text-ivory group-hover:text-gold transition-colors">
                {art.title}
              </h3>

              <p className="mt-3 font-serif text-sm italic leading-relaxed text-white/70 line-clamp-3">
                "{art.excerpt}"
              </p>
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-4">
              <span className="font-mono text-[9px] uppercase tracking-wider text-white/40">
                {art.readingTime}
              </span>
              <Link
                to={`/article/${art.id}`}
                className="font-mono text-[9px] uppercase tracking-[0.2em] text-gold hover:underline flex items-center gap-1"
              >
                <span>Read Folio</span>
                <span>→</span>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
