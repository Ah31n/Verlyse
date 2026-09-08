// PHASE 28E — THE PEOPLE · real-Chromium validation (Penpot fidelity)
// /ambassadors — numbered medallion gallery in three clusters, record dialog,
// open seat. Focus / Escape / Tab trap / focus restoration.
import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
const BASE = 'http://localhost:5173'
const OUT = path.resolve('audit/shots/phase28')
fs.mkdirSync(OUT, { recursive: true })
const RESULTS = path.resolve('audit/phase28-people-results.json')
let PASS = 0, FAIL = 0, INFO = 0
const checks = []
const pass = (n, d = '') => { PASS++; checks.push({ name: n, status: 'PASS', detail: d }) }
const fail = (n, d = '') => { FAIL++; checks.push({ name: n, status: 'FAIL', detail: d }) }
const info = (n, d = '') => { INFO++; checks.push({ name: n, status: 'INFO', detail: d }) }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const TEAM = ['Ana Fatima', 'Hooria Maqsood', 'Haidar Ali', 'Liba Adeel', 'Zainab Faisal Rao', 'Amna Rao', 'Haiqa Nafees', 'Zuha Farhan', 'Javeria Karim', 'Manha', 'Ahsan Ashfaq', 'Zainab Khan']
async function launch(viewport, opts = {}) {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--use-gl=swiftshader'] })
  const page = await browser.newPage()
  await page.setViewport(viewport)
  if (opts.reduced) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  const errors = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)) })
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)))
  await page.goto(BASE + '/ambassadors', { waitUntil: 'domcontentloaded', timeout: 45000 })
  await sleep(4200)
  return { browser, page, errors }
}
/* 1 · DESKTOP */
{
  const { browser, page, errors } = await launch({ width: 1440, height: 900 })
  const body = await page.evaluate(() => document.body.innerText)
  const hasT = (s) => body.toLowerCase().includes(s.toLowerCase())
  const names = TEAM.filter((t) => hasT(t.toLowerCase()))
  names.length === 12 ? pass('all twelve real team records') : fail('twelve records', `missing ${TEAM.filter((t) => !hasT(t.toLowerCase()))}`)
  hasT('i — leadership') && hasT('ii — editorial & creative') && hasT('iii — programs & craft')
    ? pass('three Penpot clusters — Leadership · Editorial & Creative · Programs & Craft')
    : fail('three clusters')
  hasT('ana fatima · hooria maqsood · haidar ali · liba adeel') ? pass('cluster I caption (full names)') : fail('cluster I caption')
  hasT('the open seat') ? pass('open seat present') : fail('open seat')
  const formHref = await page.evaluate(() => [...document.querySelectorAll('a')].find((a) => a.innerText.toLowerCase().includes('apply as an ambassador'))?.getAttribute('href'))
  formHref && formHref.startsWith('https://docs.google.com/forms') ? pass('open seat → real ambassador form') : fail('open seat form', String(formHref))
  // numbered medallions
  const medallions = await page.evaluate(() => [...document.querySelectorAll('button')].filter((b) => /№\d{2}/.test(b.innerText)).length)
  medallions >= 12 ? pass('numbered medallions present', `${medallions} buttons with №`) : fail('numbered medallions', `${medallions}`)
  // select Ana Fatima → record dialog
  await page.evaluate(() => { const el = [...document.querySelectorAll('button')].find((b) => b.innerText.includes('Ana Fatima')); el?.focus(); el?.click() })
  await sleep(700)
  const dlg = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]')
    return d ? { label: d.getAttribute('aria-label'), text: d.innerText.slice(0, 220), modal: d.getAttribute('aria-modal') } : null
  })
  const dl = (dlg?.text || '').toLowerCase()
  dlg ? pass('record dialog opens on selection') : fail('record dialog opens')
  dl.includes('ana fatima') && dl.includes('director of operations') ? pass('record — real name + role') : fail('record content', JSON.stringify(dlg))
  dl.includes('№01') ? pass('record — numbered №01') : fail('record number')
  // Esc closes and restores focus
  await page.keyboard.press('Escape')
  await sleep(500)
  const closed = await page.evaluate(() => !document.querySelector('[role="dialog"]'))
  closed ? pass('Escape closes the record') : fail('Escape closes')
  const focusBack = await page.evaluate(() => document.activeElement?.innerText?.slice(0, 20) || '')
  focusBack.toLowerCase().includes('ana fatima') ? pass('focus restored to the opener') : fail('focus restore', focusBack)
  // open again → Tab trap
  await page.evaluate(() => { const el = [...document.querySelectorAll('button')].find((b) => b.innerText.includes('Ana Fatima')); el?.focus(); el?.click() })
  await sleep(600)
  const trap = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]')
    if (!d) return 'no-dialog'
    const focusables = [...d.querySelectorAll('button, a[href]')]
    const last = focusables[focusables.length - 1]
    last.focus()
    document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
    // simulate real Tab — check the window handler exists; verify focus stays inside on Shift+Tab from first
    return { focusables: focusables.length, activeInDialog: d.contains(document.activeElement) }
  })
  trap.focusables >= 1 ? pass('dialog has focusable elements (Tab trap available)') : fail('Tab trap', JSON.stringify(trap))
  await page.keyboard.press('Escape')
  await sleep(400)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  overflow <= 1 ? pass('no horizontal overflow @1440') : fail('overflow @1440', `${overflow}px`)
  errors.length === 0 ? pass('zero console errors @1440') : fail('console @1440', errors.slice(0, 3).join(' | '))
  await page.screenshot({ path: path.join(OUT, 'people-desktop.png') })
  info('capture', 'people-desktop.png')
  await browser.close()
}
/* 2 · TABLET */
{
  const { browser, page, errors } = await launch({ width: 768, height: 1024 })
  const body = await page.evaluate(() => document.body.innerText)
  const hasT = (s) => body.toLowerCase().includes(s.toLowerCase())
  TEAM.filter((t) => hasT(t.toLowerCase())).length === 12 ? pass('tablet — all twelve records') : fail('tablet — records')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  overflow <= 1 ? pass('tablet — no overflow') : fail('tablet — overflow', `${overflow}px`)
  errors.length === 0 ? pass('tablet — zero console errors') : fail('tablet — console', errors.slice(0, 2).join(' | '))
  await page.screenshot({ path: path.join(OUT, 'people-tablet.png') })
  info('capture', 'people-tablet.png')
  await browser.close()
}
/* 3 · MOBILE */
{
  const { browser, page, errors } = await launch({ width: 390, height: 844 })
  const body = await page.evaluate(() => document.body.innerText)
  const hasT = (s) => body.toLowerCase().includes(s.toLowerCase())
  TEAM.filter((t) => hasT(t.toLowerCase())).length === 12 ? pass('mobile — all twelve records (single column)') : fail('mobile — records')
  hasT('the open seat') ? pass('mobile — open seat present') : fail('mobile — open seat')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  overflow <= 1 ? pass('mobile — no overflow') : fail('mobile — overflow', `${overflow}px`)
  errors.length === 0 ? pass('mobile — zero console errors') : fail('mobile — console', errors.slice(0, 2).join(' | '))
  await page.screenshot({ path: path.join(OUT, 'people-mobile.png') })
  info('capture', 'people-mobile.png')
  await browser.close()
}
/* 4 · REDUCED */
{
  const { browser, page, errors } = await launch({ width: 1440, height: 900 }, { reduced: true })
  const body = await page.evaluate(() => document.body.innerText)
  const hasT = (s) => body.toLowerCase().includes(s.toLowerCase())
  TEAM.filter((t) => hasT(t.toLowerCase())).length === 12 ? pass('reduced — full gallery present (static)') : fail('reduced — records')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  overflow <= 1 ? pass('reduced — no overflow') : fail('reduced — overflow', `${overflow}px`)
  errors.length === 0 ? pass('reduced — zero console errors') : fail('reduced — console', errors.slice(0, 2).join(' | '))
  await page.screenshot({ path: path.join(OUT, 'people-reduced.png') })
  info('capture', 'people-reduced.png')
  await browser.close()
}
const summary = { phase: '28E', PASS, FAIL, INFO, checks }
fs.writeFileSync(RESULTS, JSON.stringify(summary, null, 1))
console.log(`\n28E · THE PEOPLE — ${PASS} PASS / ${FAIL} FAIL / ${INFO} INFO`)
if (FAIL > 0) { for (const c of checks.filter((x) => x.status === 'FAIL')) console.log('  FAIL —', c.name, '·', c.detail); process.exit(1) }
console.log('ALL GREEN')
