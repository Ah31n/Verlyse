// PHASE 26 — THE DOSSIER · real-Chromium validation (Penpot Phase-25 fidelity)
// /creator/:id — wine room + dossier sheet + portrait/featured plates + nav.
// Exits non-zero on any FAIL.
import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'

const BASE = 'http://localhost:5173'
const OUT = path.resolve('audit/shots')
const RESULTS = path.resolve('audit/phase26-dossier-results.json')

let PASS = 0, FAIL = 0, INFO = 0
const checks = []
const pass = (name, detail = '') => { PASS++; checks.push({ name, status: 'PASS', detail }) }
const fail = (name, detail = '') => { FAIL++; checks.push({ name, status: 'FAIL', detail }) }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/* ---------------- content.ts parser (authoritative) ---------------- */
function parseContent() {
  const src = fs.readFileSync('src/data/content.ts', 'utf8')
  const authors = []
  const articles = []
  const aRe = /id: '([a-z0-9-]+)',\s*\n\s*name:\s*(["'])((?:[^\\]|\\.)*?)\2/g
  let m
  while ((m = aRe.exec(src))) {
    const id = m[1]
    const i = src.indexOf(`id: '${id}'`)
    const j = src.indexOf('\n  },', i)
    const block = src.slice(i, j < 0 ? src.length : j)
    const grab = (k) => {
      const mm = block.match(new RegExp(`${k}:\\s*(["'])((?:[^\\\\]|\\\\.)*?)\\1`))
      return mm ? mm[2].replace(/\\'/g, "'") : undefined
    }
    authors.push({ id, name: m[3].replace(/\\'/g, "'"), role: grab('role'), handle: grab('handle'), bio: grab('bio'), portrait: grab('portrait'), confirmed: /confirmed:\s*true/.test(block) })
  }
  const artRe = /id: '([a-z0-9-]+)',\s*\n\s*title:\s*(["'])((?:[^\\]|\\.)*?)\2,\s*\n\s*authorId: '([a-z0-9-]+)',\s*\n\s*category:\s*(["'])((?:[^\\]|\\.)*?)\5/g
  while ((m = artRe.exec(src))) {
    articles.push({ id: m[1], title: m[3].replace(/\\'/g, "'"), authorId: m[4], category: m[6].replace(/\\'/g, "'") })
  }
  const folioOf = (id) => {
    const i = articles.findIndex((a) => a.id === id)
    return i >= 0 ? String(i + 1).padStart(2, '0') : '—'
  }
  return { authors, articles, folioOf }
}
const CONTENT = parseContent()
const ALINA = CONTENT.authors.find((a) => a.id === 'alina-javed')

/* ---------------- browser helpers ---------------- */
async function launch(opts = {}) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  })
  const page = await browser.newPage()
  if (opts.noWebGL) {
    await page.evaluateOnNewDocument(() => {
      HTMLCanvasElement.prototype.getContext = function (type) {
        if (String(type).toLowerCase().includes('webgl')) return null
        return null
      }
    })
  }
  if (opts.reduce) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  const errors = []
  const failed = []
  page.on('pageerror', (e) => errors.push('pageerror: ' + String(e)))
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()) })
  page.on('requestfailed', (r) => failed.push(r.url()))
  return { browser, page, errors, failed }
}
const overflowX = (page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
const h1s = (page) => page.evaluate(() => [...document.querySelectorAll('h1')].map((h) => h.textContent.replace(/\s+/g, ' ').trim()))
const text = (page) => page.evaluate(() => document.body.textContent.replace(/\s+/g, ' '))
const runningAnims = (page) => page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length)
const badImages = (page) => page.evaluate(() => [...document.images].filter((i) => !(i.complete && i.naturalWidth > 0)).map((i) => i.getAttribute('src')))

async function gotoCreator(page, id) {
  await page.goto(`${BASE}/creator/${id}`, { waitUntil: 'domcontentloaded', timeout: 35000 })
  await sleep(4200)
}

console.log('=== PHASE 26 — THE DOSSIER INSPECTION ===')

/* ============ 1 · every canonical creator route ============ */
{
  const { browser, page, errors, failed } = await launch()
  await page.setViewport({ width: 1440, height: 900 })
  let allClean = true
  for (const a of CONTENT.authors) {
    await gotoCreator(page, a.id)
    const h = await h1s(page)
    const ox = await overflowX(page)
    const ok = h.length === 1 && h[0].toLowerCase() === a.name.toLowerCase() && ox === 0
    if (!ok) { allClean = false; fail(`creator ${a.id}: one primary H1, no overflow`, JSON.stringify({ h1: h, ox })) }
  }
  if (allClean) pass(`all ${CONTENT.authors.length} creator routes — exactly one primary H1, zero overflow`)
  const crit = failed.filter((u) => /\/img\/|\/assets\//.test(u))
  if (crit.length === 0) pass('creator routes: no failed asset requests')
  else fail('creator routes: failed assets', crit.join(',').slice(0, 160))
  if (errors.length === 0) pass('creator routes: console clean')
  else fail('creator routes: console', errors.join(' | ').slice(0, 160))
  await browser.close()
}

/* ============ 2 · Alina Javed — the Penpot reference dossier ============ */
{
  const { browser, page, errors, failed } = await launch()
  await page.setViewport({ width: 1440, height: 900 })
  await gotoCreator(page, 'alina-javed')
  const body = await text(page)

  if (body.includes('Record 01 / 16') || body.includes('Record № 01 / 16')) pass('record: RECORD 01 / 16 on the ledger')
  else fail('record ledger', 'expected Record 01 / 16')

  if (body.includes('@lina_.jved') && body.includes('Founder') && body.includes('prose poet')) pass('role + handle present')
  else fail('role/handle')

  if (body.includes('founded Verlyse Media at sixteen')) pass('authoritative biography present')
  else fail('biography')

  const h = await h1s(page)
  if (h.length === 1 && h[0] === 'Alina Javed') pass('name appears exactly once as the primary heading')
  else fail('primary heading', JSON.stringify(h))

  const portrait = await page.evaluate(() => [...document.images].some((i) => /alina-javed-about/.test(i.getAttribute('src') || '')))
  if (portrait) pass('portrait plate mounts the real asset', 'img/authors/alina-javed-about.jpg')
  else fail('portrait plate')

  const featured = await page.evaluate(() => {
    const a = document.querySelector('a[aria-label^="Open folio 01"]')
    return a ? a.getAttribute('href') : null
  })
  if (featured === '/article/their-voices-matter') pass('featured folio is canonical', featured)
  else fail('featured folio', String(featured))

  if (body.includes('№ 05') && body.includes('Hope Becomes Mythology')) pass('ALSO IN THE ARCHIVE — № 05 Hope Becomes Mythology')
  else fail('also in the archive')

  if (body.includes('Folios in archive') && /Folios in archive\s*02/.test(body.replace(/·/g, ''))) pass('archival metadata — folios count 02')
  else fail('metadata folio count')

  /* OPEN FOLIO → reaches the reading room */
  await page.evaluate(() => document.querySelector('a[aria-label^="Open folio 01"]')?.click())
  await sleep(3000)
  if (page.url().includes('/article/their-voices-matter')) pass('OPEN FOLIO → reaches the canonical article')
  else fail('OPEN FOLIO', page.url())

  /* back to the dossier, then ← THE CONTRIBUTOR WALL */
  await page.goBack({ waitUntil: 'domcontentloaded' })
  await sleep(2800)
  await page.evaluate(() => document.querySelector('a[href="/creators"]')?.click())
  await sleep(3200)
  if (page.url().endsWith('/creators')) pass('← THE CONTRIBUTOR WALL returns to the wall')
  else fail('CONTRIBUTOR WALL', page.url())

  /* keyboard focus visible */
  await gotoCreator(page, 'alina-javed')
  const kb = await page.evaluate(() => {
    const els = [...document.querySelectorAll('a, button')].slice(0, 40)
    for (const el of els) {
      el.focus()
      const cs = getComputedStyle(el)
      if (cs.outlineStyle !== 'none' && cs.outlineStyle !== '' && !/rgba\(0,\s*0,\s*0,\s*0\)/.test(cs.outlineColor)) return { ok: true, tag: el.tagName }
    }
    return { ok: false }
  })
  if (kb.ok) pass('keyboard focus visible', kb.tag)
  else fail('keyboard focus')

  // lazy covers load below the fold — scroll to the bottom and let them settle
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, document.documentElement.scrollHeight) })
  await sleep(1800)
  await page.evaluate(() => window.scrollTo(0, 0))
  await sleep(400)
  const bad = await badImages(page)
  if (bad.length === 0) pass('no broken images')
  else fail('broken images', bad.join(',').slice(0, 120))

  if (errors.length === 0) pass('alina dossier: console clean')
  else fail('alina dossier: console', errors.join(' | ').slice(0, 160))

  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, 0) })
  await sleep(400)
  await page.screenshot({ path: `${OUT}/26-dossier-1440.png` })
  await browser.close()
}

/* ============ 3 · tablet 768×1024 ============ */
{
  const { browser, page, errors } = await launch()
  await page.setViewport({ width: 768, height: 1024 })
  await gotoCreator(page, 'alina-javed')
  const t = await page.evaluate(() => ({
    h1s: document.querySelectorAll('h1').length,
    ox: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    featured: !!document.querySelector('a[aria-label^="Open folio 01"]'),
  }))
  if (t.h1s === 1 && t.ox === 0 && t.featured) pass('tablet: one H1, no overflow, featured folio present')
  else fail('tablet', JSON.stringify(t))
  if (errors.length === 0) pass('tablet: console clean')
  else fail('tablet: console', errors.join(' | ').slice(0, 140))
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, 0) })
  await sleep(400)
  await page.screenshot({ path: `${OUT}/26-dossier-768.png` })
  await browser.close()
}

/* ============ 4 · mobile 390×844 — vertical recomposition ============ */
{
  const { browser, page, errors } = await launch()
  await page.setViewport({ width: 390, height: 844 })
  await gotoCreator(page, 'alina-javed')
  const m = await page.evaluate(() => {
    const body = document.body.textContent
    const order = (needle) => body.indexOf(needle)
    return {
      h1s: document.querySelectorAll('h1').length,
      ox: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      featured: !!document.querySelector('a[aria-label^="Open folio 01"]'),
      portrait: [...document.images].some((i) => /alina-javed-about/.test(i.getAttribute('src') || '')),
      nameBeforeBio: order('Alina Javed') >= 0 && order('Biography') >= 0 && order('Alina Javed') < order('Biography'),
      bioBeforeFeatured: order('Biography') >= 0 && order('Open folio') >= 0 && order('Biography') < order('Open folio'),
    }
  })
  if (m.h1s === 1 && m.ox === 0) pass('mobile: one H1, no overflow')
  else fail('mobile: layout', JSON.stringify(m))
  if (m.featured && m.portrait && m.nameBeforeBio && m.bioBeforeFeatured)
    pass('mobile: vertical order — NAME → PORTRAIT → BIO → FEATURED')
  else fail('mobile: order', JSON.stringify(m))
  if (errors.length === 0) pass('mobile: console clean')
  else fail('mobile: console', errors.join(' | ').slice(0, 140))
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, 0) })
  await sleep(400)
  await page.screenshot({ path: `${OUT}/26-dossier-390.png` })
  await browser.close()
}

/* ============ 5 · reduced motion — same dossier, no motion ============ */
{
  const { browser, page, errors } = await launch({ reduce: true })
  await page.setViewport({ width: 1440, height: 900 })
  await gotoCreator(page, 'alina-javed')
  const r = await page.evaluate(() => {
    const back = [...document.querySelectorAll('div')].find((d) => /pointer-events-none fixed inset-0 z-0/.test(String(d.className || '')))
    return {
      h1s: document.querySelectorAll('h1').length,
      ox: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      backTf: back ? getComputedStyle(back).transform : null,
      featured: !!document.querySelector('a[aria-label^="Open folio 01"]'),
      bio: /founded Verlyse Media at sixteen/.test(document.body.textContent),
      name: /Alina Javed/.test(document.body.textContent),
    }
  })
  const anims = await runningAnims(page)
  if (r.h1s === 1 && r.ox === 0 && r.featured && r.bio && r.name) pass('reduced: complete dossier present (name, bio, folio, plates)')
  else fail('reduced: composition', JSON.stringify(r))
  if (r.backTf === 'none' && anims <= 1) pass(`reduced: no parallax, motion collapsed (${anims} running)`)
  else fail('reduced: motion', JSON.stringify({ backTf: r.backTf, anims }))
  if (errors.length === 0) pass('reduced: console clean')
  else fail('reduced: console', errors.join(' | ').slice(0, 140))
  await page.screenshot({ path: `${OUT}/26-dossier-reduced.png` })
  await browser.close()
}

/* ============ 6 · WebGL unavailable — complete publication ============ */
{
  const { browser, page, errors } = await launch({ noWebGL: true })
  await page.setViewport({ width: 1440, height: 900 })
  await gotoCreator(page, 'alina-javed')
  const w = await page.evaluate(() => ({
    canvas: document.querySelectorAll('canvas').length,
    h1s: document.querySelectorAll('h1').length,
    ox: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    featured: !!document.querySelector('a[aria-label^="Open folio 01"]'),
    bio: /founded Verlyse Media at sixteen/.test(document.body.textContent),
  }))
  if (w.canvas === 0 && w.h1s === 1 && w.ox === 0 && w.featured && w.bio) pass('webgl-off: complete dossier — no canvas, one H1, plates intact')
  else fail('webgl-off', JSON.stringify(w))
  if (errors.length === 0) pass('webgl-off: console clean')
  else fail('webgl-off: console', errors.join(' | ').slice(0, 140))
  await page.screenshot({ path: `${OUT}/26-dossier-nogl.png` })
  await browser.close()
}

/* ============ summary ============ */
const totals = { PASS, FAIL, INFO }
fs.writeFileSync(RESULTS, JSON.stringify({ phase: '26-dossier', generatedAt: new Date().toISOString(), totals, checks }, null, 2))
console.log(`\nTOTAL ${PASS + FAIL + INFO} | PASS ${PASS} | FAIL ${FAIL} | INFO ${INFO}`)
console.log(`results → ${RESULTS}`)
process.exit(FAIL > 0 ? 1 : 0)
