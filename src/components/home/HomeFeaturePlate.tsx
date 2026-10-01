import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import type { Article } from '../../data/content'
import { RoleBadge } from '../contributors/RoleBadge'

interface HomeFeaturePlateProps {
  article: Article
  className?: string
}

/**
 * HomeFeaturePlate — Dominant Editorial Cover Plate
 *
 * The heroic visual surface on the publication cover.
 */
export function HomeFeaturePlate({ article, className = '' }: HomeFeaturePlateProps) {
  return (
    <article
      string="spotlight"
      string-id={`home-feature-${article.id}`}
      className={clsx(
        'group relative grid grid-cols-1 lg:grid-cols-12 gap-8 border border-gold/30 bg-[#160309]/80 p-6 md:p-10 lg:p-12 backdrop-blur-sm shadow-2xl transition-all duration-700 hover:border-gold/60',
        className
      )}
    >
      {/* Visual Cover Half (7 Cols) */}
      <div className="relative lg:col-span-7 aspect-[16/11] overflow-hidden border border-white/10 bg-black/40">
        <img
          src={article.cover}
          alt={article.title}
          loading="eager"
          decoding="async"
          className="h-full w-full object-cover grayscale-[20%] contrast-[1.08] transition-transform duration-1000 ease-out group-hover:scale-105 group-hover:grayscale-0"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#160309] via-transparent to-transparent opacity-60" />
        <span className="absolute left-4 top-4 border border-gold/40 bg-[#160309]/90 px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest text-gold backdrop-blur-md">
          {article.category} · Lead Feature
        </span>
      </div>

      {/* Editorial Monograph Half (5 Cols) */}
      <div className="flex flex-col justify-between lg:col-span-5">
        <div>
          <div className="flex items-center justify-between border-b border-gold/20 pb-3">
            <span className="font-mono text-[9px] uppercase tracking-[0.26em] text-gold">
              Accession № 01
            </span>
            <span className="font-mono text-[9px] uppercase tracking-wider text-white/50">
              {article.readingTime}
            </span>
          </div>

          <h2 className="mt-5 font-serif text-3xl md:text-4xl lg:text-5xl font-light leading-tight tracking-tight text-ivory">
            {article.title}
          </h2>

          <div className="mt-4 flex items-center gap-2.5">
            <span className="font-serif text-base italic text-white/80">by {article.authorId}</span>
            <RoleBadge role="Founder & Writer" />
          </div>

          <p className="mt-6 font-serif text-base md:text-lg italic leading-relaxed text-white/75">
            "{article.excerpt}"
          </p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-6 border-t border-white/10">
          <Link
            to={`/article/${article.id}`}
            className="group/btn relative flex h-12 flex-1 items-center justify-center gap-2 bg-gold px-6 font-mono text-xs uppercase tracking-[0.24em] font-semibold text-charcoal transition-all hover:bg-gold/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <span>Read Lead Piece</span>
            <span className="transition-transform duration-300 group-hover/btn:translate-x-1">→</span>
          </Link>

          <Link
            to="/articles"
            className="flex h-12 items-center justify-center border border-white/20 bg-white/5 px-5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/80 transition-all hover:border-gold hover:text-gold"
          >
            Archive Index (19)
          </Link>
        </div>
      </div>
    </article>
  )
}
