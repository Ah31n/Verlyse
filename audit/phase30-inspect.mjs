// PHASE 30 — GLOBAL ART-DIRECTION AUDIT · inspection walk (no code changes)
// Captures every canonical route at desktop/tablet/mobile/reduced + WebGL-off
// spot checks, collecting technical signals for the audit.
import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'

const BASE = 'http://localhost:5173'
const OUT = path.resolve('audit/shots/phase30')
fs.mkdirSync(OUT, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const ROUTES = [
  ['/', 'entrance'],
  ['/articles', 'archive'],
  ['/article/their-voices-matter', 'reading'],
  ['/creators', 'wall'],
  ['/creator/alina-javed', 'dossier'],
  ['/ambassadors', 'people'],
  ['/categories', 'wings'],
  ['/community', 'commons'],
  ['/about', 'colophon'],
  ['/submit', 'desk'],
  ['/contact', 'correspondence'],
  ['/room', 'keeping'],
]

async function launch(viewport, opts = {}) {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--use-gl=swiftshader'] })
  const page = await browser.newPage()
  await page.setViewport(viewport)
  if (opts.reduced) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  if (opts.noWebGL) {
    await page.evaluateOnNewDocument(() => {
      HTMLCanvasElement.prototype.getContext = function (type, ...a) { if (String(type).toLowerCase().includes('webgl')) return null; return null }
    })
  }
  const errors = [], failed = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 120)) })
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 120)))
  page.on('requestfailed', (r) => failed.push(r.url()))
  return { browser, page, errors, failed }
}

const results = []
const rows = []

for (const [p, id] of ROUTES) {
  const { browser, page, errors, failed } = await launch({ width: 1440, height: 900 })
  errors.length = 0; failed.length = 0
  await page.goto(BASE + p, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await sleep(p.includes('/article/') || p === '/room' ? 7000 : 5000)
  const sig = await page.evaluate(() => {
    const h1s = [...document.querySelectorAll('h1')].map((h) => h.innerText.replace(/\s+/g, ' ').trim().slice(0, 46))
    const t = document.body.innerText
    return {
      h1: h1s, h1count: h1s.length,
      ox: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      bg: getComputedStyle(document.body).backgroundColor,
      serif: [...document.querySelectorAll('*')].filter((el) => getComputedStyle(el).fontFamily.toLowerCase().includes('cormorant')).length,
      mono: [...document.querySelectorAll('*')].filter((el) => getComputedStyle(el).fontFamily.toLowerCase().includes('plex mono') || getComputedStyle(el).fontFamily.toLowerCase().includes('mono')).length,
      ghost: [...document.querySelectorAll('*')].filter((el) => { const st = getComputedStyle(el); return st.webkitTextStroke && st.webkitTextStroke.includes('px') && el.children.length === 0 }).length,
      brassRules: [...document.querySelectorAll('*')].filter((el) => { const bg = getComputedStyle(el).backgroundImage; return /linear-gradient|radial-gradient/.test(bg) && (el.clientWidth >= 40 || el.clientHeight >= 40) }).length,
      links: document.querySelectorAll('a[href^="/"], a[href^="http"]').length,
      len: t.length,
    }
  })
  const errs = errors.filter((e) => !/favicon|WebGL|THREE|getContext|Canvas|above error|React/i.test(e))
  const flds = failed.filter((u) => !/favicon/.test(u))
  const row = { route: p, id, ...sig, consoleErr: errs.slice(0, 2), failedReq: flds.slice(0, 2) }
  rows.push(row)
  await page.screenshot({ path: path.join(OUT, `${id}-desktop.png`), fullPage: false })
  await browser.close()
}

// tablet + mobile + reduced + webgloff sweeps (signals only + one capture each for tablet/mobile)
for (const vp of [{ w: 768, h: 1024, tag: 'tablet' }, { w: 390, h: 844, tag: 'mobile' }]) {
  const { browser, page, errors, failed } = await launch({ width: vp.w, height: vp.h })
  for (const [p, id] of ROUTES) {
    errors.length = 0; failed.length = 0
    await page.goto(BASE + p, { waitUntil: 'domcontentloaded', timeout: 45000 })
    await sleep(p.includes('/article/') || p === '/room' ? 5500 : 4000)
    const sig = await page.evaluate(() => ({
      ox: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      h1: document.querySelectorAll('h1').length,
    }))
    const errs = errors.filter((e) => !/favicon|WebGL|THREE|getContext|Canvas|above error|React/i.test(e))
    rows.push({ route: p, id, viewport: vp.tag, ox: sig.ox, h1: sig.h1, consoleErr: errs.slice(0, 1), failedReq: failed.filter((u) => !/favicon/.test(u)).slice(0, 1) })
    if (vp.tag === 'mobile') await page.screenshot({ path: path.join(OUT, `${id}-mobile.png`) })
  }
  await browser.close()
}

// reduced + webgl-off — key routes only
for (const [p, id] of [['/', 'entrance'], ['/articles', 'archive'], ['/article/their-voices-matter', 'reading'], ['/creator/alina-javed', 'dossier'], ['/creators', 'wall'], ['/community', 'commons']]) {
  for (const mode of ['reduced', 'webgloff']) {
    const { browser, page, errors, failed } = await launch({ width: 1440, height: 900 }, { reduced: mode === 'reduced', noWebGL: mode === 'webgloff' })
    errors.length = 0; failed.length = 0
    await page.goto(BASE + p, { waitUntil: 'domcontentloaded', timeout: 45000 })
    await sleep(p.includes('/article/') ? 7000 : 5000)
    const sig = await page.evaluate(() => ({
      ox: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      h1: document.querySelectorAll('h1').length,
      canvas: document.querySelectorAll('canvas').length,
    }))
    const errs = errors.filter((e) => !/favicon|WebGL|THREE|getContext|Canvas|above error|React/i.test(e))
    rows.push({ route: p, id, viewport: mode, ox: sig.ox, h1: sig.h1, canvas: sig.canvas, consoleErr: errs.slice(0, 1) })
    await page.screenshot({ path: path.join(OUT, `${id}-${mode}.png`) })
    await browser.close()
  }
}

fs.writeFileSync(path.resolve('audit/phase30-inspection.json'), JSON.stringify(rows, null, 1))
// human summary
console.log('\n=== PHASE 30 INSPECTION — DESKTOP SIGNALS ===')
for (const r of rows.filter((x) => !x.viewport)) {
  const flags = []
  if (r.ox > 1) flags.push(`OVERFLOW ${r.ox}`)
  if (r.h1count !== 1) flags.push(`h1=${r.h1count}`)
  if (r.consoleErr.length) flags.push(`CONSOLE ${r.consoleErr[0]}`)
  if (r.failedReq.length) flags.push(`FAILED ${r.failedReq[0]}`)
  console.log(`${r.route.padEnd(32)} h1="${r.h1[0] || ''}"${flags.length ? '  ⚠ ' + flags.join(' · ') : '  ok'}`)
}
console.log('\n=== TABLE/MOBILE/REDUCED/WEBGLOFF SIGNALS (issues only) ===')
for (const r of rows.filter((x) => x.viewport)) {
  const flags = []
  if (r.ox > 1) flags.push(`OVERFLOW ${r.ox}`)
  if (r.h1 !== 1) flags.push(`h1=${r.h1}`)
  if (r.consoleErr && r.consoleErr.length) flags.push(`CONSOLE`)
  if (flags.length) console.log(`${r.viewport.padEnd(8)} ${r.route.padEnd(32)} ${flags.join(' · ')}`)
}
console.log('\nall inspection signals written to audit/phase30-inspection.json')
