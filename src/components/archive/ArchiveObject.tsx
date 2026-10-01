import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { clsx } from 'clsx'
import type { Article } from '../../data/content'
import { getAuthor, stampDate } from '../../data/content'
import { SpotlightCard } from '../interaction/SpotlightCard'
import { MOTION_EASE } from '../interaction/physics'

interface ArchiveObjectProps {
  article: Article
  folioIndex: number
  isDimmed?: boolean
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  className?: string
}

/**
 * ArchiveObject — Dynamic Archival Object in the Editorial Matrix
 * Features:
 * - Hover elevation with neighbor recession support (`isDimmed`)
 * - StringTune spotlight key-lighting
 * - High-contrast ivory text on deep wine
 * - Tabular mono index metadata
 * - Explicit keyboard focus outline
 */
export function ArchiveObject({
  article,
  folioIndex,
  isDimmed = false,
  onMouseEnter,
  onMouseLeave,
  className = '',
}: ArchiveObjectProps) {
  const author = getAuthor(article.authorId)
  const fNum = String(folioIndex + 1).padStart(2, '0')
  const authorName = author?.name ?? article.authorId

  return (
    <motion.div
      animate={{ opacity: isDimmed ? 0.72 : 1, scale: isDimmed ? 0.995 : 1 }}
      transition={{ duration: 0.6, ease: MOTION_EASE.easeInk }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={clsx('h-full', className)}
    >
      <Link
        to={`/article/${article.id}`}
        string="spotlight"
        string-lerp="0.18"
        string-id={`archive-object-${article.id}`}
        className="group relative block h-full no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#1E0B12]"
        data-cursor="article"
        data-cursor-label="OPEN"
      >
        <SpotlightCard
          theme="dark"
          className="flex h-full flex-col justify-between border border-white/10 bg-[#25070F]/90 p-6 transition-all duration-500 hover:border-gold/60 hover:shadow-[0_24px_50px_rgba(0,0,0,0.65)]"
        >
          {/* Top Archival Header */}
          <div>
            <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.24em] text-gold/80 mb-3">
              <span className="font-semibold text-gold">FOLIO № {fNum}</span>
              <span className="text-white/40">{stampDate(article.date)}</span>
            </div>

            {/* Category Marker */}
            <div className="mb-3 inline-block border-b border-gold/30 pb-0.5 font-mono text-[8px] uppercase tracking-[0.28em] text-gold/90">
              {article.category}
            </div>

            {/* Title */}
            <h3 className="font-serif text-2xl font-light leading-snug text-ivory group-hover:text-gold transition-colors duration-300">
              {article.title}
            </h3>

            {/* Excerpt */}
            {article.excerpt && (
              <p className="mt-3 font-serif text-xs font-light italic leading-relaxed text-white/60 line-clamp-2">
                "{article.excerpt}"
              </p>
            )}
          </div>

          {/* Bottom Colophon */}
          <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 font-mono text-[9px] uppercase tracking-[0.2em] text-white/50">
            <span className="font-serif text-xs text-gold/90">{authorName}</span>
            <span>{article.readingTime}</span>
          </div>
        </SpotlightCard>
      </Link>
    </motion.div>
  )
}
