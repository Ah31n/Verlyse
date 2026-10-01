import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import type { Article } from '../../data/content'
import { getAuthor, stampDate } from '../../data/content'
import { Badge } from '../ui/Badge'
import { RoleBadge } from '../contributors/RoleBadge'
import { SpotlightCard } from '../interaction/SpotlightCard'
import SaveButton from '../ui/SaveButton'

interface FolioPlateProps {
  article: Article
  folioIndex?: number
  isLead?: boolean
  variant?: 'ivory' | 'wine'
  className?: string
  showExcerpt?: boolean
}

/**
 * FolioPlate — Dominant Feature or Lead Article Object
 *
 * Distinct visual & behavioral role:
 * - Dominant editorial weight (asymmetric 8-col or full-width lead)
 * - Restrained image parallax / stable aspect ratio box
 * - High-contrast typographic hierarchy (Cormorant Garamond 3xl-5xl)
 * - Full metadata registration (Accession №, Date, Reading measure, Role)
 * - Single localized spotlight key-light on desktop; instant press scaling on touch.
 */
export function FolioPlate({
  article,
  folioIndex,
  isLead = true,
  variant = 'ivory',
  className = '',
  showExcerpt = true,
}: FolioPlateProps) {
  const author = getAuthor(article.authorId)
  const fNum = folioIndex !== undefined ? String(folioIndex + 1).padStart(2, '0') : '01'
  const isIvory = variant === 'ivory'

  return (
    <div
      className={clsx(
        'group relative overflow-hidden transition-all duration-700',
        isLead ? 'w-full' : 'max-w-4xl mx-auto',
        className
      )}
    >
      <Link
        to={`/article/${article.id}`}
        className="block no-underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold active:scale-[0.985] transition-transform duration-200"
        data-cursor="article"
        data-cursor-label={`FOLIO ${fNum}`}
      >
        <SpotlightCard
          theme={isIvory ? 'paper' : 'dark'}
          borderHighlight={isLead}
          className={clsx(
            'relative border transition-all duration-500',
            isIvory
              ? 'border-gold/40 bg-[#F8F6F2] text-[#2A0F18] shadow-[0_20px_50px_rgba(0,0,0,0.45)] p-6 md:p-10 lg:p-12'
              : 'border-white/10 bg-[#25070F]/90 text-ivory shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-6 md:p-10 lg:p-12 hover:border-gold/50'
          )}
        >
          {/* Ghost archival accession numeral in background */}
          <span
            aria-hidden="true"
            className={clsx(
              'pointer-events-none absolute -bottom-6 -right-2 select-none font-serif text-[100px] md:text-[140px] font-bold leading-none transition-colors duration-500',
              isIvory ? 'text-[#2A0F18]/[0.04] group-hover:text-gold/[0.12]' : 'text-white/[0.03] group-hover:text-gold/[0.08]'
            )}
          >
            {fNum}
          </span>

          {/* Top metadata header rail */}
          <div
            className={clsx(
              'flex flex-wrap items-center justify-between gap-4 border-b pb-4 mb-6 md:mb-8 relative z-10',
              isIvory ? 'border-[#2A0F18]/15' : 'border-white/10'
            )}
          >
            <div className="flex items-center gap-3 font-mono text-[9px] md:text-[10px] uppercase tracking-[0.26em]">
              <span className={clsx('font-semibold', isIvory ? 'text-[#7C6338]' : 'text-gold')}>
                FOLIO № {fNum}
              </span>
              <span className={isIvory ? 'text-[#2A0F18]/30' : 'text-white/30'} aria-hidden="true">·</span>
              <Badge variant={isIvory ? 'outline' : 'subtle'} size="sm">
                {article.category}
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              <span className={clsx('font-mono text-[9px] tracking-[0.2em]', isIvory ? 'text-[#2A0F18]/60' : 'text-white/45')}>
                {stampDate(article.date)} · {article.readingTime}
              </span>
              <SaveButton
                id={article.id}
                title={article.title}
                category={article.category}
                author={author?.name}
                compact
                className={clsx(
                  'transition-opacity duration-300',
                  isIvory ? 'text-[#2A0F18]/70 hover:text-[#5C1224]' : 'text-white/60 hover:text-gold'
                )}
              />
            </div>
          </div>

          {/* Main Grid: Plate Photograph + Editorial Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center relative z-10">
            {/* Plate Photograph */}
            {article.cover && (
              <div className="lg:col-span-6 relative aspect-[16/10] md:aspect-[4/3] overflow-hidden border border-gold/40 bg-charcoal">
                <img
                  string="lazy"
                  string-lazy=""
                  src={article.cover}
                  alt={`Plate for “${article.title}”`}
                  width={1280}
                  height={720}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                />
                <div
                  aria-hidden="true"
                  className={clsx(
                    'absolute inset-0 pointer-events-none',
                    isIvory
                      ? 'bg-gradient-to-t from-[#2A0F18]/30 via-transparent to-transparent'
                      : 'bg-gradient-to-t from-[#140307]/80 via-transparent to-transparent'
                  )}
                />
              </div>
            )}

            {/* Editorial Content */}
            <div className={clsx('flex flex-col justify-center', article.cover ? 'lg:col-span-6' : 'lg:col-span-12')}>
              <h2
                className={clsx(
                  'font-serif text-3xl sm:text-4xl lg:text-[44px] font-light leading-[1.05] tracking-tight transition-colors duration-400',
                  isIvory ? 'text-[#1E0B12] group-hover:text-[#5C1224]' : 'text-ivory group-hover:text-gold'
                )}
              >
                “{article.title}”
              </h2>

              {showExcerpt && article.excerpt && (
                <p
                  className={clsx(
                    'mt-4 font-serif text-base lg:text-lg font-light italic leading-relaxed line-clamp-3',
                    isIvory ? 'text-[#2A0F18]/85' : 'text-white/75'
                  )}
                >
                  "{article.excerpt}"
                </p>
              )}

              {/* Author Attribution Footer */}
              <div
                className={clsx(
                  'mt-6 md:mt-8 flex flex-wrap items-center justify-between gap-4 border-t pt-4 md:pt-6',
                  isIvory ? 'border-[#2A0F18]/15' : 'border-white/10'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className={clsx('font-serif text-base font-normal', isIvory ? 'text-[#1E0B12]' : 'text-ivory')}>
                      {author?.name}
                    </span>
                    {author?.role && (
                      <RoleBadge role={author.role} className="mt-0.5" />
                    )}
                  </div>
                </div>

                <span
                  className={clsx(
                    'inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.24em] transition-all group-hover:translate-x-1',
                    isIvory ? 'text-[#7C6338] group-hover:text-[#5C1224]' : 'text-gold group-hover:text-ivory'
                  )}
                >
                  Read full folio →
                </span>
              </div>
            </div>
          </div>
        </SpotlightCard>
      </Link>
    </div>
  )
}
