// PHASE 28D — THE CONTRIBUTOR WALL · real-Chromium validation (Penpot fidelity)
// /creators — wine wall + 16 names; focused contributor steps forward into a
// dossier plate; OPEN THE DOSSIER → /creator/:id.
import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
const BASE = 'http://localhost:5173'
const OUT = path.resolve('audit/shots/phase28')
fs.mkdirSync(OUT, { recursive: true })
const RESULTS = path.resolve('audit/phase28-wall-results.json')
let PASS = 0, FAIL = 0, INFO = 0
const checks = []
const pass = (n, d = '') => { PASS++; checks.push({ name: n, status: 'PASS', detail: d }) }
const fail = (n, d = '') => { FAIL++; checks.push({ name: n, status: 'FAIL', detail: d }) }
const info = (n, d = '') => { INFO++; checks.push({ name: n, status: 'INFO', detail: d }) }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const AUTHORS = ['Alina Javed', 'Anshujit Singh', 'Haieqa Wahab', 'Shaza Fatima', 'Adeena Irfan', 'Craft with Bro', 'Munkashay Javed', 'Abheesha Ghosh', 'Kenza Imene', 'Hadia Raza', 'Zuha Farhan', 'Haiqa Nafees', 'Syeda Tasbeeha Noman', 'Kazi Fatimataz Zahra', 'Mochi', 'Verlyse Media']
async function launch(viewport, opts = {}) {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--use-gl=swiftshader'] })
  const page = await browser.newPage()
  await page.setViewport(viewport)
  if (opts.reduced) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  const errors = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)) })
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)))
  await page.goto(BASE + '/creators', { waitUntil: 'domcontentloaded', timeout: 45000 })
  await sleep(4200)
  return { browser, page, errors }
}
/* 1 · DESKTOP */
{
  const { browser, page, errors } = await launch({ width: 1440, height: 900 })
  const body = await page.evaluate(() => document.body.innerText)
  const hasT = (s) => body.toLowerCase().includes(s.toLowerCase())
  hasT('16 voices') && hasT('19 folios') ? pass('header — 16 voices · 19 folios') : fail('header line')
  const names = AUTHORS.filter((a) => hasT(a.toLowerCase()))
  names.length === 16 ? pass('all sixteen real names on the wall') : fail('sixteen names', `missing ${AUTHORS.filter((a) => !hasT(a.toLowerCase()))}`)
  hasT('@lina_.jved') ? pass('real handles present') : fail('handles')
  // default focused = Alina Javed dossier
  const dossier = await page.evaluate(() => {
    const art = document.querySelector('article')
    return art ? { label: art.getAttribute('aria-label'), text: art.innerText.slice(0, 160) } : null
  })
  dossier?.label?.includes('Alina Javed') ? pass('default dossier = Alina Javed') : fail('default dossier', JSON.stringify(dossier))
  const dl = (dossier?.text || '').toLowerCase()
  dl.includes('founder') ? pass('dossier shows real role (Founder · prose poet)') : fail('dossier role')
  dl.includes('open the dossier') ? pass('dossier — OPEN THE DOSSIER →') : fail('dossier CTA')
  const dossierHref = await page.evaluate(() => [...document.querySelectorAll('article a')].find((a) => a.innerText.toLowerCase().includes('open the dossier'))?.getAttribute('href'))
  dossierHref === '/creator/alina-javed' ? pass('OPEN THE DOSSIER → /creator/alina-javed') : fail('dossier href', String(dossierHref))
  // 2 folios in archive — № 01 · № 05
  dl.includes('2 folios in the archive') ? pass('dossier — real folio count (2)') : fail('folio count')
  // selection steps forward — click Zuha Farhan
  await page.evaluate(() => { [...document.querySelectorAll('button')].find((b) => b.innerText.includes('Zuha Farhan'))?.click() })
  await sleep(600)
  const z = await page.evaluate(() => {
    const art = document.querySelector('article')
    const t = (art ? art.innerText : '').toLowerCase()
    return { label: art?.getAttribute('aria-label'), hasZuha: t.includes('zuha farhan'), has2: t.includes('2 folios in the archive'), href: [...document.querySelectorAll('article a')].find((a) => a.innerText.toLowerCase().includes('open the dossier'))?.getAttribute('href') }
  })
  z.hasZuha ? pass('selecting a name steps it forward (Zuha Farhan)') : fail('selection steps forward', JSON.stringify(z))
  z.href === '/creator/zuha-farhan' ? pass('dossier hands off to correct /creator/:id') : fail('creator href', String(z.href))
  // RETURN — Esc shows the wall at rest (exit animation ≈0.5s)
  await page.evaluate(() => { const el = [...document.querySelectorAll('button')].find((b) => b.innerText.includes('Zuha Farhan')); el?.focus() })
  await page.keyboard.press('Escape')
  await sleep(950)
  const resting = await page.evaluate(() => !document.querySelector('article'))
  resting ? pass('RETURN — Esc returns the wall (dossier steps back)') : fail('RETURN')
  // keyboard arrows move selection — real keypress at the focused button
  await page.evaluate(() => { const el = [...document.querySelectorAll('button')].find((b) => b.innerText.includes('Zuha Farhan')); el?.focus() })
  await page.keyboard.press('ArrowRight')
  await sleep(700)
  const after = await page.evaluate(() => document.querySelector('article')?.getAttribute('aria-label') || '')
  after.includes('Haiqa Nafees') ? pass('keyboard — arrow moves to the next name (Haiqa Nafees)') : fail('keyboard arrow', after)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  overflow <= 1 ? pass('no horizontal overflow @1440') : fail('overflow @1440', `${overflow}px`)
  errors.length === 0 ? pass('zero console errors @1440') : fail('console @1440', errors.slice(0, 3).join(' | '))
  await page.screenshot({ path: path.join(OUT, 'wall-desktop.png') })
  info('capture', 'wall-desktop.png')
  await browser.close()
}
/* 2 · TABLET */
{
  const { browser, page, errors } = await launch({ width: 768, height: 1024 })
  const body = await page.evaluate(() => document.body.innerText)
  const hasT = (s) => body.toLowerCase().includes(s.toLowerCase())
  const names = AUTHORS.filter((a) => hasT(a.toLowerCase()))
  names.length === 16 ? pass('tablet — all sixteen names') : fail('tablet — names', `${names.length}/16`)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  overflow <= 1 ? pass('tablet — no overflow') : fail('tablet — overflow', `${overflow}px`)
  errors.length === 0 ? pass('tablet — zero console errors') : fail('tablet — console', errors.slice(0, 2).join(' | '))
  await page.screenshot({ path: path.join(OUT, 'wall-tablet.png') })
  info('capture', 'wall-tablet.png')
  await browser.close()
}
/* 3 · MOBILE */
{
  const { browser, page, errors } = await launch({ width: 390, height: 844 })
  const body = await page.evaluate(() => document.body.innerText)
  const hasT = (s) => body.toLowerCase().includes(s.toLowerCase())
  const names = AUTHORS.filter((a) => hasT(a.toLowerCase()))
  names.length === 16 ? pass('mobile — all sixteen names (single column)') : fail('mobile — names', `${names.length}/16`)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  overflow <= 1 ? pass('mobile — no overflow') : fail('mobile — overflow', `${overflow}px`)
  errors.length === 0 ? pass('mobile — zero console errors') : fail('mobile — console', errors.slice(0, 2).join(' | '))
  await page.screenshot({ path: path.join(OUT, 'wall-mobile.png') })
  info('capture', 'wall-mobile.png')
  await browser.close()
}
/* 4 · REDUCED */
{
  const { browser, page, errors } = await launch({ width: 1440, height: 900 }, { reduced: true })
  const body = await page.evaluate(() => document.body.innerText)
  const hasT = (s) => body.toLowerCase().includes(s.toLowerCase())
  const names = AUTHORS.filter((a) => hasT(a.toLowerCase()))
  names.length === 16 ? pass('reduced — full wall present (static)') : fail('reduced — names', `${names.length}/16`)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  overflow <= 1 ? pass('reduced — no overflow') : fail('reduced — overflow', `${overflow}px`)
  errors.length === 0 ? pass('reduced — zero console errors') : fail('reduced — console', errors.slice(0, 2).join(' | '))
  await page.screenshot({ path: path.join(OUT, 'wall-reduced.png') })
  info('capture', 'wall-reduced.png')
  await browser.close()
}
const summary = { phase: '28D', PASS, FAIL, INFO, checks }
fs.writeFileSync(RESULTS, JSON.stringify(summary, null, 1))
console.log(`\n28D · THE CONTRIBUTOR WALL — ${PASS} PASS / ${FAIL} FAIL / ${INFO} INFO`)
if (FAIL > 0) { for (const c of checks.filter((x) => x.status === 'FAIL')) console.log('  FAIL —', c.name, '·', c.detail); process.exit(1) }
console.log('ALL GREEN')
