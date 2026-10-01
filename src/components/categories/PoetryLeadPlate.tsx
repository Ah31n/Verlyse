import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import type { Article } from '../../data/content'

interface PoetryLeadPlateProps {
  article: Article
  className?: string
}

/**
 * PoetryLeadPlate — Rhythm, Whitespace & Stanza Presentation
 */
export function PoetryLeadPlate({ article, className = '' }: PoetryLeadPlateProps) {
  return (
    <article
      string="spotlight"
      string-id={`poetry-lead-${article.id}`}
      className={clsx(
        'group relative my-10 border border-gold/40 bg-[#160309] p-8 md:p-14 text-center shadow-2xl transition-all duration-700 hover:border-gold',
        className
      )}
    >
      <div className="mx-auto max-w-2xl">
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-gold">
          Featured Verse · Accession
        </span>

        <h2 className="mt-4 font-serif text-3xl md:text-5xl font-light text-ivory tracking-tight">
          {article.title}
        </h2>

        <div className="mt-3 font-serif text-sm italic text-white/70">
          by {article.authorId}
        </div>

        <div className="my-8 h-px w-24 mx-auto bg-gold/40" />

        <blockquote className="font-serif text-lg md:text-xl italic leading-relaxed text-white/85 whitespace-pre-line">
          {article.excerpt}
        </blockquote>

        <div className="mt-10 flex justify-center">
          <Link
            to={`/article/${article.id}`}
            className="border border-gold bg-gold/15 px-6 py-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-gold hover:bg-gold hover:text-charcoal transition-all"
          >
            Read Complete Verse →
          </Link>
        </div>
      </div>
    </article>
  )
}
