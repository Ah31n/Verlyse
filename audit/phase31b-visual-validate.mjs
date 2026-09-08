#!/usr/bin/env node
/**
 * PHASE 31B — VISUAL VALIDATION (P27 Penpot fidelity)
 * ------------------------------------------------------------------
 * Asserts the real design requirements of the three P27-fidelity routes
 * (Entrance /, Archive /articles, Wings /categories) in live Chromium:
 * visible content, responsive dimensions, no overflow, no console/page/
 * request errors, keyboard behaviour, reduced motion, selected states,
 * archive filtering, wing selection, canonical links, and the board-
 * mandated material (solid ivory plates on the wine hall).
 *
 * Deliberately does NOT assert impl-specific trivia; only real board
 * requirements. All numbers are measured from live renders.
 */
import puppeteer from 'puppeteer'

const BASE = 'http://localhost:5173'
const OUT = 'audit/shots/phase31b'

let PASS = 0
let FAIL = 0
let INFO = 0
const pass = (m, d = '') => { PASS++; console.log(`  [PASS] ${m}${d ? ` — ${d}` : ''}`) }
const fail = (m, d = '') => { FAIL++; console.log(`  [FAIL] ${m}${d ? ` — ${d}` : ''}`) }
const info = (m, d = '') => { INFO++; console.log(`  [info] ${m}${d ? ` — ${d}` : ''}`) }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const VIEWPORTS = {
  desk: { width: 1440, height: 900, file: 'entrance-1440.png' },
  tab: { width: 768, height: 1024, file: 'entrance-768.png' },
  mob: { width: 390, height: 844, file: 'entrance-390.png' },
}

async function launch(vp, { reduced = false, noWebGL = false } = {}) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      ...(noWebGL ? ['--disable-gpu'] : []),
    ],
  })
  const page = await browser.newPage()
  await page.setViewport(vp)
  if (reduced) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  const errors = []
  const failed = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('requestfailed', (r) => failed.push(`${r.url()} ${r.failure()?.errorText ?? ''}`))
  return { browser, page, errors, failed }
}

const go = async (page, route) => {
  await page.goto(BASE + route, { waitUntil: 'load', timeout: 60000 })
  await sleep(7000) // lazy routes settle 4.2-7s
}

/* =====================================================================
   1 · THE THREE ROUTES — visible content + canonical links
   ===================================================================== */
console.log('\n=== 1 · ROUTES & CANONICAL LINKS ===')
{
  const { browser, page } = await launch(VIEWPORTS.desk)
  await go(page, '/')
  const h1 = await page.evaluate(() => document.querySelector('h1')?.innerText?.trim() ?? '')
  h1.includes('Where Vision') ? pass('Entrance h1', h1.slice(0, 40)) : fail('Entrance h1', h1)
  const can = await page.evaluate(() => {
    const l = document.querySelector('link[rel="canonical"]')
    return l ? l.getAttribute('href') : null
  })
  can === `${BASE}/` || can?.endsWith('/') ? pass('Entrance canonical', String(can)) : fail('Entrance canonical', String(can))

  await go(page, '/articles')
  const h1a = await page.evaluate(() => document.querySelector('h1')?.innerText?.trim() ?? '')
  h1a.includes('folio shelf') ? pass('Archive h1', h1a.slice(0, 40)) : fail('Archive h1', h1a)
  const canA = await page.evaluate(() => document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null)
  canA?.includes('/articles') ? pass('Archive canonical', String(canA)) : fail('Archive canonical', String(canA))

  await go(page, '/categories')
  const h1w = await page.evaluate(() => document.querySelector('h1')?.innerText?.trim() ?? '')
  h1w.includes('wings') ? pass('Wings h1', h1w.slice(0, 40)) : fail('Wings h1', h1w)
  const canW = await page.evaluate(() => document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null)
  canW?.includes('/categories') ? pass('Wings canonical', String(canW)) : fail('Wings canonical', String(canW))
  await browser.close()
}

/* =====================================================================
   2 · RESPONSIVE — every viewport, no overflow, content visible
   ===================================================================== */
console.log('\n=== 2 · RESPONSIVE (no overflow, single h1, ivory present) ===')
for (const [name, vp] of Object.entries(VIEWPORTS)) {
  const { browser, page, errors, failed } = await launch(vp)
  for (const route of ['/', '/articles', '/categories']) {
    await go(page, route)
    const m = await page.evaluate(() => {
      const ox = document.documentElement.scrollWidth - document.documentElement.clientWidth
      const h1s = document.querySelectorAll('h1').length
      const iv = [...document.querySelectorAll('div,a,button')].filter((el) => {
        const bg = getComputedStyle(el).backgroundColor
        const m2 = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
        return m2 && +m2[1] > 200 && +m2[2] > 190 && +m2[3] > 160
      }).length
      return { ox, h1s, iv }
    })
    m.ox === 0 ? pass(`${name} ${route} no overflow`) : fail(`${name} ${route} overflow`, `${m.ox}px`)
    m.h1s === 1 ? pass(`${name} ${route} single h1`) : fail(`${name} ${route} h1 count`, String(m.h1s))
    m.iv > 0 ? pass(`${name} ${route} ivory plate present`, `${m.iv} elements`) : fail(`${name} ${route} ivory plate missing`)
    errors.length === 0 ? pass(`${name} ${route} console clean`) : fail(`${name} ${route} console`, errors.slice(0, 2).join(' | '))
    failed.length === 0 ? pass(`${name} ${route} no failed requests`) : fail(`${name} ${route} failed`, failed.slice(0, 2).join(' | '))
  }
  await browser.close()
}

/* =====================================================================
   3 · ENTRANCE — board composition: ivory sheet in the lower-middle,
       headline upper-middle, folio bar at the base
   ===================================================================== */
console.log('\n=== 3 · ENTRANCE BOARD COMPOSITION ===')
{
  const { browser, page } = await launch(VIEWPORTS.desk)
  await go(page, '/')
  const m = await page.evaluate(() => {
    const sheet = [...document.querySelectorAll('div')].find((d) => /bg-\[#F8F6F2\]/.test(d.className))
    const h1 = document.querySelector('h1')
    const folioBar = [...document.querySelectorAll('div')].find((d) => /absolute inset-x-0 bottom-0/.test(d.className) && d.textContent?.includes('Verlyse Media presents — Issue'))
    const b = (el) => { const r = el?.getBoundingClientRect(); return r ? { t: +r.top.toFixed(0), b: +r.bottom.toFixed(0), h: +r.height.toFixed(0) } : null }
    const V = window.innerHeight
    return { sheet: b(sheet), h1: b(h1), folioBar: b(folioBar), V }
  })
  if (m.sheet && m.sheet.t >= 0.38 * m.V && m.sheet.t <= 0.62 * m.V && m.sheet.b <= 0.85 * m.V)
    pass('Entrance ivory sheet in board zone (lower-middle)', `y${m.sheet.t}-${m.sheet.b}`)
  else fail('Entrance ivory sheet position', JSON.stringify(m.sheet))
  if (m.h1 && m.h1.t <= 0.55 * m.V) pass('Entrance headline upper-middle', `y${m.h1.t}`)
  else fail('Entrance headline position', JSON.stringify(m.h1))
  if (m.folioBar && m.folioBar.b >= 0.9 * m.V) pass('Entrance folio bar at base', `y${m.folioBar.t}-${m.folioBar.b}`)
  else fail('Entrance folio bar', JSON.stringify(m.folioBar))
  await browser.close()
}

/* =====================================================================
   4 · ARCHIVE — nineteen ivory folios, board rows, selected plate,
       search/filter/keyboard/Esc, canonical article links
   ===================================================================== */
console.log('\n=== 4 · ARCHIVE SHELF ===')
{
  const { browser, page, errors } = await launch(VIEWPORTS.desk)
  await go(page, '/articles')
  const shelf = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('a[id^="folio-"]')]
    const sel = cards.find((c) => c.getAttribute('aria-current') === 'true')
    const ivory = cards.filter((c) => /bg-\[#F8F6F2\]/.test(c.className)).length
    const hrefs = cards.map((c) => c.getAttribute('href'))
    return { count: cards.length, ivory, selectedId: sel?.id ?? null, hrefs, selBorder: sel ? getComputedStyle(sel).borderColor : null }
  })
  shelf.count === 19 ? pass('Archive nineteen folios') : fail('Archive folio count', String(shelf.count))
  shelf.ivory === 19 ? pass('All nineteen folios ivory plates') : fail('Ivory folio plates', `${shelf.ivory}/19`)
  shelf.selectedId === 'folio-0' ? pass('Folio №01 selected at rest', shelf.selectedId) : fail('Selected at rest', String(shelf.selectedId))
  shelf.hrefs.every((h, i) => h === (i === 0 ? '/article/their-voices-matter' : h) && h.startsWith('/article/'))
    ? pass('Canonical article links on folios')
    : fail('Article links', JSON.stringify(shelf.hrefs.slice(0, 3)))

  // filtering: category rail
  await page.evaluate(() => { [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Poetry')?.click() })
  await sleep(900)
  const filtered = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('a[id^="folio-"]')]
    const visible = cards.filter((c) => parseFloat(getComputedStyle(c).opacity) > 0.5 && c.getAttribute('href')?.startsWith('/article/'))
    return { visibleCount: visible.length, labels: visible.map((c) => c.getAttribute('aria-label')) }
  })
  filtered.visibleCount >= 1 && filtered.visibleCount <= 8
    ? pass('Category filter narrows the shelf', `${filtered.visibleCount} visible`)
    : fail('Category filter', JSON.stringify(filtered))

  // search
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'All')
    b?.click()
  })
  await sleep(500)
  await page.type('#art-search', 'Their Voices')
  await sleep(900)
  const searched = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('a[id^="folio-"]')]
    const vis = cards.filter((c) => c.getAttribute('href')?.startsWith('/article/'))
    return { n: vis.length, first: vis[0]?.getAttribute('aria-label') }
  })
  searched.n === 1 && searched.first?.includes('Their Voices Matter')
    ? pass('Search narrows to the match', `${searched.n} result — ${searched.first}`)
    : fail('Search', JSON.stringify(searched))

  // Esc restores
  await page.keyboard.press('Escape')
  await sleep(700)
  const restored = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('a[id^="folio-"]')]
    return cards.filter((c) => c.getAttribute('href')?.startsWith('/article/')).length
  })
  restored === 19 ? pass('Esc restores all nineteen') : fail('Esc restore', String(restored))

  // keyboard arrow selection
  await page.focus('#folio-0')
  await page.keyboard.press('ArrowRight')
  await sleep(400)
  const focusAfter = await page.evaluate(() => document.activeElement?.id ?? null)
  focusAfter === 'folio-1' ? pass('ArrowRight moves selection to folio-1') : fail('Arrow navigation', String(focusAfter))
  errors.length === 0 ? pass('Archive console clean during interaction') : fail('Archive console', errors.slice(0, 2).join(' | '))
  await browser.close()
}

/* =====================================================================
   5 · WINGS — ivory door plate, seven doors, selection brightens,
       non-members recede, counts update, Esc restores
   ===================================================================== */
console.log('\n=== 5 · WINGS DOORS ===')
{
  const { browser, page, errors } = await launch(VIEWPORTS.desk)
  await go(page, '/categories')
  const rest = await page.evaluate(() => {
    const doors = [...document.querySelectorAll('button')].filter((b) => /Wing/.test(b.textContent))
    const plate = doors.find((b) => /bg-\[#F8F6F2\]/.test(b.className))
    return { doors: doors.length, plateText: plate?.textContent.trim().slice(0, 30) ?? null }
  })
  rest.doors === 7 ? pass('Seven wing doors') : fail('Wing door count', String(rest.doors))
  rest.plateText?.includes('Stories') ? pass('First door is the ivory plate at rest', rest.plateText) : fail('Rest plate', String(rest.plateText))

  // select Poetry
  await page.evaluate(() => { [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Poetry'))?.click() })
  await sleep(1500)
  const sel = await page.evaluate(() => {
    const pressed = [...document.querySelectorAll('button')].find((b) => b.getAttribute('aria-pressed') === 'true')
    const plate = [...document.querySelectorAll('button')].find((b) => /bg-\[#F8F6F2\]/.test(b.className))
    const receded = [...document.querySelectorAll('button')]
      .filter((b) => /Wing/.test(b.textContent) && b.getAttribute('aria-pressed') !== 'true')
      .map((b) => parseFloat(getComputedStyle(b.closest('div')).opacity))
    return { pressed: pressed?.textContent.trim().slice(0, 24), plateText: plate?.textContent.trim().slice(0, 24), recededMin: Math.min(...receded), folios: [...document.querySelectorAll('a[href^="/article/"]')].length }
  })
  sel.pressed?.includes('Poetry') ? pass('Poetry selected (aria-pressed)') : fail('Poetry selected', String(sel.pressed))
  sel.plateText?.includes('Poetry') ? pass('Ivory plate follows the selected wing', sel.plateText) : fail('Selected plate', String(sel.plateText))
  sel.recededMin < 0.5 ? pass('Non-members recede', `opacity ${sel.recededMin}`) : fail('Recede state', String(sel.recededMin))
  sel.folios >= 7 ? pass('Poetry folios step forward', `${sel.folios} links`) : fail('Folios forward', String(sel.folios))

  // Esc restores the rest state
  await page.keyboard.press('Escape')
  await sleep(700)
  const esc = await page.evaluate(() => {
    const pressed = [...document.querySelectorAll('button')].filter((b) => b.getAttribute('aria-pressed') === 'true').length
    const plate = [...document.querySelectorAll('button')].find((b) => /bg-\[#F8F6F2\]/.test(b.className))
    return { pressed, plateText: plate?.textContent.trim().slice(0, 16) ?? null }
  })
  esc.pressed === 0 && esc.plateText?.includes('Stories')
    ? pass('Esc restores rest — first door plate again')
    : fail('Esc restore', JSON.stringify(esc))
  errors.length === 0 ? pass('Wings console clean during interaction') : fail('Wings console', errors.slice(0, 2).join(' | '))
  await browser.close()
}

/* =====================================================================
   6 · REDUCED MOTION — static compositions, all three routes
   ===================================================================== */
console.log('\n=== 6 · REDUCED MOTION (static, content intact) ===')
for (const route of ['/', '/articles', '/categories']) {
  const { browser, page } = await launch(VIEWPORTS.desk, { reduced: true })
  await go(page, route)
  const m = await page.evaluate(() => {
    const h1 = document.querySelector('h1')?.innerText?.trim() ?? ''
    const running = document.getAnimations().filter((a) => a.playState === 'running').length
    const ox = document.documentElement.scrollWidth - document.documentElement.clientWidth
    return { h1, running, ox }
  })
  m.h1 && m.running <= 1 && m.ox === 0
    ? pass(`REDUCED ${route} — static, intact (${m.running} running)`)
    : fail(`REDUCED ${route}`, JSON.stringify(m))
  await browser.close()
}

console.log(`\nPHASE 31B VISUAL VALIDATE — ${PASS} PASS / ${FAIL} FAIL / ${INFO} INFO`)
process.exit(FAIL === 0 ? 0 : 1)
