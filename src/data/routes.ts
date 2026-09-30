/* ------------------------------------------------------------------ */
/* THE ROUTE REGISTRY — the one place a Verlyse URL is declared.        */
/*                                                                      */
/* Before this file existed the publication described itself in four    */
/* places at once: React Router, a hand-written public/sitemap.xml, an  */
/* inline list inside scripts/prerender-metadata.mjs, and the rewrite   */
/* rules in vercel.json. They had already drifted — /creators was in    */
/* the sitemap but had no prerendered shell, and /room was in neither,  */
/* so the spatial page shipped with the home page's title.              */
/*                                                                      */
/* Everything enumerable is now derived from the content registry, so a */
/* new folio, contributor or wing appears in the router, the sitemap,   */
/* the prerendered metadata and the route audit at the same moment.     */
/* ------------------------------------------------------------------ */

import {
  ARTICLES,
  AUTHORS,
  CATEGORIES,
  getAuthor,
  primaryRole,
  roleInSentence,
} from './content'

/** The canonical public origin. Overridable for previews and mirrors. */
export const DEFAULT_ORIGIN = 'https://verlysemedia.kesug.com'

/**
 * Route patterns, exactly as React Router declares them.
 * `App.tsx` reads these so a path can never be renamed in one place only.
 */
export const ROUTE_PATTERNS = {
  home: '/',
  articles: '/articles',
  article: '/article/:id',
  categories: '/categories',
  category: '/categories/:slug',
  creators: '/creators',
  creator: '/creator/:authorId',
  community: '/community',
  ambassadors: '/ambassadors',
  about: '/about',
  submit: '/submit',
  contact: '/contact',
  room: '/room',
  notFound: '*',
} as const

export type RouteKind = 'core' | 'category' | 'article' | 'creator' | 'spatial'

export interface RouteRecord {
  /** Path without a trailing slash; the home page is ''. */
  path: string
  kind: RouteKind
  title: string
  description: string
  /** Absolute-from-root image path for og:image. */
  image: string
  ogType: string
  jsonLd: Record<string, unknown>
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly'
  priority: string
  /** ISO date, when the content itself carries one. */
  lastmod?: string
  /** Emit a prerendered metadata shell at <path>/index.html. */
  prerender: boolean
  /** List in sitemap.xml. */
  sitemap: boolean
}

const FALLBACK_IMAGE = '/img/poster-3-13-1.webp'

/**
 * The canonical URL for a route.
 *
 * The primary host serves every prerendered shell as a directory index, so it
 * 301s /articles to /articles/ — which meant every canonical tag previously
 * pointed at a URL that immediately redirected. Canonicals therefore carry the
 * trailing slash the host actually serves.
 */
export function canonicalUrl(path: string, origin: string = DEFAULT_ORIGIN): string {
  if (!path || path === '/') return `${origin}/`
  return `${origin}${path}/`
}

/** Newest publication date in the archive — the archive-wide lastmod. */
function latestArticleDate(): string {
  return ARTICLES.reduce((newest, a) => (a.date > newest ? a.date : newest), ARTICLES[0]?.date ?? '')
}

export function buildRouteRegistry(origin: string = DEFAULT_ORIGIN): RouteRecord[] {
  const routes: RouteRecord[] = []
  const archiveLastmod = latestArticleDate()

  const core = (
    path: string,
    title: string,
    description: string,
    opts: Partial<RouteRecord> & { schemaType?: string } = {},
  ) => {
    const { schemaType = 'WebPage', ...rest } = opts
    const fullTitle = `${title} — Verlyse Media`
    routes.push({
      path,
      kind: 'core',
      title: fullTitle,
      description,
      image: FALLBACK_IMAGE,
      ogType: 'website',
      jsonLd: { '@type': schemaType, name: fullTitle, url: canonicalUrl(path, origin) },
      changefreq: 'monthly',
      priority: '0.7',
      prerender: true,
      sitemap: true,
      ...rest,
    })
  }

  /* ---- Core ------------------------------------------------------- */
  core('', 'Where Vision Becomes A Voice',
    'Verlyse Media — a student-led platform sharing youth perspectives on culture, global issues and creativity.',
    { priority: '1.0', lastmod: archiveLastmod, schemaType: 'WebSite',
      jsonLd: { '@type': 'WebSite', name: 'Verlyse Media', url: canonicalUrl('', origin), slogan: 'Where Vision Becomes A Voice' } })

  core('/articles', 'Articles',
    `The Verlyse Media archive — ${ARTICLES.length} features, ${AUTHORS.length} credited voices.`,
    { schemaType: 'CollectionPage', lastmod: archiveLastmod })

  core('/categories', 'Categories',
    `The departments of Verlyse Media — ${CATEGORIES.length} wings, one publication.`,
    { schemaType: 'CollectionPage' })

  /* /creators was listed in the sitemap but never prerendered, so every
     share of the contributor wall previewed as the home page. */
  core('/creators', 'Featured Creators',
    `The contributor wall — ${AUTHORS.length} records, every feature credited by name and handle.`,
    { schemaType: 'CollectionPage', lastmod: archiveLastmod })

  core('/community', 'Community',
    'The Verlyse Media commons — conversations, appreciations, and the voices around the magazine.')
  core('/ambassadors', 'Ambassadors',
    'Meet the people who carry Verlyse Media into their communities.')
  core('/about', 'About',
    'Verlyse Media — a publication for emerging voices, careful reading, and work made with intention.')
  core('/submit', 'Submit',
    'Send your story to Verlyse Media. Every feature begins as a submission.', { priority: '0.6' })
  core('/contact', 'Contact',
    'Write to Verlyse Media — submissions, questions, or a note about a feature that stayed with you.', { priority: '0.6' })

  /* ---- Spatial ----------------------------------------------------- */
  /* A real public experience, linked from the footer. It previously had
     no shell, no sitemap entry and no title of its own. */
  routes.push({
    path: '/room',
    kind: 'spatial',
    title: 'The Keeping Room — Verlyse Media',
    description: `A spatial walk through the archive — all ${ARTICLES.length} folios on one thread. Pull a plate, read it, return it.`,
    image: FALLBACK_IMAGE,
    ogType: 'website',
    jsonLd: {
      '@type': 'CollectionPage',
      name: 'The Keeping Room — Verlyse Media',
      url: canonicalUrl('/room', origin),
      description: 'A spatial reading room holding every folio in the issue.',
    },
    changefreq: 'monthly',
    priority: '0.6',
    lastmod: archiveLastmod,
    prerender: true,
    sitemap: true,
  })

  /* ---- Categories --------------------------------------------------- */
  for (const wing of CATEGORIES) {
    routes.push({
      path: `/categories/${wing.slug}`,
      kind: 'category',
      title: `${wing.name} — Verlyse Media`,
      description: wing.blurb,
      image: FALLBACK_IMAGE,
      ogType: 'website',
      jsonLd: {
        '@type': 'CollectionPage',
        name: `${wing.name} — Verlyse Media`,
        url: canonicalUrl(`/categories/${wing.slug}`, origin),
        description: wing.blurb,
      },
      changefreq: 'monthly',
      priority: '0.6',
      prerender: true,
      sitemap: true,
    })
  }

  /* ---- Articles ----------------------------------------------------- */
  for (const article of ARTICLES) {
    const author = getAuthor(article.authorId)
    const path = `/article/${article.id}`
    routes.push({
      path,
      kind: 'article',
      title: `${article.title} — Verlyse Media`,
      description: article.excerpt,
      image: article.cover,
      ogType: 'article',
      jsonLd: {
        '@type': 'Article',
        headline: article.title,
        description: article.excerpt,
        datePublished: article.date,
        timeRequired: article.readingTime,
        articleSection: article.category,
        author: { '@type': 'Person', name: author?.name ?? article.authorId },
        publisher: { '@type': 'Organization', name: 'Verlyse Media' },
        keywords: article.tags?.join(', '),
        image: `${origin}${article.cover}`,
        mainEntityOfPage: canonicalUrl(path, origin),
      },
      changefreq: 'yearly',
      priority: '0.8',
      lastmod: article.date,
      prerender: true,
      sitemap: true,
    })
  }

  /* ---- Contributors -------------------------------------------------- */
  for (const author of AUTHORS) {
    const path = `/creator/${author.id}`
    const role = primaryRole(author)
    const portrait = author.profilePhoto ?? author.portrait ?? FALLBACK_IMAGE
    routes.push({
      path,
      kind: 'creator',
      /* The role is read from the record. Sixteen dossiers previously all
         said "Writer", including a painter, a calligrapher and the platform.
         The masthead's own record drops the duplicated publication suffix. */
      title: author.name === 'Verlyse Media'
        ? `Verlyse Media — ${role}`
        : `${author.name} — ${role} — Verlyse Media`,
      description: `${author.name} (${author.handle}) — ${roleInSentence(author)} on Verlyse Media. ${author.favoriteQuote ?? author.bio}`,
      image: portrait,
      ogType: 'profile',
      jsonLd: {
        '@type': 'ProfilePage',
        name: `${author.name} — ${role}`,
        url: canonicalUrl(path, origin),
        mainEntity: {
          '@type': author.id === 'verlyse-media' ? 'Organization' : 'Person',
          name: author.name,
          alternateName: author.handle,
          jobTitle: author.role,
          image: `${origin}${portrait}`,
        },
      },
      changefreq: 'monthly',
      priority: '0.6',
      prerender: true,
      sitemap: true,
    })
  }

  return routes
}

/** The registry at the canonical origin. */
export const ROUTE_REGISTRY: RouteRecord[] = buildRouteRegistry()

/** Concrete paths only — what a crawler can reach. */
export const ALL_ROUTE_PATHS: string[] = ROUTE_REGISTRY.map((r) => r.path || '/')
