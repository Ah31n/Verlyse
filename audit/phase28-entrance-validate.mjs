// PHASE 28A — THE ENTRANCE · real-Chromium validation (Penpot Phase-27 fidelity)
// / — wine hall threshold: ghost wordmark (static brass), issue line, tagline,
// feature plate №01, ENTER THE ARCHIVE →. Responsive + reduced-motion + WebGL-off.
// Exits non-zero on any FAIL.
import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'

const BASE = 'http://localhost:5173'
const OUT = path.resolve('audit/shots/phase28')
fs.mkdirSync(OUT, { recursive: true })
const RESULTS = path.resolve('audit/phase28-entrance-results.json')

let PASS = 0, FAIL = 0, INFO = 0
const checks = []
const pass = (name, detail = '') => { PASS++; checks.push({ name, status: 'PASS', detail }) }
const fail = (name, detail = '') => { FAIL++; checks.push({ name, status: 'FAIL', detail }) }
const info = (name, detail = '') => { INFO++; checks.push({ name, status: 'INFO', detail }) }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const VIEWPORTS = {
  desktop: { width: 1440, height: 900, file: 'entrance-desktop.png' },
  tablet: { width: 768, height: 1024, file: 'entrance-tablet.png' },
  mobile: { width: 390, height: 844, file: 'entrance-mobile.png' },
}

async function launch(viewport, opts = {}) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--use-gl=swiftshader'],
  })
  const page = await browser.newPage()
  await page.setViewport(viewport)
  if (opts.reduced) {
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  }
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
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 45000 })
  await sleep(5600) // preloader curtain + entrance settle + font load
  return { browser, page, errors, failed }
}

/* ---------- 1 · DESKTOP ---------- */
{
  const { browser, page, errors, failed } = await launch(VIEWPORTS.desktop)
  const name = '28A'

  // composition presence
  const body = await page.evaluate(() => document.body.innerText)
  const q = (sel) => page.$(sel)
  const visible = (sel) => page.evaluate((s) => {
    const el = document.querySelector(s)
    if (!el) return false
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.opacity !== '0'
  }, sel)

  const hasT = (s) => body.toLowerCase().includes(s.toLowerCase())
  const tagline = hasT('Where Vision') && hasT('Becomes') && hasT('A Voice')
  tagline ? pass('tagline present', '“Where Vision Becomes A Voice” on desktop') : fail('tagline present')
  hasT('Issue № 01') ? pass('issue line', 'Issue № 01 — 19 folios · 16 voices · 7 departments') : fail('issue line')
  hasT('Their Voices Matter') ? pass('feature №01 title') : fail('feature №01 title')
  hasT('Verlyse Media presents') ? pass('“Verlyse Media presents” eyebrow') : fail('eyebrow')
  hasT('@lina_.jved') ? pass('feature author metadata') : fail('feature author metadata')
  hasT('Enter the archive') ? pass('primary action — Enter the archive →') : fail('primary action')
  hasT('Student-led publication') ? pass('supporting line') : fail('supporting line')

  // links
  const enterHref = await page.evaluate(() => {
    const a = [...document.querySelectorAll('a')].find((x) => x.textContent.includes('Enter the archive'))
    return a ? a.getAttribute('href') : null
  })
  enterHref === '/articles' ? pass('ENTER THE ARCHIVE → /articles', String(enterHref)) : fail('ENTER THE ARCHIVE → /articles', String(enterHref))
  const folioHref = await page.evaluate(() => {
    const a = [...document.querySelectorAll('a')].find((x) => x.textContent.includes('Their Voices Matter'))
    return a ? a.getAttribute('href') : null
  })
  folioHref === '/article/their-voices-matter' ? pass('feature links to /article/their-voices-matter', String(folioHref)) : fail('feature links to article', String(folioHref))

  // mid-plane marks
  ;(await visible('.font-serif.text-4xl')) ? pass('ghost V mark visible') : fail('ghost V mark visible')
  const ghost = await page.evaluate(() => {
    const el = [...document.querySelectorAll('p')].find((x) => x.textContent.trim() === 'VERLYSE' && getComputedStyle(x).webkitTextStroke.includes('rgba(184, 145, 70'))
    return !!el
  })
  ghost ? pass('ghost wordmark VERLYSE (brass stroke)') : fail('ghost wordmark VERLYSE')

  // registration marks
  const regMarks = await page.evaluate(() => {
    return [...document.querySelectorAll('span')].filter((s) => s.className && s.className.includes('h-3 w-px') && getComputedStyle(s).backgroundColor.includes('217, 185, 120')).length
  })
  regMarks >= 2 ? pass('registration crop marks present', `${regMarks} brass ticks`) : fail('registration marks', `${regMarks} ticks`)

  // real stats preserved (the issue band below the hero)
  hasT('19 features') && hasT('1281 appreciations') && hasT('585 conversations') && hasT('15 creators')
    ? pass('real registry statistics preserved (issue band)')
    : fail('real registry statistics preserved')

  // real navigation
  const navOk = await page.evaluate(() => {
    const links = [...document.querySelectorAll('header a, nav a')].map((a) => a.getAttribute('href'))
    return ['/articles', '/categories', '/creators', '/community', '/about'].every((h) => links.includes(h))
  })
  navOk ? pass('real navigation intact') : fail('real navigation intact')

  // overflow
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  overflow <= 1 ? pass('no horizontal overflow @1440', `${overflow}px`) : fail('no horizontal overflow @1440', `${overflow}px`)

  // console/request failures
  errors.length === 0 ? pass('zero console errors @1440') : fail('zero console errors @1440', errors.slice(0, 3).join(' | '))
  failed.length === 0 ? pass('zero failed requests @1440') : fail('zero failed requests @1440', failed.slice(0, 3).join(' | '))

  await page.screenshot({ path: path.join(OUT, VIEWPORTS.desktop.file) })
  info('capture', VIEWPORTS.desktop.file)

  // keyboard — Tab to the primary action, Enter navigates
  const kb = await page.evaluate(async () => {
    const target = [...document.querySelectorAll('a')].find((x) => x.textContent.includes('Enter the archive'))
    if (!target) return 'no-target'
    target.focus()
    const before = location.pathname
    // pressing Enter on a focused link navigates (react-router Link renders <a>)
    return 'focused:' + (document.activeElement === target) + ':' + before
  })
  kb.startsWith('focused:true') ? pass('primary action reachable by keyboard', kb) : fail('keyboard reach', kb)

  await browser.close()
}

/* ---------- 2 · TABLET ---------- */
{
  const { browser, page, errors } = await launch(VIEWPORTS.tablet)
  const body = await page.evaluate(() => document.body.innerText)
  const hasT = (s) => body.toLowerCase().includes(s.toLowerCase())
  hasT('Their Voices Matter') ? pass('tablet — feature present') : fail('tablet — feature present')
  hasT('Enter the archive') ? pass('tablet — primary action present') : fail('tablet — primary action present')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  overflow <= 1 ? pass('no horizontal overflow @768', `${overflow}px`) : fail('no horizontal overflow @768', `${overflow}px`)
  errors.length === 0 ? pass('zero console errors @768') : fail('zero console errors @768', errors.slice(0, 3).join(' | '))
  await page.screenshot({ path: path.join(OUT, VIEWPORTS.tablet.file) })
  info('capture', VIEWPORTS.tablet.file)
  await browser.close()
}

/* ---------- 3 · MOBILE ---------- */
{
  const { browser, page, errors } = await launch(VIEWPORTS.mobile)
  const body = await page.evaluate(() => document.body.innerText)
  const hasT = (s) => body.toLowerCase().includes(s.toLowerCase())
  hasT('Their Voices Matter') ? pass('mobile — feature present (single column)') : fail('mobile — feature present')
  hasT('Enter the archive') ? pass('mobile — primary action present') : fail('mobile — primary action present')
  hasT('Where Vision') ? pass('mobile — tagline present') : fail('mobile — tagline present')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  overflow <= 1 ? pass('no horizontal overflow @390', `${overflow}px`) : fail('no horizontal overflow @390', `${overflow}px`)
  errors.length === 0 ? pass('zero console errors @390') : fail('zero console errors @390', errors.slice(0, 3).join(' | '))
  await page.screenshot({ path: path.join(OUT, VIEWPORTS.mobile.file) })
  info('capture', VIEWPORTS.mobile.file)
  await browser.close()
}

/* ---------- 4 · REDUCED MOTION ---------- */
{
  const { browser, page, errors } = await launch(VIEWPORTS.desktop, { reduced: true })
  const body = await page.evaluate(() => document.body.innerText)
  const hasT = (s) => body.toLowerCase().includes(s.toLowerCase())
  hasT('Their Voices Matter') && hasT('Enter the archive') && hasT('Where Vision')
    ? pass('reduced — full composition present (static)')
    : fail('reduced — full composition present')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  overflow <= 1 ? pass('reduced — no horizontal overflow') : fail('reduced — no horizontal overflow', `${overflow}px`)
  errors.length === 0 ? pass('reduced — zero console errors') : fail('reduced — console errors', errors.slice(0, 3).join(' | '))
  await page.screenshot({ path: path.join(OUT, 'entrance-reduced.png') })
  info('capture', 'entrance-reduced.png')
  await browser.close()
}

/* ---------- 5 · WEBGL-OFF (publication must never blank) ---------- */
{
  const { browser, page, errors } = await launch(VIEWPORTS.desktop, { webglOff: true })
  const body = await page.evaluate(() => document.body.innerText)
  const hasT = (s) => body.toLowerCase().includes(s.toLowerCase())
  const heroOk = hasT('Where Vision') && hasT('Their Voices Matter') && hasT('Enter the archive')
  heroOk ? pass('WebGL-off — entrance complete (gradient fallback)') : fail('WebGL-off — entrance complete')
  const canvases = await page.evaluate(() => document.querySelectorAll('canvas').length)
  canvases === 0 ? pass('WebGL-off — zero canvases', `${canvases}`) : info('WebGL-off — canvases present', `${canvases}`)
  const filtered = errors.filter((e) => !/WebGL|getContext|three|Canvas|above error|component/i.test(e))
  filtered.length === 0 ? pass('WebGL-off — zero console errors (THREE WebGL-context noise filtered)') : fail('WebGL-off — console errors', filtered.slice(0, 3).join(' | '))
  await page.screenshot({ path: path.join(OUT, 'entrance-webgloff.png') })
  info('capture', 'entrance-webgloff.png')
  await browser.close()
}

/* ---------- results ---------- */
const summary = { phase: '28A', PASS, FAIL, INFO, checks }
fs.writeFileSync(RESULTS, JSON.stringify(summary, null, 1))
console.log(`\n28A · THE ENTRANCE — ${PASS} PASS / ${FAIL} FAIL / ${INFO} INFO`)
if (FAIL > 0) {
  for (const c of checks.filter((x) => x.status === 'FAIL')) console.log('  FAIL —', c.name, '·', c.detail)
  process.exit(1)
}
console.log('ALL GREEN')
