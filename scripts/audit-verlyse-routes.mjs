/* eslint-disable no-console */
import { chromium } from '@playwright/test'
import * as fs from 'node:fs'
import * as path from 'node:path'

/**
 * Verlyse full route / runtime / accessibility evidence collector (local only).
 * Covers: all 19 article slugs, all 16 creator slugs, plus the core public
 * routes, at 1440x900 and 390x844. Captures console/page errors, failed
 * requests, bad responses; records scrollHeight, footer rect, horizontal
 * overflow; tests reduced-motion and WebGL-disabled fallback; saves screenshots.
 * Writes docs/verlyse/route-matrix.json and page-heights.json.
 */
const BASE = 'http://127.0.0.1:5173'
const OUT = path.resolve(process.cwd(), 'docs/verlyse')
const SHOT = path.join(OUT, 'screenshots')

const CORE = [
  '/', '/articles', '/categories', '/categories?room=Stories', '/creators',
  '/community', '/ambassadors', '/about', '/submit', '/contact',
]
// All article + creator slugs (from the canonical registry).
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
  { name: 'mobile', width: 390, height: 844 },
]

function attachCollectors(page, box) {
  page.on('console', (m) => {
    if (['error', 'warning'].includes(m.type())) box.push({ kind: 'console', type: m.type(), text: m.text() })
  })
  page.on('pageerror', (e) => box.push({ kind: 'pageerror', text: String((e && e.message) || e) }))
  page.on('requestfailed', (r) => box.push({ kind: 'requestfailed', url: r.url(), error: r.failure()?.errorText }))
  page.on('response', (r) => { if (r.status() >= 400) box.push({ kind: 'badresponse', url: r.url(), status: r.status() }) })
}

const labelFor = (route) => route.replace(/^\//, '').replace(/[\/?=&]/g, '-') || 'home'

async function snap(page) {
  return page.evaluate(() => {
    const footer = document.querySelector('footer') || document.querySelector('[role=contentinfo]')
    const fr = footer ? footer.getBoundingClientRect() : null
    const h1 = document.querySelector('h1')
    const se = document.scrollingElement || document.documentElement
    return {
      title: document.title,
      h1: h1 ? h1.textContent.trim().slice(0, 120) : null,
      scrollHeight: se.scrollHeight,
      footerTop: fr ? Math.round(fr.top) : null,
      footerBottom: fr ? Math.round(fr.bottom) : null,
      footerBottomOnScreen: fr ? Math.round(fr.bottom) : null,
      footerVisible: !!fr && fr.top < window.innerHeight,
      overflowX: document.documentElement.scrollWidth > window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }
  })
}

async function auditCtx(browser, viewport, box, opts) {
  const matrix = {}
  const pageHeights = {}
  const ctx = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, ...(opts?.context || {}) })
  const page = await ctx.newPage()
  attachCollectors(page, box)

  async function visit(route) {
    const key = `${labelFor(route)}|${viewport.name}`
    let data = {}
    try {
      await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 45000 })
      await page.waitForTimeout(1600)
      data = await snap(page)
    } catch (e) {
      data = { error: String(e) }
    }
    if (data.scrollHeight) pageHeights[key] = data.scrollHeight
    if (opts?.shot !== false) {
      try { await page.screenshot({ path: path.join(SHOT, `${labelFor(route)}__${viewport.name}.png`), fullPage: true }) } catch {}
    }
    return { key, data }
  }

  // Core routes (screenshots on desktop only to avoid bloat)
  for (const route of CORE) {
    const { key, data } = await visit(route)
    matrix[key] = data
  }
  // Article detail routes
  for (const slug of ARTICLE_SLUGS) {
    const { key, data } = await visit(`/article/${slug}`)
    matrix[key] = data
  }
  // Creator detail routes
  for (const slug of CREATOR_SLUGS) {
    const { key, data } = await visit(`/creator/${slug}`)
    matrix[key] = data
  }
  await ctx.close()
  return { matrix, pageHeights }
}

async function run() {
  fs.mkdirSync(SHOT, { recursive: true })
  const browser = await chromium.launch()

  // ---- 1. Standard matrix (desktop + mobile) ----
  const box = []
  for (const vp of VIEWPORTS) {
    const { matrix, pageHeights } = await auditCtx(browser, vp, box, {})
    fs.writeFileSync(path.join(OUT, `route-matrix-${vp.name}.json`), JSON.stringify(matrix, null, 2))
    fs.writeFileSync(path.join(OUT, `page-heights-${vp.name}.json`), JSON.stringify(pageHeights, null, 2))
  }

  // ---- 2. Reduced-motion test (homepage + a detail route) ----
  const rmBox = []
  for (const vp of VIEWPORTS) {
    const { matrix } = await auditCtx(browser, vp, rmBox, {
      context: { reducedMotion: 'reduce' },
      shot: false,
    })
    fs.writeFileSync(path.join(OUT, `route-matrix-${vp.name}-reduced.json`), JSON.stringify(matrix, null, 2))
  }

  // ---- 3. WebGL-disabled test (emulate no WebGL) ----
  const glBox = []
  const glCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  await glCtx.addInitScript(() => {
    const orig = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (type, ...a) {
      if (String(type).includes('webgl')) return null
      return orig.call(this, type, ...a)
    }
  })
  const glPage = await glCtx.newPage()
  attachCollectors(glPage, glBox)
  const glData = {}
  for (const route of ['/', '/article/their-voices-matter']) {
    await glPage.goto(BASE + route, { waitUntil: 'networkidle', timeout: 45000 })
    await glPage.waitForTimeout(1500)
    glData[route] = await snap(glPage)
  }
  fs.writeFileSync(path.join(OUT, 'webgl-off.json'), JSON.stringify({ routes: glData, records: glBox.length ? glBox : 'clean' }, null, 2))
  await glCtx.close()

  // ---- global collector report ----
  fs.writeFileSync(path.join(OUT, 'console-network-report.json'), JSON.stringify(
    { total_records_captured: box.length, records: box.length ? box.slice(0, 200) : 'clean' }, null, 2))

  await browser.close()

  // ---- summary ----
  const errs = box.filter((r) => ['error', 'pageerror', 'requestfailed', 'badresponse'].includes(r.kind === 'pageerror' ? r.kind : r.kind === 'console' && r.type === 'error' ? 'error' : r.kind))
  console.log('Collected records:', box.length)
  console.log('Errors / network failures:', errs.length)
  console.log('Warnings:', box.filter((r) => r.kind === 'console' && r.type === 'warning').length)
  console.log('\nWrote evidence to', OUT)
}

run().catch((e) => { console.error(e); process.exit(1) })
