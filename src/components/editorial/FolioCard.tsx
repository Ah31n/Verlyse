import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { clsx } from 'clsx'
import type { Article } from '../../data/content'
import { getAuthor, stampDate } from '../../data/content'
import { SpotlightCard } from '../interaction/SpotlightCard'
import { RoleBadge } from '../contributors/RoleBadge'
import { MOTION_EASE } from '../interaction/physics'

interface FolioCardProps {
  article: Article
  folioIndex?: number
  variant?: 'featured' | 'standard' | 'compact' | 'horizontal'
  showImage?: boolean
  className?: string
}

/**
 * FolioCard — Compound Editorial Folio Object
 * Unifies:
 * - Ghost archival numeral
 * - High-definition plate photograph with duotone shift
 * - Department taxonomy & motif
 * - Headline typography in Cormorant Garamond
 * - Contributor accreditation with RoleBadge
 * - Tabular reading time & publication date
 * - Pointer spotlight key-light (`string="spotlight"`)
 * - Contextual cursor mode (`data-cursor="article" data-cursor-label="READ"`)
 */
export function FolioCard({
  article,
  folioIndex,
  variant = 'standard',
  showImage = true,
  className = '',
}: FolioCardProps) {
  const author = getAuthor(article.authorId)
  const fNum = folioIndex !== undefined ? String(folioIndex + 1).padStart(2, '0') : undefined
  const authorName = author?.name ?? article.authorId

  if (variant === 'horizontal') {
    return (
      <Link
        to={`/article/${article.id}`}
        className={clsx(
          'group block no-underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold',
          className
        )}
        data-cursor="article"
        data-cursor-label="READ"
      >
        <SpotlightCard
          theme="dark"
          className="border border-white/10 bg-[#25070F]/80 p-6 transition-all duration-500 hover:border-gold/50"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {showImage && article.cover && (
              <div className="md:col-span-4 relative aspect-[16/10] overflow-hidden border border-gold/20 bg-charcoal">
                <img
                  src={article.cover}
                  alt={article.title}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-wine-deep/60 via-transparent to-transparent pointer-events-none" />
              </div>
            )}
            <div className={clsx(showImage && article.cover ? 'md:col-span-8' : 'md:col-span-12', 'flex flex-col justify-between')}>
              <div>
                <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.24em] text-gold/80 mb-2">
                  <span className="flex items-center gap-2">
                    {fNum && <span className="font-semibold text-gold">№ {fNum}</span>}
                    {fNum && <span className="text-white/30">/</span>}
                    <span>{article.category}</span>
                  </span>
                  <span className="text-white/40">{stampDate(article.date)}</span>
                </div>
                <h3 className="font-serif text-2xl md:text-3xl font-light text-ivory group-hover:text-gold transition-colors duration-300">
                  {article.title}
                </h3>
                {article.excerpt && (
                  <p className="mt-2 font-serif text-sm font-light italic text-white/60 line-clamp-2">
                    {article.excerpt}
                  </p>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                <div className="flex items-center gap-2">
                  <span className="font-serif text-xs text-gold">{authorName}</span>
                  {author && <RoleBadge role={author.role} />}
                </div>
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
                  {article.readingTime}
                </span>
              </div>
            </div>
          </div>
        </SpotlightCard>
      </Link>
    )
  }

  if (variant === 'compact') {
    return (
      <Link
        to={`/article/${article.id}`}
        className={clsx(
          'group block no-underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold',
          className
        )}
        data-cursor="article"
        data-cursor-label="READ"
      >
        <div className="relative border-b border-white/10 py-4 transition-colors duration-300 hover:border-gold/40">
          <div className="flex items-baseline justify-between font-mono text-[9px] uppercase tracking-[0.22em] text-gold/70">
            <span>{fNum ? `№ ${fNum} · ` : ''}{article.category}</span>
            <span className="text-white/40">{article.readingTime}</span>
          </div>
          <h4 className="mt-1 font-serif text-lg font-light text-ivory group-hover:text-gold transition-colors duration-300">
            {article.title}
          </h4>
          <p className="mt-0.5 font-serif text-xs italic text-white/50">{authorName}</p>
        </div>
      </Link>
    )
  }

  // Standard Editorial Folio Card
  return (
    <Link
      to={`/article/${article.id}`}
      string="spotlight"
      string-lerp="0.18"
      string-id={`folio-card-${article.id}`}
      className={clsx(
        'group relative block h-full no-underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold',
        className
      )}
      data-cursor="article"
      data-cursor-label="READ"
    >
      <SpotlightCard
        theme="dark"
        stringId={`folio-spotlight-${article.id}`}
        className="h-full flex flex-col justify-between border border-white/10 bg-[#25070F]/85 p-6 transition-all duration-500 hover:border-gold/60 hover:shadow-[0_20px_45px_rgba(0,0,0,0.6)]"
      >
        {/* Ghost Archival Folio Numeral */}
        {fNum && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-4 -right-2 select-none font-serif text-[88px] font-bold leading-none text-white/[0.03] transition-opacity duration-500 group-hover:text-gold/[0.08]"
          >
            {fNum}
          </span>
        )}

        <div>
          {/* Top Metadata Header */}
          <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.24em] text-gold/80 mb-4">
            <span className="flex items-center gap-1.5">
              {fNum && <span className="font-semibold text-gold">№ {fNum}</span>}
              {fNum && <span className="text-white/30">·</span>}
              <span>{article.category}</span>
            </span>
            <span className="text-white/40">{stampDate(article.date)}</span>
          </div>

          {/* Cover Plate Photo */}
          {showImage && article.cover && (
            <div className="relative aspect-[16/10] overflow-hidden border border-gold/25 bg-[#140307] mb-5">
              <motion.img
                string="lazy"
                string-lazy=""
                src={article.cover}
                alt={article.title}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
                transition={{ duration: 0.7, ease: MOTION_EASE.easeInk }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#140307]/80 via-transparent to-transparent pointer-events-none" />
            </div>
          )}

          {/* Title */}
          <h3 className="font-serif text-2xl font-light leading-snug text-ivory group-hover:text-gold transition-colors duration-300">
            {article.title}
          </h3>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="mt-3 font-serif text-xs font-light italic leading-relaxed text-white/60 line-clamp-3">
              "{article.excerpt}"
            </p>
          )}
        </div>

        {/* Footer Author & Reading Time */}
        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 font-mono text-[9px] uppercase tracking-[0.2em]">
          <div className="flex items-center gap-2">
            <span className="font-serif text-xs text-gold/90">{authorName}</span>
          </div>
          <span className="text-white/45">{article.readingTime}</span>
        </div>
      </SpotlightCard>
    </Link>
  )
}
