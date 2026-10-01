import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import { InteractivePortrait } from './InteractivePortrait'
import { SpotlightCard } from '../interaction/SpotlightCard'
import type { Author } from '../../data/content'

export function ContributorCard({
  author,
  articlesCount = 0,
  featured = false,
  className = '',
}: {
  author: Author
  articlesCount?: number
  featured?: boolean
  className?: string
}) {
  const photo = author.profilePhoto ?? author.portrait

  return (
    <Link
      to={`/creator/${author.id}`}
      className={clsx('block group no-underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold', className)}
      data-cursor="link"
      data-cursor-label="DOSSIER"
    >
      <SpotlightCard
        theme="dark"
        borderHighlight={featured}
        className="h-full border border-white/10 bg-[#25070F]/80 p-6 flex flex-col justify-between hover:border-gold/50 transition-all duration-500"
      >
        <div>
          <div className="mb-5">
            <InteractivePortrait
              src={photo}
              alt={author.name}
              role={author.role}
              philosophy={author.philosophy ?? author.favoriteQuote}
              aspect="aspect-[3/4]"
            />
          </div>

          <h3 className="font-serif text-2xl font-light text-ivory group-hover:text-gold transition-colors duration-300">
            {author.name}
          </h3>

          <p className="mt-2 font-sans text-xs text-white/65 line-clamp-3 font-light leading-relaxed">
            {author.bio}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 font-mono text-[9px] uppercase tracking-[0.24em] text-white/50">
          <span>{articlesCount} {articlesCount === 1 ? 'Folio' : 'Folios'}</span>
          <span className="text-gold group-hover:translate-x-1 transition-transform">
            View dossier →
          </span>
        </div>
      </SpotlightCard>
    </Link>
  )
}
