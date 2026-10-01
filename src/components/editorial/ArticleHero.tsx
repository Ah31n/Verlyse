import { motion } from 'motion/react'
import { clsx } from 'clsx'
import type { Article } from '../../data/content'
import { getAuthor, stampDate, writtenDate } from '../../data/content'
import { RoleBadge } from '../contributors/RoleBadge'
import { MOTION_EASE } from '../interaction/physics'

interface ArticleHeroProps {
  article: Article
  folioNumber?: string | number
  className?: string
}

/**
 * ArticleHero — Master Compound Article Hero
 * Coordinates:
 * - Issue marker & department category
 * - Masked typographic entrance in Cormorant Garamond
 * - Contributor colophon with monogram/portrait and role badge
 * - Publication date & estimated reading duration
 * - Centered 1px brass hairline delimiter
 */
export function ArticleHero({
  article,
  folioNumber,
  className = '',
}: ArticleHeroProps) {
  const author = getAuthor(article.authorId)
  const fNum = folioNumber !== undefined ? String(folioNumber).padStart(2, '0') : undefined
  const authorPhoto = author?.profilePhoto ?? author?.portrait

  return (
    <header className={clsx('relative mx-auto max-w-4xl text-center pt-8 pb-12', className)}>
      {/* Folio & Category Eyebrow */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: MOTION_EASE.easeInk }}
        className="flex items-center justify-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-gold/80 mb-6"
      >
        {fNum && <span className="font-semibold text-gold">FOLIO № {fNum}</span>}
        {fNum && <span className="text-white/30" aria-hidden="true">/</span>}
        <span>{article.category}</span>
        <span className="text-white/30" aria-hidden="true">·</span>
        <span className="text-white/50">{stampDate(article.date)}</span>
      </motion.div>

      {/* Main Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: MOTION_EASE.easeInk }}
        className="font-serif text-[clamp(2.5rem,6vw,4.5rem)] font-light leading-[1.08] tracking-tight text-ivory"
      >
        {article.title}
      </motion.h1>

      {/* Excerpt Lead */}
      {article.excerpt && (
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: MOTION_EASE.easeInk }}
          className="mx-auto mt-6 max-w-2xl font-serif text-lg md:text-xl font-light italic leading-relaxed text-white/70"
        >
          {article.excerpt}
        </motion.p>
      )}

      {/* Contributor Row & Metadata Colophon */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: MOTION_EASE.easeInk }}
        className="mt-8 flex flex-wrap items-center justify-center gap-6 border-y border-gold/20 py-4 font-mono text-[10px] uppercase tracking-[0.24em] text-white/60"
      >
        <div className="flex items-center gap-3">
          {authorPhoto ? (
            <img
              src={authorPhoto}
              alt={author?.name ?? article.authorId}
              className="h-8 w-8 rounded-full border border-gold/40 object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/40 bg-wine-deep font-serif text-sm text-gold">
              {(author?.name ?? article.authorId).charAt(0)}
            </div>
          )}
          <span className="font-serif text-sm normal-case tracking-normal text-gold">
            {author?.name ?? article.authorId}
          </span>
          {author && <RoleBadge role={author.role} />}
        </div>

        <div className="flex items-center gap-4 text-white/40">
          <span>{writtenDate(article.date)}</span>
          <span aria-hidden="true">·</span>
          <span className="text-gold/90">{article.readingTime}</span>
        </div>
      </motion.div>
    </header>
  )
}
