import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import type { Article } from '../../data/content'
import { RoleBadge } from '../contributors/RoleBadge'

interface ArchiveLeadFolioProps {
  article: Article
  accessionNumber?: string
  className?: string
}

/**
 * ArchiveLeadFolio — Asymmetric 8-Col Lead Editorial Surface
 */
export function ArchiveLeadFolio({
  article,
  accessionNumber = '01',
  className = '',
}: ArchiveLeadFolioProps) {
  return (
    <article
      string="spotlight"
      string-id={`archive-lead-${article.id}`}
      className={clsx(
        'group relative grid grid-cols-1 lg:grid-cols-12 gap-8 border border-gold/40 bg-[#18040B] p-6 md:p-10 backdrop-blur-sm transition-all duration-700 hover:border-gold',
        className
      )}
    >
      <div className="lg:col-span-7 aspect-[16/10] overflow-hidden border border-white/10 bg-black/40">
        <img
          src={article.cover}
          alt={article.title}
          loading="eager"
          decoding="async"
          className="h-full w-full object-cover grayscale-[20%] transition-transform duration-700 group-hover:scale-105 group-hover:grayscale-0"
        />
      </div>

      <div className="flex flex-col justify-between lg:col-span-5">
        <div>
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="font-mono text-[9px] uppercase tracking-widest text-gold">
              № {accessionNumber} · Lead Work
            </span>
            <span className="font-mono text-[8px] uppercase tracking-wider text-white/50">
              {article.category}
            </span>
          </div>

          <h2 className="mt-4 font-serif text-3xl md:text-4xl font-light text-ivory group-hover:text-gold transition-colors leading-tight">
            {article.title}
          </h2>

          <div className="mt-3 flex items-center gap-2">
            <span className="font-serif text-sm italic text-white/80">by {article.authorId}</span>
            <RoleBadge role="Founder & Writer" />
          </div>

          <p className="mt-4 font-serif text-sm md:text-base italic leading-relaxed text-white/70">
            "{article.excerpt}"
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
          <span className="font-mono text-[9px] uppercase tracking-wider text-white/40">
            {article.readingTime}
          </span>
          <Link
            to={`/article/${article.id}`}
            className="font-mono text-[10px] uppercase tracking-[0.24em] font-semibold text-gold hover:underline flex items-center gap-1.5"
          >
            <span>Open Lead Folio</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </article>
  )
}
