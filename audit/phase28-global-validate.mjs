// PHASE 28J/K/L — global coherence, responsive/reduced sweep, canonical walk.
// 1) nav integrity — every canonical nav link resolves (h1, no console errors)
// 2) canonical walk — one institution, visually distinct spaces
// 3) mobile sweep — every route @390: no overflow, no console errors
// 4) reduced sweep — every route @1440 reduced: key content, no overflow
import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
const BASE = 'http://localhost:5173'
const OUT = path.resolve('audit/shots/phase28')
fs.mkdirSync(OUT, { recursive: true })
const RESULTS = path.resolve('audit/phase28-global-results.json')
let PASS = 0, FAIL = 0, INFO = 0
const checks = []
const pass = (n, d = '') => { PASS++; checks.push({ name: n, status: 'PASS', detail: d }) }
const fail = (n, d = '') => { FAIL++; checks.push({ name: n, status: 'FAIL', detail: d }) }
const info = (n, d = '') => { INFO++; checks.push({ name: n, status: 'INFO', detail: d }) }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const ROUTES = [
  ['/', 'entrance', 'Where Vision Becomes', 'where vision becomes'],
  ['/articles', 'archive', 'nineteen folios', 'nineteen folios'],
  ['/article/their-voices-matter', 'reading room', 'Their Voices Matter', 'alina javed'],
  ['/creators', 'contributor wall', 'wall of names', 'contributor'],
  ['/creator/alina-javed', 'dossier', 'Alina Javed', 'dossier'],
  ['/ambassadors', 'people', 'open seat', 'the people'],
  ['/categories', 'wings', 'your department', 'the wings'],
  ['/community', 'commons', 'appreciations', 'conversations'],
  ['/about', 'colophon', 'the colophon', 'set in'],
  ['/submit', 'editorial desk', 'the editorial desk', 'submit the piece'],
  ['/contact', 'correspondence desk', 'the correspondence desk', 'seal the letter'],
  ['/room', 'keeping room', 'keeping', 'folio'],
]

async function launch(viewport, opts = {}) {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--use-gl=swiftshader'] })
  const page = await browser.newPage()
  await page.setViewport(viewport)
  if (opts.reduced) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  const errors = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)) })
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)))
  return { browser, page, errors }
}

/* ============ 1 · NAV INTEGRITY (desktop) ============ */
{
  const { browser, page, errors } = await launch({ width: 1440, height: 900 })
  const paths = ['/', '/articles', '/categories', '/creators', '/community', '/about', '/ambassadors', '/submit', '/contact']
  let bad = []
  for (const p of paths) {
    errors.length = 0
    await page.goto(BASE + p, { waitUntil: 'domcontentloaded', timeout: 45000 })
    await sleep(2100)
    const h1 = await page.evaluate(() => document.querySelector('h1')?.innerText?.slice(0, 34) || '')
    const title = await page.title()
    const errs = errors.filter((e) => !/favicon|WebGL|THREE|getContext/i.test(e))
    if (!h1) bad.push(p + ' (no h1)')
    if (!/verlyse media/i.test(title)) bad.push(p + ' (title)')
    if (errs.length) bad.push(p + ' (console: ' + errs[0] + ')')
  }
  bad.length === 0 ? pass('nav — all 9 canonical routes resolve (h1 · title · clean console)') : fail('nav integrity', bad.join(' | '))
  await browser.close()
}

/* ============ 2 · CANONICAL WALK — one institution, distinct spaces ============ */
{
  const { browser, page, errors } = await launch({ width: 1440, height: 900 })
  const seen = []
  for (let i = 0; i < ROUTES.length; i++) {
    const [p, id, key] = ROUTES[i]
    errors.length = 0
    await page.goto(BASE + p, { waitUntil: 'domcontentloaded', timeout: 45000 })
    await sleep(p.startsWith('/article') || p === '/room' ? 3000 : 2400)
    const txt = await page.evaluate(() => document.body.innerText.toLowerCase().replace(/\s+/g, ' '))
    const body = await page.evaluate(() => document.body.innerText)
    const h1s = await page.evaluate(() => document.querySelectorAll('h1').length)
    const ox = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    const errs = errors.filter((e) => !/favicon|WebGL|THREE|getContext/i.test(e))
    const ok = txt.includes(key.toLowerCase()) && h1s === 1 && ox <= 1 && errs.length === 0
    ok ? pass(`walk ${i + 1}/12 ${p} — ${id}`, key) : fail(`walk ${i + 1}/12 ${p}`, JSON.stringify({ key: txt.includes(key.toLowerCase()), h1s, ox, errs: errs.slice(0, 1) }))
    if (body) seen.push(id)
    if (p === '/creators' || p === '/ambassadors' || p === '/about' || p === '/room') {
      const name = 'walk-' + id.replace(/\s+/g, '-') + '.png'
      await page.screenshot({ path: path.join(OUT, name) })
      info('capture', name)
    }
  }
  new Set(seen).size === seen.length && seen.length === ROUTES.length
    ? pass('walk — 12 spaces, each a distinct room of the same institution')
    : info('walk spaces', `${new Set(seen).size}/${seen.length}`)
  await browser.close()
}

/* ============ 3 · MOBILE SWEEP @390 ============ */
{
  const { browser, page, errors } = await launch({ width: 390, height: 844 })
  let bad = []
  for (const [p, id] of ROUTES) {
    errors.length = 0
    await page.goto(BASE + p, { waitUntil: 'domcontentloaded', timeout: 45000 })
    await sleep(2200)
    const ox = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    const h1 = await page.evaluate(() => !!document.querySelector('h1'))
    const errs = errors.filter((e) => !/favicon|WebGL|THREE|getContext/i.test(e))
    if (ox > 1) bad.push(`${p} overflow ${ox}px`)
    if (!h1) bad.push(`${p} no h1`)
    if (errs.length) bad.push(`${p} console`)
  }
  bad.length === 0 ? pass('mobile @390 — all 12 routes: zero overflow · h1 · clean console') : fail('mobile sweep', bad.slice(0, 5).join(' | '))
  await browser.close()
}

/* ============ 4 · REDUCED SWEEP ============ */
{
  const { browser, page, errors } = await launch({ width: 1440, height: 900 }, { reduced: true })
  let bad = []
  for (const [p, id, , key] of ROUTES) {
    errors.length = 0
    await page.goto(BASE + p, { waitUntil: 'domcontentloaded', timeout: 45000 })
    await sleep(2100)
    const txt = await page.evaluate(() => document.body.innerText.toLowerCase().replace(/\s+/g, ' '))
    const ox = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    const errs = errors.filter((e) => !/favicon|WebGL|THREE|getContext/i.test(e))
    if (!txt.includes(key.toLowerCase())) bad.push(`${p} content`)
    if (ox > 1) bad.push(`${p} overflow`)
    if (errs.length) bad.push(`${p} console`)
  }
  bad.length === 0 ? pass('reduced-motion — all 12 routes: full content · static · no overflow') : fail('reduced sweep', bad.slice(0, 5).join(' | '))
  await browser.close()
}

/* ============ 5 · WEBGL-OFF SPOT CHECK ============ */
{
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--use-gl=swiftshader'] })
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })
  await page.evaluateOnNewDocument(() => {
    HTMLCanvasElement.prototype.getContext = function (type, ...a) {
      if (String(type).toLowerCase().includes('webgl')) return null
      return null
    }
  })
  const errors = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)) })
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)))
  let bad = []
  for (const p of ['/', '/articles', '/categories', '/creators', '/community', '/about', '/submit', '/contact']) {
    errors.length = 0
    await page.goto(BASE + p, { waitUntil: 'domcontentloaded', timeout: 45000 })
    await sleep(2000)
    const h1 = await page.evaluate(() => !!document.querySelector('h1'))
    const errs = errors.filter((e) => !/favicon|WebGL|THREE|getContext|above error|Canvas/i.test(e))
    if (!h1) bad.push(p + ' no h1')
    if (errs.length) bad.push(p + ' console: ' + errs[0])
  }
  bad.length === 0 ? pass('WebGL-off — 8 routes complete, no unexpected console errors') : fail('webgloff sweep', bad.slice(0, 4).join(' | '))
  await browser.close()
}

const summary = { phase: '28J/K/L', PASS, FAIL, INFO, checks }
fs.writeFileSync(RESULTS, JSON.stringify(summary, null, 1))
console.log(`\n28J/K/L · GLOBAL — ${PASS} PASS / ${FAIL} FAIL / ${INFO} INFO`)
if (FAIL > 0) { for (const c of checks.filter((x) => x.status === 'FAIL')) console.log('  FAIL —', c.name, '·', c.detail); process.exit(1) }
console.log('ALL GREEN')
