import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import type { Article } from '../../data/content'
import { RoleBadge } from '../contributors/RoleBadge'

interface CategoryLeadFolioProps {
  article: Article
  className?: string
}

export function CategoryLeadFolio({ article, className = '' }: CategoryLeadFolioProps) {
  return (
    <article
      string="spotlight"
      string-id={`category-lead-${article.id}`}
      className={clsx(
        'group grid grid-cols-1 lg:grid-cols-12 gap-8 border border-gold/30 bg-[#160309] p-6 md:p-10 transition-all duration-700 hover:border-gold',
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
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <span className="font-mono text-[9px] uppercase tracking-widest text-gold">
              Lead Folio
            </span>
            <span className="font-mono text-[9px] text-white/50">{article.readingTime}</span>
          </div>

          <h2 className="mt-4 font-serif text-3xl font-light text-ivory group-hover:text-gold transition-colors">
            {article.title}
          </h2>

          <div className="mt-2.5 flex items-center gap-2">
            <span className="font-serif text-sm italic text-white/70">by {article.authorId}</span>
            <RoleBadge role="Writer" />
          </div>

          <p className="mt-4 font-serif text-sm italic leading-relaxed text-white/70">
            "{article.excerpt}"
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10">
          <Link
            to={`/article/${article.id}`}
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold hover:underline flex items-center gap-1.5"
          >
            <span>Read Lead Folio</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </article>
  )
}

export function CategoryReturnNav({ className = '' }: { className?: string }) {
  return (
    <nav className={clsx('my-12 flex items-center justify-between border-t border-white/10 pt-6', className)}>
      <Link
        to="/categories"
        className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold hover:underline flex items-center gap-1.5"
      >
        <span>← All Wings</span>
      </Link>
      <Link
        to="/articles"
        className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60 hover:text-ivory flex items-center gap-1.5"
      >
        <span>Full Folio Shelf →</span>
      </Link>
    </nav>
  )
}
