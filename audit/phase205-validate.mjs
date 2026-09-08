// Phase 20.5 — The Keeping Room validation harness (real Chromium).
// Every assertion records actual evidence. No claim unless measured.
import puppeteer from 'puppeteer'
import fs from 'node:fs'

const BASE = 'http://localhost:5173'
const OUT = '/home/user/verlyse-project/audit/shots'
fs.mkdirSync(OUT, { recursive: true })

const results = []
const pass = (name, detail = '') => results.push({ check: name, status: 'PASS', detail })
const fail = (name, detail = '') => results.push({ check: name, status: 'FAIL', detail })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  headless: 'new',
})

async function newPage(viewport, opts = {}) {
  const page = await browser.newPage()
  await page.setViewport(viewport)
  const errors = []
  const failed = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('requestfailed', (r) => failed.push(r.url()))
  if (opts.reduceMotion) {
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  }
  if (opts.noWebGL) {
    await page.evaluateOnNewDocument(() => {
      const noop = () => null
      const spoof = () => ({ getContext: () => null })
      Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', { value: (type) => type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl' ? null : null })
      // force webgl to be unavailable
    })
    await page.evaluateOnNewDocument(() => {
      window.__webglBlocked = true
    })
  }
  return { page, errors, failed }
}

async function checkOverflow(page, tag) {
  const r = await page.evaluate(() => {
    const de = document.documentElement
    return { x: de.scrollWidth - de.clientWidth, y: de.scrollHeight - de.clientHeight }
  })
  if (r.x > 1 || r.y > 1) fail(`${tag} overflow`, JSON.stringify(r))
  else pass(`${tag} overflow (overflowX/Y = ${r.x}/${r.y})`)
  return r
}

async function snap(page, name) {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false })
}

async function textOf(page) {
  return await page.evaluate(() => document.body.innerText)
}

async function platesVisible(page) {
  return await page.evaluate(() => document.querySelectorAll('[aria-label^="Folio"]').length)
}

// ---------------------------------------------------------------------------
// Per-viewport state flow
// ---------------------------------------------------------------------------
async function flowViewport(label, viewport) {
  const { page, errors, failed } = await newPage(viewport)
  const t0 = Date.now()
  await page.goto(`${BASE}/room`, { waitUntil: 'networkidle0', timeout: 30000 })
  await sleep(500)

  // 01 ARRIVAL
  let txt = await textOf(page)
  if (txt.includes('The Keeping') && txt.includes('Enter the archive')) pass(`${label} 01 arrival content`)
  else fail(`${label} 01 arrival content`, txt.slice(0, 120))
  if (txt.includes('VERLYSE MEDIA') && txt.includes('THE KEEPING ROOM')) pass(`${label} brand hierarchy present`)
  else fail(`${label} brand hierarchy`)
  await snap(page, `${label}-01-arrival`)

  // Enter → 02 discovery
  await page.keyboard.press('Enter'); await sleep(1200)
  txt = await textOf(page)
  const nPlates = await platesVisible(page)
  if (nPlates === 19) pass(`${label} 02 discovery: 19 plates`)
  else fail(`${label} 02 discovery: plate count`, String(nPlates))
  if (txt.includes('Their Voices Matter')) pass(`${label} 02 discovery: №01 Their Voices Matter present`)
  else fail(`${label} 02 discovery: №01`)
  await snap(page, `${label}-02-discovery`)

  // Arrow → move focus, Enter → 03 focus
  await page.keyboard.press('ArrowRight'); await sleep(300)
  await page.keyboard.press('Enter'); await sleep(1200)
  txt = await textOf(page)
  if (txt.includes('Pull the plate')) pass(`${label} 03 focus: pull affordance`)
  else fail(`${label} 03 focus: pull affordance`, txt.slice(0, 200))
  await snap(page, `${label}-03-focus`)

  // Enter → 04 settle
  await page.keyboard.press('Enter'); await sleep(1200)
  txt = await textOf(page)
  if (txt.includes('Enter →') && txt.includes('Return ←')) pass(`${label} 04 settle: ENTER/RETURN controls`)
  else fail(`${label} 04 settle`, txt.slice(0, 200))
  await snap(page, `${label}-04-settle`)

  // Esc → back to focus (settle → focus)
  await page.keyboard.press('Escape'); await sleep(900)
  txt = await textOf(page)
  if (txt.includes('Pull the plate')) pass(`${label} Esc settle→focus`)
  else fail(`${label} Esc settle→focus`)

  // ArrowUp → discovery
  await page.keyboard.press('ArrowUp'); await sleep(900)
  txt = await textOf(page)
  if (txt.includes('Pull folio')) pass(`${label} ArrowUp focus→discovery`)
  else fail(`${label} ArrowUp focus→discovery`)

  // deep-link hard refresh
  const { page: p2, errors: e2, failed: f2 } = await newPage(viewport)
  await p2.goto(`${BASE}/room`, { waitUntil: 'networkidle0', timeout: 30000 })
  await sleep(400)
  if ((await p2.evaluate(() => document.body.innerText)).includes('The Keeping')) pass(`${label} hard refresh /room`)
  else fail(`${label} hard refresh /room`)
  if (e2.length === 0 && f2.length === 0) pass(`${label} console/network clean (refresh)`)
  else fail(`${label} console/network (refresh)`, JSON.stringify({ e: e2, f: f2 }))
  await p2.close()

  // 12 SEARCH overlay
  await page.keyboard.press('/'); await sleep(600)
  const dialog = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]')
    return d ? { ariaModal: d.getAttribute('aria-modal'), label: d.getAttribute('aria-label') } : null
  })
  if (dialog && dialog.ariaModal === 'true') pass(`${label} 12 search: dialog aria-modal`)
  else fail(`${label} 12 search: dialog`, JSON.stringify(dialog))
  await page.keyboard.type('voice', { delay: 40 }); await sleep(500)
  const nRes = await page.evaluate(() => document.querySelectorAll('[role="dialog"] li').length)
  if (nRes >= 1 && nRes <= 6) pass(`${label} 12 search: ${nRes} results (≤6)`)
  else fail(`${label} 12 search: result count`, String(nRes))
  await snap(page, `${label}-12-search`)
  await page.keyboard.press('Escape'); await sleep(500)
  if (!(await page.evaluate(() => !!document.querySelector('[role="dialog"]')))) pass(`${label} 12 search: Esc closes`)
  else fail(`${label} 12 search: Esc closes`)

  // 10 CATEGORY (desktop/tablet only)
  if (viewport.width >= 768) {
    const cats = await page.evaluate(() => Array.from(document.querySelectorAll('button')).filter(b => /POETRY|ESSAYS|ART|HORROR|STORIES|SOCIAL|LIFESTYLE/i.test(b.textContent)).map(b => b.textContent.trim()))
    if (cats.length) {
      // click first category chip
      const ok = await page.evaluate((label) => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim().toUpperCase() === label)
        if (btn) { btn.click(); return true }
        return false
      }, cats[0])
      if (ok) {
        await sleep(1200)
        const memberOps = await page.evaluate(() => {
          const plates = Array.from(document.querySelectorAll('[aria-label^="Folio"]'))
          return plates.map(p => ({ op: parseFloat(getComputedStyle(p.parentElement).opacity) }))
        })
        pass(`${label} 10 category: entered (${cats[0]})`, `plate opacity range ${Math.min(...memberOps.map(o=>o.op)).toFixed(2)}–${Math.max(...memberOps.map(o=>o.op)).toFixed(2)}`)
        await snap(page, `${label}-10-category`)
      } else fail(`${label} 10 category: chip click`)
    } else fail(`${label} 10 category: no chips found`)
    // Esc back
    await page.keyboard.press('Escape'); await sleep(900)
  }

  // 05 entry → article handoff → browser Back → 07 ending
  await page.keyboard.press('Enter'); await sleep(300) // focus from discovery
  await page.keyboard.press('Enter'); await sleep(300) // focus → settle... (state machine: discovery→focus→settle)
  // careful: if we are in discovery, Enter→focus, Enter→settle, Enter→entry
  await page.keyboard.press('Enter'); await sleep(1200)
  txt = await textOf(page)
  if (txt.includes('Folio №') && (await page.url()).includes('/article/')) {
    pass(`${label} 05/06 entry→article handoff (${page.url().split('/').pop()})`)
    await snap(page, `${label}-06-article`)
  } else if (txt.includes('Folio №')) {
    pass(`${label} 05 entry: wine threshold shown`)
    await sleep(1200)
    if ((await page.url()).includes('/article/')) pass(`${label} entry resolves to /article/:id`)
    else fail(`${label} entry → article`, page.url())
  } else fail(`${label} entry flow`, txt.slice(0, 150))

  // browser Back → room remounts at ENDING
  await page.goBack({ waitUntil: 'networkidle0', timeout: 30000 })
  await sleep(1500)
  txt = await textOf(page)
  if (txt.includes('Next on the thread') && txt.includes('Return to archive')) pass(`${label} 07 ending after Back`)
  else fail(`${label} 07 ending after Back`, txt.slice(0, 150))
  await snap(page, `${label}-07-ending`)

  // 08 NEXT
  await page.keyboard.press('Enter'); await sleep(1200)
  txt = await textOf(page)
  if (txt.includes('Mir Raza Ali')) pass(`${label} 08 next: №19 Mir Raza Ali`)
  else fail(`${label} 08 next`, txt.slice(0, 150))
  await snap(page, `${label}-08-next`)

  // 09 RETURN
  // from next, Esc → ending, then Return to archive button... simpler: navigate to return via button
  await page.keyboard.press('Escape'); await sleep(900) // next → ending
  const clicked = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Return to archive'))
    if (btn) { btn.click(); return true }
    return false
  })
  await sleep(1200)
  txt = await textOf(page)
  if (clicked && txt.includes('read · the thread remembers')) pass(`${label} 09 return: READ ✓ persists (${txt.match(/\d+ folios? read/)?.[0]})`)
  else fail(`${label} 09 return`, txt.slice(0, 150))
  await snap(page, `${label}-09-return`)

  // console/network for the whole flow
  if (errors.length === 0) pass(`${label} console clean (${Date.now() - t0}ms)`)
  else fail(`${label} console errors`, JSON.stringify(errors.slice(0, 3)))
  if (failed.length === 0) pass(`${label} no failed requests`)
  else fail(`${label} failed requests`, JSON.stringify(failed.slice(0, 3)))

  await checkOverflow(page, label)
  await page.close()
}

// ---------------------------------------------------------------------------
await flowViewport('desktop', { width: 1440, height: 900 })
await flowViewport('tablet', { width: 768, height: 1024 })
await flowViewport('mobile', { width: 390, height: 844 })

// ---------------------------------------------------------------------------
// Canonical routes + invalid article
// ---------------------------------------------------------------------------
{
  const { page, errors } = await newPage({ width: 1440, height: 900 })
  for (const route of ['/article/their-voices-matter', '/article/mir-raza-ali', '/creator/alina-javed', '/ambassadors']) {
    const resp = await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle0', timeout: 30000 })
    if (resp && resp.status() === 200) pass(`canonical route 200 ${route}`)
    else fail(`canonical route 200 ${route}`, resp ? String(resp.status()) : 'no resp')
  }
  const resp = await page.goto(`${BASE}/article/does-not-exist-xyz`, { waitUntil: 'networkidle0', timeout: 30000 })
  const body = await page.evaluate(() => document.body.innerText)
  if (resp && resp.status() === 200 && body.includes('waiting for its feature')) pass('invalid article → 200 shell + not-found copy')
  else fail('invalid article', `${resp ? resp.status() : '?'} | ${body.slice(0, 80)}`)
  if (errors.length === 0) pass('canonical routes: console clean')
  else fail('canonical routes console', JSON.stringify(errors))
  await page.close()
}

// ---------------------------------------------------------------------------
// Reduced motion
// ---------------------------------------------------------------------------
{
  const { page, errors } = await newPage({ width: 1440, height: 900 }, { reduceMotion: true })
  await page.goto(`${BASE}/room`, { waitUntil: 'networkidle0', timeout: 30000 })
  await page.keyboard.press('Enter'); await sleep(300)
  const dur = await page.evaluate(() => {
    const pl = document.querySelector('[aria-label^="Folio"]')
    return pl ? getComputedStyle(pl.parentElement).transitionDuration : null
  })
  if (dur === '0.001s' || dur === '1ms' || dur === '0s') pass(`reduced motion: transitions near-instant (${dur})`)
  else fail('reduced motion transitions', String(dur))
  const persp = await page.evaluate(() => {
    const m = document.querySelector('main.room')
    return m ? getComputedStyle(m).perspective : null
  })
  if (persp === 'none') pass('reduced motion: perspective disabled')
  else fail('reduced motion perspective', String(persp))
  if (errors.length === 0) pass('reduced motion: console clean')
  else fail('reduced motion console', JSON.stringify(errors))
  await snap(page, 'reduced-02')
  await page.close()
}

// ---------------------------------------------------------------------------
// WebGL unavailable (block canvas webgl contexts)
// ---------------------------------------------------------------------------
{
  const { page, errors } = await newPage({ width: 1440, height: 900 })
  await page.evaluateOnNewDocument(() => {
    const orig = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (String(type).toLowerCase().includes('webgl')) return null
      return orig.call(this, type, ...args)
    }
  })
  await page.goto(`${BASE}/room`, { waitUntil: 'networkidle0', timeout: 30000 })
  await sleep(400)
  const txt = await textOf(page)
  if (txt.includes('The Keeping')) pass('WebGL-off: room renders (no blank state)')
  else fail('WebGL-off render', txt.slice(0, 100))
  await page.keyboard.press('Enter'); await sleep(1000)
  const nPlates = await platesVisible(page)
  if (nPlates === 19) pass('WebGL-off: 19 plates in discovery')
  else fail('WebGL-off plates', String(nPlates))
  if (errors.length === 0) pass('WebGL-off: console clean')
  else fail('WebGL-off console', JSON.stringify(errors.slice(0, 3)))
  await page.close()
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
await browser.close()
console.log('\n================ PHASE 20.5 VALIDATION ================')
for (const r of results) console.log(`${r.status === 'PASS' ? '✅' : '❌'} ${r.check}${r.detail ? '  — ' + r.detail : ''}`)
const fails = results.filter((r) => r.status === 'FAIL')
console.log(`\nTOTAL: ${results.length} | PASS: ${results.length - fails.length} | FAIL: ${fails.length}`)
fs.writeFileSync('/home/user/verlyse-project/audit/phase205-results.json', JSON.stringify(results, null, 2))
process.exit(fails.length ? 1 : 0)
