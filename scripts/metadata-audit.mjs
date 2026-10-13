#!/usr/bin/env node
import { readFile, readdir } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { loadRouteRegistry } from './lib/load-registry.mjs'

const root = join(process.cwd(), 'dist')
const origin = process.env.PUBLIC_SITE_ORIGIN || 'https://verlysemedia.kesug.com'
const files = []
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) await walk(path)
    else if (entry.name === 'index.html') files.push(path)
  }
}
await walk(root)
const failures = []
const routes = []
const titles = new Set()
const canonicals = new Set()
const attr = (html, pattern) => html.match(pattern)?.[1] ?? ''
const count = (html, pattern) => (html.match(pattern) || []).length
const routeFor = (file) => {
  const rel = relative(root, file).replaceAll('\\', '/')
  if (rel === 'index.html') return '/'
  return `/${rel.replace(/\/index\.html$/, '')}`
}

for (const file of files) {
  const route = routeFor(file)
  const html = await readFile(file, 'utf8')
  const title = attr(html, /<title>([^<]+)<\/title>/i)
  const description = attr(html, /<meta name="description" content="([^"]+)"/i)
  const canonical = attr(html, /<link rel="canonical" href="([^"]+)"/i)
  const ogTitle = attr(html, /<meta property="og:title" content="([^"]+)"/i)
  const ogDescription = attr(html, /<meta property="og:description" content="([^"]+)"/i)
  const ogType = attr(html, /<meta property="og:type" content="([^"]+)"/i)
  const ogImage = attr(html, /<meta property="og:image" content="([^"]+)"/i)
  const twitterCard = attr(html, /<meta name="twitter:card" content="([^"]+)"/i)
  const twitterTitle = attr(html, /<meta name="twitter:title" content="([^"]+)"/i)
  const twitterDescription = attr(html, /<meta name="twitter:description" content="([^"]+)"/i)
  const twitterImage = attr(html, /<meta name="twitter:image" content="([^"]+)"/i)
  if (!title || titles.has(title)) failures.push(`${route}: title missing or duplicate`)
  if (title) titles.add(title)
  if (!description) failures.push(`${route}: description missing`)
  if (!canonical || canonicals.has(canonical)) failures.push(`${route}: canonical missing or duplicate`)
  if (canonical) canonicals.add(canonical)
  if (!ogTitle || !ogDescription || !ogType || !ogImage) failures.push(`${route}: Open Graph metadata incomplete`)
  if (twitterCard !== 'summary_large_image' || !twitterTitle || !twitterDescription || !twitterImage) failures.push(`${route}: Twitter metadata incomplete`)
  if (!html.includes('content="index, follow"')) failures.push(`${route}: indexing directive missing`)
  if (!html.includes('id="ld-prerendered"')) failures.push(`${route}: JSON-LD missing`)
  if (count(html, /<title>/gi) !== 1 || count(html, /meta name="description"/gi) !== 1) failures.push(`${route}: duplicate title/description tags`)
  if (/^\/article\//.test(route) && !html.includes('"@type":"Article"')) failures.push(`${route}: Article JSON-LD missing`)
  if (/^\/creator\//.test(route) && !html.includes('"@type":"ProfilePage"')) failures.push(`${route}: ProfilePage JSON-LD missing`)
  routes.push(route)
}

/* ------------------------------------------------------------------ */
/* Route coherence — the registry, the shells, the sitemap and the      */
/* deployment rewrites must describe the same publication.              */
/*                                                                      */
/* Counts are no longer typed here. They come from the registry, so     */
/* this audit cannot pass while silently expecting the wrong archive.   */
/* ------------------------------------------------------------------ */
const { routes: registry, canonicalUrl } = await loadRouteRegistry(process.env.PUBLIC_SITE_ORIGIN || undefined)

const expectedShells = registry.filter((r) => r.prerender).map((r) => r.path || '/')
const builtShells = new Set(routes)

for (const path of expectedShells) {
  if (!builtShells.has(path)) failures.push(`registry declares ${path} but no shell was generated`)
}
for (const path of routes) {
  if (!expectedShells.includes(path)) failures.push(`shell ${path} exists but is not in the route registry`)
}

/* every kind the registry knows about must actually have shipped */
const byKind = registry.filter((r) => r.prerender).reduce((acc, r) => {
  acc[r.kind] = (acc[r.kind] ?? 0) + 1
  return acc
}, {})
for (const [kind, expected] of Object.entries(byKind)) {
  const built = registry.filter((r) => r.kind === kind && r.prerender && builtShells.has(r.path || '/')).length
  if (built !== expected) failures.push(`${kind}: expected ${expected} shells, found ${built}`)
}

/* sitemap must match the registry exactly, trailing slashes included */
try {
  const sitemap = await readFile(join(root, 'sitemap.xml'), 'utf8')
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  const expectedLocs = registry.filter((r) => r.sitemap).map((r) => canonicalUrl(r.path))
  for (const loc of expectedLocs) {
    if (!locs.includes(loc)) failures.push(`sitemap is missing ${loc}`)
  }
  for (const loc of locs) {
    if (!expectedLocs.includes(loc)) failures.push(`sitemap lists ${loc}, which is not in the registry`)
  }
} catch {
  failures.push('sitemap.xml was not generated into dist/')
}

/* canonical tags must point at the URL the primary host actually serves */
for (const route of registry.filter((r) => r.prerender)) {
  const file = join(root, route.path, 'index.html')
  try {
    const html = await readFile(file, 'utf8')
    const canonical = attr(html, /<link rel="canonical" href="([^"]+)"/i)
    const expected = canonicalUrl(route.path)
    if (canonical !== expected) failures.push(`${route.path || '/'}: canonical is ${canonical}, expected ${expected}`)
  } catch {
    /* absence already reported above */
  }
}

/* the two routes that had drifted — asserted by name so a regression is loud */
for (const mustExist of ['/creators', '/room']) {
  if (!builtShells.has(mustExist)) failures.push(`${mustExist} must ship a prerendered shell (regression of R01)`)
}

/* deployment rewrites must cover every prerendered directory */
try {
  const vercel = JSON.parse(await readFile(join(process.cwd(), 'vercel.json'), 'utf8'))
  const sources = (vercel.rewrites ?? []).map((r) => r.source)
  const needed = ['/articles', '/categories', '/creators', '/room', '/article/:id', '/creator/:id', '/categories/:slug']
  for (const source of needed) {
    if (!sources.includes(source)) failures.push(`vercel.json has no rewrite for ${source}`)
  }
} catch {
  failures.push('vercel.json could not be read for rewrite coherence')
}

if (failures.length) {
  console.error(`Metadata audit failed with ${failures.length} finding(s):`)
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}
console.log(
  `Metadata audit passed: ${routes.length} shells, ` +
    `${registry.filter((r) => r.sitemap).length} sitemap URLs, registry coherent.`,
)
