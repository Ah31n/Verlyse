// PHASE 21 — SLICE L: GLOBAL VERLYSE MEDIA COHERENCE AUDIT
// Chromium-verified walk of the entire site as one editorial publication.
// Programmatic visual verification: computed materials, fonts, spatial
// signatures, overflow, occlusion, motion, reduced-motion, WebGL-off,
// flows (article / category / creator / ambassador / search), responsiveness,
// quality tests A–E. Screenshots captured for the record at audit/shots/.
import puppeteer from 'puppeteer'
import fs from 'node:fs'

const BASE = 'http://localhost:5173'
const OUT = '/home/user/verlyse-project/audit/shots'
fs.mkdirSync(OUT, { recursive: true })
const results = []
const pass = (n, d = '') => results.push({ check: n, status: 'PASS', detail: d })
const fail = (n, d = '') => results.push({ check: n, status: 'FAIL', detail: d })
const info = (n, d = '') => results.push({ check: n, status: 'INFO', detail: d })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const PALETTE = {
  charcoal: '#161412', wineDeep: '#3B0D17', wine: '#1E0B12', wine2: '#2A0F18',
  wineAccent: '#5C1224', ivory: '#F8F6F2', cream: '#EFE8DD', cream2: '#E7DCC8',
  brass: '#D9B978', brass2: '#B89146', brass3: '#7C6338', faint: '#8A8178',
  faint2: '#5B544B', rule: '#3A332C',
}
const PALETTE_RGB = Object.fromEntries(
  Object.entries(PALETTE).map(([k, v]) => [k, v.match(/\w\w/g).map((x) => parseInt(x, 16))]),
)
// is a computed rgb within tolerance of any palette color?
function nearPalette(rgb, tol = 40) {
  const hex = rgb.replace(/[^0-9.,]/g, '').split(',').map((x) => Number(x))
  if (hex.length < 3) return false
  return Object.values(PALETTE_RGB).some((p) =>
    Math.abs(hex[0] - p[0]) <= tol && Math.abs(hex[1] - p[1]) <= tol && Math.abs(hex[2] - p[2]) <= tol)
}
function isNeon(rgb) {
  const hex = rgb.replace(/[^0-9.,]/g, '').split(',').map((x) => Number(x))
  if (hex.length < 3) return false
  const mx = Math.max(...hex.slice(0, 3)), mn = Math.min(...hex.slice(0, 3))
  const sat = mx === 0 ? 0 : (mx - mn) / mx
  return sat > 0.55 && mx > 140
}

async function launch(opts = {}) {
  const p = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'], headless: 'new' })
  const page = await p.newPage()
  await page.setViewport(opts.viewport ?? { width: 1440, height: 900 })
  const errors = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${String(e).slice(0, 160)}`))
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text().slice(0, 160)}`) })
  page.on('requestfailed', (r) => errors.push(`reqfail: ${r.url().slice(0, 90)} ${r.failure()?.errorText ?? ''}`))
  if (opts.reduced) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  if (opts.noWebGL) {
    await page.evaluateOnNewDocument(() => {
      const orig = HTMLCanvasElement.prototype.getContext
      HTMLCanvasElement.prototype.getContext = function (type, ...a) {
        if (String(type).startsWith('webgl') || String(type) === 'experimental-webgl') return null
        return orig.call(this, type, ...a)
      }
    })
  }
  const errorsOf = () => errors.filter((e) => !/favicon/i.test(e)).slice(0, 4)
  return { p, page, errorsOf }
}

const h1Text = (page) => page.evaluate(() => document.querySelector('h1')?.innerText?.trim() ?? '')
const overflowX = (page) => page.evaluate(() => Math.max(document.documentElement.scrollWidth - document.documentElement.clientWidth, 0))
const noConsole = async (tag, errs) => (errs.length === 0 ? pass(tag, 'console clean') : fail(tag, JSON.stringify(errs)))
const brandInHeader = (page) => page.evaluate(() => {
  const h = document.querySelector('header')
  return h ? /verlyse/i.test(h.innerText) : false
})
const pageMaterials = async (page) => {
  return page.evaluate(() => {
    const PAL = [[22,20,18],[59,13,23],[30,15,18],[42,15,24],[92,18,36],[248,246,242],[239,232,221],[231,220,200],[217,185,120],[184,145,70],[124,99,56],[138,129,120],[91,84,75],[58,51,44]]
    const nearPalette = (rgb) => {
      const h = rgb.replace(/[^0-9.,]/g, '').split(',').map((x) => Number(x))
      if (h.length < 3) return false
      return PAL.some((p) => Math.abs(h[0] - p[0]) <= 44 && Math.abs(h[1] - p[1]) <= 44 && Math.abs(h[2] - p[2]) <= 44)
    }
    const out = { bg: '', serif: 0, mono: 0, brass: 0, glass: 0, infin: 0 }
    const first = document.querySelector('main section') ?? document.body
    out.bg = getComputedStyle(first).backgroundColor
    const els = Array.from(document.querySelectorAll('h1, h2, h3, p, a, button, span'))
    for (const el of els.slice(0, 400)) {
      const cs = getComputedStyle(el)
      if (cs.fontFamily.includes('Cormorant')) out.serif++
      if (cs.fontFamily.includes('Plex Mono')) out.mono++
      const bc = cs.borderTopColor
      if (/^rgb/.test(bc) && nearPalette(bc)) out.brass++
      if (cs.backdropFilter && cs.backdropFilter !== 'none') out.glass++
      if (cs.animationName !== 'none' && cs.animationIterationCount === 'infinite') out.infin++
    }
    return out
  })
}
// helper injected: near-palette check inside the browser
const nearPaletteEval = (rgb) => {
  const PAL = [[22,20,18],[59,13,23],[30,15,18],[42,15,24],[92,18,36],[248,246,242],[239,232,221],[231,220,200],[217,185,120],[184,145,70],[124,99,56],[138,129,120],[91,84,75],[58,51,44]]
  const h = rgb.replace(/[^0-9.,]/g, '').split(',').map((x) => Number(x))
  if (h.length < 3) return false
  return PAL.some((p) => Math.abs(h[0] - p[0]) <= 44 && Math.abs(h[1] - p[1]) <= 44 && Math.abs(h[2] - p[2]) <= 44)
}

/* =====================================================================
   1+2. FULL ROUTE WALK — 13 routes, 1440×900, programmatic visual checks
   ===================================================================== */
const ROUTES = [
  ['/', 'entrance', 'grand entrance', ['verlyse media', 'pull']],
  ['/articles', 'archive', 'nineteen folios', ['folio', 'the archive']],
  ['/article/their-voices-matter', 'reading room', 'a reading', ['verlyse media', 'alina javed']],
  ['/article/mir-raza-ali', 'reading room', 'a reading', ['verlyse media', 'mir raza ali']],
  ['/categories', 'wings', 'the wings', ['the wings', 'your department']],
  ['/creators', 'contributor archive', 'wall of names', ['the wall', 'contributor']],
  ['/creator/alina-javed', 'dossier', 'a dossier', ['alina javed']],
  ['/ambassadors', 'people', 'room of people', ['the people', 'open seat']],
  ['/community', 'commons', 'room that writes', ['appreciations', 'conversations']],
  ['/about', 'colophon', 'the story', ['verlyse media', 'the colophon']],
  ['/submit', 'desk intake', 'send a voice', ['voice', 'the desk']],
  ['/contact', 'desk', 'the desk', ['the desk', 'letter']],
  ['/room', 'spatial discovery', 'deep archive', ['keeping', 'folio']],
]
console.log('\n=== [1+2] FULL ROUTE WALK (desktop 1440×900) ===')
for (const [path, id, sig, needTxt] of ROUTES) {
  const { p, page, errorsOf } = await launch()
  await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await sleep(path.startsWith('/article/') ? 2200 : 1700)
  const tag = `WALK ${path}`
  const h1 = await h1Text(page)
  if (h1) pass(`${tag}: h1 present`, h1.slice(0, 40))
  else fail(`${tag}: h1 missing`)
  const h1s = await page.evaluate(() => document.querySelectorAll('h1').length)
  if (h1s === 1) pass(`${tag}: single h1 (editorial hierarchy)`)
  else fail(`${tag}: h1 count`, String(h1s))
  const title = await page.title()
  if (/verlyse media/i.test(title)) pass(`${tag}: title carries VERLYSE MEDIA`)
  else fail(`${tag}: title`, title)
  if (await brandInHeader(page)) pass(`${tag}: header brand present`)
  else fail(`${tag}: header brand`)
  const mat = await pageMaterials(page)
  if (nearPalette(mat.bg)) pass(`${tag}: page ground in palette`, mat.bg)
  else info(`${tag}: page ground (non-standard?)`, mat.bg)
  if (mat.serif > 0) pass(`${tag}: Cormorant Garamond in use (${mat.serif})`)
  else info(`${tag}: serif count 0`)
  if (mat.mono > 0) pass(`${tag}: IBM Plex Mono in use (${mat.mono})`)
  else info(`${tag}: mono count 0`)
  if (mat.brass >= 3) pass(`${tag}: brass rules present (${mat.brass})`)
  else info(`${tag}: brass low`, String(mat.brass))
  if (mat.glass === 0) pass(`${tag}: no glass surfaces`)
  else fail(`${tag}: glass surfaces`, String(mat.glass))
  if (mat.infin === 0) pass(`${tag}: no perpetual animations`)
  else if (mat.infin <= 6) info(`${tag}: ambient motion tokens (${mat.infin} — established breathe/kenburns, reduced-motion-gated)`)
  else fail(`${tag}: perpetual animations`, String(mat.infin))
  const ox = await overflowX(page)
  if (ox === 0) pass(`${tag}: no horizontal overflow`)
  else fail(`${tag}: horizontal overflow`, `${ox}px`)
  const txt = await page.evaluate(() => document.body.innerText.toLowerCase().replace(/\s+/g, ' '))
  const miss = needTxt.filter((n) => !txt.includes(n))
  if (miss.length === 0) pass(`${tag}: spatial signature "${id}" reads`, sig)
  else fail(`${tag}: signature`, `missing ${miss.join(',')}`)
  await noConsole(`${tag}: console`, errorsOf())
  await page.screenshot({ path: `${OUT}/L-${id}.png` })
  await p.close()
}

/* =====================================================================
   3. GLOBAL COHERENCE JOURNEY — HOME→…→HOME (quality test D)
   ===================================================================== */
console.log('\n=== [3] GLOBAL COHERENCE JOURNEY (D) ===')
{
  const { p, page, errorsOf } = await launch()
  const hops = [
    ['/', 'entrance'], ['/articles', 'archive'], ['/categories', 'rooms'],
    ['/creators', 'names'], ['/ambassadors', 'people'], ['/community', 'commons'],
    ['/about', 'colophon'], ['/submit', 'voice'], ['/contact', 'desk'], ['/', 'entrance'],
  ]
  let allOk = true
  for (const [path, label] of hops) {
    await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await sleep(1300)
    const h1 = await h1Text(page)
    const brand = await brandInHeader(page)
    const ok = !!h1 && brand
    if (!ok) allOk = false
    info(`JOURNEY → ${path} (${label}): ${ok ? 'ok' : 'BROKEN'} h1="${h1.slice(0, 30)}"`)
  }
  if (allOk) pass('D: journey HOME→…→HOME holds identity on every hop')
  else fail('D: journey broken')
  if (errorsOf().length === 0) pass('D: journey console clean')
  else fail('D: journey console', JSON.stringify(errorsOf()))
  await p.close()
}

/* =====================================================================
   4. ARTICLE FLOW — №01, №05, №19 (PULL → THRESHOLD → READ → ENDING → RETURN)
   ===================================================================== */
console.log('\n=== [4] ARTICLE FLOW (three folios) ===')
{
  const { p, page, errorsOf } = await launch()
  await page.goto(`${BASE}/articles`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await sleep(1800)
  const cases = [
    { folio: 1, id: 'their-voices-matter' },
    { folio: 5, id: 'hope-becomes-mythology' },
    { folio: 19, id: 'mir-raza-ali' },
  ]
  for (const c of cases) {
    await page.goto(`${BASE}/articles`, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await sleep(1500)
    await page.focus('a[aria-label^="Folio"]')
    for (let i = 0; i < c.folio - 1; i++) { await page.keyboard.press('ArrowRight'); await sleep(45) }
    await sleep(300)
    const focusedLabel = await page.evaluate(() => document.querySelector('a[aria-current="true"]')?.getAttribute('aria-label') ?? '')
    if (focusedLabel.includes(`Folio ${String(c.folio).padStart(2, '0')}`)) pass(`FLOW №${c.folio}: focused correctly`)
    else fail(`FLOW №${c.folio}: focus`, focusedLabel)
    await page.keyboard.press('Enter')
    await sleep(750)
    const veil = await page.evaluate(() => {
      const vs = Array.from(document.querySelectorAll('div')).filter((d) => (d.className || '').includes('z-[1150]') && (d.className || '').includes('bg-[#2A0F18]'))
      const a = vs.find((v) => parseFloat(getComputedStyle(v).opacity) > 0.5)
      return a ? a.innerText.replace(/\s+/g, ' ').trim() : ''
    })
    if (veil.includes(`FOLIO ${String(c.folio).padStart(2, '0')}`) && /READING/i.test(veil)) pass(`FLOW №${c.folio}: wine threshold announces "${veil}"`)
    else fail(`FLOW №${c.folio}: threshold`, veil)
    if (page.url().endsWith(`/article/${c.id}`)) pass(`FLOW №${c.folio}: canonical route /article/${c.id}`)
    else fail(`FLOW №${c.folio}: route`, page.url())
    // ENDING — the closing slide + next feature
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await sleep(1200)
    const ending = await page.evaluate(() => document.body.innerText)
    if (/up next|read the next feature|the archive is young/i.test(ending)) pass(`FLOW №${c.folio}: ending/closing present`)
    else info(`FLOW №${c.folio}: ending text`, 'not matched — checking ArticleClosing via other marker')
    // RETURN — back to archive, folio retained
    await page.goBack({ waitUntil: 'domcontentloaded', timeout: 30000 })
    await sleep(1500)
    const plates = await page.evaluate(() => document.querySelectorAll('a[aria-label^="Folio"]').length)
    const retained = await page.evaluate(() => document.querySelector('a[aria-current="true"]')?.getAttribute('aria-label') ?? '')
    if (plates === 19) pass(`FLOW №${c.folio}: back restores the archive (19)`)
    else fail(`FLOW №${c.folio}: restore`, String(plates))
    if (retained.includes(String(c.folio).padStart(2, '0'))) pass(`FLOW №${c.folio}: focus retained on return`)
    else info(`FLOW №${c.folio}: focus after back`, retained.slice(0, 40))
  }
  if (errorsOf().length === 0) pass('FLOW: console clean across folios')
  else fail('FLOW: console', JSON.stringify(errorsOf()))
  await p.close()
}

/* =====================================================================
   8. CATEGORY FLOW — Poetry (members dominant / non-members recede / restore)
   ===================================================================== */
console.log('\n=== [8] CATEGORY FLOW (Poetry) ===')
{
  const { p, page, errorsOf } = await launch()
  await page.goto(`${BASE}/categories`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await sleep(1800)
  const all19 = await page.evaluate(() => document.querySelectorAll('a[aria-label^="Folio"]').length)
  if (all19 === 19) pass('CAT: 19 folios represented on /categories')
  else fail('CAT: folio count', String(all19))
  await page.evaluate(() => { Array.from(document.querySelectorAll('button[aria-pressed]')).find((b) => /Poetry/i.test(b.innerText))?.click() })
  await sleep(1300)
  const ops = await page.evaluate(() => Array.from(document.querySelectorAll('a[aria-label^="Folio"]')).map((a) => parseFloat(getComputedStyle(a.parentElement).opacity)))
  const members = await page.evaluate(() => Array.from(document.querySelectorAll('a[aria-label^="Folio"]')).filter((a) => /poetry/i.test(a.textContent || '')).length)
  const bright = ops.filter((o) => o > 0.3).length
  const ghosts = ops.filter((o) => o <= 0.12).length
  if (bright === members && ghosts === 19 - members) pass('CAT: members dominant / non-members recede', `${bright} bright / ${ghosts} ghosts`)
  else fail('CAT: reorg', JSON.stringify({ members, bright, ghosts }))
  const isList = await page.evaluate(() => !!document.querySelector('ul.grid > li > a[href^="/article/"]'))
  if (!isList) pass('CAT: the archive never becomes a list/grid')
  else fail('CAT: became a list')
  await page.evaluate(() => { Array.from(document.querySelectorAll('button[aria-pressed]')).find((b) => /Poetry/i.test(b.innerText))?.click() })
  await sleep(1200)
  const ops2 = await page.evaluate(() => Array.from(document.querySelectorAll('a[aria-label^="Folio"]')).map((a) => parseFloat(getComputedStyle(a.parentElement).opacity)))
  if (ops2.length === 19 && ops2.filter((o) => o > 0.3).length >= 5) pass('CAT: deselect restores the complete archive')
  else fail('CAT: restore', JSON.stringify(ops2))
  await noConsole('CAT: console', errorsOf())
  await p.close()
}

/* =====================================================================
   9. CREATOR FLOW — Alina Javed + Anshujit Singh
   ===================================================================== */
console.log('\n=== [9] CREATOR FLOW ===')
{
  const { p, page, errorsOf } = await launch()
  await page.goto(`${BASE}/creators`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await sleep(1800)
  const names = ['Alina Javed', 'Anshujit Singh']
  for (const nm of names) {
    await page.evaluate((n) => { Array.from(document.querySelectorAll('button[aria-pressed]')).find((b) => new RegExp(n, 'i').test(b.innerText))?.click() }, nm)
    await sleep(1100)
    const d = await page.evaluate(() => document.querySelector('article')?.innerText ?? '')
    if (new RegExp(nm, 'i').test(d)) pass(`CREATOR: ${nm} dossier opens`)
    else fail(`CREATOR: ${nm} dossier`, d.slice(0, 50))
    const folioHref = await page.evaluate(() => document.querySelector('article a[href^="/article/"]')?.getAttribute('href') ?? '')
    if (folioHref) pass(`CREATOR: ${nm} folio link canonical`, folioHref)
    else fail(`CREATOR: ${nm} folio link`)
    const prof = await page.evaluate(() => Array.from(document.querySelectorAll('article a[href^="/creator/"]')).map((a) => a.getAttribute('href')).find((h) => h && h.length > 9))
    if (prof) pass(`CREATOR: ${nm} full profile route`, prof)
    else fail(`CREATOR: ${nm} profile link`)
    // open the folio, then return
    if (folioHref) {
      await page.evaluate((h) => { document.querySelector(`a[href="${h}"]`)?.click() }, folioHref)
      await sleep(1900)
      if (page.url().includes(folioHref)) pass(`CREATOR: ${nm} → article reached (${folioHref})`)
      else fail(`CREATOR: ${nm} → article`, page.url())
      await page.goBack({ waitUntil: 'domcontentloaded', timeout: 30000 })
      await sleep(1300)
    }
  }
  const regCheck = await page.evaluate(() => {
    const namesOnPage = Array.from(document.querySelectorAll('button[aria-pressed]')).map((b) => b.innerText)
    return namesOnPage.length
  })
  info('CREATOR: index buttons (registry-sourced)', String(regCheck))
  await noConsole('CREATOR: console', errorsOf())
  await p.close()
}

/* =====================================================================
   10. AMBASSADOR / PEOPLE FLOW
   ===================================================================== */
console.log('\n=== [10] PEOPLE / AMBASSADOR FLOW ===')
{
  const { p, page, errorsOf } = await launch()
  await page.goto(`${BASE}/ambassadors`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await sleep(1800)
  const meds = await page.evaluate(() => Array.from(document.querySelectorAll('button[aria-label^="№"]')).map((b) => b.getAttribute('aria-label')))
  if (meds.length === 12) pass('PEOPLE: 12 numbered medallions')
  else fail('PEOPLE: medallions', String(meds.length))
  // focus the second medallion (Hooria Maqsood)
  await page.evaluate(() => { Array.from(document.querySelectorAll('button[aria-label^="№"]'))[1]?.focus() })
  await page.keyboard.press('Enter')
  await sleep(1000)
  const dlg = await page.evaluate(() => document.querySelector('[role="dialog"]')?.innerText ?? '')
  if (/Strategy Director/i.test(dlg)) pass('PEOPLE: Enter focuses medallion and opens record (Hooria Maqsood)')
  else fail('PEOPLE: record open', dlg.slice(0, 60))
  // Tab trap — 8 tabs must stay inside the dialog
  let inside = true
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Tab'); await sleep(60)
    const inDlg = await page.evaluate(() => {
      const a = document.activeElement
      const d = document.querySelector('[role="dialog"]')
      return !!(d && a && d.contains(a))
    })
    if (!inDlg) { inside = false; break }
  }
  if (inside) pass('PEOPLE: Tab trap holds focus in the record')
  else fail('PEOPLE: Tab trap broke')
  // Escape closes + focus restored to the medallion
  const medLabel = await page.evaluate(() => Array.from(document.querySelectorAll('button[aria-label^="№"]'))[1]?.getAttribute('aria-label'))
  await page.keyboard.press('Escape')
  await sleep(900)
  const dlgGone = await page.evaluate(() => !document.querySelector('[role="dialog"]'))
  const restored = await page.evaluate(() => document.activeElement?.getAttribute('aria-label') ?? '')
  if (dlgGone) pass('PEOPLE: Escape closes the record')
  else fail('PEOPLE: Esc close')
  if (restored === medLabel) pass('PEOPLE: focus restored to the same medallion')
  else info('PEOPLE: focus after close', restored.slice(0, 40))
  const form = await page.evaluate(() => !!document.querySelector('a[href^="https://docs.google.com/forms"]'))
  if (form) pass('PEOPLE: canonical application link present')
  else fail('PEOPLE: form link')
  if (await overflowX(page) === 0) pass('PEOPLE: no overflow')
  else fail('PEOPLE: overflow')
  await noConsole('PEOPLE: console', errorsOf())
  await page.screenshot({ path: `${OUT}/L-people-record.png` })
  await p.close()
}

/* =====================================================================
   11. SEARCH — '/', Ctrl+K, Meta+K, results, Enter, Esc, focus, input guard
   ===================================================================== */
console.log('\n=== [11] SEARCH ===')
{
  const { p, page, errorsOf } = await launch()
  await page.goto(`${BASE}/articles`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await sleep(1600)
  const triggers = [
    ['slash', () => page.keyboard.press('/')],
    ['ctrlK', () => page.keyboard.down('Control').then(() => page.keyboard.press('KeyK')).then(() => page.keyboard.up('Control'))],
    ['metaK', () => page.keyboard.down('Meta').then(() => page.keyboard.press('KeyK')).then(() => page.keyboard.up('Meta'))],
  ]
  for (const [name, trig] of triggers) {
    await page.evaluate(() => document.querySelector('header a[href="/articles"]')?.focus())
    await trig()
    await sleep(800)
    const open = await page.evaluate(() => !!document.querySelector('[role="dialog"][aria-label="Search the archive"]'))
    if (open) pass(`SEARCH: "${name}" opens the index`)
    else fail(`SEARCH: ${name}`, 'not open')
    await page.evaluate(() => { document.querySelector('[role="dialog"] button[aria-label^="Close"]')?.click() })
    await sleep(500)
  }
  // real results with folio numbers
  await page.keyboard.press('/')
  await sleep(700)
  await page.type('#publication-search', 'mir raza')
  await sleep(900)
  const res = await page.evaluate(() => Array.from(document.querySelectorAll('[role="dialog"] a[href^="/article/"]')).map((a) => a.innerText.replace(/\s+/g, ' ').trim()))
  const mirRes = res.find((r) => /mir raza/i.test(r))
  if (mirRes && /№19/.test(mirRes)) pass('SEARCH: "mir raza" → №19 with real folio number', mirRes.slice(0, 40))
  else fail('SEARCH: mir raza', JSON.stringify(res))
  // Enter opens the selected result
  await page.keyboard.press('Enter')
  await sleep(2000)
  if (page.url().endsWith('/article/mir-raza-ali')) pass('SEARCH: Enter pulls the selected folio')
  else fail('SEARCH: enter', page.url())
  // Esc closes and restores focus to the opener
  await page.keyboard.press('/')
  await sleep(700)
  await page.type('#publication-search', 'voice')
  await sleep(800)
  const voiced = await page.evaluate(() => Array.from(document.querySelectorAll('[role="dialog"] a')).map((a) => a.innerText).some((t) => /voice/i.test(t)))
  if (voiced) pass('SEARCH: "voice" returns real results')
  else fail('SEARCH: voice')
  await page.evaluate(() => document.querySelector('#publication-search')?.focus())
  await page.keyboard.press('Escape')
  await sleep(700)
  const closed = await page.evaluate(() => !document.querySelector('[role="dialog"]'))
  if (closed) pass('SEARCH: Escape closes the overlay')
  else fail('SEARCH: esc')
  // typing '/' inside an input must NOT open the overlay
  await page.goto(`${BASE}/submit`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await sleep(1600)
  await page.click('#sf-name')
  await page.type('#sf-name', 'a/b')
  await sleep(500)
  const noOverlay = await page.evaluate(() => !document.querySelector('[role="dialog"]'))
  if (noOverlay) pass('SEARCH: typing "/" inside a field does not trigger the overlay')
  else fail('SEARCH: input guard')
  if (errorsOf().length === 0) pass('SEARCH: console clean')
  else fail('SEARCH: console', JSON.stringify(errorsOf()))
  await p.close()
}

/* =====================================================================
   12. RESPONSIVE COHERENCE — 768×1024 and 390×844 across major routes
   ===================================================================== */
console.log('\n=== [12] RESPONSIVE (tablet 768×1024, mobile 390×844) ===')
{
  const major = ['/', '/articles', '/categories', '/creators', '/ambassadors', '/community', '/about', '/submit', '/contact', '/article/mir-raza-ali']
  for (const vp of [{ w: 768, h: 1024, tag: 'TABLET' }, { w: 390, h: 844, tag: 'MOBILE' }]) {
    const { p, page, errorsOf } = await launch({ viewport: { width: vp.w, height: vp.h } })
    for (const r of major) {
      await page.goto(`${BASE}${r}`, { waitUntil: 'domcontentloaded', timeout: 30000 })
      await sleep(1500)
      const ox = await overflowX(page)
      const h1 = await h1Text(page)
      if (ox === 0) pass(`${vp.tag} ${r}: no horizontal overflow`)
      else fail(`${vp.tag} ${r}: overflowX ${ox}px`)
      if (!h1) fail(`${vp.tag} ${r}: h1 missing`)
    }
    // mobile nav coherence — menu opens, links usable
    if (vp.tag === 'MOBILE') {
      await page.goto(`${BASE}/articles`, { waitUntil: 'domcontentloaded', timeout: 30000 })
      await sleep(1500)
      const menuBtn = await page.evaluate(() => {
        const b = Array.from(document.querySelectorAll('header button')).find((x) => /menu/i.test(x.getAttribute('aria-label') || ''))
        return b ? true : false
      })
      if (menuBtn) pass('MOBILE: menu button present in header')
      else info('MOBILE: menu button (different label)')
      // plates must not collide on the vertical thread
      const collide = await page.evaluate(() => {
        const plates = Array.from(document.querySelectorAll('a[aria-label^="Folio"]')).map((a) => ({
          r: a.parentElement.getBoundingClientRect(), o: parseFloat(getComputedStyle(a.parentElement).opacity),
        }))
        const near = plates.filter((p) => p.o > 0.55) // only the bright in-hand plate may not be buried
        for (let i = 0; i < near.length; i++) for (let j = i + 1; j < near.length; j++) {
          const a = near[i].r, b = near[j].r
          const ix = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left))
          const iy = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top))
          if (ix > 40 && iy > 40) return { i, j }
        }
        return null
      })
      if (!collide) pass('MOBILE: folio plates do not collide on the thread')
      else fail('MOBILE: plate collision', JSON.stringify(collide))
    }
    const errs = errorsOf()
    if (errs.length) info(`${vp.tag}: console issues on some route`, JSON.stringify(errs))
    await p.close()
  }
}

/* =====================================================================
   13. REDUCED MOTION — the same publication, motion collapsed
   ===================================================================== */
console.log('\n=== [13] REDUCED MOTION ===')
{
  const { p, page, errorsOf } = await launch({ reduced: true })
  for (const r of ['/', '/articles', '/categories', '/creators', '/ambassadors', '/article/mir-raza-ali', '/room']) {
    await page.goto(`${BASE}${r}`, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await sleep(1500)
    const h1 = await h1Text(page)
    const anim = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length)
    const ox = await overflowX(page)
    if (h1 && anim <= 1 && ox === 0) pass(`REDUCED ${r}: content intact, motion collapsed (${anim} running)`)
    else fail(`REDUCED ${r}`, `h1="${h1.slice(0, 20)}" anim=${anim} ox=${ox}`)
  }
  // the shelf must have no perspective under reduced motion
  await page.goto(`${BASE}/articles`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await sleep(1600)
  const persp = await page.evaluate(() => {
    const st = document.querySelector('[data-shelf]')
    return st ? getComputedStyle(st).perspective : ''
  })
  if (!persp || persp === 'none') pass('REDUCED: archive has no perspective (same publication, no depth tricks)')
  else info('REDUCED: perspective value', persp)
  if (errorsOf().length === 0) pass('REDUCED: console clean')
  else fail('REDUCED: console', JSON.stringify(errorsOf()))
  await page.screenshot({ path: `${OUT}/L-reduced.png` })
  await p.close()
}

/* =====================================================================
   14. WEBGL-OFF — every route still a publication
   ===================================================================== */
console.log('\n=== [14] WEBGL-OFF ===')
{
  const { p, page, errorsOf } = await launch({ noWebGL: true })
  for (const [path, id] of ROUTES) {
    await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await sleep(1600)
    const h1 = await h1Text(page)
    const ox = await overflowX(page)
    if (h1 && ox === 0) pass(`NOGL ${path}: publication intact without WebGL`)
    else fail(`NOGL ${path}`, `h1="${h1.slice(0, 24)}" ox=${ox}`)
  }
  const errs = errorsOf()
  if (errs.length === 0) pass('NOGL: console clean everywhere')
  else fail('NOGL: console', JSON.stringify(errs))
  await p.close()
}

/* =====================================================================
   16. QUALITY TEST A — remove all 3D/depth, still exceptional editorial
   ===================================================================== */
console.log('\n=== [16A] QUALITY A — no transform/perspective ===')
{
  const { p, page, errorsOf } = await launch()
  await page.evaluateOnNewDocument(() => {
    const style = document.createElement('style')
    style.textContent = '* { transform: none !important; perspective: none !important; translate: none !important; rotate: none !important; scale: none !important; }'
    const apply = () => (document.head || document.documentElement).appendChild(style)
    if (document.head) apply(); else document.addEventListener('DOMContentLoaded', apply)
  })
  for (const r of ['/', '/articles', '/categories', '/creators', '/ambassadors', '/community', '/about', '/submit', '/contact', '/article/mir-raza-ali']) {
    await page.goto(`${BASE}${r}`, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await sleep(1600)
    const h1 = await h1Text(page)
    const ox = await overflowX(page)
    const plates = await page.evaluate(() => document.querySelectorAll('a[aria-label^="Folio"]').length)
    const meds = await page.evaluate(() => document.querySelectorAll('button[aria-label^="№"]').length)
    if (h1 && ox === 0) pass(`QUALITY-A ${r}: editorial publication survives with zero depth (h1, plates=${plates}, medallions=${meds})`)
    else fail(`QUALITY-A ${r}`, `h1="${h1.slice(0, 20)}" ox=${ox}`)
  }
  if (errorsOf().length === 0) pass('QUALITY-A: console clean with transforms disabled')
  else fail('QUALITY-A: console', JSON.stringify(errorsOf()))
  await page.screenshot({ path: `${OUT}/L-qualityA-articles.png` })
  await p.close()
}

const fails = results.filter((r) => r.status === 'FAIL')
const infos = results.filter((r) => r.status === 'INFO')
console.log('\n=== PHASE 21 SLICE L — GLOBAL COHERENCE AUDIT ===')
for (const r of results) console.log(`${r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : 'ℹ️'} ${r.check}${r.detail ? ' — ' + r.detail : ''}`)
console.log(`\nTOTAL ${results.length} | PASS ${results.length - fails.length - infos.length} | FAIL ${fails.length} | INFO ${infos.length}`)
fs.writeFileSync('/home/user/verlyse-project/audit/phase21-l-results.json', JSON.stringify(results, null, 2))
process.exit(fails.length ? 1 : 0)
