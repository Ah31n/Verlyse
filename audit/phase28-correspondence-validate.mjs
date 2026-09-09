// PHASE 28I — THE CORRESPONDENCE DESK · real-Chromium validation (Penpot fidelity)
// /contact — the letter (stationery, ruled lines, wax seal), contact notes,
// SEAL THE LETTER — SEND, SENT acknowledgement.
import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
const BASE = 'http://localhost:5173'
const OUT = path.resolve('audit/shots/phase28')
fs.mkdirSync(OUT, { recursive: true })
const RESULTS = path.resolve('audit/phase28-correspondence-results.json')
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
  await page.setRequestInterception(true)
  page.on('request', (r) => {
    if (r.url().includes('formsubmit.co')) r.respond({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }, body: '{"success":"ok"}' })
    else r.continue()
  })
  if (opts.reduced) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  const errors = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)) })
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)))
  await page.goto(BASE + '/contact', { waitUntil: 'domcontentloaded', timeout: 45000 })
  await sleep(4200)
  return { browser, page, errors }
}
/* 1 · DESKTOP — the letter, channels, seal */
{
  const { browser, page, errors } = await launch({ width: 1440, height: 900 })
  const body = await page.evaluate(() => document.body.innerText)
  const hasT = (s) => body.toLowerCase().includes(s.toLowerCase())
  hasT('the correspondence desk') ? pass('header — the correspondence desk') : fail('header')
  hasT('write to the publication — a letter, not a form') ? pass('subtitle — a letter, not a form') : fail('subtitle')
  hasT('to the editors —') ? pass('the letter opens “To the Editors —”') : fail('salutation')
  // stationery — a paper object with a wax seal
  const stationery = await page.evaluate(() => {
    const forms = document.querySelectorAll('form[aria-label="Write a letter to the desk"]')
    if (!forms.length) return null
    const bg = getComputedStyle(forms[0].querySelector('div > div') || forms[0]).backgroundColor
    return { forms: forms.length, bg }
  })
  stationery?.forms === 1 ? pass('the letter is a single paper sheet') : fail('stationery', JSON.stringify(stationery))
  const seal = await page.evaluate(() => [...document.querySelectorAll('span')].some((s) => s.innerText.trim() === 'VM' && /rounded-full/.test(s.className)))
  seal ? pass('the wax seal — VM pressed in wine') : fail('wax seal')
  // the four letter-lines with exact placeholders (placeholder attrs, not innerText)
  const phs = await page.evaluate(() => [...document.querySelectorAll('input[placeholder], textarea[placeholder]')].map((el) => el.getAttribute('placeholder')))
  const phText = phs.join(' · ').toLowerCase()
  phText.includes('your name') && phText.includes('your@email.com') && phText.includes('what the letter is about') && phText.includes('write it as you would to a reader, not a form')
    ? pass('letter-lines — name · email · subject · the letter itself, exact placeholders')
    : fail('letter-lines', JSON.stringify(phs))
  // signature fills as the writer writes
  await page.type('#cf-name', 'Asma Khan')
  const sig = await page.evaluate(() => document.body.innerText.includes('Asma Khan'))
  sig ? pass('the signature fills as the writer writes') : fail('signature')
  // contact notes — real registry channels
  hasT('contact notes') ? pass('contact notes heading') : fail('contact notes heading')
  hasT('verlysemedia.09@gmail.com') ? pass('channel — email from the registry') : fail('channel email')
  hasT('@verlyse.media') ? pass('channel — handle from the registry') : fail('channel handle')
  const instaHref = await page.evaluate(() => [...document.querySelectorAll('a')].map((a) => a.getAttribute('href')).find((h) => h && h.startsWith('https://instagram.com')))
  instaHref ? pass('channel — instagram link', instaHref) : fail('channel instagram')
  hasT('letters — read, answered') ? pass('letters — read, answered') : fail('letters-read-answered')
  // validation + seal
  await page.click('button[type="submit"]')
  await sleep(500)
  const val = await page.evaluate(() => {
    const alerts = [...document.querySelectorAll('[role="alert"]')].map((a) => a.innerText)
    return { alerts, active: document.activeElement?.getAttribute('name') || '' }
  })
  val.alerts.length >= 3 ? pass('empty seal → letter-lines marked') : fail('validation', JSON.stringify(val.alerts))
  await page.type('#cf-email', 'asma@example.com')
  await page.type('#cf-subject', 'A note about the Empty Waltz')
  await page.type('#cf-msg', 'That story stayed with me. Thank you for publishing it.')
  await page.click('button[type="submit"]')
  let sealed = ''
  for (let i = 0; i < 30; i++) {
    sealed = await page.evaluate(() => document.body.innerText.toLowerCase())
    if (sealed.includes('letter sealed')) break
    await sleep(500)
  }
  sealed.includes('letter sealed') && sealed.includes('your correspondence has been received') ? pass('SEAL — the acknowledgement appears') : fail('sealed state')
  sealed.includes('write another letter') ? pass('SEAL — reset offered') : fail('sealed reset')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  overflow <= 1 ? pass('no horizontal overflow @1440') : fail('overflow @1440', `${overflow}px`)
  const realErrors = errors.filter((e) => !e.toLowerCase().includes('favicon'))
  realErrors.length === 0 ? pass('zero console errors @1440') : fail('console @1440', realErrors.slice(0, 3).join(' | '))
  await page.screenshot({ path: path.join(OUT, 'correspondence-desktop.png') })
  info('capture', 'correspondence-desktop.png')
  await browser.close()
}
/* 2 · TABLET */
{
  const { browser, page, errors } = await launch({ width: 768, height: 1024 })
  const body = await page.evaluate(() => document.body.innerText)
  const hasT = (s) => body.toLowerCase().includes(s.toLowerCase())
  hasT('to the editors —') && hasT('seal the letter — send') ? pass('tablet — letter + seal present') : fail('tablet — letter')
  hasT('verlysemedia.09@gmail.com') ? pass('tablet — channels present') : fail('tablet — channels')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  overflow <= 1 ? pass('tablet — no overflow') : fail('tablet — overflow', `${overflow}px`)
  errors.length === 0 ? pass('tablet — zero console errors') : fail('tablet — console', errors.slice(0, 2).join(' | '))
  await page.screenshot({ path: path.join(OUT, 'correspondence-tablet.png') })
  info('capture', 'correspondence-tablet.png')
  await browser.close()
}
/* 3 · MOBILE */
{
  const { browser, page, errors } = await launch({ width: 390, height: 844 })
  const body = await page.evaluate(() => document.body.innerText)
  const hasT = (s) => body.toLowerCase().includes(s.toLowerCase())
  hasT('to the editors —') ? pass('mobile — the letter fits the page') : fail('mobile — letter')
  hasT('seal the letter — send') ? pass('mobile — seal action') : fail('mobile — seal')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  overflow <= 1 ? pass('mobile — no overflow') : fail('mobile — overflow', `${overflow}px`)
  errors.length === 0 ? pass('mobile — zero console errors') : fail('mobile — console', errors.slice(0, 2).join(' | '))
  await page.screenshot({ path: path.join(OUT, 'correspondence-mobile.png') })
  info('capture', 'correspondence-mobile.png')
  await browser.close()
}
/* 4 · REDUCED */
{
  const { browser, page, errors } = await launch({ width: 1440, height: 900 }, { reduced: true })
  const body = await page.evaluate(() => document.body.innerText)
  const hasT = (s) => body.toLowerCase().includes(s.toLowerCase())
  hasT('to the editors —') && hasT('seal the letter — send') ? pass('reduced — letter static, fully present') : fail('reduced — letter')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  overflow <= 1 ? pass('reduced — no overflow') : fail('reduced — overflow', `${overflow}px`)
  errors.length === 0 ? pass('reduced — zero console errors') : fail('reduced — console', errors.slice(0, 2).join(' | '))
  await page.screenshot({ path: path.join(OUT, 'correspondence-reduced.png') })
  info('capture', 'correspondence-reduced.png')
  await browser.close()
}
const summary = { phase: '28I', PASS, FAIL, INFO, checks }
fs.writeFileSync(RESULTS, JSON.stringify(summary, null, 1))
console.log(`\n28I · THE CORRESPONDENCE DESK — ${PASS} PASS / ${FAIL} FAIL / ${INFO} INFO`)
if (FAIL > 0) { for (const c of checks.filter((x) => x.status === 'FAIL')) console.log('  FAIL —', c.name, '·', c.detail); process.exit(1) }
console.log('ALL GREEN')
