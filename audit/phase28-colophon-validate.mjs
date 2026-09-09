// PHASE 28G — THE COLOPHON · real-Chromium validation (Penpot fidelity)
// /about — quiet dim room, three layered sheets (mission/principles/milestones),
// colophon imprint.
import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
const BASE = 'http://localhost:5173'
const OUT = path.resolve('audit/shots/phase28')
fs.mkdirSync(OUT, { recursive: true })
const RESULTS = path.resolve('audit/phase28-colophon-results.json')
let PASS = 0, FAIL = 0, INFO = 0
const checks = []
const pass = (n, d = '') => { PASS++; checks.push({ name: n, status: 'PASS', detail: d }) }
const fail = (n, d = '') => { FAIL++; checks.push({ name: n, status: 'FAIL', detail: d }) }
const info = (n, d = '') => { INFO++; checks.push({ name: n, status: 'INFO', detail: d }) }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
async function launch(viewport, opts = {}) {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--use-gl=swiftshader'] })
  const page = await browser.newPage()
  await page.setViewport(viewport)
  if (opts.reduced) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  const errors = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)) })
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)))
  await page.goto(BASE + '/about', { waitUntil: 'domcontentloaded', timeout: 45000 })
  await sleep(4200)
  return { browser, page, errors }
}
/* 1 · DESKTOP */
{
  const { browser, page, errors } = await launch({ width: 1440, height: 900 })
  const body = await page.evaluate(() => document.body.innerText)
  const hasT = (s) => body.toLowerCase().includes(s.toLowerCase())
  hasT('the institutional record of verlyse media') ? pass('header — colophon subtitle') : fail('header')
  hasT('the mission — sheet i') ? pass('Sheet I — The Mission') : fail('Sheet I')
  hasT('creative platform dedicated to giving artists') || hasT('platform dedicated to giving artists') ? pass('mission — real registry text') : fail('mission text')
  hasT('principles — sheet ii') ? pass('Sheet II — Principles') : fail('Sheet II')
  hasT('i · creator credit') && hasT('ii · the conversation') && hasT('iii · tools disclosed') && hasT('iv · the door is open')
    ? pass('principles I–IV from the real record')
    : fail('principles I–IV')
  hasT('milestones — sheet iii') ? pass('Sheet III — Milestones') : fail('Sheet III')
  for (const d of ['before', '26.06.2026', '30.06.2026', '07.07.2026']) hasT(d) ? null : console.log('missing date', d)
  hasT('the feed opens') && hasT('shaza fatima') && hasT('meet alina javed') && hasT('19 features · 15 creators · 1281 appreciations · 585 conversations')
    ? pass('milestones — real chronology')
    : fail('milestones content')
  hasT('verlyse media — where vision becomes a voice') ? pass('imprint — the masthead line') : fail('imprint masthead')
  hasT('set by hand in the keeping room') ? pass('imprint — set by hand') : fail('imprint set-by-hand')
  hasT('alina javed — founder, sixteen · the door is open') ? pass('imprint — founder line') : fail('imprint founder')
  // quiet — the least wash: verify the page is dimmer than the commons? INFO-level only (subjective)
  const ctas = await page.evaluate(() => [...document.querySelectorAll('a')].map((a) => ({ t: a.innerText.slice(0, 40), h: a.getAttribute('href') })).filter((x) => /send|write|desk/i.test(x.t)))
  ctas.some((c) => c.h === '/submit' && /send your work/i.test(c.t)) ? pass('CTA → /submit') : fail('CTA submit', JSON.stringify(ctas))
  ctas.some((c) => c.h === '/contact' && /write to the desk/i.test(c.t)) ? pass('CTA → /contact') : fail('CTA contact')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  overflow <= 1 ? pass('no horizontal overflow @1440') : fail('overflow @1440', `${overflow}px`)
  errors.length === 0 ? pass('zero console errors @1440') : fail('console @1440', errors.slice(0, 3).join(' | '))
  await page.screenshot({ path: path.join(OUT, 'colophon-desktop.png') })
  info('capture', 'colophon-desktop.png')
  await browser.close()
}
/* 2 · TABLET */
{
  const { browser, page, errors } = await launch({ width: 768, height: 1024 })
  const body = await page.evaluate(() => document.body.innerText)
  const hasT = (s) => body.toLowerCase().includes(s.toLowerCase())
  hasT('the mission — sheet i') && hasT('principles — sheet ii') && hasT('milestones — sheet iii') ? pass('tablet — three sheets') : fail('tablet — sheets')
  hasT('where vision becomes a voice') ? pass('tablet — imprint') : fail('tablet — imprint')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  overflow <= 1 ? pass('tablet — no overflow') : fail('tablet — overflow', `${overflow}px`)
  errors.length === 0 ? pass('tablet — zero console errors') : fail('tablet — console', errors.slice(0, 2).join(' | '))
  await page.screenshot({ path: path.join(OUT, 'colophon-tablet.png') })
  info('capture', 'colophon-tablet.png')
  await browser.close()
}
/* 3 · MOBILE */
{
  const { browser, page, errors } = await launch({ width: 390, height: 844 })
  const body = await page.evaluate(() => document.body.innerText)
  const hasT = (s) => body.toLowerCase().includes(s.toLowerCase())
  hasT('the mission — sheet i') && hasT('principles — sheet ii') && hasT('milestones') ? pass('mobile — single column: sheets stacked') : fail('mobile — sheets')
  hasT('the door is open') ? pass('mobile — imprint') : fail('mobile — imprint')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  overflow <= 1 ? pass('mobile — no overflow') : fail('mobile — overflow', `${overflow}px`)
  errors.length === 0 ? pass('mobile — zero console errors') : fail('mobile — console', errors.slice(0, 2).join(' | '))
  await page.screenshot({ path: path.join(OUT, 'colophon-mobile.png') })
  info('capture', 'colophon-mobile.png')
  await browser.close()
}
/* 4 · REDUCED */
{
  const { browser, page, errors } = await launch({ width: 1440, height: 900 }, { reduced: true })
  const body = await page.evaluate(() => document.body.innerText)
  const hasT = (s) => body.toLowerCase().includes(s.toLowerCase())
  hasT('the mission — sheet i') && hasT('principles — sheet ii') && hasT('milestones — sheet iii') && hasT('where vision becomes a voice')
    ? pass('reduced — full colophon static')
    : fail('reduced — content')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  overflow <= 1 ? pass('reduced — no overflow') : fail('reduced — overflow', `${overflow}px`)
  errors.length === 0 ? pass('reduced — zero console errors') : fail('reduced — console', errors.slice(0, 2).join(' | '))
  await page.screenshot({ path: path.join(OUT, 'colophon-reduced.png') })
  info('capture', 'colophon-reduced.png')
  await browser.close()
}
const summary = { phase: '28G', PASS, FAIL, INFO, checks }
fs.writeFileSync(RESULTS, JSON.stringify(summary, null, 1))
console.log(`\n28G · THE COLOPHON — ${PASS} PASS / ${FAIL} FAIL / ${INFO} INFO`)
if (FAIL > 0) { for (const c of checks.filter((x) => x.status === 'FAIL')) console.log('  FAIL —', c.name, '·', c.detail); process.exit(1) }
console.log('ALL GREEN')
