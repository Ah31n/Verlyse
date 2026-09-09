/* SSR render smoke — renders every page component through react-dom/server to
   catch crashes-in-render (missing data, bad hooks, invalid props) without a
   browser. Run with `node scripts/ssr-smoke.mjs`; it compiles this entry with
   Vite's SSR pipeline first. Production serving stays client-only; this file
   never ships in the bundle. */
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import type { ReactNode } from 'react'
import Layout from '../src/components/layout/Layout'
import Home from '../src/pages/Home'
import About from '../src/pages/About'
import Articles from '../src/pages/Articles'
import ArticleDetail from '../src/pages/ArticleDetail'
import Categories from '../src/pages/Categories'
import Community from '../src/pages/Community'
import Submit from '../src/pages/Submit'
import Ambassadors from '../src/pages/Ambassadors'
import Creators from '../src/pages/Creators'
import Contact from '../src/pages/Contact'
import Room from '../src/pages/Room'
import WriterProfilePage from '../src/pages/WriterProfilePage'

declare global { var __SMOKE__: boolean }
;(globalThis as unknown as { __SMOKE__: boolean }).__SMOKE__ = true

const shell = (el: ReactNode, path = '/') => (
  <MemoryRouter initialEntries={[path]}>
    <Layout>{el}</Layout>
  </MemoryRouter>
)

const routes: [string, ReactNode][] = [
  ['/', shell(<Home />, '/')],
  ['/about', shell(<About />, '/about')],
  ['/articles', shell(<Articles />, '/articles')],
  ['/categories', shell(<Categories />, '/categories')],
  ['/categories (poetry)', shell(<Routes><Route path="/categories/:slug" element={<Categories />} /></Routes>, '/categories/poetry')],
  ['/community', shell(<Community />, '/community')],
  ['/submit', shell(<Submit />, '/submit')],
  ['/ambassadors', shell(<Ambassadors />, '/ambassadors')],
  ['/creators', shell(<Creators />, '/creators')],
  ['/contact', shell(<Contact />, '/contact')],
  ['/room', shell(<Room />, '/room')],
  ['/article (first)', shell(<Routes><Route path="/article/:id" element={<ArticleDetail />} /></Routes>, '/article/their-voices-matter')],
  ['/article (horror)', shell(<Routes><Route path="/article/:id" element={<ArticleDetail />} /></Routes>, '/article/3-13')],
  ['/article (gallery)', shell(<Routes><Route path="/article/:id" element={<ArticleDetail />} /></Routes>, '/article/water-cat')],
  ['/article (quiet)', shell(<Routes><Route path="/article/:id" element={<ArticleDetail />} /></Routes>, '/article/jaldi')],
  ['/article (missing)', shell(<Routes><Route path="/article/:id" element={<ArticleDetail />} /></Routes>, '/article/not-a-folio')],
  ['/creator (writer)', shell(<Routes><Route path="/creator/:authorId" element={<WriterProfilePage />} /></Routes>, '/creator/alina-javed')],
  ['/creator (poet-credited)', shell(<Routes><Route path="/creator/:authorId" element={<WriterProfilePage />} /></Routes>, '/creator/mochjixx')],
  ['/creator (missing)', shell(<Routes><Route path="/creator/:authorId" element={<WriterProfilePage />} /></Routes>, '/creator/nobody')],
]

export function run(): string {
  const lines: string[] = []
  let failures = 0
  for (const [name, el] of routes) {
    try {
      const html = renderToStaticMarkup(el)
      const issues: string[] = []
      if (!html || html.length < 200) issues.push('suspiciously small output')
      if (html.includes('NaN')) issues.push('NaN rendered')
      lines.push(`${name} ✓ ${html.length} chars${issues.length ? ' · ' + issues.join('; ') : ''}`)
      if (issues.length) failures++
    } catch (e) {
      failures++
      lines.push(`${name} ✗ ${(e as Error).message?.slice(0, 200)}`)
    }
  }
  lines.push(failures ? `SMOKE FAIL (${failures})` : 'SMOKE PASS')
  return lines.join('\n')
}
