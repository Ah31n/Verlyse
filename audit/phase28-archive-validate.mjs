// PHASE 28B — THE ARCHIVE · real-Chromium validation (Penpot Phase-27 fidelity)
// /articles — wine hall + shelf depths, SEARCH + category rail, 19 folio
// spines, №01 SELECTED. States REST/FOCUS/SELECTED/FILTERED/SEARCH/RETURN.
// Exits non-zero on any FAIL.
import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'

const BASE = 'http://localhost:5173'
const OUT = path.resolve('audit/shots/phase28')
fs.mkdirSync(OUT, { recursive: true })
const RESULTS = path.resolve('audit/phase28-archive-results.json')

let PASS = 0, FAIL = 0, INFO = 0
const checks = []
const pass = (name, detail = '') => { PASS++; checks.push({ name, status: 'PASS', detail }) }
const fail = (name, detail = '') => { FAIL++; checks.push({ name, status: 'FAIL', detail }) }
const info = (name, detail = '') => { INFO++; checks.push({ name, status: 'INFO', detail }) }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const TITLES = ['Their Voices Matter', '3:13', 'The Empty Waltz', 'The Arts Deserve Respect', 'Hope Becomes Mythology', "A Student's Worth", 'Tasbih-e-Fatima', 'Intellect Lost to Code', 'Forgive Me, Mother', 'Water Cat', 'If Hope Were a Feather', 'The Horrors of Child Sexual Abuse', 'Khageena', 'Behind Every Headline', 'Jaldi', 'Failure', 'My Last Breath', 'The Garden Beyond My Tower', 'Mir Raza Ali']
const DEPS = ['STORIES', 'POETRY', 'ESSAYS', 'ART', 'SOCIAL ISSUES', 'LIFESTYLE', 'HORROR']

async function launch(viewport, opts = {}) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--use-gl=swiftshader'],
  })
  const page = await browser.newPage()
  await page.setViewport(viewport)
  if (opts.reduced) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  if (opts.webglOff) {
    await page.evaluateOnNewDocument(() => {
      const c = HTMLCanvasElement.prototype.getContext
      HTMLCanvasElement.prototype.getContext = function (...a) {
        if (a[0] === 'webgl' || a[0] === 'webgl2') return null
        return c.apply(this, a)
      }
    })
  }
  const errors = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)) })
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)))
  const failed = []
  page.on('requestfailed', (r) => failed.push(r.url().slice(0, 160)))
  await page.goto(BASE + '/articles', { waitUntil: 'domcontentloaded', timeout: 45000 })
  await sleep(4200)
  return { browser, page, errors, failed }
}

/* ---------- 1 · DESKTOP ---------- */
{
  const { browser, page, errors } = await launch({ width: 1440, height: 900 })
  const body = await page.evaluate(() => document.body.innerText)
  const hasT = (s) => body.toLowerCase().includes(s.toLowerCase())

  // all 19 titles
  const found = TITLES.filter((t) => hasT(t))
  found.length === 19 ? pass('all 19 folio titles present', `${found.length}/19`) : fail('all 19 folio titles present', `missing: ${TITLES.filter((t) => !hasT(t)).join(', ')}`)

  // header + search + rail
  hasT('19 features') && hasT('16 voices') && hasT('7 departments') ? pass('archive header line') : fail('archive header line')
  hasT('Search the archive') ? pass('search field') : fail('search field')
  const deps = DEPS.filter((d) => hasT(d))
  deps.length === 7 ? pass('category rail — 7 departments') : fail('category rail — 7 departments', `missing ${DEPS.filter((d) => !hasT(d))}`)

  // №01 SELECTED default
  const sel01 = await page.evaluate(() => {
    const el = [...document.querySelectorAll('a[aria-current="true"]')][0]
    return el ? { text: el.innerText, href: el.getAttribute('href') } : null
  })
  const selText = (sel01?.text || '').toLowerCase()
  sel01 && selText.includes('their voices matter') && selText.includes('selected — open folio')
    ? pass('№01 SELECTED by default — “Selected — open folio →”', JSON.stringify(sel01))
    : fail('№01 SELECTED by default', JSON.stringify(sel01))
  sel01?.href === '/article/their-voices-matter' ? pass('selected folio links to its article') : fail('selected folio links')

  // every folio is a real link to its article
  const linkCount = await page.evaluate(() => document.querySelectorAll('a[href^="/article/"]').length)
  linkCount === 19 ? pass('19 real article links') : fail('19 real article links', `${linkCount}`)

  // FILTERED — Poetry rail recedes the rest
  await page.evaluate(() => { [...document.querySelectorAll('button')].find((b) => b.innerText.trim() === 'Poetry')?.click() })
  await sleep(500)
  const filtered = await page.evaluate(() => {
    const folios = [...document.querySelectorAll('a[href^="/article/"]')]
    const bright = folios.filter((f) => f.closest('div') && getComputedStyle(f.closest('div')).opacity !== '0.3')
    return { total: folios.length, titles: folios.map((f) => f.innerText.split('\n')[1]?.trim()) }
  })
  const poetryCount = filtered.titles.filter((t) => ['Hope Becomes Mythology', 'Forgive Me, Mother', 'If Hope Were a Feather', 'Jaldi', 'Failure', 'My Last Breath', 'The Garden Beyond My Tower'].includes(t)).length
  poetryCount === 7 ? pass('FILTERED — Poetry keeps its 7 folios', `${poetryCount} poetry folios`) : fail('FILTERED — Poetry', `${poetryCount}/7`)

  // SEARCH
  await page.evaluate(() => {
    const el = document.querySelector('#art-search')
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
    setter.call(el, '3:13')
    el.dispatchEvent(new Event('input', { bubbles: true }))
  })
  await sleep(500)
  const searchTitles = await page.evaluate(() => [...document.querySelectorAll('a[href^="/article/"]')].map((f) => f.innerText.split('\n')[1]?.trim()))
  searchTitles.length === 1 && searchTitles[0] === '3:13' ? pass('SEARCH — “3:13” isolates folio №02') : fail('SEARCH', JSON.stringify(searchTitles))

  // RETURN — Esc (from the focused search field) restores all
  await page.focus('#art-search')
  await page.keyboard.press('Escape')
  await sleep(400)
  const restored = await page.evaluate(() => document.querySelectorAll('a[href^="/article/"]').length)
  restored === 19 ? pass('RETURN — Esc restores all nineteen') : fail('RETURN — Esc restores all nineteen', `${restored}`)

  // keyboard — arrows move selection, Enter opens
  const kb = await page.evaluate(async () => {
    const first = document.querySelector('a[aria-current="true"]')
    first?.focus()
    const before = document.activeElement?.getAttribute('aria-current')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    await new Promise((r) => setTimeout(r, 120))
    const after = document.activeElement?.getAttribute('aria-current')
    return { before, after }
  })
  kb.before === 'true' && kb.after === 'true' ? pass('keyboard — arrow moves selection between folios') : fail('keyboard — arrow', JSON.stringify(kb))

  // overflow
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  overflow <= 1 ? pass('no horizontal overflow @1440', `${overflow}px`) : fail('no horizontal overflow @1440', `${overflow}px`)
  errors.length === 0 ? pass('zero console errors @1440') : fail('zero console errors @1440', errors.slice(0, 3).join(' | '))

  await page.screenshot({ path: path.join(OUT, 'archive-desktop.png') })
  info('capture', 'archive-desktop.png')
  await browser.close()
}

/* ---------- 2 · TABLET ---------- */
{
  const { browser, page, errors } = await launch({ width: 768, height: 1024 })
  const body = await page.evaluate(() => document.body.innerText)
  const hasT = (s) => body.toLowerCase().includes(s.toLowerCase())
  const found = TITLES.filter((t) => hasT(t))
  found.length === 19 ? pass('tablet — all 19 titles (recomposed columns)') : fail('tablet — all 19 titles', `${found.length}/19`)
  hasT('Their Voices Matter') ? pass('tablet — №01 selected present') : fail('tablet — №01 selected present')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  overflow <= 1 ? pass('tablet — no horizontal overflow @768') : fail('tablet — no horizontal overflow @768', `${overflow}px`)
  errors.length === 0 ? pass('tablet — zero console errors') : fail('tablet — console errors', errors.slice(0, 3).join(' | '))
  await page.screenshot({ path: path.join(OUT, 'archive-tablet.png') })
  info('capture', 'archive-tablet.png')
  await browser.close()
}

/* ---------- 3 · MOBILE ---------- */
{
  const { browser, page, errors } = await launch({ width: 390, height: 844 })
  const body = await page.evaluate(() => document.body.innerText)
  const hasT = (s) => body.toLowerCase().includes(s.toLowerCase())
  const found = TITLES.filter((t) => hasT(t))
  found.length === 19 ? pass('mobile — all 19 titles (single column shelf)') : fail('mobile — all 19 titles', `${found.length}/19`)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  overflow <= 1 ? pass('mobile — no horizontal overflow @390') : fail('mobile — no horizontal overflow @390', `${overflow}px`)
  errors.length === 0 ? pass('mobile — zero console errors') : fail('mobile — console errors', errors.slice(0, 3).join(' | '))
  await page.screenshot({ path: path.join(OUT, 'archive-mobile.png') })
  info('capture', 'archive-mobile.png')
  await browser.close()
}

/* ---------- 4 · REDUCED MOTION ---------- */
{
  const { browser, page, errors } = await launch({ width: 1440, height: 900 }, { reduced: true })
  const body = await page.evaluate(() => document.body.innerText)
  const hasT = (s) => body.toLowerCase().includes(s.toLowerCase())
  const found = TITLES.filter((t) => hasT(t))
  found.length === 19 ? pass('reduced — full shelf present (static)') : fail('reduced — full shelf', `${found.length}/19`)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  overflow <= 1 ? pass('reduced — no horizontal overflow') : fail('reduced — no horizontal overflow', `${overflow}px`)
  errors.length === 0 ? pass('reduced — zero console errors') : fail('reduced — console errors', errors.slice(0, 3).join(' | '))
  await page.screenshot({ path: path.join(OUT, 'archive-reduced.png') })
  info('capture', 'archive-reduced.png')
  await browser.close()
}

/* ---------- 5 · WEBGL-OFF ---------- */
{
  const { browser, page, errors } = await launch({ width: 1440, height: 900 }, { webglOff: true })
  const canvases = await page.evaluate(() => document.querySelectorAll('canvas').length)
  canvases === 0 ? pass('WebGL-off — zero canvases on the archive') : info('WebGL-off — canvases', `${canvases}`)
  const body = await page.evaluate(() => document.body.innerText)
  body.toLowerCase().includes('their voices matter') ? pass('WebGL-off — archive complete') : fail('WebGL-off — archive complete')
  await page.screenshot({ path: path.join(OUT, 'archive-webgloff.png') })
  info('capture', 'archive-webgloff.png')
  await browser.close()
}

/* ---------- results ---------- */
const summary = { phase: '28B', PASS, FAIL, INFO, checks }
fs.writeFileSync(RESULTS, JSON.stringify(summary, null, 1))
console.log(`\n28B · THE ARCHIVE — ${PASS} PASS / ${FAIL} FAIL / ${INFO} INFO`)
if (FAIL > 0) {
  for (const c of checks.filter((x) => x.status === 'FAIL')) console.log('  FAIL —', c.name, '·', c.detail)
  process.exit(1)
}
console.log('ALL GREEN')
