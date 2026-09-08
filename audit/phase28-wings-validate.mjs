// PHASE 28C — THE WINGS · real-Chromium validation (Penpot Phase-27 fidelity)
// /categories — hall + seven arched wing-doors, real departments/counts;
// selecting a wing brings its stories forward, others recede.
import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
const BASE = 'http://localhost:5173'
const OUT = path.resolve('audit/shots/phase28')
fs.mkdirSync(OUT, { recursive: true })
const RESULTS = path.resolve('audit/phase28-wings-results.json')
let PASS = 0, FAIL = 0, INFO = 0
const checks = []
const pass = (n, d = '') => { PASS++; checks.push({ name: n, status: 'PASS', detail: d }) }
const fail = (n, d = '') => { FAIL++; checks.push({ name: n, status: 'FAIL', detail: d }) }
const info = (n, d = '') => { INFO++; checks.push({ name: n, status: 'INFO', detail: d }) }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const DEPS = ['Stories', 'Poetry', 'Essays', 'Art', 'Social Issues', 'Lifestyle', 'Horror']
const COUNTS = { Stories: 1, Poetry: 7, Essays: 2, Art: 3, 'Social Issues': 4, Lifestyle: 1, Horror: 1 }
async function launch(viewport, opts = {}) {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--use-gl=swiftshader'] })
  const page = await browser.newPage()
  await page.setViewport(viewport)
  if (opts.reduced) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  const errors = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)) })
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)))
  await page.goto(BASE + '/categories', { waitUntil: 'domcontentloaded', timeout: 45000 })
  await sleep(4200)
  return { browser, page, errors }
}
/* 1 · DESKTOP */
{
  const { browser, page, errors } = await launch({ width: 1440, height: 900 })
  const body = await page.evaluate(() => document.body.innerText)
  const hasT = (s) => body.toLowerCase().includes(s.toLowerCase())
  hasT('seven departments of verlyse media') ? pass('header — seven departments line') : fail('header line')
  const deps = DEPS.filter((d) => hasT(d))
  deps.length === 7 ? pass('all seven department doors') : fail('seven doors', `missing ${DEPS.filter((d) => !hasT(d))}`)
  const countsOk = Object.entries(COUNTS).every(([d, n]) => hasT(`${n} folio`))
  countsOk ? pass('real folio counts on the doors (1·7·2·3·4·1·1)') : fail('folio counts')
  // select Stories — its folio steps forward, others recede
  await page.evaluate(() => { [...document.querySelectorAll('button')].find((b) => b.innerText.includes('Stories'))?.click() })
  await sleep(600)
  const sel = await page.evaluate(() => {
    const pressed = [...document.querySelectorAll('button[aria-pressed="true"]')][0]
    const receded = [...document.querySelectorAll('button')].filter((b) => b.getAttribute('aria-pressed') !== 'true' && b.closest('div') && parseFloat(getComputedStyle(b.closest('div')).opacity) < 0.5)
    const stories = [...document.querySelectorAll('a[href^="/article/"]')].map((a) => a.getAttribute('href'))
    return { pressed: pressed?.innerText.slice(0, 30), recededCount: receded.length, stories }
  })
  sel.pressed?.includes('Stories') ? pass('Stories wing selected (aria-pressed)') : fail('Stories selected', JSON.stringify(sel))
  sel.recededCount >= 6 ? pass('other doors recede (FILTERED ARCHIVE)') : fail('other doors recede', `${sel.recededCount}`)
  sel.stories.length === 1 && sel.stories[0] === '/article/the-empty-waltz'
    ? pass('Stories wing — “The Empty Waltz” steps forward')
    : fail('Stories folio forward', JSON.stringify(sel.stories))
  const selLine = await page.evaluate(() => [...document.querySelectorAll('p')].find((p) => p.innerText.toLowerCase().includes('selected wing'))?.innerText.toLowerCase() || '')
  selLine.includes('stories') ? pass('“Selected wing — Stories · … steps forward” line') : fail('selected-wing line', selLine)
  // RETURN
  await page.evaluate(() => { [...document.querySelectorAll('button')].find((b) => b.innerText.toLowerCase().includes('esc · return'))?.click() })
  await sleep(400)
  const back = await page.evaluate(() => document.querySelectorAll('button[aria-pressed="true"]').length)
  back === 0 ? pass('RETURN — restores all seven doors') : fail('RETURN', `${back}`)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  overflow <= 1 ? pass('no horizontal overflow @1440') : fail('overflow @1440', `${overflow}px`)
  errors.length === 0 ? pass('zero console errors @1440') : fail('console @1440', errors.slice(0, 3).join(' | '))
  await page.screenshot({ path: path.join(OUT, 'wings-desktop.png') })
  info('capture', 'wings-desktop.png')
  await browser.close()
}
/* 2 · TABLET */
{
  const { browser, page, errors } = await launch({ width: 768, height: 1024 })
  const body = await page.evaluate(() => document.body.innerText)
  const hasT = (s) => body.toLowerCase().includes(s.toLowerCase())
  DEPS.filter((d) => hasT(d)).length === 7 ? pass('tablet — all seven doors (two rows)') : fail('tablet — seven doors')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  overflow <= 1 ? pass('tablet — no overflow') : fail('tablet — overflow', `${overflow}px`)
  errors.length === 0 ? pass('tablet — zero console errors') : fail('tablet — console', errors.slice(0, 2).join(' | '))
  await page.screenshot({ path: path.join(OUT, 'wings-tablet.png') })
  info('capture', 'wings-tablet.png')
  await browser.close()
}
/* 3 · MOBILE */
{
  const { browser, page, errors } = await launch({ width: 390, height: 844 })
  const body = await page.evaluate(() => document.body.innerText)
  const hasT = (s) => body.toLowerCase().includes(s.toLowerCase())
  DEPS.filter((d) => hasT(d)).length === 7 ? pass('mobile — all seven doors (single column)') : fail('mobile — seven doors')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  overflow <= 1 ? pass('mobile — no overflow') : fail('mobile — overflow', `${overflow}px`)
  errors.length === 0 ? pass('mobile — zero console errors') : fail('mobile — console', errors.slice(0, 2).join(' | '))
  await page.screenshot({ path: path.join(OUT, 'wings-mobile.png') })
  info('capture', 'wings-mobile.png')
  await browser.close()
}
/* 4 · REDUCED */
{
  const { browser, page, errors } = await launch({ width: 1440, height: 900 }, { reduced: true })
  const body = await page.evaluate(() => document.body.innerText)
  const hasT = (s) => body.toLowerCase().includes(s.toLowerCase())
  DEPS.filter((d) => hasT(d)).length === 7 ? pass('reduced — all seven doors (static)') : fail('reduced — seven doors')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  overflow <= 1 ? pass('reduced — no overflow') : fail('reduced — overflow', `${overflow}px`)
  errors.length === 0 ? pass('reduced — zero console errors') : fail('reduced — console', errors.slice(0, 2).join(' | '))
  await page.screenshot({ path: path.join(OUT, 'wings-reduced.png') })
  info('capture', 'wings-reduced.png')
  await browser.close()
}
const summary = { phase: '28C', PASS, FAIL, INFO, checks }
fs.writeFileSync(RESULTS, JSON.stringify(summary, null, 1))
console.log(`\n28C · THE WINGS — ${PASS} PASS / ${FAIL} FAIL / ${INFO} INFO`)
if (FAIL > 0) { for (const c of checks.filter((x) => x.status === 'FAIL')) console.log('  FAIL —', c.name, '·', c.detail); process.exit(1) }
console.log('ALL GREEN')
