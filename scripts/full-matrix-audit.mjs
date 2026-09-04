/* eslint-disable no-console */
import { chromium } from '@playwright/test'
import * as fs from 'node:fs'
import * as path from 'node:path'

/**
 * FULL ROUTE MATRIX AUDIT — desktop 1440x900, tablet 768x1024, mobile 390x844.
 * Covers core routes, all 7 category query states, all 19 article detail routes,
 * all 16 creator detail routes. Captures scrollHeight, footer rect, overflow,
 * H1, console/page errors, request failures, bad responses, and a screenshot.
 * Writes audit/route-matrix.json + screenshots per route, and per-viewport files.
 */
const BASE = 'http://127.0.0.1:5173'
const OUT = path.resolve(process.cwd(), 'audit')
const SHOT = path.join(OUT, 'screenshots')

const CORE = ['/', '/articles', '/categories', '/creators', '/community', '/ambassadors', '/about', '/submit', '/contact']
const CATEGORY_ROOMS = [
  'Stories', 'Poetry', 'Essays', 'Art', 'Social%20Issues', 'Lifestyle', 'Horror',
].map((c) => `/categories?room=${c}`)
/* Registry-driven slugs (Phase 31) — 19 articles / 16 author records.
   The registry `src/data/content.ts` is the ground truth; keep this list in sync. */
const ARTICLE_SLUGS = [
  'their-voices-matter', '3-13', 'the-empty-waltz', 'the-arts-deserve-respect',
  'hope-becomes-mythology', 'a-students-worth', 'tasbih-e-fatima',
  'intellect-lost-to-code', 'forgive-me-mother', 'water-cat',
  'if-hope-were-a-feather', 'the-horrors-of-child-sexual-abuse', 'khageena',
  'behind-every-headline', 'jaldi', 'failure', 'my-last-breath',
  'the-garden-beyond-my-tower', 'mir-raza-ali',
]
const CREATOR_SLUGS = [
  'alina-javed', 'anshujit-singh', 'haieqa-wahab', 'shaza-fatima', 'adeena-irfan',
  'craft-with-bro', 'munkashay-javed', 'abheesha-ghosh', 'kenza-imene',
  'hadia-raza', 'zuha-farhan', 'haiqa-nafees', 'syeda-tasbeeha-noman',
  'kazi-fatimataz-zahra', 'mochjixx', 'verlyse-media',
]
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
]

const labelFor = (route) => route.replace(/^\//, '').replace(/[\/?=&%]/g, '-') || 'home'

async function snap(page) {
  return page.evaluate(() => {
    const footer = document.querySelector('footer') || document.querySelector('[role=contentinfo]')
    const fr = footer ? footer.getBoundingClientRect() : null
    const h1 = document.querySelector('h1')
    const se = document.scrollingElement || document.documentElement
    return {
      title: document.title,
      h1: h1 ? h1.textContent.trim().replace(/\s+/g, ' ').slice(0, 120) : null,
      scrollHeight: se.scrollHeight,
      footerTop: fr ? Math.round(fr.top) : null,
      footerBottom: fr ? Math.round(fr.bottom) : null,
      footerAtBottom: fr ? Math.abs(fr.bottom - se.scrollHeight) <= 8 : false,
      footerIsFixedOffset: fr ? Math.abs(fr.bottom - se.scrollHeight) : 0,
      overflowX: document.documentElement.scrollWidth > window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }
  })
}

async function run() {
  fs.mkdirSync(SHOT, { recursive: true })
  const browser = await chromium.launch()
  const issues = []
  const allRoutes = [...CORE, ...CATEGORY_ROOMS, ...ARTICLE_SLUGS.map((s) => `/article/${s}`), ...CREATOR_SLUGS.map((s) => `/creator/${s}`)]

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
    const page = await ctx.newPage()
    const box = []
    page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) box.push({ kind: 'console', type: m.type(), text: m.text() }) })
    page.on('pageerror', (e) => box.push({ kind: 'pageerror', text: String((e && e.message) || e) }))
    page.on('requestfailed', (r) => box.push({ kind: 'requestfailed', url: r.url(), error: r.failure()?.errorText }))
    page.on('response', (r) => { if (r.status() >= 400) box.push({ kind: 'badresponse', url: r.url(), status: r.status() }) })

    const matrix = {}
    for (const route of allRoutes) {
      const before = box.length
      const key = `${labelFor(route)}|${vp.name}`
      const data = {}
      try {
        await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 45000 })
        await page.waitForTimeout(1200)
        Object.assign(data, await snap(page))
      } catch (e) {
        data.error = String(e).slice(0, 200)
      }
      data.route = route
      data.viewport = vp.name
      data.recordStart = before
      // collect issues attributable to THIS route
      data.issues = box.slice(before).map((r) => ({ kind: r.kind, type: r.type, text: (r.text || r.error || '').slice(0, 160), url: (r.url || '').slice(0, 80) }))
      matrix[key] = data
      // screenshot only core + article detail + creator detail on desktop; all core on tablet/mobile
      const shot = vp.name === 'desktop' ? !route.startsWith('/categories') : !route.startsWith('/article') && !route.startsWith('/creator')
      if (shot) {
        try { if (data.scrollHeight) await page.screenshot({ path: path.join(SHOT, `${labelFor(route)}__${vp.name}.png`), fullPage: true }) } catch {}
      }
    }
    fs.writeFileSync(path.join(OUT, `route-matrix-${vp.name}.json`), JSON.stringify(matrix, null, 2))
    // report
    const errs = box.filter((r) => ['pageerror', 'requestfailed', 'badresponse'].includes(r.kind) || (r.kind === 'console' && r.type === 'error'))
    const overflow = Object.values(matrix).filter((v) => v.overflowX === true)
    const badFooter = Object.values(matrix).filter((v) => v.footerBottom != null && !v.footerAtBottom && v.footerIsFixedOffset > 8)
    console.log(`--- ${vp.name} (${vp.width}x${vp.height}) ---`)
    console.log(`  routes: ${allRoutes.length}, console/page/network errors: ${errs.length}`)
    console.log(`  horizontal overflow routes: ${overflow.length} ${overflow.length ? '[' + overflow.map((v) => v.route).join(', ') + ']' : ''}`)
    console.log(`  routes footer not at true bottom (>8px): ${badFooter.length}`)
    if (errs.length) console.log('  sample errors:', errs.slice(0, 8).map((r) => `${r.kind}${r.type ? '/' + r.type : ''}: ${(r.text || r.error || '').slice(0, 80)}`).join(' | '))
    await ctx.close()
  }
  await browser.close()
  console.log('\nWrote route matrices to', OUT)
}

run().catch((e) => { console.error(e); process.exit(1) })
