import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import type { Article } from '../../data/content'
import { RoleBadge } from '../contributors/RoleBadge'

interface ArchiveSupportingFolioProps {
  article: Article
  accessionNumber: string
  className?: string
}

/**
 * ArchiveSupportingFolio — Secondary Archival Unit Plate
 */
export function ArchiveSupportingFolio({
  article,
  accessionNumber,
  className = '',
}: ArchiveSupportingFolioProps) {
  return (
    <article
      string="spotlight"
      string-id={`archive-item-${article.id}`}
      className={clsx(
        'group flex flex-col justify-between border border-white/15 bg-[#160309] p-5 transition-all duration-500 hover:border-gold/60 hover:bg-[#20050E]',
        className
      )}
    >
      <div>
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <span className="font-mono text-[9px] uppercase tracking-widest text-gold">
            № {accessionNumber}
          </span>
          <span className="font-mono text-[8px] uppercase tracking-wider text-white/50">
            {article.category}
          </span>
        </div>

        <div className="mt-4 aspect-[16/10] overflow-hidden border border-white/10 bg-black/40">
          <img
            src={article.cover}
            alt={article.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover grayscale-[25%] transition-transform duration-700 group-hover:scale-105 group-hover:grayscale-0"
          />
        </div>

        <h3 className="mt-4 font-serif text-2xl font-light text-ivory group-hover:text-gold transition-colors leading-snug">
          {article.title}
        </h3>

        <div className="mt-2 flex items-center gap-2">
          <span className="font-serif text-xs italic text-white/70">by {article.authorId}</span>
          <RoleBadge role="Writer" />
        </div>

        <p className="mt-3 font-serif text-xs italic leading-relaxed text-white/70 line-clamp-3">
          "{article.excerpt}"
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-3">
        <span className="font-mono text-[8px] uppercase tracking-wider text-white/40">
          {article.readingTime}
        </span>
        <Link
          to={`/article/${article.id}`}
          className="font-mono text-[9px] uppercase tracking-[0.2em] text-gold hover:underline flex items-center gap-1"
        >
          <span>Read Piece</span>
          <span>→</span>
        </Link>
      </div>
    </article>
  )
}
