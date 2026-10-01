import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import type { Article } from '../../data/content'
import { RoleBadge } from '../contributors/RoleBadge'

interface ArticleHeaderProps {
  article: Article
  accessionNumber?: string
  className?: string
}

/**
 * ArticleHeader — Reading Room Masthead & Byline
 */
export function ArticleHeader({
  article,
  accessionNumber = '01',
  className = '',
}: ArticleHeaderProps) {
  return (
    <header className={clsx('mx-auto max-w-4xl pt-8 pb-10 text-center', className)}>
      <div className="flex items-center justify-center gap-3 font-mono text-[9px] uppercase tracking-[0.28em] text-gold">
        <Link to={`/categories/${article.category.toLowerCase().replace(/\s+/g, '-')}`} className="hover:underline">
          {article.category}
        </Link>
        <span className="text-white/20">·</span>
        <span>Accession № {accessionNumber}</span>
      </div>

      <h1
        string="split"
        string-id={`article-title-${article.id}`}
        className="mt-6 font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-ivory tracking-tight leading-[1.05]"
      >
        “{article.title}”
      </h1>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <span className="font-serif text-lg italic text-white/80">by</span>
        <Link
          to={`/creator/${article.authorId}`}
          className="font-serif text-xl text-gold hover:underline"
        >
          {article.authorId}
        </Link>
        <RoleBadge role="Author" />
      </div>

      <div className="mt-4 flex items-center justify-center gap-4 font-mono text-[9px] uppercase tracking-[0.2em] text-white/50">
        <span>{new Date(article.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}</span>
        <span>·</span>
        <span>{article.readingTime}</span>
      </div>
    </header>
  )
}
