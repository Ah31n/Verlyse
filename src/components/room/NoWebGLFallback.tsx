import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import type { SpatialArchiveItem } from '../../lib/room/folios'
import { RoleBadge } from '../contributors/RoleBadge'

interface NoWebGLFallbackProps {
  items: SpatialArchiveItem[]
  className?: string
  reason?: 'unsupported' | 'error'
}

/**
 * NoWebGLFallback — Semantic 2D Archival Keeping Room
 *
 * Provides a high-fidelity literary alternative when WebGL is unavailable
 * or experiences a runtime initialization failure.
 */
export function NoWebGLFallback({
  items,
  className = '',
  reason = 'unsupported',
}: NoWebGLFallbackProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const categories = useMemo(() => {
    const counts = new Map<string, number>()
    items.forEach((item) => {
      counts.set(item.category, (counts.get(item.category) || 0) + 1)
    })
    return Array.from(counts.entries()).map(([cat, count]) => ({
      name: cat,
      count,
    }))
  }, [items])

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory = !selectedCategory || item.category === selectedCategory
      const matchesQuery =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesQuery
    })
  }, [items, selectedCategory, searchQuery])

  return (
    <div
      className={clsx(
        'min-h-screen bg-[#120207] text-ivory px-4 py-8 md:px-12 md:py-16 selection:bg-gold selection:text-charcoal',
        className
      )}
    >
      <div className="mx-auto max-w-6xl">
        {/* Masthead */}
        <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-gold/30 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-gold">
                Archival Folio Ledger
              </span>
              <span className="border border-gold/40 px-1.5 py-0.5 font-mono text-[8px] uppercase text-gold/80">
                2D Fallback Shelf
              </span>
            </div>
            <h1 className="mt-2 font-serif text-3xl md:text-5xl font-light text-ivory">
              The Keeping Room
            </h1>
            <p className="mt-2 font-serif text-sm md:text-base italic text-white/70 max-w-xl">
              {reason === 'error'
                ? '3D spatial renderer encountered an interruption. Reading mode activated.'
                : 'Accelerated 3D is inactive. Complete catalog rendered in flat archival folio format.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/articles"
              className="flex h-10 items-center gap-2 border border-gold/40 bg-gold/10 px-4 font-mono text-[10px] uppercase tracking-[0.2em] text-gold hover:bg-gold hover:text-charcoal transition-all"
            >
              <span>← Editorial Archive</span>
            </Link>
          </div>
        </header>

        {/* Filter Controls */}
        <section aria-label="Archive filters" className="mt-8 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={clsx(
                'px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] border transition-all',
                selectedCategory === null
                  ? 'border-gold bg-gold text-charcoal font-semibold'
                  : 'border-white/20 text-white/70 hover:border-gold hover:text-ivory'
              )}
            >
              All Folios ({items.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => setSelectedCategory(cat.name)}
                className={clsx(
                  'px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] border transition-all',
                  selectedCategory === cat.name
                    ? 'border-gold bg-gold text-charcoal font-semibold'
                    : 'border-white/20 text-white/70 hover:border-gold hover:text-ivory'
                )}
              >
                {cat.name} ({cat.count})
              </button>
            ))}
          </div>

          <div className="w-full md:w-64">
            <input
              type="search"
              placeholder="Search keeping room…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-white/20 bg-black/40 px-3 py-1.5 font-mono text-xs text-ivory placeholder-white/40 focus:border-gold focus:outline-none"
            />
          </div>
        </section>

        {/* Grid of Folios */}
        <main className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <article
              key={item.id}
              className="group flex flex-col justify-between border border-white/15 bg-[#18040B] p-5 transition-all hover:border-gold/60 hover:bg-[#20050E]"
            >
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <span className="font-mono text-[8px] uppercase tracking-widest text-gold">
                    № {item.accession}
                  </span>
                  <span className="font-mono text-[8px] uppercase tracking-wider text-white/50">
                    {item.category}
                  </span>
                </div>

                {item.coverImage && (
                  <div className="mt-4 aspect-[16/10] overflow-hidden border border-white/10 bg-black/30">
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="h-full w-full object-cover grayscale-[25%] transition-transform duration-500 group-hover:scale-105 group-hover:grayscale-0"
                      loading="lazy"
                    />
                  </div>
                )}

                <h2 className="mt-4 font-serif text-xl font-light text-ivory group-hover:text-gold transition-colors">
                  {item.title}
                </h2>

                <div className="mt-2 flex items-center gap-2">
                  <span className="font-serif text-xs italic text-white/70">
                    by {item.author}
                  </span>
                  {item.authorRole && <RoleBadge role={item.authorRole} />}
                </div>

                <p className="mt-3 font-serif text-xs leading-relaxed text-white/70 line-clamp-3 italic">
                  "{item.excerpt}"
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-3">
                <span className="font-mono text-[8px] uppercase tracking-wider text-white/40">
                  {item.readingTime || '5 min'}
                </span>
                <Link
                  to={`/article/${item.id}`}
                  className="font-mono text-[9px] uppercase tracking-[0.2em] text-gold hover:underline flex items-center gap-1"
                >
                  <span>Open Folio</span>
                  <span>→</span>
                </Link>
              </div>
            </article>
          ))}
        </main>

        {filteredItems.length === 0 && (
          <div className="py-20 text-center font-serif text-base italic text-white/50">
            No folios match your current filter criteria.
          </div>
        )}
      </div>
    </div>
  )
}
