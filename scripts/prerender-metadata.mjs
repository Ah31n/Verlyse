#!/usr/bin/env node
/**
 * Vite-compatible static metadata generation. The canonical registry is
 * transpiled for build-time reading only; the application remains React Router
 * + SPA and keeps its existing lazy 3D architecture.
 */
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import ts from 'typescript'

const root = process.cwd()
const dist = join(root, 'dist')
const origin = process.env.PUBLIC_SITE_ORIGIN || 'https://verlyse-react.vercel.app'
const shell = await readFile(join(dist, 'index.html'), 'utf8')
const contentSource = await readFile(join(root, 'src/data/content.ts'), 'utf8')
const tempModule = '/tmp/verlyse-content-metadata.mjs'
const compiled = ts.transpileModule(contentSource, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText
await writeFile(tempModule, compiled)
const { ARTICLES, AUTHORS, CATEGORIES } = await import(`file://${tempModule}?${Date.now()}`)

const routes = []
const add = (path, title, description, image, type, jsonLd) => routes.push({ path, title, description, image, type, jsonLd })
const page = (path, title, description, image = '/img/poster-3-13-1.webp', type = 'website', jsonLd = {}) => {
  const url = `${origin}${path || '/'}`
  add(path, `${title} — Verlyse Media`, description, image, type, {
    '@type': type === 'website' ? 'WebSite' : type,
    name: `${title} — Verlyse Media`,
    url,
    ...jsonLd,
  })
}

page('', 'Where Vision Becomes A Voice', 'Verlyse Media — a student-led platform sharing youth perspectives on culture, global issues and creativity.', undefined, 'website', { slogan: 'Where Vision Becomes A Voice' })
page('/articles', 'Articles', `The Verlyse Media archive — ${ARTICLES.length} features, ${AUTHORS.length} credited voices.`, undefined, 'CollectionPage')
page('/categories', 'Categories', `The departments of Verlyse Media — ${CATEGORIES.length} wings, one publication.`, undefined, 'CollectionPage')
page('/about', 'About', 'Verlyse Media — a publication for emerging voices, careful reading, and work made with intention.')
page('/community', 'Community', 'The Verlyse Media commons — conversations, appreciations, and the voices around the magazine.')
page('/ambassadors', 'Ambassadors', 'Meet the people who carry Verlyse Media into their communities.')
page('/submit', 'Submit', 'Send your story to Verlyse Media. Every feature begins as a submission.')
page('/contact', 'Contact', 'Write to Verlyse Media — submissions, questions, or a note about a feature that stayed with you.')

for (const category of CATEGORIES) {
  const path = `/categories/${category.slug}`
  page(path, category.name, category.blurb, undefined, 'CollectionPage', { name: `${category.name} — Verlyse Media`, description: category.blurb })
}

for (const article of ARTICLES) {
  const author = AUTHORS.find((candidate) => candidate.id === article.authorId)
  const path = `/article/${article.id}`
  add(path, `${article.title} — Verlyse Media`, article.excerpt, article.cover, 'article', {
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
    mainEntityOfPage: `${origin}${path}`,
  })
}

for (const author of AUTHORS) {
  const path = `/creator/${author.id}`
  const description = `${author.name} (${author.handle}) — a writer on Verlyse Media. ${author.favoriteQuote ?? author.bio}`
  const portrait = author.profilePhoto ?? author.portrait ?? '/img/poster-3-13-1.webp'
  add(path, `${author.name} — Writer — Verlyse Media`, description, portrait, 'profile', {
    '@type': 'ProfilePage',
    name: `${author.name} — Writer`,
    url: `${origin}${path}`,
    mainEntity: { '@type': 'Person', name: author.name, alternateName: author.handle, image: `${origin}${portrait}` },
  })
}

function esc(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}
function json(value) {
  return JSON.stringify({ '@context': 'https://schema.org', ...value }).replaceAll('<', '\\u003c')
}
function metadataHead(route) {
  const canonical = `${origin}${route.path || '/'}`
  const image = `${origin}${route.image}`
  const meta = [
    `<title>${esc(route.title)}</title>`,
    `<meta name="description" content="${esc(route.description)}">`,
    '<meta name="robots" content="index, follow">',
    `<link rel="canonical" href="${esc(canonical)}">`,
    `<meta property="og:type" content="${esc(route.type)}">`,
    `<meta property="og:title" content="${esc(route.title)}">`,
    `<meta property="og:description" content="${esc(route.description)}">`,
    `<meta property="og:url" content="${esc(canonical)}">`,
    `<meta property="og:image" content="${esc(image)}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${esc(route.title)}">`,
    `<meta name="twitter:description" content="${esc(route.description)}">`,
    `<meta name="twitter:image" content="${esc(image)}">`,
    `<script id="ld-prerendered" type="application/ld+json">${json(route.jsonLd)}</script>`,
  ].join('\n    ')
  const cleanShell = shell
    .replace(/\s*<title>[\s\S]*?<\/title>/i, '')
    .replace(/\s*<meta name="robots"[^>]*>/gi, '')
    .replace(/\s*<meta name="description"[^>]*>/gi, '')
    .replace(/\s*<meta property="og:[^"]+"[^>]*>/gi, '')
    .replace(/\s*<meta name="twitter:[^"]+"[^>]*>/gi, '')
    .replace(/\s*<link rel="canonical"[^>]*>/gi, '')
    .replace(/\s*<script[^>]*application\/ld\+json[^>]*>[\s\S]*?<\/script>/gi, '')
  return cleanShell.replace('</head>', `    ${meta}\n  </head>`)
}

for (const route of routes) {
  const target = join(dist, route.path, 'index.html')
  await mkdir(join(dist, route.path), { recursive: true })
  await writeFile(target, metadataHead(route))
}
console.log(`Prerendered metadata shells for ${routes.length} registry-backed routes.`)
