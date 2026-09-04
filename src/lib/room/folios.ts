// The Keeping Room — folio (plate) model.
// Derived entirely from the canonical registry; no content is duplicated here.
import { ARTICLES, getAuthor } from '../../data/content'

export interface Folio {
  /** registry order (1-based); folio number shown on the plate */
  folio: string
  index: number
  id: string
  /** canonical author id — used to hand off to /creator/:authorId */
  authorId: string
  title: string
  author: string
  category: string
  excerpt: string
  readingTime: string
  date: string
  /** true for the featured plate (PULL start) */
  featured: boolean
  /** true for the newest plate (NEXT target) — Mir Raza Ali remains folio №19 */
  newest: boolean
}

export const FOLIOS: Folio[] = ARTICLES.map((a, i) => {
  const author = getAuthor(a.authorId)
  return {
    folio: String(i + 1).padStart(2, '0'),
    index: i,
    id: a.id,
    authorId: a.authorId,
    title: a.title,
    author: author?.name ?? a.authorId,
    category: a.category,
    excerpt: a.excerpt,
    readingTime: a.readingTime,
    date: new Date(a.date).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    }).toUpperCase(),
    featured: i === 0,
    newest: i === ARTICLES.length - 1,
  }
})

export const FEATURED = FOLIOS[0]          // №01 — Their Voices Matter
export const NEXT_FOLIO = FOLIOS[FOLIOS.length - 1] // №19 — Mir Raza Ali

/** Distinct categories present on the thread, in first-appearance order. */
export const CATEGORIES: string[] = Array.from(
  new Set(FOLIOS.map((f) => f.category)),
)

/** Every folio by a given creator (the dossier discovery layer). */
export function foliosByAuthor(authorId: string): Folio[] {
  return FOLIOS.filter((f) => f.authorId === authorId)
}

/** Spatial search: matches title, author or category. Returns registry-ordered folios. */
export function searchFolios(query: string): Folio[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return FOLIOS.filter(
    (f) =>
      f.title.toLowerCase().includes(q) ||
      f.author.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q),
  ).slice(0, 6)
}
