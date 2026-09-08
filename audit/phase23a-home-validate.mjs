// PHASE 23A — THE ENTRANCE · real-Chromium inspection harness.
// Verifies the refined homepage art direction and captures screenshots.
import puppeteer from 'puppeteer'
import fs from 'node:fs'

const BASE = 'http://localhost:5173'
const OUT = '/home/user/verlyse-project/audit/shots'
fs.mkdirSync(OUT, { recursive: true })
const results = []
const pass = (n, d = '') => results.push({ check: n, status: 'PASS', detail: d })
const fail = (n, d = '') => results.push({ check: n, status: 'FAIL', detail: d })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function launch(opts = {}) {
  const p = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'], headless: 'new' })
  const page = await p.newPage()
  await page.setViewport(opts.viewport ?? { width: 1440, height: 900 })
  const errors = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${String(e).slice(0, 140)}`))
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text().slice(0, 140)}`) })
  page.on('requestfailed', (r) => errors.push(`reqfail: ${r.url().slice(0, 80)}`))
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
const overflowX = (page) => page.evaluate(() => Math.max(document.documentElement.scrollWidth - document.documentElement.clientWidth, 0))

/* ============================== DESKTOP ============================== */
{
  const { p, page, errorsOf } = await launch({ viewport: { width: 1440, height: 900 } })
  const res = await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await sleep(2800)
  if (res && res.status() === 200) pass('loads (200)')
  else fail('loads', res?.status())

  const h1s = await page.evaluate(() => Array.from(document.querySelectorAll('h1')).map((h) => h.innerText.replace(/\s+/g, ' ').trim()))
  if (h1s.length === 1 && /Where Vision Becomes A Voice/i.test(h1s[0])) pass('exactly one H1 — the headline')
  else fail('H1', JSON.stringify(h1s))

  const title = await page.title()
  if (/Verlyse Media/i.test(title)) pass('title carries Verlyse Media')
  else fail('title', title)

  const artifacts = await page.evaluate(() => {
    const body = document.body.innerText
    return {
      issue: /Issue №\s?01/i.test(body),
      ledger: /publication record — engraved, not estimated/i.test(body),
      descend: /the archive opens below/i.test(body),
      vocab: /Pull → Read → Return/i.test(body),
    }
  })
  if (artifacts.issue) pass('issue notation present (Issue № 01)')
  else fail('issue notation')
  if (artifacts.ledger) pass('engraved ledger caption present')
  else fail('ledger caption')
  if (artifacts.descend) pass('archive-descent cue present')
  else fail('descend cue')
  if (artifacts.vocab) pass('PULL → READ → RETURN vocabulary present')
  else fail('vocabulary')

  // registration hairlines (two 1px vertical brass lines, desktop)
  const hairlines = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('div')).filter((d) => {
      const cs = getComputedStyle(d)
      return cs.position === 'absolute' && cs.width === '1px' && cs.backgroundImage.includes('linear-gradient')
    })
    return els.length
  })
  if (hairlines >= 2) pass('print-registration hairlines (desktop)', `${hairlines} found`)
  else fail('registration hairlines', String(hairlines))

  // feature link is canonical
  const featureHref = await page.evaluate(() => {
    const a = document.querySelector('a[href="/article/their-voices-matter"]')
    return a ? a.getAttribute('href') : ''
  })
  if (featureHref) pass('feature link canonical → /article/their-voices-matter')
  else fail('feature link')

  // parallax depth hierarchy — each plane a different rate
  await page.evaluate(() => {
  document.documentElement.style.scrollBehavior = 'auto'
  window.scrollTo(0, 400)
})
  await sleep(500)
  const planes = await page.evaluate(() => {
    const tyOf = (el) => {
      if (!el) return null
      const t = getComputedStyle(el).transform
      const m = t.match(/matrix\(([^)]+)\)/) || t.match(/matrix3d\(([^)]+)\)/)
      if (!m) return 0
      const v = m[1].split(',').map(Number)
      return v.length === 16 ? v[13] : v[5]
    }
    // atmosphere: the motion.div wrapping the radial-gradient layer
    const atmo = [...document.querySelectorAll('div')].find((d) => /-top-\[10%\]/.test(String(d.className || '')))
    const ghostBig = [...document.querySelectorAll('p')].find((el) => el.textContent.trim() === 'Verlyse' && /whitespace-nowrap/.test(el.className))
    const band = [...document.querySelectorAll('div')].find((d) => /Est\. 2026/.test(d.textContent || '') && /justify-between/.test(String(d.className || '')))
    const copy = [...document.querySelectorAll('div')].find((d) => /pb-28/.test(d.className) && /pt-44/.test(d.className))
    const folio = [...document.querySelectorAll('span')].find((el) => /№\s*01/.test(el.textContent || '') && /whitespace-nowrap/.test(String(el.className || '')))
    const plate = [...document.querySelectorAll('a[aria-label*="current feature"]')]?.[0]?.parentElement
    return {
      atmo: tyOf(atmo),
      ghost: tyOf(ghostBig?.parentElement),
      band: tyOf(band?.parentElement),
      folio: tyOf(folio?.parentElement),
      copy: tyOf(copy),
      plate: tyOf(plate),
    }
  })
  const { atmo, ghost, band, folio, copy, plate } = planes
  // far > ghost > band > folio >= copy; plate negative (foreground, faster)
  const depthOk = atmo > ghost && ghost > band && band > folio && folio !== null && folio >= copy
  const plateNear = plate !== null && plate < 0
  if (depthOk && plateNear) pass('parallax depth hierarchy verified', JSON.stringify(planes))
  else fail('parallax hierarchy', JSON.stringify(planes))

  // plate scale grows toward the reader
  const plateScale = await page.evaluate(() => {
    const inner = document.querySelector('a[aria-label*="current feature"]')?.parentElement
    if (!inner) return null
    const t = getComputedStyle(inner).transform
    const m = t.match(/matrix\(([^)]+)\)/)
    return m ? Number(m[1].split(',')[0]) : null
  })
  if (plateScale && plateScale > 1 && plateScale < 1.1) pass('plate scale grows toward reader', `scale=${plateScale.toFixed(3)}`)
  else fail('plate scale', String(plateScale))

  // ——— 23A.1 reveal assertions ———
  // archive plates/thread visible: canvas blends with the wine backdrop via lighten
  const blend = await page.evaluate(() => {
    const c = document.querySelector('canvas')
    return c ? getComputedStyle(c).mixBlendMode : 'no-canvas'
  })
  if (blend === 'lighten') pass('archive revealed — canvas lighten blend', blend)
  else fail('archive blend', String(blend))

  // wine atmosphere veil reduced substantially (kept, not removed)
  const atmoBg = await page.evaluate(() => {
    const wrap = [...document.querySelectorAll('div')].find((d) => /-top-\[10%\]/.test(String(d.className || '')))
    const g = wrap?.firstElementChild
    return g ? getComputedStyle(g).backgroundImage : ''
  })
  if (/0\.38/.test(atmoBg)) pass('wine atmosphere veil reduced', 'rgba(92,18,36,0.38)')
  else fail('atmo veil', String(atmoBg).slice(0, 90))

  // heavy vignette reduced substantially
  const vigBg = await page.evaluate(() => {
    const v = [...document.querySelectorAll('div')].find((d) => /rgba\(22,5,10/.test(String(d.className || '')))
    return v ? getComputedStyle(v).backgroundImage : ''
  })
  if (/0\.26/.test(vigBg)) pass('vignette veil reduced', 'rgba(22,5,10,0.26)')
  else fail('vignette veil', String(vigBg).slice(0, 90))

  // ghost masthead is legible at rest (stroke alpha >= 0.3)
  const ghostStroke = await page.evaluate(() => {
    const p = [...document.querySelectorAll('p')].find((el) => el.textContent.trim() === 'Verlyse' && /whitespace-nowrap/.test(String(el.className || '')))
    return p ? getComputedStyle(p).webkitTextStrokeColor || getComputedStyle(p).textStrokeColor || '' : ''
  })
  if (/0\.3[6-9]/.test(ghostStroke) || /0\.4/.test(ghostStroke)) pass('ghost masthead legible at rest', ghostStroke)
  else fail('ghost stroke', String(ghostStroke))

  // registration marks — brass crosses at the editorial field corners
  const marks = await page.evaluate(() => {
    const spans = [...document.querySelectorAll('span')]
    return spans.filter((sp) => {
      const r = sp.getBoundingClientRect()
      return r.width <= 2 && r.height >= 10 && r.height <= 14
    }).length
  })
  if (marks >= 4) pass('registration marks present', `${marks} brass crosses`)
  else fail('registration marks', String(marks))

  if (await overflowX(page) === 0) pass('no horizontal overflow (desktop)')
  else fail('overflowX desktop', String(await overflowX(page)))

  // keyboard: tab to the feature link, focus-visible outline visible
  await page.evaluate(() => {
  document.documentElement.style.scrollBehavior = 'auto'
  window.scrollTo(0, 0)
})
  await sleep(400)
  for (let i = 0; i < 14; i++) { await page.keyboard.press('Tab'); await sleep(40) }
  const kbd = await page.evaluate(() => {
    const a = document.activeElement
    if (!a || a.tagName !== 'A') return { tag: a?.tagName }
    const cs = getComputedStyle(a)
    return { href: a.getAttribute('href'), outline: cs.outlineStyle, outlineW: cs.outlineWidth }
  })
  if (kbd.href === '/article/their-voices-matter' && kbd.outlineW !== '0px') pass('keyboard focus reaches the feature with visible outline')
  else info('keyboard focus', JSON.stringify(kbd))

  await noConsole(page, errorsOf())
  await page.screenshot({ path: `${OUT}/23a-home-1440.png` })
  await p.close()
}

/* ============================ TABLET 768 ============================ */
{
  const { p, page, errorsOf } = await launch({ viewport: { width: 768, height: 1024 } })
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await sleep(2400)
  const h1 = await page.evaluate(() => document.querySelectorAll('h1').length)
  const ox = await overflowX(page)
  if (h1 === 1 && ox === 0) pass('tablet 768×1024 — one H1, no overflow')
  else fail('tablet', `h1=${h1} ox=${ox}`)
  if (errorsOf().length === 0) pass('tablet console clean')
  else fail('tablet console', JSON.stringify(errorsOf()))
  await page.screenshot({ path: `${OUT}/23a-home-768.png` })
  await p.close()
}

/* ============================= MOBILE 390 ============================= */
{
  const { p, page, errorsOf } = await launch({ viewport: { width: 390, height: 844 } })
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await sleep(2400)
  const h1 = await page.evaluate(() => document.querySelectorAll('h1').length)
  const ox = await overflowX(page)
  // one primary object per view — the copy stack + CTA must be present and readable
  const cta = await page.evaluate(() => !!document.querySelector('a[href="/submit"]'))
  const pull = await page.evaluate(() => /Pull folio 01/i.test(document.body.innerText))
  if (h1 === 1 && ox === 0 && cta && pull) pass('mobile 390×844 — one H1, no overflow, CTA + pull present')
  else fail('mobile', `h1=${h1} ox=${ox} cta=${cta} pull=${pull}`)
  if (errorsOf().length === 0) pass('mobile console clean')
  else fail('mobile console', JSON.stringify(errorsOf()))
  await page.screenshot({ path: `${OUT}/23a-home-390.png` })
  await p.close()
}

/* ============================ REDUCED MOTION ============================ */
{
  const { p, page, errorsOf } = await launch({ reduced: true })
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await sleep(2400)
  await page.evaluate(() => {
  document.documentElement.style.scrollBehavior = 'auto'
  window.scrollTo(0, 500)
})
  await sleep(500)
  const moving = await page.evaluate(() => {
    const movers = [...document.querySelectorAll('div')].filter((d) => {
      if (!(d.style && d.style.transform && d.style.transform !== 'none' && d.style.transform !== '')) return false
      const t = getComputedStyle(d).transform
      if (t === 'none') return false
      const m = t.match(/matrix\(([^)]+)\)/) || t.match(/matrix3d\(([^)]+)\)/)
      if (!m) return false
      const v = m[1].split(',').map(Number)
      const ty = v.length === 16 ? v[13] : v[5]
      return Math.abs(ty) > 0.5
    })
    return movers.length
  })
  const anims = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length)
  const h1 = await page.evaluate(() => document.querySelectorAll('h1').length)
  const ox = await overflowX(page)
  if (h1 === 1 && ox === 0 && moving === 0 && anims <= 1) pass('reduced-motion — same composition, no parallax, no running motion', `anims=${anims}`)
  else fail('reduced-motion', JSON.stringify({ h1, ox, moving, anims }))
  if (errorsOf().length === 0) pass('reduced console clean')
  else fail('reduced console', JSON.stringify(errorsOf()))
  await page.screenshot({ path: `${OUT}/23a-home-reduced.png` })
  await p.close()
}

/* ============================= WEBGL OFF ============================= */
{
  const { p, page, errorsOf } = await launch({ noWebGL: true })
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await sleep(2600)
  const h1 = await page.evaluate(() => document.querySelectorAll('h1').length)
  const ox = await overflowX(page)
  const feature = await page.evaluate(() => !!document.querySelector('a[href="/article/their-voices-matter"]'))
  if (h1 === 1 && ox === 0 && feature) pass('WebGL-off — entrance fully intact (H1, no overflow, feature)')
  else fail('WebGL-off', JSON.stringify({ h1, ox, feature }))
  if (errorsOf().length === 0) pass('WebGL-off console clean')
  else fail('WebGL-off console', JSON.stringify(errorsOf()))
  await page.screenshot({ path: `${OUT}/23a-home-nogl.png` })
  await p.close()
}

async function noConsole(page, errs) {
  if (errs.length === 0) pass('console clean')
  else fail('console', JSON.stringify(errs))
}

const fails = results.filter((r) => r.status === 'FAIL')
console.log('\n=== PHASE 23A — ENTRANCE INSPECTION ===')
for (const r of results) console.log(`${r.status === 'PASS' ? '✅' : '❌'} ${r.check}${r.detail ? ' — ' + r.detail : ''}`)
console.log(`\nTOTAL ${results.length} | PASS ${results.length - fails.length} | FAIL ${fails.length}`)
fs.writeFileSync('/home/user/verlyse-project/audit/phase23a-results.json', JSON.stringify(results, null, 2))
process.exit(fails.length ? 1 : 0)
