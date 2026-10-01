import { useState } from 'react'
import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import { SpotlightCard } from '../interaction/SpotlightCard'
import { Badge } from '../ui/Badge'
import { PullQuotePlate } from '../editorial/PullQuotePlate'
import { ARTICLES, getAuthor, type Article } from '../../data/content'

/**
 * ArchiveMatrix — an authored publication wall / irregular editorial matrix.
 * Composed with varied scales, asymmetric 2-column leads, typographic pull-quote interludes,
 * and disciplined spotlight key-lighting.
 */
export function ArchiveMatrix({
  articles = ARTICLES,
  onHoverArticle,
}: {
  articles?: Article[]
  onHoverArticle?: (article: Article | null) => void
  activeFilter?: string
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <div
      string="masonry"
      string-id="archive-masonry-matrix"
      string-masonry-cols="1|640:2|1024:3"
      string-masonry-gap="20|640:28|1024:36"
      string-masonry-mode="auto"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 md:gap-8 items-start"
    >
      {articles.map((article, index) => {
        const author = getAuthor(article.authorId)
        const folioNum = String(ARTICLES.findIndex((a) => a.id === article.id) + 1).padStart(2, '0')
        const isHovered = hoveredId === article.id
        const isOtherHovered = hoveredId !== null && !isHovered
        const coverSrc = article.thumbnail ?? article.cover

        // Editorial rhythm sequencing
        const rhythm = index % 7
        const colSpan =
          rhythm === 0
            ? 'lg:col-span-8'
            : rhythm === 1
            ? 'lg:col-span-4'
            : rhythm === 4
            ? 'lg:col-span-12'
            : rhythm === 5
            ? 'lg:col-span-4'
            : rhythm === 6
            ? 'lg:col-span-8'
            : 'lg:col-span-6'

        const isLead = rhythm === 0 || rhythm === 6
        const isPullquote = rhythm === 4

        return (
          <div
            key={article.id}
            className={clsx(
              colSpan,
              'transition-all duration-700 ease-out',
              isOtherHovered ? 'opacity-70 scale-[0.995]' : 'opacity-100 scale-100'
            )}
            onMouseEnter={() => {
              setHoveredId(article.id)
              onHoverArticle?.(article)
            }}
            onMouseLeave={() => {
              setHoveredId(null)
              onHoverArticle?.(null)
            }}
          >
            <Link
              to={`/article/${article.id}`}
              className="block no-underline group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold active:scale-[0.98] transition-transform duration-200"
              data-cursor="article"
              data-cursor-label={`FOLIO ${folioNum}`}
            >
              <SpotlightCard
                theme="dark"
                borderHighlight={isLead}
                className={clsx(
                  'border border-white/10 bg-[#25070F]/80 p-6 md:p-8 hover:border-gold/50 transition-all duration-500 relative',
                  isLead && 'shadow-[0_20px_45px_rgba(0,0,0,0.6)]'
                )}
              >
                {/* Ghost archival accession numeral in background */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-4 -right-2 select-none font-serif text-[84px] md:text-[104px] font-bold leading-none text-white/[0.03] transition-colors duration-500 group-hover:text-gold/[0.08]"
                >
                  {folioNum}
                </span>

                {/* Folio top rail */}
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4 mb-6 relative z-10">
                  <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.24em] text-gold">
                    <span className="font-semibold">FOLIO № {folioNum}</span>
                    <span className="text-white/30" aria-hidden="true">·</span>
                    <Badge variant="subtle" size="sm">{article.category}</Badge>
                  </div>
                  <span className="font-mono text-[9px] tracking-[0.2em] text-white/45">
                    {article.readingTime}
                  </span>
                </div>

                {isPullquote ? (
                  /* Pullquote feature block */
                  <div className="py-4 relative z-10">
                    <PullQuotePlate
                      variant="wine"
                      quote={article.excerpt ?? article.title}
                      attribution={author?.name}
                      role={author?.role}
                      folioRef={`FOLIO № ${folioNum} · ${article.category}`}
                    />
                  </div>
                ) : (
                  /* Standard / Lead Folio block */
                  <div className={clsx('grid gap-6 relative z-10', isLead ? 'md:grid-cols-12 md:items-center' : 'grid-cols-1')}>
                    {coverSrc && (
                      <div className={clsx('relative overflow-hidden border border-gold/30', isLead ? 'md:col-span-5 aspect-[4/3]' : 'aspect-[16/10]')}>
                        <img
                          src={coverSrc}
                          alt={article.title}
                          className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#140307]/80 via-transparent to-transparent pointer-events-none" />
                      </div>
                    )}
                    <div className={clsx(isLead ? 'md:col-span-7 flex flex-col justify-center' : 'flex flex-col')}>
                      <h3 className="font-serif text-2xl md:text-3xl font-light text-ivory leading-tight group-hover:text-gold transition-colors duration-400">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="mt-3 font-serif text-sm font-light italic text-white/70 line-clamp-2 leading-relaxed">
                          "{article.excerpt}"
                        </p>
                      )}
                      <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
                        <span className="font-serif text-xs text-gold/90">
                          {author?.name}
                        </span>
                        <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/50 group-hover:text-ivory group-hover:translate-x-1 transition-all">
                          Read folio →
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </SpotlightCard>
            </Link>
          </div>
        )
      })}
    </div>
  )
}
