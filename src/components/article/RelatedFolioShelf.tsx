import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import type { Article } from '../../data/content'

interface RelatedFolioShelfProps {
  relatedArticles: Article[]
  className?: string
}

/**
 * RelatedFolioShelf — Curatorial Cross-Reference at Article Close
 */
export function RelatedFolioShelf({
  relatedArticles,
  className = '',
}: RelatedFolioShelfProps) {
  if (relatedArticles.length === 0) return null

  return (
    <section className={clsx('my-24 border-t border-gold/30 pt-12', className)}>
      <div className="flex items-center justify-between pb-6">
        <div>
          <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-gold">
            Cross References
          </span>
          <h2 className="mt-1 font-serif text-3xl font-light text-ivory">
            Further on the Shelf
          </h2>
        </div>
        <Link
          to="/articles"
          className="font-mono text-[9px] uppercase tracking-[0.2em] text-gold hover:underline"
        >
          View All Folios →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {relatedArticles.slice(0, 2).map((rel) => (
          <Link
            key={rel.id}
            to={`/article/${rel.id}`}
            className="group flex flex-col justify-between border border-white/10 bg-[#160309] p-6 transition-all duration-500 hover:border-gold hover:bg-[#20050E]"
          >
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <span className="font-mono text-[8px] uppercase tracking-wider text-gold">
                  {rel.category}
                </span>
                <span className="font-mono text-[8px] text-white/40">{rel.readingTime}</span>
              </div>
              <h3 className="mt-3 font-serif text-2xl font-light text-ivory group-hover:text-gold transition-colors">
                {rel.title}
              </h3>
              <p className="mt-2 font-serif text-xs italic text-white/60 line-clamp-2">
                "{rel.excerpt}"
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-gold/80 group-hover:text-gold">
              <span>Read Folio</span>
              <span>→</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
