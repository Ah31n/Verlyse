#!/usr/bin/env node
/**
 * Static metadata shells for every enumerable route.
 *
 * The route list is no longer written here. It comes from the canonical
 * registry (`src/data/routes.ts`), so this script cannot fall out of step
 * with the sitemap, the router or the route audit — which is exactly what
 * had happened: /creators and /room were missing from this file only.
 *
 * The application remains React Router + SPA; these are metadata shells,
 * not server-rendered pages.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { loadRouteRegistry } from './lib/load-registry.mjs'

const root = process.cwd()
const dist = join(root, 'dist')
const origin = process.env.PUBLIC_SITE_ORIGIN || undefined

const shell = await readFile(join(dist, 'index.html'), 'utf8')
const { routes, canonicalUrl } = await loadRouteRegistry(origin)

function esc(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function json(value) {
  return JSON.stringify({ '@context': 'https://schema.org', ...value }).replaceAll('<', '\\u003c')
}

function metadataHead(route, siteOrigin) {
  const canonical = canonicalUrl(route.path)
  const image = `${siteOrigin}${route.image}`
  const meta = [
    `<title>${esc(route.title)}</title>`,
    `<meta name="description" content="${esc(route.description)}">`,
    '<meta name="robots" content="index, follow">',
    `<link rel="canonical" href="${esc(canonical)}">`,
    `<meta property="og:type" content="${esc(route.ogType)}">`,
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

const siteOrigin = canonicalUrl('').replace(/\/$/, '')
const shells = routes.filter((route) => route.prerender)

for (const route of shells) {
  const target = join(dist, route.path, 'index.html')
  await mkdir(join(dist, route.path), { recursive: true })
  await writeFile(target, metadataHead(route, siteOrigin))
}

const byKind = shells.reduce((acc, r) => ({ ...acc, [r.kind]: (acc[r.kind] ?? 0) + 1 }), {})
console.log(
  `Prerendered ${shells.length} metadata shells from the route registry ` +
    `(${Object.entries(byKind).map(([k, n]) => `${k}: ${n}`).join(', ')}).`,
)
