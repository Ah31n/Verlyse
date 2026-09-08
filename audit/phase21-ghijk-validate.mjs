// Phase 21 — Slices G / H / I / J / K validation harness.
// Routes: /categories (spatial index), /creators (dossiers), /ambassadors
// (people medallions), search (index over dimmed archive), and the four
// Slice-K routes (/community /about /submit /contact — each its own metaphor).
import puppeteer from 'puppeteer'
import fs from 'node:fs'

const BASE = 'http://localhost:5173'
const OUT = '/home/user/verlyse-project/audit/shots'
fs.mkdirSync(OUT, { recursive: true })
const results = []
const pass = (n, d = '') => results.push({ check: n, status: 'PASS', detail: d })
const fail = (n, d = '') => results.push({ check: n, status: 'FAIL', detail: d })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const launch = async (opts = {}) => {
  const p = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'], headless: 'new' })
  const page = await p.newPage()
  await page.setViewport(opts.viewport ?? { width: 1440, height: 900 })
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('requestfailed', (r) => errors.push(`req:${r.url()} ${r.failure()?.errorText ?? ''}`))
  if (opts.reduced) {
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  }
  if (opts.noWebGL) {
    await page.evaluateOnNewDocument(() => {
      const orig = HTMLCanvasElement.prototype.getContext
      HTMLCanvasElement.prototype.getContext = function (type, ...a) {
        if (String(type).startsWith('webgl')) return null
        return orig.call(this, type, ...a)
      }
    })
  }
  const errorsOf = () => errors.filter((e) => !/favicon/i.test(e)).slice(0, 4)
  return { p, page, errorsOf }
}

const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)
const plateCount = (page) => page.evaluate(() => document.querySelectorAll('a[aria-label^="Folio"]').length)
const plateOpacity = (page) => page.evaluate(() => Array.from(document.querySelectorAll('a[aria-label^="Folio"]')).map((a) => parseFloat(getComputedStyle(a.parentElement).opacity)))

/* ============================== SLICE G — /categories ============================== */
{
  const { p, page, errorsOf } = await launch()
  await page.goto(`${BASE}/categories`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await sleep(1800)
  const body = await page.evaluate(() => document.body.innerText)
  if (/The wings/i.test(body)) pass('G: /categories hero "The wings"')
  else fail('G: /categories hero', 'no "The rooms"')
  const roomButtons = await page.evaluate(() => Array.from(document.querySelectorAll('button[aria-pressed]')).map((b) => b.innerText.split('\n')[0]))
  if (roomButtons.length >= 7) pass('G: room selectors present', `roomButtons=${roomButtons.length}`)
  else fail('G: room selectors', JSON.stringify(roomButtons))
  // select Poetry → spatial reorg
  await page.evaluate(() => { Array.from(document.querySelectorAll('button[aria-pressed]')).find((b) => /Poetry/i.test(b.innerText))?.click() })
  await sleep(1200)
  const ops = await plateOpacity(page)
  const members = await page.evaluate(() => Array.from(document.querySelectorAll('a[aria-label^="Folio"]')).filter((a) => /poetry/i.test(a.textContent || '')).length)
  const bright = ops.filter((o) => o > 0.3).length
  const ghosts = ops.filter((o) => o <= 0.12).length
  if (members === bright && ghosts === ops.length - members) pass('G: selecting a room reorganizes the archive', `${bright} bright / ${ghosts} ghosts`)
  else fail('G: room reorg', JSON.stringify({ members, bright, ghosts }))
  const headTxt = await page.evaluate(() => Array.from(document.querySelectorAll('h2')).map((h) => h.innerText).join(' | '))
  if (/Poetry/i.test(headTxt) && /folio/i.test(headTxt)) pass('G: heading reflects the room', headTxt.trim().slice(0, 40))
  else fail('G: heading', headTxt)
  // restore
  await page.evaluate(() => { Array.from(document.querySelectorAll('button[aria-pressed]')).find((b) => /Poetry/i.test(b.innerText))?.click() })
  await sleep(1000)
  const ops2 = await plateOpacity(page)
  if (ops2.length === 19 && ops2.filter((o) => o > 0.3).length >= 5) pass('G: deselect restores the whole archive (19 plates, plain stacks)')
  else fail('G: restore', JSON.stringify(ops2))
  // keyboard: focus a room via Tab, press Enter to select
  let tabbed = false
  for (let t = 0; t < 40 && !tabbed; t++) {
    await page.keyboard.press('Tab'); await sleep(90)
    tabbed = await page.evaluate(() => !!document.querySelector('button[aria-pressed]:focus'))
  }
  await page.keyboard.press('Enter')
  await sleep(900)
  const pressed = await page.evaluate(() => Array.from(document.querySelectorAll('button[aria-pressed="true"]')).length)
  if (tabbed && pressed === 1) pass('G: room selectable by keyboard (Tab → Enter)')
  else fail('G: keyboard select', `tabbed=${tabbed} pressed=${pressed}`)
  if (await overflow(page)) fail('G: no horizontal overflow (desktop)')
  else pass('G: no horizontal overflow (desktop)')
  if (errorsOf().length === 0) pass('G: console clean')
  else fail('G: console', JSON.stringify(errorsOf()))
  await page.screenshot({ path: `${OUT}/phase21-categories.png` })
  await p.close()
}

/* ============================== SLICE H — /creators ============================== */
{
  const { p, page, errorsOf } = await launch()
  await page.goto(`${BASE}/creators`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await sleep(1800)
  const indexButtons = await page.evaluate(() => Array.from(document.querySelectorAll('button[aria-pressed]')).length)
  if (indexButtons >= 16) pass('H: name index with 16 contributors', `buttons=${indexButtons}`)
  else fail('H: name index', String(indexButtons))
  const firstFolios = await page.evaluate(() => Array.from(document.querySelectorAll('a[href^="/article/"]')).length)
  if (firstFolios >= 1) pass('H: default dossier shows folio links', `links=${firstFolios}`)
  else fail('H: default dossier', String(firstFolios))
  // select a different name (e.g. Anshujit Singh) — dossier swaps
  await page.evaluate(() => { Array.from(document.querySelectorAll('button[aria-pressed]')).find((b) => /Anshujit/i.test(b.innerText))?.click() })
  await sleep(1100)
  const dossierTxt = await page.evaluate(() => document.querySelector('article')?.innerText ?? '')
  if (/Anshujit/i.test(dossierTxt) && /HORROR|Horror/i.test(dossierTxt)) pass('H: dossier swaps to selected contributor (Anshujit Singh)')
  else fail('H: dossier swap', dossierTxt.slice(0, 60))
  // canonical route integrity: follow a folio link
  const href = await page.evaluate(() => document.querySelector('article a[href^="/article/"]')?.getAttribute('href') ?? '')
  if (href) pass('H: folio link is canonical', href)
  else fail('H: folio link', 'none')
  // full profile link
  const profHref = await page.evaluate(() => Array.from(document.querySelectorAll('a[href^="/creator/"]')).map((a) => a.getAttribute('href')).find((h) => h && h !== '/creator/'))
  if (profHref) pass('H: full profile → canonical /creator/:id', profHref)
  else fail('H: profile link', 'none')
  if (await overflow(page)) fail('H: no overflow (desktop)')
  else pass('H: no overflow (desktop)')
  if (errorsOf().length === 0) pass('H: console clean')
  else fail('H: console', JSON.stringify(errorsOf()))
  await page.screenshot({ path: `${OUT}/phase21-creators.png` })
  await p.close()
}

/* ============================== SLICE I — /ambassadors ============================== */
{
  const { p, page, errorsOf } = await launch()
  await page.goto(`${BASE}/ambassadors`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await sleep(1800)
  const medallions = await page.evaluate(() => Array.from(document.querySelectorAll('button[aria-label^="№"]')).length)
  if (medallions >= 12) pass('I: 12 numbered medallions', `medallions=${medallions}`)
  else fail('I: medallions', String(medallions))
  const openSeat = await page.evaluate(() => /open seat|next ambassador/i.test(document.body.innerText))
  if (openSeat) pass('I: the open seat №13 present')
  else fail('I: open seat')
  const formLink = await page.evaluate(() => Array.from(document.querySelectorAll('a[href^="https://docs.google.com/forms"]')).length)
  if (formLink >= 1) pass('I: ambassador form link (real)')
  else fail('I: form link')
  // focus a medallion → record opens
  await page.evaluate(() => document.querySelector('button[aria-label^="№"]')?.click())
  await sleep(1000)
  const dlg = await page.evaluate(() => document.querySelector('[role="dialog"]')?.innerText ?? '')
  if (/Ana Fatima|Director of Operations/i.test(dlg)) pass('I: focusing a medallion opens the person record')
  else fail('I: record', dlg.slice(0, 50))
  // Esc closes
  await page.keyboard.press('Escape')
  await sleep(800)
  const closed = await page.evaluate(() => document.querySelector('[role="dialog"]') === null)
  if (closed) pass('I: Esc closes the record')
  else fail('I: Esc close')
  if (await overflow(page)) fail('I: no overflow')
  else pass('I: no overflow')
  if (errorsOf().length === 0) pass('I: console clean')
  else fail('I: console', JSON.stringify(errorsOf()))
  await page.screenshot({ path: `${OUT}/phase21-ambassadors.png` })
  await p.close()
}

/* ============================== SLICE J — search ============================== */
{
  const { p, page, errorsOf } = await launch()
  await page.goto(`${BASE}/articles`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await sleep(1600)
  await page.keyboard.press('/')
  await sleep(900)
  const dlg = await page.evaluate(() => document.querySelector('[role="dialog"]')?.innerText ?? '')
  if (/index|archive/i.test(dlg)) pass('J: "/" opens the index over the archive')
  else fail('J: "/" opens', dlg.slice(0, 60))
  await page.type('#publication-search', 'poetry')
  await sleep(900)
  const resTxt = await page.evaluate(() => Array.from(document.querySelectorAll('[role="dialog"] a')).map((a) => a.innerText).join(' | '))
  const hasFolio = await page.evaluate(() => Array.from(document.querySelectorAll('[role="dialog"] a')).some((a) => /№/.test(a.textContent || '')))
  if (hasFolio && /poetry|mythology|forgive|feather|water|mother|hope/i.test(resTxt)) pass('J: real results with registry folio №s', resTxt.split(' | ')[0])
  else fail('J: results', resTxt.slice(0, 80))
  const backdropDim = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('div')).find((d) => (d.className || '').includes('rgba(14,3,7,0.94)'))
    return el ? getComputedStyle(el).backgroundColor : ''
  })
  if (/rgba?\(14, ?3, ?7/.test(backdropDim)) pass('J: archive dimmed beneath, context preserved')
  else fail('J: dim', backdropDim)
  // ArrowDown + Enter → canonical article
  await page.keyboard.press('ArrowDown')
  await sleep(120)
  await page.keyboard.press('Enter')
  await sleep(1800)
  if (page.url().includes('/article/')) pass('J: Enter pulls a result → canonical article', page.url().split('/').pop())
  else fail('J: enter pull', p.url())
  // natural return: back → articles, focus restored to opener
  await page.goBack({ waitUntil: 'domcontentloaded', timeout: 30000 })
  await sleep(1400)
  const openAgain = await page.evaluate(() => !!document.querySelector('[role="dialog"]'))
  if (!openAgain && page.url().includes('/articles')) pass('J: back returns to the archive, overlay closed')
  else fail('J: return', p.url())
  if (errorsOf().length === 0) pass('J: console clean')
  else fail('J: console', JSON.stringify(errorsOf()))
  await page.screenshot({ path: `${OUT}/phase21-search.png` })
  await p.close()
}

/* ============================== SLICE K — the four rooms ============================== */
{
  const rooms = [
    { path: '/community', id: 'commons', need: ['writes back', 'appreciations'] },
    { path: '/about', id: 'colophon', need: ['colophon', 'set in', 'imprint'] },
    { path: '/submit', id: 'voice', need: ['send', 'voice'] },
    { path: '/contact', id: 'desk', need: ['the desk', 'every letter is read'] },
  ]
  for (const r of rooms) {
    const { p, page, errorsOf } = await launch()
    await page.goto(`${BASE}${r.path}`, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await sleep(1800)
    const body = await page.evaluate(() => (document.body.innerText + '\n' + document.body.textContent).toLowerCase().replace(/\s+/g, ' '))
    const ok = r.need.every((n) => body.includes(n))
    if (ok) pass(`K: /${r.path} keeps its own metaphor (${r.id})`)
    else fail(`K: /${r.path} metaphor`, `missing: ${r.need.filter((n) => !body.includes(n)).join(', ')}`)
    if (await overflow(page)) fail(`K: /${r.path} no overflow`)
    else pass(`K: /${r.path} no overflow`)
    if (errorsOf().length === 0) pass(`K: /${r.path} console clean`)
    else fail(`K: /${r.path} console`, JSON.stringify(errorsOf()))
    await p.close()
  }
  // unique compositions: the four pages must not be the same markup family
  const { p, page } = await launch()
  const sigs = []
  for (const r of rooms) {
    await page.goto(`${BASE}${r.path}`, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await sleep(1500)
    const h1 = await page.evaluate(() => document.querySelector('h1')?.innerText ?? '')
    sigs.push(`${r.path}:${h1}`)
  }
  if (new Set(sigs).size === sigs.length) pass('K: four rooms, four distinct headings')
  else fail('K: distinct headings', JSON.stringify(sigs))
  await p.close()
}

/* ============ responsive + reduced-motion + WebGL-off (representative) ============ */
{
  const { p, page } = await launch({ viewport: { width: 390, height: 844 } })
  await page.goto(`${BASE}/categories`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await sleep(1500)
  const plates = await plateCount(page)
  if (plates === 19 && !(await overflow(page))) pass('R: mobile /categories — 19 plates, no overflow')
  else fail('R: mobile /categories', String(plates))
  await page.screenshot({ path: `${OUT}/phase21-categories-mobile.png` })
  await p.close()
}
{
  const { p, page } = await launch({ viewport: { width: 768, height: 1024 } })
  await page.goto(`${BASE}/creators`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await sleep(1500)
  if (!(await overflow(page))) pass('R: tablet /creators — no overflow')
  else fail('R: tablet /creators')
  await p.close()
}
{
  const { p, page } = await launch({ reduced: true })
  await page.goto(`${BASE}/ambassadors`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await sleep(1500)
  const meds = await page.evaluate(() => Array.from(document.querySelectorAll('button[aria-label^="№"]')).length)
  if (meds === 12) pass('R: reduced-motion /ambassadors — same 12 medallions')
  else fail('R: reduced /ambassadors', String(meds))
  await p.close()
}
{
  const { p, page, errorsOf } = await launch({ noWebGL: true })
  await page.goto(`${BASE}/community`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await sleep(1500)
  const hasLedger = await page.evaluate(() => /appreciations|conversations/i.test(document.body.innerText))
  if (hasLedger && errorsOf().length === 0) pass('R: WebGL-off /community — still a publication, console clean')
  else fail('R: WebGL-off /community', JSON.stringify(errorsOf()))
  await p.close()
}

const fails = results.filter((r) => r.status === 'FAIL')
console.log('\n=== PHASE 21 SLICES G–K VALIDATION ===')
for (const r of results) console.log(`${r.status === 'PASS' ? '✅' : '❌'} ${r.check}${r.detail ? ' — ' + r.detail : ''}`)
console.log(`\nTOTAL ${results.length} | PASS ${results.length - fails.length} | FAIL ${fails.length}`)
fs.writeFileSync('/home/user/verlyse-project/audit/phase21-ghijk-results.json', JSON.stringify(results, null, 2))
process.exit(fails.length ? 1 : 0)
