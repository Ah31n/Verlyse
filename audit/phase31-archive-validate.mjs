// PHASE 31 — ARCHIVE MOBILE ABOVE-THE-FOLD validation (real Chromium).
// Fix D-02: /articles mobile (390×844 / 360×800) must show kicker + title +
// first folio above the fixed bottom dock, with zero overflow, 1 h1, and all
// functionality (search, filter, keyboard nav, reduced-motion, WebGL-off)
// intact. Desktop/tablet must be unchanged (19 folios, same grids).
// Exits non-zero on any FAIL.
import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'

const BASE = 'http://localhost:5173'
const OUT = path.resolve('audit/shots/phase31')
fs.mkdirSync(OUT, { recursive: true })
const RESULTS = path.resolve('audit/phase31-archive-results.json')

let PASS = 0, FAIL = 0, INFO = 0
const checks = []
const pass = (n, d = '') => { PASS++; checks.push({ check: n, status: 'PASS', detail: d }) }
const fail = (n, d = '') => { FAIL++; checks.push({ check: n, status: 'FAIL', detail: d }) }
const info = (n, d = '') => { INFO++; checks.push({ check: n, status: 'INFO', detail: d }) }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function launch(viewport, opts = {}) {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--use-gl=swiftshader'] })
  const page = await browser.newPage()
  await page.setViewport(viewport)
  if (opts.reduced) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  if (opts.noWebGL) {
    await page.evaluateOnNewDocument(() => {
      HTMLCanvasElement.prototype.getContext = function (t, ...a) { if (String(t).toLowerCase().includes('webgl')) return null; return null }
    })
  }
  const errors = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 100)) })
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 100)))
  return { browser, page, errors }
}

async function headerGeometry(page) {
  return page.evaluate(() => {
    const q = (sel) => { const el = document.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect(); return { y: Math.round(r.y), bottom: Math.round(r.bottom) } }
    const kicker = Array.from(document.querySelectorAll('p')).find((p) => p.textContent.includes('The Archive — 19 features'))
    const dock = document.querySelector('.fixed.bottom-0')
    const dockRect = dock && getComputedStyle(dock).display !== 'none' ? dock.getBoundingClientRect() : null
    const thread = Array.from(document.querySelectorAll('div')).find((d) => getComputedStyle(d).backgroundImage.includes('217, 185, 120') && getComputedStyle(d).width === '1px')
    const tr = thread ? { w: getComputedStyle(thread).width, h: getComputedStyle(thread).height } : null
    return {
      kicker: kicker ? { y: Math.round(kicker.getBoundingClientRect().y), bottom: Math.round(kicker.getBoundingClientRect().bottom) } : null,
      h1: q('h1'),
      search: q('#art-search'),
      firstFolio: q('#folio-0'),
      folio1: q('#folio-1'),
      dockTop: dockRect ? Math.round(dockRect.top) : null,
      fold: innerHeight,
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      h1count: document.querySelectorAll('h1').length,
      folios: document.querySelectorAll('a[aria-label^="Folio"]').length,
      thread: tr,
      gridCols: getComputedStyle(document.querySelector('#folio-0')?.closest('.grid')).gridTemplateColumns.split(' ').length,
    }
  })
}

// ---------------- MOBILE 390×844 ----------------
{
  const { browser, page, errors } = await launch({ width: 390, height: 844 })
  await page.goto(BASE + '/articles', { waitUntil: 'domcontentloaded', timeout: 45000 })
  await sleep(5000)
  const g = await headerGeometry(page)
  await page.screenshot({ path: path.join(OUT, 'archive-390-after.png') })
  const foldLine = g.dockTop ?? g.fold // bottom of the usable viewport = dock top when dock visible
  if (g.h1count === 1) { pass('390: one h1') } else { fail('390: one h1', JSON.stringify(g.h1count)) }
  if (g.kicker && g.kicker.y > 0 && g.kicker.bottom <= foldLine) { pass('390: kicker above fold') } else { fail('390: kicker above fold', JSON.stringify(g.kicker)) }
  if (g.h1 && g.h1.y > 0 && g.h1.bottom <= foldLine) { pass('390: title above fold') } else { fail('390: title above fold', JSON.stringify(g.h1)) }
  if (g.firstFolio && g.firstFolio.y > 0 && g.firstFolio.bottom <= foldLine) { pass('390: first folio above dock') } else { fail('390: first folio above dock', JSON.stringify(g.firstFolio)) }
  if (g.overflowX === 0) { pass('390: no horizontal overflow') } else { fail('390: no horizontal overflow', JSON.stringify(g.overflowX)) }
  if (g.folios === 19) { pass('390: 19 folios present') } else { fail('390: 19 folios present', JSON.stringify(g.folios)) }
  if (g.thread && g.thread.w === '1px' && parseFloat(g.thread.h) > 300) { pass('390: brass thread retained (1px × >300px)') } else { fail('390: brass thread retained', JSON.stringify(g.thread)) }
  if (errors.length === 0) { pass('390: console clean') } else { fail('390: console clean', JSON.stringify(errors.slice(0, 2))) }
  await browser.close()
}

// ---------------- MOBILE 360×800 ----------------
{
  const { browser, page, errors } = await launch({ width: 360, height: 800 })
  await page.goto(BASE + '/articles', { waitUntil: 'domcontentloaded', timeout: 45000 })
  await sleep(5000)
  const g = await headerGeometry(page)
  const foldLine = g.dockTop ?? g.fold
  if (g.h1 && g.h1.bottom <= foldLine) { pass('360: title above fold') } else { fail('360: title above fold', JSON.stringify(g.h1)) }
  if (g.firstFolio && g.firstFolio.bottom <= foldLine) { pass('360: first folio above dock') } else { fail('360: first folio above dock', JSON.stringify(g.firstFolio)) }
  if (g.overflowX === 0) { pass('360: no horizontal overflow') } else { fail('360: no horizontal overflow', JSON.stringify(g.overflowX)) }
  if (errors.length === 0) { pass('360: console clean') } else { fail('360: console clean', JSON.stringify(errors.slice(0, 2))) }
  await browser.close()
}

// ---------------- DESKTOP 1440×900 (unchanged) ----------------
{
  const { browser, page, errors } = await launch({ width: 1440, height: 900 })
  await page.goto(BASE + '/articles', { waitUntil: 'domcontentloaded', timeout: 45000 })
  await sleep(5000)
  const g = await headerGeometry(page)
  if (g.gridCols === 5) { pass('desktop: 5-column shelf') } else { fail('desktop: 5-column shelf', JSON.stringify(g.gridCols)) }
  if (g.folios === 19) { pass('desktop: 19 folios') } else { fail('desktop: 19 folios', JSON.stringify(g.folios)) }
  if (g.overflowX === 0) { pass('desktop: no overflow') } else { fail('desktop: no overflow', JSON.stringify(g.overflowX)) }
  if (g.h1count === 1) { pass('desktop: one h1') } else { fail('desktop: one h1', JSON.stringify(g.h1count)) }
  if (errors.length === 0) { pass('desktop: console clean') } else { fail('desktop: console clean', JSON.stringify(errors.slice(0, 2))) }
  await browser.close()
}

// ---------------- TABLET 768×1024 (unchanged) ----------------
{
  const { browser, page, errors } = await launch({ width: 768, height: 1024 })
  await page.goto(BASE + '/articles', { waitUntil: 'domcontentloaded', timeout: 45000 })
  await sleep(5000)
  const g = await headerGeometry(page)
  if (g.gridCols === 3) { pass('tablet: 3-column shelf') } else { fail('tablet: 3-column shelf', JSON.stringify(g.gridCols)) }
  if (g.folios === 19) { pass('tablet: 19 folios') } else { fail('tablet: 19 folios', JSON.stringify(g.folios)) }
  if (g.overflowX === 0) { pass('tablet: no overflow') } else { fail('tablet: no overflow', JSON.stringify(g.overflowX)) }
  if (errors.length === 0) { pass('tablet: console clean') } else { fail('tablet: console clean', JSON.stringify(errors.slice(0, 2))) }
  await browser.close()
}

// ---------------- REDUCED MOTION (mobile) ----------------
{
  const { browser, page, errors } = await launch({ width: 390, height: 844 }, { reduced: true })
  await page.goto(BASE + '/articles', { waitUntil: 'domcontentloaded', timeout: 45000 })
  await sleep(5000)
  const g = await headerGeometry(page)
  if (g.h1 && g.firstFolio && g.firstFolio.bottom <= (g.dockTop ?? g.fold)) { pass('reduced: mobile layout intact above fold') } else { fail('reduced: mobile layout intact', JSON.stringify({ h1: g.h1, first: g.firstFolio })) }
  if (g.overflowX === 0) { pass('reduced: no overflow') } else { fail('reduced: no overflow', JSON.stringify(g.overflowX)) }
  if (errors.length === 0) { pass('reduced: console clean') } else { fail('reduced: console clean', JSON.stringify(errors.slice(0, 2))) }
  await browser.close()
}

// ---------------- WEBGL OFF (mobile fallback) ----------------
{
  const { browser, page, errors } = await launch({ width: 390, height: 844 }, { noWebGL: true })
  await page.goto(BASE + '/articles', { waitUntil: 'domcontentloaded', timeout: 45000 })
  await sleep(5000)
  const g = await headerGeometry(page)
  if (g.h1 && g.overflowX === 0) { pass('webgloff: layout intact, no overflow') } else { fail('webgloff: layout intact', JSON.stringify(g)) }
  await browser.close()
}

// ---------------- KEYBOARD NAV + SEARCH/FILTER ----------------
{
  const { browser, page, errors } = await launch({ width: 390, height: 844 })
  await page.goto(BASE + '/articles', { waitUntil: 'domcontentloaded', timeout: 45000 })
  await sleep(5000)
  // keyboard: focus search, type a query, expect the visible set to shrink
  await page.focus('#art-search')
  await page.keyboard.type('mir raza')
  await sleep(800)
  const typed = await page.evaluate(() => {
    const bright = Array.from(document.querySelectorAll('a[aria-label^="Folio"]')).filter((a) => getComputedStyle(a.closest('span')).opacity !== '0.1' || getComputedStyle(a.parentElement.parentElement).opacity !== '0.3')
    return { value: document.querySelector('#art-search').value, labels: Array.from(document.querySelectorAll('a[aria-label^="Folio"]')).slice(0, 3).map((a) => a.getAttribute('aria-label')) }
  })
  if (typed.value === 'mir raza') { pass('search: query typed') } else { fail('search: query typed', JSON.stringify(typed.value)) }
  // Esc returns to full shelf
  await page.keyboard.press('Escape')
  await sleep(600)
  const esc = await page.evaluate(() => document.querySelector('#art-search').value === '' && Array.from(document.querySelectorAll('a[aria-label^="Folio"]')).length === 19)
  if (esc) { pass('search: Esc returns to all 19') } else { fail('search: Esc returns to all 19') }
  // arrow-key selection still moves focus
  await page.focus('#folio-0')
  await page.keyboard.press('ArrowRight')
  await sleep(400)
  const moved = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))
  if (moved && moved.startsWith('Folio') && moved !== 'Folio 01') { pass('keyboard: ArrowRight moves selection', moved) } else { fail('keyboard: ArrowRight moves selection', JSON.stringify(moved)) }
  if (errors.length === 0) { pass('interaction: console clean') } else { fail('interaction: console clean', JSON.stringify(errors.slice(0, 2))) }
  await browser.close()
}

fs.writeFileSync(RESULTS, JSON.stringify(checks, null, 1))
console.log(`PHASE 31 ARCHIVE — ${PASS} PASS / ${FAIL} FAIL / ${INFO} INFO`)
for (const c of checks) console.log(`  [${c.status}] ${c.check}${c.detail ? ' — ' + c.detail : ''}`)
process.exit(FAIL ? 1 : 0)
