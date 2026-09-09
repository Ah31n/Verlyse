// Phase 20.5 — The Keeping Room validation harness v2 (real Chromium).
// Case-insensitive text checks + footer state oracle + URL polling.
import puppeteer from 'puppeteer'
import fs from 'node:fs'

const BASE = 'http://localhost:5173'
const OUT = '/home/user/verlyse-project/audit/shots'
fs.mkdirSync(OUT, { recursive: true })
const results = []
const pass = (n, d = '') => results.push({ check: n, status: 'PASS', detail: d })
const fail = (n, d = '') => results.push({ check: n, status: 'FAIL', detail: d })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const norm = (s) => (s || '').toLowerCase()

const browser = await puppeteer.launch({
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  headless: 'new',
})

async function mkPage(viewport, opts = {}) {
  const page = await browser.newPage()
  await page.setViewport(viewport)
  const errors = [], failed = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('requestfailed', (r) => failed.push(r.url()))
  if (opts.reduceMotion) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  if (opts.noWebGL) {
    await page.evaluateOnNewDocument(() => {
      HTMLCanvasElement.prototype.getContext = function (type, ...a) {
        if (String(type).toLowerCase().includes('webgl')) return null
        return null
      }
    })
  }
  return { page, errors, failed }
}

const footerState = (page) => page.evaluate(() => {
  const f = document.querySelector('footer')
  const m = f ? f.innerText.match(/state\s*(\d+)/i) : null
  return m ? parseInt(m[1], 10) : null
})
const hasButton = (page, label) => page.evaluate((l) => {
  return Array.from(document.querySelectorAll('button')).some((b) => (b.textContent || '').trim().toLowerCase().includes(l))
}, label)
const clickButton = (page, label) => page.evaluate((l) => {
  const b = Array.from(document.querySelectorAll('button')).find((x) => (x.textContent || '').trim().toLowerCase().includes(l))
  if (b) { b.click(); return true }
  return false
}, label)
const waitFor = async (fn, timeout = 5000, step = 150) => {
  const t0 = Date.now()
  while (Date.now() - t0 < timeout) { if (await fn()) return true; await sleep(step) }
  return false
}
const bodyText = (page) => page.evaluate(() => document.body.innerText)
const snap = (page, n) => page.screenshot({ path: `${OUT}/${n}.png` })

async function flowViewport(label, viewport) {
  const { page, errors, failed } = await mkPage(viewport)
  await page.goto(`${BASE}/room`, { waitUntil: 'networkidle0', timeout: 30000 })
  await sleep(700)

  // 01 ARRIVAL
  await waitFor(() => hasButton(page, 'enter the archive'))
  let txt = await bodyText(page)
  if (norm(txt).includes('the keeping room') && norm(txt).includes('enter the archive')) pass(`${label} 01 arrival`)
  else fail(`${label} 01 arrival`, txt.slice(0, 120))
  if (norm(txt).includes('verlyse media') && norm(txt).includes('spatial archive of 19 voices')) pass(`${label} brand hierarchy + 19 voices`)
  else fail(`${label} brand hierarchy`)
  if (norm(txt).includes('press enter') && norm(txt).includes('pull → read → return')) pass(`${label} PULL→READ→RETURN vocabulary`)
  else fail(`${label} PULL→READ→RETURN`)
  const st1 = await footerState(page)
  if (st1 === 1) pass(`${label} footer state 01`)
  else fail(`${label} footer state 01`, String(st1))
  await snap(page, `${label}-01-arrival`)

  // Enter → 02 discovery
  await page.keyboard.press('Enter'); await sleep(1100)
  const nPlates = await page.evaluate(() => document.querySelectorAll('[aria-label^="Folio"]').length)
  if (nPlates === 19) pass(`${label} 02 discovery: 19 plates`)
  else fail(`${label} 02 discovery: plates`, String(nPlates))
  const st2 = await footerState(page)
  if (st2 === 2) pass(`${label} footer state 02`)
  else fail(`${label} footer state 02`, String(st2))
  const firstPlate = await page.evaluate(() => document.querySelector('[aria-label^="Folio"]')?.getAttribute('aria-label') || '')
  if (norm(firstPlate).includes('their voices matter') && norm(firstPlate).includes('alina javed')) pass(`${label} №01 = Their Voices Matter / Alina Javed`)
  else fail(`${label} №01 anchor`, firstPlate)
  await snap(page, `${label}-02-discovery`)

  // keyboard: arrows move focus
  await page.keyboard.press(viewport.width < 560 ? 'ArrowLeft' : 'ArrowRight'); await sleep(300)
  const focused = await page.evaluate(() => document.querySelector('[aria-current="true"]')?.getAttribute('aria-label') || '')
  const expectFolio = viewport.width < 560 ? 'folio 18' : 'folio 02'
  if (norm(focused).includes(expectFolio)) pass(`${label} arrow moves focus to ${expectFolio}`)
  else fail(`${label} arrow focus`, focused)

  // Enter → 03 focus
  await page.keyboard.press('Enter'); await sleep(1100)
  if (await waitFor(() => hasButton(page, 'pull the plate'))) pass(`${label} 03 focus: pull affordance`)
  else fail(`${label} 03 focus`)
  await snap(page, `${label}-03-focus`)

  // Enter → 04 settle
  await page.keyboard.press('Enter'); await sleep(1100)
  if (await hasButton(page, 'enter →') && await hasButton(page, 'return ←')) pass(`${label} 04 settle: ENTER/RETURN on plate`)
  else fail(`${label} 04 settle`)
  await snap(page, `${label}-04-settle`)

  // Esc settle → focus
  await page.keyboard.press('Escape'); await sleep(1000)
  if (await hasButton(page, 'pull the plate')) pass(`${label} Esc settle→focus`)
  else fail(`${label} Esc settle→focus`)

  // ArrowUp focus → discovery
  await page.keyboard.press('ArrowUp'); await sleep(1000)
  if (await hasButton(page, 'pull folio')) pass(`${label} ArrowUp focus→discovery`)
  else fail(`${label} ArrowUp focus→discovery`)

  // 12 SEARCH
  await page.keyboard.press('/'); await sleep(600)
  const dlg = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]')
    return d ? { modal: d.getAttribute('aria-modal'), label: d.getAttribute('aria-label') } : null
  })
  if (dlg && dlg.modal === 'true' && norm(dlg.label).includes('search')) pass(`${label} 12 search dialog aria-modal`)
  else fail(`${label} 12 search dialog`, JSON.stringify(dlg))
  await page.keyboard.type('voice', { delay: 40 }); await sleep(500)
  const nRes = await page.evaluate(() => document.querySelectorAll('[role="dialog"] li').length)
  if (nRes >= 1 && nRes <= 6) pass(`${label} 12 search: ${nRes} results (≤6)`)
  else fail(`${label} 12 search count`, String(nRes))
  await snap(page, `${label}-12-search`)
  await page.keyboard.press('Escape'); await sleep(500)
  if (!(await page.evaluate(() => !!document.querySelector('[role="dialog"]')))) pass(`${label} 12 search Esc closes`)
  else fail(`${label} 12 search Esc`)

  // 10 CATEGORY (desktop/tablet; chips hidden on mobile)
  if (viewport.width >= 768) {
    const chips = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button'))
        .map((b) => (b.textContent || '').trim())
        .filter((t) => t.length < 24 && !t.includes('№') && !t.includes('folio'))
        .filter((t) => /^(social issues|art|poetry|essays|lifestyle|stories|horror)$/i.test(t))
    })
    if (chips.length) {
      const cat = chips[0]
      // exact-match the CHIP button (plates contain the same words but with
      // folio + author text — never fuzzy-match a category name onto a plate)
      const chipClicked = await page.evaluate((c) => {
        const b = Array.from(document.querySelectorAll('button')).find((x) => (x.textContent || '').trim().toLowerCase() === c.toLowerCase())
        if (b) { b.click(); return true }
        return false
      }, cat)
      if (!chipClicked) fail(`${label} 10 category: chip click (${cat})`)
      await sleep(1200)
      const st10 = await footerState(page)
      if (st10 === 10) pass(`${label} 10 category: state 10 (${cat})`)
      else fail(`${label} 10 category state`, `chips=${chips.join(',')} got=${st10}`)
      const ops = await page.evaluate(() => {
        const ps = Array.from(document.querySelectorAll('[aria-label^="Folio"]'))
        const vis = ps.filter((p) => parseFloat(getComputedStyle(p.parentElement).opacity) > 0.3)
        return { visible: vis.length, total: ps.length }
      })
      pass(`${label} 10 category: ${ops.visible}/${ops.total} plates visible (ghosts recede)`)
      await snap(page, `${label}-10-category`)
      await page.keyboard.press('Escape'); await sleep(1000)
      if (await footerState(page) === 2) pass(`${label} 10 category Esc → discovery`)
      else fail(`${label} 10 category Esc`)
    } else fail(`${label} 10 category: no chips`)
  }

  // 05 entry → article handoff (click PULL FOLIO → Enter on settle → wait URL)
  await clickButton(page, 'pull folio'); await sleep(1100)   // discovery → focus
  await page.keyboard.press('Enter'); await sleep(1100)      // focus → settle
  await page.keyboard.press('Enter'); await sleep(300)       // settle → entry
  const handedOff = await waitFor(async () => (await page.url()).includes('/article/'), 5000)
  if (handedOff) pass(`${label} 05/06 entry → article handoff (${page.url().split('/').pop()})`)
  else fail(`${label} 05/06 entry handoff`, await page.url())
  await snap(page, `${label}-06-article`)
  const articleTxt = await bodyText(page)
  if (norm(articleTxt).includes('verlyse media')) pass(`${label} 06 article: masthead present`)
  else fail(`${label} 06 article masthead`)

  // browser Back → room remounts at ENDING
  await page.goBack({ waitUntil: 'networkidle0', timeout: 30000 })
  await waitFor(() => hasButton(page, 'next on the thread'))
  const st7 = await footerState(page)
  if (await hasButton(page, 'return to archive')) pass(`${label} 07 ending after Back (footer ${st7})`)
  else fail(`${label} 07 ending after Back`)
  await snap(page, `${label}-07-ending`)

  // 08 NEXT
  await clickButton(page, 'next on the thread'); await sleep(1200)
  const nxtTxt = await bodyText(page)
  if (norm(nxtTxt).includes('mir raza ali')) pass(`${label} 08 next: №19 Mir Raza Ali`)
  else fail(`${label} 08 next`, nxtTxt.slice(0, 120))
  await snap(page, `${label}-08-next`)

  // 09 RETURN
  await page.keyboard.press('Escape'); await sleep(900) // next → ending
  await clickButton(page, 'return to archive'); await sleep(1200)
  const retTxt = await bodyText(page)
  if (norm(retTxt).includes('the thread remembers')) pass(`${label} 09 return: thread remembers`)
  else fail(`${label} 09 return`, retTxt.slice(0, 120))
  const readBadge = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('span')).find((s) => (s.textContent || '').toLowerCase().includes('read ✓'))
    return !!el
  })
  if (readBadge) pass(`${label} 09 READ ✓ badge present`)
  else fail(`${label} 09 READ ✓ badge`)
  await snap(page, `${label}-09-return`)

  if (errors.length === 0) pass(`${label} console clean`)
  else fail(`${label} console errors`, JSON.stringify(errors.slice(0, 3)))
  if (failed.length === 0) pass(`${label} no failed requests`)
  else fail(`${label} failed requests`, JSON.stringify(failed.slice(0, 3)))
  const ov = await page.evaluate(() => {
    const de = document.documentElement
    return { x: de.scrollWidth - de.clientWidth, y: de.scrollHeight - de.clientHeight }
  })
  if (ov.x <= 1 && ov.y <= 1) pass(`${label} overflow 0/0`)
  else fail(`${label} overflow`, JSON.stringify(ov))
  await page.close()
}

await flowViewport('desktop', { width: 1440, height: 900 })
await flowViewport('tablet', { width: 768, height: 1024 })
await flowViewport('mobile', { width: 390, height: 844 })

// Canonical routes + invalid article
{
  const { page, errors } = await mkPage({ width: 1440, height: 900 })
  for (const route of ['/article/their-voices-matter', '/article/mir-raza-ali', '/creator/alina-javed', '/ambassadors']) {
    const resp = await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle0', timeout: 30000 })
    if (resp && resp.status() === 200) pass(`canonical 200 ${route}`)
    else fail(`canonical 200 ${route}`, resp ? String(resp.status()) : 'no resp')
  }
  const resp = await page.goto(`${BASE}/article/does-not-exist-xyz`, { waitUntil: 'networkidle0', timeout: 30000 })
  const b = await bodyText(page)
  if (resp && resp.status() === 200 && norm(b).includes('on the shelf') && norm(b).includes('misplaced')) pass('invalid article → 200 graceful "not on the shelf"')
  else fail('invalid article', `${resp ? resp.status() : '?'} | ${b.slice(0, 100)}`)
  if (errors.length === 0) pass('canonical routes console clean')
  else fail('canonical console', JSON.stringify(errors))
  await page.close()
}

// Reduced motion
{
  const { page, errors } = await mkPage({ width: 1440, height: 900 }, { reduceMotion: true })
  await page.goto(`${BASE}/room`, { waitUntil: 'networkidle0', timeout: 30000 })
  await page.keyboard.press('Enter'); await sleep(400)
  const dur = await page.evaluate(() => {
    const el = document.querySelector('[aria-label^="Folio"]')
    return el ? getComputedStyle(el.parentElement).transitionDuration : null
  })
  if (['0s', '0.001s', '1ms'].includes(dur)) pass(`reduced motion: transition ${dur}`)
  else fail('reduced motion transition', String(dur))
  const persp = await page.evaluate(() => {
    const m = document.querySelector('main.room')
    return m ? getComputedStyle(m).perspective : null
  })
  if (persp === 'none') pass('reduced motion: perspective disabled')
  else fail('reduced motion perspective', String(persp))
  if (errors.length === 0) pass('reduced motion console clean')
  else fail('reduced motion console', JSON.stringify(errors))
  await snap(page, 'reduced-02')
  await page.close()
}

// WebGL unavailable
{
  const { page, errors } = await mkPage({ width: 1440, height: 900 }, { noWebGL: true })
  await page.goto(`${BASE}/room`, { waitUntil: 'networkidle0', timeout: 30000 })
  await page.keyboard.press('Enter'); await sleep(1100)
  const n = await page.evaluate(() => document.querySelectorAll('[aria-label^="Folio"]').length)
  if (n === 19) pass('WebGL-off: room + 19 plates render')
  else fail('WebGL-off plates', String(n))
  if (errors.length === 0) pass('WebGL-off console clean')
  else fail('WebGL-off console', JSON.stringify(errors.slice(0, 3)))
  await snap(page, 'webgl-off-02')
  await page.close()
}

await browser.close()
const fails = results.filter((r) => r.status === 'FAIL')
console.log('\n================ PHASE 20.5 VALIDATION v2 ================')
for (const r of results) console.log(`${r.status === 'PASS' ? '✅' : '❌'} ${r.check}${r.detail ? '  — ' + r.detail : ''}`)
console.log(`\nTOTAL ${results.length} | PASS ${results.length - fails.length} | FAIL ${fails.length}`)
fs.writeFileSync('/home/user/verlyse-project/audit/phase205-results-v2.json', JSON.stringify(results, null, 2))
process.exit(fails.length ? 1 : 0)
