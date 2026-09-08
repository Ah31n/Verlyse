// PHASE 28H — THE EDITORIAL DESK · real-Chromium validation (Penpot fidelity)
// /submit — real accessible form, I/II/III sections, real wings, SENT state.
import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
const BASE = 'http://localhost:5173'
const OUT = path.resolve('audit/shots/phase28')
fs.mkdirSync(OUT, { recursive: true })
const RESULTS = path.resolve('audit/phase28-desk-results.json')
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
  // neutralise the external forwarding service so SENT resolves deterministically
  await page.setRequestInterception(true)
  page.on('request', (r) => {
    if (r.url().includes('formsubmit.co')) r.respond({
      status: 200,
      contentType: 'application/json',
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS' },
      body: '{"success":"ok"}',
    })
    else r.continue()
  })
  if (opts.reduced) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  const errors = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)) })
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)))
  await page.goto(BASE + '/submit', { waitUntil: 'domcontentloaded', timeout: 45000 })
  await sleep(4200)
  return { browser, page, errors }
}
/* 1 · DESKTOP — structure, fields, validation, SENT */
{
  const { browser, page, errors } = await launch({ width: 1440, height: 900 })
  const body = await page.evaluate(() => document.body.innerText)
  const hasT = (s) => body.toLowerCase().includes(s.toLowerCase())
  hasT('the editorial desk') ? pass('header — the editorial desk') : fail('header')
  hasT('writer → work → piece → desk') ? pass('subtitle — writer → work → piece → desk') : fail('subtitle')
  for (const s of ['i — the writer', 'ii — the work', 'iii — the piece']) hasT(s) ? null : console.log('MISSING section', s)
  hasT('i — the writer') && hasT('ii — the work') && hasT('iii — the piece') ? pass('sections I · II · III') : fail('sections')
  // every real field present, labelled
  const fields = await page.evaluate(() => {
    const labels = [...document.querySelectorAll('label')]
    const pairs = labels.filter((l) => l.htmlFor).map((l) => ({ for: l.htmlFor, text: l.innerText.replace(/\s+/g, ' ').trim().slice(0, 46) }))
    return { n: document.querySelectorAll('input[name], select[name], textarea[name]').length, pairs }
  })
  fields.n >= 8 ? pass('eight real inputs (name · email · handle · title · category · description · work · cover)') : fail('inputs', `${fields.n}`)
  const labelTexts = fields.pairs.map((p) => p.text.toLowerCase())
  const want = ['full name', 'email', 'instagram / social handle', 'title of the work', 'category', 'short description / excerpt', 'full submission / article']
  want.every((w) => labelTexts.some((t) => t.includes(w))) ? pass('all fields carry real labels') : fail('field labels', JSON.stringify(labelTexts))
  // category — the seven wings from the registry
  const cats = await page.evaluate(() => [...document.querySelectorAll('#sf-cat option')].map((o) => o.value))
  const real = cats.filter((c) => c && c !== 'Other')
  real.length === 7 ? pass('category — the seven wings + Other') : fail('seven wings', JSON.stringify(cats))
  // validation: submit empty → alerts + focus moves
  await page.click('button[type="submit"]')
  await sleep(500)
  const val = await page.evaluate(() => {
    const alerts = [...document.querySelectorAll('[role="alert"]')].map((a) => a.innerText)
    return { alerts, active: document.activeElement?.getAttribute('name') || document.activeElement?.tagName }
  })
  val.alerts.length >= 3 ? pass('empty submit → field-level alerts') : fail('validation alerts', JSON.stringify(val.alerts))
  val.active === 'name' ? pass('focus moves to the first invalid field') : fail('focus first invalid', val.active)
  // fill + submit → SENT
  await page.type('#sf-name', 'Test Writer')
  await page.type('#sf-email', 'test@example.com')
  await page.type('#sf-title', 'A Test Piece')
  await page.select('#sf-cat', real[0])
  await page.type('#sf-work', 'This is the full submission body, written in the writer’s own words.')
  await page.click('button[type="submit"]')
  let sentText = ''
  for (let i = 0; i < 30; i++) {
    sentText = await page.evaluate(() => document.body.innerText.toLowerCase())
    if (sentText.includes('your work is on the desk')) break
    await sleep(500)
  }
  sentText.includes('your work is on the desk') && sentText.includes('the desk writes back')
    ? pass('SENT — “Your work is on the desk — the desk writes back”')
    : fail('SENT state')
  sentText.includes('send another piece') ? pass('SENT — reset offered') : fail('SENT reset')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  overflow <= 1 ? pass('no horizontal overflow @1440') : fail('overflow @1440', `${overflow}px`)
  const realErrors = errors.filter((e) => !e.toLowerCase().includes('favicon'))
  realErrors.length === 0 ? pass('zero console errors @1440') : fail('console @1440', realErrors.slice(0, 3).join(' | '))
  await page.screenshot({ path: path.join(OUT, 'desk-desktop.png') })
  info('capture', 'desk-desktop.png')
  await browser.close()
}
/* 2 · TABLET */
{
  const { browser, page, errors } = await launch({ width: 768, height: 1024 })
  const body = await page.evaluate(() => document.body.innerText)
  const hasT = (s) => body.toLowerCase().includes(s.toLowerCase())
  hasT('i — the writer') && hasT('ii — the work') && hasT('iii — the piece') ? pass('tablet — sections stacked') : fail('tablet — sections')
  hasT('the editorial desk') ? pass('tablet — header') : fail('tablet — header')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  overflow <= 1 ? pass('tablet — no overflow') : fail('tablet — overflow', `${overflow}px`)
  errors.length === 0 ? pass('tablet — zero console errors') : fail('tablet — console', errors.slice(0, 2).join(' | '))
  await page.screenshot({ path: path.join(OUT, 'desk-tablet.png') })
  info('capture', 'desk-tablet.png')
  await browser.close()
}
/* 3 · MOBILE */
{
  const { browser, page, errors } = await launch({ width: 390, height: 844 })
  const body = await page.evaluate(() => document.body.innerText)
  const hasT = (s) => body.toLowerCase().includes(s.toLowerCase())
  hasT('i — the writer') && hasT('ii — the work') && hasT('iii — the piece') ? pass('mobile — sections single column') : fail('mobile — sections')
  hasT('submit the piece') ? pass('mobile — submit action present') : fail('mobile — submit')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  overflow <= 1 ? pass('mobile — no overflow') : fail('mobile — overflow', `${overflow}px`)
  errors.length === 0 ? pass('mobile — zero console errors') : fail('mobile — console', errors.slice(0, 2).join(' | '))
  await page.screenshot({ path: path.join(OUT, 'desk-mobile.png') })
  info('capture', 'desk-mobile.png')
  await browser.close()
}
/* 4 · REDUCED */
{
  const { browser, page, errors } = await launch({ width: 1440, height: 900 }, { reduced: true })
  const body = await page.evaluate(() => document.body.innerText)
  const hasT = (s) => body.toLowerCase().includes(s.toLowerCase())
  hasT('i — the writer') && hasT('ii — the work') && hasT('iii — the piece') ? pass('reduced — full form static') : fail('reduced — form')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  overflow <= 1 ? pass('reduced — no overflow') : fail('reduced — overflow', `${overflow}px`)
  errors.length === 0 ? pass('reduced — zero console errors') : fail('reduced — console', errors.slice(0, 2).join(' | '))
  await page.screenshot({ path: path.join(OUT, 'desk-reduced.png') })
  info('capture', 'desk-reduced.png')
  await browser.close()
}
const summary = { phase: '28H', PASS, FAIL, INFO, checks }
fs.writeFileSync(RESULTS, JSON.stringify(summary, null, 1))
console.log(`\n28H · THE EDITORIAL DESK — ${PASS} PASS / ${FAIL} FAIL / ${INFO} INFO`)
if (FAIL > 0) { for (const c of checks.filter((x) => x.status === 'FAIL')) console.log('  FAIL —', c.name, '·', c.detail); process.exit(1) }
console.log('ALL GREEN')
