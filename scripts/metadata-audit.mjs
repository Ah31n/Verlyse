#!/usr/bin/env node
import { readFile, readdir } from 'node:fs/promises'
import { join, relative } from 'node:path'

const root = join(process.cwd(), 'dist')
const origin = process.env.PUBLIC_SITE_ORIGIN || 'https://verlyse-react.vercel.app'
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

const articleRoutes = routes.filter((route) => route.startsWith('/article/'))
const creatorRoutes = routes.filter((route) => route.startsWith('/creator/'))
const categoryRoutes = routes.filter((route) => route.startsWith('/categories/'))
if (articleRoutes.length < 19) failures.push(`article route count too low: ${articleRoutes.length}`)
if (creatorRoutes.length < 16) failures.push(`contributor route count too low: ${creatorRoutes.length}`)
if (categoryRoutes.length < 7) failures.push(`category route count too low: ${categoryRoutes.length}`)
if (failures.length) {
  console.error(`Metadata audit failed with ${failures.length} finding(s):`)
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}
console.log(`Metadata audit passed for ${routes.length} generated routes.`)
