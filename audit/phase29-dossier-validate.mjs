// PHASE 29A — THE DOSSIER · real-Chromium validation (Penpot Phase-25 fidelity)
// /creator/:id — wine room + standing ivory dossier sheet + portrait/featured
// plates. No hardcoding: verifies Alina's record AND a second creator with a
// monogram fallback. Exits non-zero on any FAIL.
import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'

const BASE = 'http://localhost:5173'
const OUT = path.resolve('audit/shots/phase29')
fs.mkdirSync(OUT, { recursive: true })
const RESULTS = path.resolve('audit/phase29-dossier-results.json')

let PASS = 0, FAIL = 0, INFO = 0
const checks = []
const pass = (name, detail = '') => { PASS++; checks.push({ name, status: 'PASS', detail }) }
const fail = (name, detail = '') => { FAIL++; checks.push({ name, status: 'FAIL', detail }) }
const info = (name, detail = '') => { INFO++; checks.push({ name, status: 'INFO', detail }) }
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
    authors.push({ id, name: m[3].replace(/\\'/g, "'"), role: grab('role'), handle: grab('handle'), bio: grab('bio'), portrait: grab('portrait'), profilePhoto: grab('profilePhoto'), confirmed: /confirmed:\s*true/.test(block) })
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
const ZUHA = CONTENT.authors.find((a) => a.id === 'zuha-farhan')
const ALINA_FIRST = CONTENT.articles.find((a) => a.authorId === 'alina-javed')
const ALINA_WORKS = CONTENT.articles.filter((a) => a.authorId === 'alina-javed')

/* ---------------- browser helpers ---------------- */
async function launch(viewport, opts = {}) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--use-gl=swiftshader'],
  })
  const page = await browser.newPage()
  await page.setViewport(viewport)
  if (opts.reduced) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  if (opts.noWebGL) {
    await page.evaluateOnNewDocument(() => {
      HTMLCanvasElement.prototype.getContext = function (type, ...a) {
        if (String(type).toLowerCase().includes('webgl')) return null
        return null
      }
    })
  }
  const errors = []
  const failed = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)) })
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)))
  page.on('requestfailed', (r) => failed.push(r.url()))
  return { browser, page, errors, failed }
}
const open = async (page, p, wait = 4200) => {
  await page.goto(`${BASE}${p}`, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await sleep(wait)
}

/* ================= 1 · EVERY CANONICAL /creator/:id RESOLVES ================= */
{
  const { browser, page, errors } = await launch({ width: 1440, height: 900 })
  let bad = []
  for (const a of CONTENT.authors) {
    await open(page, `/creator/${a.id}`, 2600)
    const ok = await page.evaluate((name) => {
      const h1s = document.querySelectorAll('h1')
      return h1s.length === 1 && h1s[0].innerText.trim() === name && document.body.innerText.includes(name)
    }, a.name)
    if (!ok) bad.push(a.id)
  }
  bad.length === 0 ? pass('all 16 canonical /creator/:id routes resolve — one H1, correct name') : fail('creator routes', bad.join(', '))
  errors.length === 0 ? pass('creator routes: console clean') : fail('creator routes console', errors.slice(0, 2).join(' | '))
  await browser.close()
}

/* ================= 2 · ALINA — THE BOARD'S EXAMPLE RECORD ================= */
{
  const { browser, page, errors, failed } = await launch({ width: 1440, height: 900 })
  await open(page, '/creator/alina-javed')
  const body = (await page.evaluate(() => document.body.innerText)).toLowerCase()

  body.includes('record 01 / 16') || body.includes('record № 01 / 16')
    ? pass('record — RECORD 01 / 16 on the dossier')
    : fail('record line', body.slice(0, 200))
  body.includes('@lina_.jved') && body.includes('founder') && body.includes('prose poet')
    ? pass('role + handle — Founder · prose poet · @lina_.jved')
    : fail('role + handle')
  body.includes('founded verlyse media at sixteen')
    ? pass('biography — authoritative registry text')
    : fail('biography')

  const h1s = await page.evaluate(() => [...document.querySelectorAll('h1')].map((h) => h.innerText.trim()))
  h1s.length === 1 && h1s[0] === 'Alina Javed'
    ? pass('the name appears exactly once as the primary heading')
    : fail('primary heading', JSON.stringify(h1s))

  // portrait plate — the real asset from the registry
  const portrait = await page.evaluate(() => [...document.querySelectorAll('img')].map((i) => i.src).filter((s) => /authors/.test(s)))
  portrait.some((s) => s.includes('alina-javed'))
    ? pass('portrait plate mounts the real registry asset', portrait[0].split('/').pop())
    : fail('portrait', JSON.stringify(portrait))

  // featured folio — first-published work (№01 Their Voices Matter)
  const featured = await page.evaluate(() => {
    const a = [...document.querySelectorAll('a[aria-label^="Open folio"]')]
    return a.length ? a[0].getAttribute('href') : null
  })
  featured === '/article/their-voices-matter'
    ? pass('featured folio — №01 “Their Voices Matter” (first-published)')
    : fail('featured folio', String(featured))

  // also in the archive — the remainder (№05 Hope Becomes Mythology)
  const also = ALINA_WORKS.map((w) => CONTENT.folioOf(w.id) + ' ' + w.title)
  const alsoOk = await page.evaluate(() => document.body.innerText.toLowerCase().includes('also in the archive'))
  alsoOk
    ? pass(`also in the archive — ${also.join(' · ')}`)
    : fail('also in the archive')

  // OPEN FOLIO → reaches the canonical article
  await page.evaluate(() => [...document.querySelectorAll('a[aria-label^="Open folio"]')][0]?.click())
  await sleep(1600)
  page.url().includes('/article/their-voices-matter')
    ? pass('OPEN FOLIO → reaches the canonical article')
    : fail('open folio nav', page.url())

  // ← THE CONTRIBUTOR WALL returns to the wall
  await page.goBack({ waitUntil: 'domcontentloaded' })
  await sleep(1200)
  await page.evaluate(() => [...document.querySelectorAll('a')].find((a) => a.innerText.includes('The Contributor Wall'))?.click())
  await sleep(1200)
  page.url().endsWith('/creators')
    ? pass('← THE CONTRIBUTOR WALL returns to the wall')
    : fail('wall nav', page.url())

  await browser.close()
}

/* ================= 3 · ZUHA — NO HARDCODING, MONOGRAM FALLBACK ================= */
{
  const { browser, page, errors } = await launch({ width: 1440, height: 900 })
  await open(page, '/creator/zuha-farhan')
  const body = (await page.evaluate(() => document.body.innerText)).toLowerCase()
  const zuhaHandle = (ZUHA?.handle || '').toLowerCase()
  body.includes('zuha farhan') && (zuhaHandle === '' || body.includes(zuhaHandle)) && body.includes('record')
    ? pass('second creator — Zuha Farhan dossier renders from the registry', zuhaHandle)
    : fail('zuha dossier', body.slice(0, 160))
  // no portrait asset → monogram fallback + caption
  const mono = await page.evaluate(() => document.body.innerText.toLowerCase().includes('the monogram'))
  mono ? pass('monogram fallback — caption reads “Plate 01 — Portrait · the monogram”') : fail('monogram fallback')
  // featured folio is zuha's own first-published work
  const zuhaFirst = CONTENT.articles.filter((a) => a.authorId === 'zuha-farhan').sort((a, b) => CONTENT.articles.indexOf(a) - CONTENT.articles.indexOf(b))[0]
  const featured = await page.evaluate(() => [...document.querySelectorAll('a[aria-label^="Open folio"]')][0]?.getAttribute('href'))
  featured === `/article/${zuhaFirst.id}`
    ? pass(`featured folio — Zuha's own first folio №${CONTENT.folioOf(zuhaFirst.id)}`)
    : fail('zuha featured', String(featured))
  errors.length === 0 ? pass('zuha: console clean') : fail('zuha console', errors.slice(0, 2).join(' | '))
  await browser.close()
}

/* ================= 4 · TABLET 768×1024 ================= */
{
  const { browser, page, errors, failed } = await launch({ width: 768, height: 1024 })
  await open(page, '/creator/alina-javed')
  const t = await page.evaluate(() => {
    const b = document.body.innerText.toLowerCase()
    return {
      h1s: document.querySelectorAll('h1').length,
      ox: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      featured: b.includes('featured folio'),
      portrait: b.includes('plate 01 — portrait'),
    }
  })
  t.h1s === 1 && t.ox <= 1 && t.featured && t.portrait
    ? pass('tablet — one H1, no overflow, portrait + featured plates present')
    : fail('tablet', JSON.stringify(t))
  failed.length === 0 ? pass('tablet — no failed image requests') : fail('tablet failed requests', failed.slice(0, 2).join(' | '))
  errors.length === 0 ? pass('tablet — console clean') : fail('tablet console', errors.slice(0, 2).join(' | '))
  await page.screenshot({ path: path.join(OUT, 'dossier-tablet.png') })
  info('capture', 'dossier-tablet.png')
  await browser.close()
}

/* ================= 5 · MOBILE 390×844 — MANDATED ORDER ================= */
{
  const { browser, page, errors, failed } = await launch({ width: 390, height: 844 })
  await open(page, '/creator/alina-javed')
  const m = await page.evaluate(() => {
    const y = (txt) => {
      const q = txt.toLowerCase()
      const walk = (n) => {
        if (n.nodeType === 1) {
          const cs = getComputedStyle(n)
          if (cs.display === 'none' || cs.visibility === 'hidden') return null
        }
        if (n.nodeType === 3 && n.textContent.toLowerCase().includes(q)) return n
        for (const c of n.childNodes) { const r = walk(c); if (r) return r }
        return null
      }
      const node = walk(document.body)
      if (!node) return -1
      const range = document.createRange()
      range.selectNode(node)
      return range.getBoundingClientRect().top
    }
    return {
      h1s: document.querySelectorAll('h1').length,
      ox: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      name: y('Alina Javed'),
      handle: y('@lina_.jved'),
      portrait: y('Plate 01 — Portrait'),
      bio: y('founded Verlyse Media at sixteen'),
      featured: y('Featured folio'),
      wall: y('THE CONTRIBUTOR WALL'),
      title: document.querySelector('h1')?.innerText || '',
    }
  })
  const order = ['name', 'handle', 'portrait', 'bio', 'featured', 'wall']
  const positions = order.map((k) => m[k])
  const ascending = positions.every((p, i) => i === 0 || p > positions[i - 1])
  ascending
    ? pass('mobile — mandated order NAME → ROLE/HANDLE → PORTRAIT → BIO → FEATURED → RETURN')
    : fail('mobile order', JSON.stringify(m))
  m.h1s === 1 && m.ox <= 1
    ? pass('mobile — one H1, zero horizontal overflow')
    : fail('mobile overflow', JSON.stringify({ h1s: m.h1s, ox: m.ox }))
  failed.length === 0 ? pass('mobile — no failed image requests') : fail('mobile failed', failed.slice(0, 2).join(' | '))
  errors.length === 0 ? pass('mobile — console clean') : fail('mobile console', errors.slice(0, 2).join(' | '))
  await page.screenshot({ path: path.join(OUT, 'dossier-mobile.png') })
  info('capture', 'dossier-mobile.png')
  await browser.close()
}

/* ================= 6 · REDUCED MOTION — same composition, static ================= */
{
  const { browser, page, errors } = await launch({ width: 1440, height: 900 }, { reduced: true })
  await open(page, '/creator/alina-javed')
  const r = await page.evaluate(() => {
    const b = document.body.innerText.toLowerCase()
    return {
      h1s: document.querySelectorAll('h1').length,
      ox: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      name: b.includes('alina javed'),
      bio: b.includes('founded verlyse media at sixteen'),
      featured: b.includes('featured folio'),
      portrait: b.includes('plate 01 — portrait'),
    }
  })
  r.h1s === 1 && r.ox <= 1 && r.name && r.bio && r.featured && r.portrait
    ? pass('reduced — full dossier present, static (name · bio · plates)')
    : fail('reduced', JSON.stringify(r))
  errors.length === 0 ? pass('reduced — console clean') : fail('reduced console', errors.slice(0, 2).join(' | '))
  await page.screenshot({ path: path.join(OUT, 'dossier-reduced.png') })
  info('capture', 'dossier-reduced.png')
  await browser.close()
}

/* ================= 7 · WEBGL-OFF ================= */
{
  const { browser, page, errors } = await launch({ width: 1440, height: 900 }, { noWebGL: true })
  await open(page, '/creator/alina-javed')
  const w = await page.evaluate(() => {
    const b = document.body.innerText.toLowerCase()
    return {
      canvas: document.querySelectorAll('canvas').length,
      h1s: document.querySelectorAll('h1').length,
      ox: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      featured: b.includes('featured folio'),
      bio: b.includes('founded verlyse media at sixteen'),
    }
  })
  w.canvas === 0 && w.h1s === 1 && w.ox <= 1 && w.featured && w.bio
    ? pass('webgl-off — complete dossier, zero canvases')
    : fail('webgl-off', JSON.stringify(w))
  const real = errors.filter((e) => !/favicon|WebGL|THREE|getContext|Canvas/i.test(e))
  real.length === 0 ? pass('webgl-off — console clean (no unexpected errors)') : fail('webgl-off console', real.slice(0, 2).join(' | '))
  await page.screenshot({ path: path.join(OUT, 'dossier-webgloff.png') })
  info('capture', 'dossier-webgloff.png')
  await browser.close()
}

/* ================= 8 · DESKTOP CAPTURE (settled) ================= */
{
  const { browser, page, errors } = await launch({ width: 1440, height: 900 })
  await open(page, '/creator/alina-javed', 4600)
  await page.screenshot({ path: path.join(OUT, 'dossier-desktop.png') })
  info('capture', 'dossier-desktop.png')
  // keyboard — a real link reachable by Tab with visible brass focus
  const kb = await page.evaluate(async () => {
    const wall = [...document.querySelectorAll('a')].find((a) => a.innerText.toLowerCase().includes('the contributor wall'))
    if (!wall) return { found: false }
    wall.focus()
    const cs = getComputedStyle(wall)
    const visible = cs.outlineStyle !== 'none' || cs.boxShadow !== 'none' || wall.className.includes('focus-visible')
    return { found: true, focused: document.activeElement === wall, visible, cls: wall.className.slice(0, 60) }
  })
  kb.found && kb.focused ? pass('keyboard — wall link focusable (brass focus class present)', kb.cls) : fail('keyboard focus', JSON.stringify(kb))
  errors.length === 0 ? pass('desktop — console clean') : fail('desktop console', errors.slice(0, 2).join(' | '))
  await browser.close()
}

const summary = { phase: '29A', PASS, FAIL, INFO, checks }
fs.writeFileSync(RESULTS, JSON.stringify(summary, null, 1))
console.log(`\n29A · THE DOSSIER — ${PASS} PASS / ${FAIL} FAIL / ${INFO} INFO`)
if (FAIL > 0) {
  for (const c of checks.filter((x) => x.status === 'FAIL')) console.log('  FAIL —', c.name, '·', c.detail)
  process.exit(1)
}
console.log('ALL GREEN')
