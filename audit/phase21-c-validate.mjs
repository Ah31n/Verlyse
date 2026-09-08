// Phase 21 · Slice C — /articles spatial archive validation (real Chromium).
import puppeteer from 'puppeteer'
import fs from 'node:fs'
const BASE = 'http://localhost:5173'
const OUT = '/home/user/verlyse-project/audit/shots'
fs.mkdirSync(OUT, { recursive: true })
const results = []
const pass = (n, d = '') => results.push({ check: n, status: 'PASS', detail: d })
const fail = (n, d = '') => results.push({ check: n, status: 'FAIL', detail: d })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'], headless: 'new' })

async function mkPage(vp, opts = {}) {
  const page = await browser.newPage()
  await page.setViewport(vp)
  const errors = [], failed = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('requestfailed', (r) => failed.push(r.url()))
  if (opts.reduceMotion) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  return { page, errors, failed }
}

const folioLabels = (page) => page.evaluate(() =>
  Array.from(document.querySelectorAll('a[aria-label^="Folio"]')).map((a) => a.getAttribute('aria-label')))
const plateOpacity = (page) => page.evaluate(() =>
  Array.from(document.querySelectorAll('a[aria-label^="Folio"]')).map((a) => +parseFloat(getComputedStyle(a.parentElement).opacity).toFixed(2)))
const overflow = (page) => page.evaluate(() => {
  const de = document.documentElement
  return { x: de.scrollWidth - de.clientWidth, y: de.scrollHeight - de.clientHeight }
})

// ---------- DESKTOP ----------
{
  const { page, errors, failed } = await mkPage({ width: 1440, height: 900 })
  await page.goto(`${BASE}/articles`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await sleep(1800)

  const labels = await folioLabels(page)
  if (labels.length === 19) pass('desktop: 19 folio plates on the shelf')
  else fail('desktop: 19 folio plates', String(labels.length))
  if (labels[0]?.includes('Their Voices Matter')) pass('desktop: №01 = Their Voices Matter')
  else fail('desktop: №01', labels[0] || '')
  if (labels[18]?.includes('Mir Raza Ali')) pass('desktop: №19 = Mir Raza Ali')
  else fail('desktop: №19', labels[18] || '')
  const newestBadge = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('span')).find((s) => (s.textContent || '').trim() === 'Newest')
    return !!el
  })
  if (newestBadge) pass('desktop: NEWEST badge present')
  else fail('desktop: NEWEST badge')

  // opacity hierarchy: focused = 1, neighbours recede
  const ops = await plateOpacity(page)
  if (ops[0] === 1 && ops[1] < 1 && ops[1] > ops[2]) pass('desktop: attention hierarchy (focus 1, neighbours recede)')
  else fail('desktop: attention hierarchy', ops.slice(0, 5).join(','))

  // keyboard: arrows + Enter
  await page.focus('a[aria-label^="Folio"]')
  await page.keyboard.press('ArrowRight')
  await sleep(400)
  const focused1 = await page.evaluate(() => document.querySelector('a[aria-current="true"]')?.getAttribute('aria-label') || '')
  if (focused1.includes('3:13')) pass('desktop: ArrowRight moves focus to №02 (3:13)')
  else fail('desktop: ArrowRight', focused1)
  await page.keyboard.press('Enter')
  await sleep(1400)
  const url = page.url()
  if (url.includes('/article/3-13') || url.includes('/article/')) pass(`desktop: Enter pulls → canonical article (${url.split('/').pop()})`)
  else fail('desktop: Enter → article', url)

  // back + category filter spatial reorg
  await page.goBack({ waitUntil: 'domcontentloaded', timeout: 30000 })
  await sleep(1500)
  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find((x) => (x.textContent || '').trim().toUpperCase() === 'POETRY')
    b && b.click()
  })
  await sleep(1400)
  const opsPoetry = await plateOpacity(page)
  const membersPoetry = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[aria-label^="Folio"]'))
    return links.filter((a) => /poetry/i.test(a.textContent || '')).length
  })
  const bright = opsPoetry.filter((o) => o > 0.3).length
  const ghost = opsPoetry.filter((o) => o <= 0.12).length
  if (membersPoetry >= 5 && bright === membersPoetry && ghost === 19 - membersPoetry) pass(`desktop: Poetry reorganizes shelf (${bright} members bright / ${ghost} ghosts)`)
  else fail('desktop: category reorg', JSON.stringify({ membersPoetry, bright, ghost }))
  await page.screenshot({ path: `${OUT}/phase21-articles-cat-poetry.png` })

  // clear filter + search dims non-matches
  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find((x) => (x.textContent || '').trim().toUpperCase() === 'ALL')
    b && b.click()
  })
  await sleep(900)
  await page.type('#art-search', 'mir raza', { delay: 30 })
  await sleep(900)
  const opsSearch = await plateOpacity(page)
  const brightS = opsSearch.filter((o) => o > 0.3).length
  const ghostS = opsSearch.filter((o) => o <= 0.12).length
  if (brightS === 1 && ghostS === 18) pass(`desktop: search dims non-matches (${brightS} member bright / ${ghostS} ghosts)`)
  else fail('desktop: search dim', JSON.stringify({ brightS, ghostS }))
  await page.screenshot({ path: `${OUT}/phase21-articles-search.png` })

  const ov = await overflow(page)
  if (ov.x <= 1) pass('desktop: no horizontal overflow')
  else fail('desktop: overflow', JSON.stringify(ov))
  if (errors.length === 0) pass('desktop: console clean')
  else fail('desktop: console', JSON.stringify(errors.slice(0, 3)))
  if (failed.length === 0) pass('desktop: no failed requests')
  else fail('desktop: failed requests', JSON.stringify(failed.slice(0, 3)))
  await page.close()
}

// ---------- MOBILE ----------
{
  const { page, errors } = await mkPage({ width: 390, height: 844 })
  await page.goto(`${BASE}/articles`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await sleep(1600)
  const labels = await folioLabels(page)
  if (labels.length === 19) pass('mobile: 19 folio plates present')
  else fail('mobile: plates', String(labels.length))
  const thread = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('div'))
    const t = els.find((d) => {
      const bg = getComputedStyle(d).backgroundImage
      return bg.includes('linear-gradient') && (bg.includes('rgb(184, 145, 70)') || bg.includes('217, 185, 120'))
    })
    if (!t) return null
    const cs = getComputedStyle(t)
    return { w: cs.width, h: cs.height }
  })
  if (thread && thread.w === '1px' && parseFloat(thread.h) > 300) pass(`mobile: vertical brass thread (${thread.w} × ${thread.h})`)
  else fail('mobile: vertical thread', JSON.stringify(thread))
  const ov = await overflow(page)
  if (ov.x <= 1) pass('mobile: no horizontal overflow')
  else fail('mobile: overflow', JSON.stringify(ov))
  if (errors.length === 0) pass('mobile: console clean')
  else fail('mobile: console', JSON.stringify(errors.slice(0, 3)))
  await page.screenshot({ path: `${OUT}/phase21-articles-mobile.png` })
  await page.close()
}

// ---------- TABLET ----------
{
  const { page, errors } = await mkPage({ width: 768, height: 1024 })
  await page.goto(`${BASE}/articles`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await sleep(1600)
  const labels = await folioLabels(page)
  const ov = await overflow(page)
  if (labels.length === 19) pass('tablet: 19 folio plates present')
  else fail('tablet: plates', String(labels.length))
  if (ov.x <= 1) pass('tablet: no horizontal overflow')
  else fail('tablet: overflow', JSON.stringify(ov))
  if (errors.length === 0) pass('tablet: console clean')
  else fail('tablet: console', JSON.stringify(errors.slice(0, 3)))
  await page.screenshot({ path: `${OUT}/phase21-articles-tablet.png` })
  await page.close()
}

// ---------- REDUCED MOTION ----------
{
  const { page, errors } = await mkPage({ width: 1440, height: 900 }, { reduceMotion: true })
  await page.goto(`${BASE}/articles`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await sleep(1200)
  const persp = await page.evaluate(() => {
    const stage = Array.from(document.querySelectorAll('div[role="group"]')).find((d) => (d.getAttribute('aria-label') || '').includes('archive'))
    return stage ? getComputedStyle(stage).perspective : null
  })
  if (persp === 'none') pass('reduced-motion: no perspective on the archive')
  else fail('reduced-motion: perspective', String(persp))
  const labels = await folioLabels(page)
  if (labels.length === 19) pass('reduced-motion: all 19 folios still present (same publication)')
  else fail('reduced-motion: folios', String(labels.length))
  if (errors.length === 0) pass('reduced-motion: console clean')
  else fail('reduced-motion console', JSON.stringify(errors))
  await page.screenshot({ path: `${OUT}/phase21-articles-reduced.png` })
  await page.close()
}

// ---------- NO WEBGL ----------
{
  const { page, errors } = await mkPage({ width: 1440, height: 900 })
  await page.evaluateOnNewDocument(() => {
    HTMLCanvasElement.prototype.getContext = function (type, ...a) {
      if (String(type).toLowerCase().includes('webgl')) return null
      return null
    }
  })
  await page.goto(`${BASE}/articles`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await sleep(1200)
  const labels = await folioLabels(page)
  if (labels.length === 19) pass('WebGL-off: archive renders (CSS-3D, no canvas)')
  else fail('WebGL-off: archive', String(labels.length))
  if (errors.length === 0) pass('WebGL-off: console clean')
  else fail('WebGL-off console', JSON.stringify(errors.slice(0, 3)))
  await page.close()
}

await browser.close()
const fails = results.filter((r) => r.status === 'FAIL')
console.log('\n=== PHASE 21 SLICE C VALIDATION ===')
for (const r of results) console.log(`${r.status === 'PASS' ? '✅' : '❌'} ${r.check}${r.detail ? ' — ' + r.detail : ''}`)
console.log(`\nTOTAL ${results.length} | PASS ${results.length - fails.length} | FAIL ${fails.length}`)
fs.writeFileSync('/home/user/verlyse-project/audit/phase21-c-results.json', JSON.stringify(results, null, 2))
process.exit(fails.length ? 1 : 0)
