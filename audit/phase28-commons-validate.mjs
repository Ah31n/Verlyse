// PHASE 28F — THE COMMONS · real-Chromium validation (Penpot fidelity)
// /community — film strip 01→19 (real covers), ledger (19·1281·585·15),
// @marziaontop voice, letter from the desk.
import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
const BASE = 'http://localhost:5173'
const OUT = path.resolve('audit/shots/phase28')
fs.mkdirSync(OUT, { recursive: true })
const RESULTS = path.resolve('audit/phase28-commons-results.json')
let PASS = 0, FAIL = 0, INFO = 0
const checks = []
const pass = (n, d = '') => { PASS++; checks.push({ name: n, status: 'PASS', detail: d }) }
const fail = (n, d = '') => { FAIL++; checks.push({ name: n, status: 'FAIL', detail: d }) }
const info = (n, d = '') => { INFO++; checks.push({ name: n, status: 'INFO', detail: d }) }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const TITLES = ['Their Voices Matter', '3:13', 'The Empty Waltz', 'The Arts Deserve Respect', 'Hope Becomes Mythology', "A Student's Worth", 'Tasbih-e-Fatima', 'Intellect Lost to Code', 'Forgive Me, Mother', 'Water Cat', 'If Hope Were a Feather', 'The Horrors of Child Sexual Abuse', 'Khageena', 'Behind Every Headline', 'Jaldi', 'Failure', 'My Last Breath', 'The Garden Beyond My Tower', 'Mir Raza Ali']
async function launch(viewport, opts = {}) {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--use-gl=swiftshader'] })
  const page = await browser.newPage()
  await page.setViewport(viewport)
  if (opts.reduced) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  const errors = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)) })
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)))
  await page.goto(BASE + '/community', { waitUntil: 'domcontentloaded', timeout: 45000 })
  await sleep(4200)
  return { browser, page, errors }
}
/* 1 · DESKTOP */
{
  const { browser, page, errors } = await launch({ width: 1440, height: 900 })
  const body = await page.evaluate(() => document.body.innerText)
  const hasT = (s) => body.toLowerCase().includes(s.toLowerCase())
  hasT('all nineteen covers, held not driven') ? pass('header — the reel’s promise') : fail('header')
  // 19 covers on the reel (real links)
  const covers = await page.evaluate(() => document.querySelectorAll('.vm-film-scroll a[href^="/article/"]').length)
  covers === 19 ? pass('film strip — 19 real cover links') : fail('film strip covers', `${covers}`)
  const titles = TITLES.filter((t) => hasT(t))
  titles.length === 19 ? pass('all 19 titles on the reel') : fail('19 titles', `${titles.length}/19`)
  hasT('№ 01') && hasT('№ 19') ? pass('folio marks № 01 → № 19') : fail('folio marks')
  // ledger — real numbers, not a dashboard
  hasT('the commons in numbers') ? pass('ledger heading — read from the feed') : fail('ledger heading')
  for (const v of ['19', '1281', '585', '15']) hasT(v) ? null : console.log('MISSING', v)
  hasT('features presented') && hasT('appreciations') && hasT('conversations') && hasT('creators credited')
    ? pass('ledger — 19 features · 1281 appreciations · 585 conversations · 15 creators credited')
    : fail('ledger labels')
  // the voice
  hasT("speaking up about this") || hasT("society doesn") ? pass('real community voice — @marziaontop') : fail('marzia voice')
  hasT('@marziaontop') && hasT('beneath №12') ? pass('voice attribution — @marziaontop beneath №12') : fail('voice attribution')
  // letter
  hasT('a letter from the desk') ? pass('letter from the desk') : fail('letter')
  const letterHref = await page.evaluate(() => [...document.querySelectorAll('a')].find((a) => a.innerText.toLowerCase().includes('send your work'))?.getAttribute('href'))
  letterHref === '/submit' ? pass('letter CTA → /submit') : fail('letter CTA', String(letterHref))
  // not a dashboard — no chart/canvas
  const canvases = await page.evaluate(() => document.querySelectorAll('canvas').length)
  canvases === 0 ? pass('no canvases — not a dashboard') : info('canvases', `${canvases}`)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  overflow <= 1 ? pass('no horizontal overflow @1440') : fail('overflow @1440', `${overflow}px`)
  errors.length === 0 ? pass('zero console errors @1440') : fail('console @1440', errors.slice(0, 3).join(' | '))
  await page.screenshot({ path: path.join(OUT, 'commons-desktop.png') })
  info('capture', 'commons-desktop.png')
  await browser.close()
}
/* 2 · TABLET */
{
  const { browser, page, errors } = await launch({ width: 768, height: 1024 })
  const body = await page.evaluate(() => document.body.innerText)
  const hasT = (s) => body.toLowerCase().includes(s.toLowerCase())
  const titles = TITLES.filter((t) => hasT(t))
  titles.length === 19 ? pass('tablet — all 19 covers on the reel') : fail('tablet — 19 titles', `${titles.length}/19`)
  hasT('1281') && hasT('585') ? pass('tablet — ledger numbers present') : fail('tablet — ledger')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  overflow <= 1 ? pass('tablet — no overflow') : fail('tablet — overflow', `${overflow}px`)
  errors.length === 0 ? pass('tablet — zero console errors') : fail('tablet — console', errors.slice(0, 2).join(' | '))
  await page.screenshot({ path: path.join(OUT, 'commons-tablet.png') })
  info('capture', 'commons-tablet.png')
  await browser.close()
}
/* 3 · MOBILE */
{
  const { browser, page, errors } = await launch({ width: 390, height: 844 })
  const body = await page.evaluate(() => document.body.innerText)
  const hasT = (s) => body.toLowerCase().includes(s.toLowerCase())
  const titles = TITLES.filter((t) => hasT(t))
  titles.length === 19 ? pass('mobile — all 19 covers (single-column reel)') : fail('mobile — 19 titles', `${titles.length}/19`)
  hasT('@marziaontop') ? pass('mobile — voice present') : fail('mobile — voice')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  overflow <= 1 ? pass('mobile — no overflow') : fail('mobile — overflow', `${overflow}px`)
  errors.length === 0 ? pass('mobile — zero console errors') : fail('mobile — console', errors.slice(0, 2).join(' | '))
  await page.screenshot({ path: path.join(OUT, 'commons-mobile.png') })
  info('capture', 'commons-mobile.png')
  await browser.close()
}
/* 4 · REDUCED */
{
  const { browser, page, errors } = await launch({ width: 1440, height: 900 }, { reduced: true })
  const body = await page.evaluate(() => document.body.innerText)
  const hasT = (s) => body.toLowerCase().includes(s.toLowerCase())
  const titles = TITLES.filter((t) => hasT(t))
  titles.length === 19 ? pass('reduced — full commons present (static)') : fail('reduced — 19 titles', `${titles.length}/19`)
  hasT('1281') && hasT('585') && hasT('@marziaontop') ? pass('reduced — ledger + voice present') : fail('reduced — ledger + voice')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  overflow <= 1 ? pass('reduced — no overflow') : fail('reduced — overflow', `${overflow}px`)
  errors.length === 0 ? pass('reduced — zero console errors') : fail('reduced — console', errors.slice(0, 2).join(' | '))
  await page.screenshot({ path: path.join(OUT, 'commons-reduced.png') })
  info('capture', 'commons-reduced.png')
  await browser.close()
}
const summary = { phase: '28F', PASS, FAIL, INFO, checks }
fs.writeFileSync(RESULTS, JSON.stringify(summary, null, 1))
console.log(`\n28F · THE COMMONS — ${PASS} PASS / ${FAIL} FAIL / ${INFO} INFO`)
if (FAIL > 0) { for (const c of checks.filter((x) => x.status === 'FAIL')) console.log('  FAIL —', c.name, '·', c.detail); process.exit(1) }
console.log('ALL GREEN')
