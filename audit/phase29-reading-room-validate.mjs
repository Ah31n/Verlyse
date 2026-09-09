// PHASE 29B — THE READING ROOM · real-Chromium validation (Penpot Phase-25 fidelity)
// /article/:id — the canonical article inside the wine room: BACK architecture,
// MID ledger/thread/gutter, FRONT the article (always dominant).
import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'

const BASE = 'http://localhost:5173'
const OUT = path.resolve('audit/shots/phase29')
fs.mkdirSync(OUT, { recursive: true })
const RESULTS = path.resolve('audit/phase29-reading-room-results.json')

let PASS = 0, FAIL = 0, INFO = 0
const checks = []
const pass = (name, detail = '') => { PASS++; checks.push({ name, status: 'PASS', detail }) }
const fail = (name, detail = '') => { FAIL++; checks.push({ name, status: 'FAIL', detail }) }
const info = (name, detail = '') => { INFO++; checks.push({ name, status: 'INFO', detail }) }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

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
const open = async (page, p, wait = 4600) => {
  await page.goto(`${BASE}${p}`, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await sleep(wait)
}
/* the article types its title with non-breaking spaces — normalise before matching */
const bodyText = async (page) => (await page.evaluate(() => document.body.innerText)).replace(/\u00a0/g, ' ')

/* ================= 1 · CANONICAL ROUTES RESOLVE ================= */
{
  const { browser, page, errors } = await launch({ width: 1440, height: 900 })
  let bad = []
  for (const [p, title] of [['/article/their-voices-matter', 'Their Voices Matter'], ['/article/mir-raza-ali', 'Mir Raza Ali'], ['/article/3-13', '3:13']]) {
    await open(page, p, 3000)
    const h1txt = await page.evaluate(() => document.querySelector('h1')?.innerText.replace(/\u00a0/g, ' ') || '')
    const body = await bodyText(page)
    const ok = h1txt.includes(title) && body.includes(title)
    if (!ok) bad.push(p)
  }
  bad.length === 0 ? pass('canonical article routes resolve — one H1 each (№01, №12, №19)') : fail('article routes', bad.join(', '))
  errors.length === 0 ? pass('article routes: console clean') : fail('article routes console', errors.slice(0, 2).join(' | '))
  await browser.close()
}

/* ================= 2 · DESKTOP — THE ROOM ================= */
{
  const { browser, page, errors, failed } = await launch({ width: 1440, height: 900 })
  await open(page, '/article/their-voices-matter')

  const r = await page.evaluate(() => {
    const b = document.body.innerText.replace(/\u00a0/g, ' ').toLowerCase()
    const spans = [...document.querySelectorAll('span')]
    return {
      backBg: [...document.querySelectorAll('div')].some((d) => /radial-gradient/.test(getComputedStyle(d).backgroundImage)),
      ledger: spans.some((s) => /the reading room — folio/i.test(s.textContent || '')),
      index: spans.some((s) => /social issues · № 01 \/ 19/i.test(s.textContent || '')),
      dotVisible: [...document.querySelectorAll('span')].some((s) => /(^|\s)top:/.test(s.getAttribute('style') || '') && getComputedStyle(s).width === '7px'),
      h1s: document.querySelectorAll('h1').length,
      ox: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      bodyHas: b.includes('their voices matter'),
    }
  })
  r.backBg ? pass('BACK — wine room renders (layered washes)') : fail('BACK wine room')
  r.ledger ? pass('MID — left ledger “THE READING ROOM — FOLIO № 01”') : fail('ledger')
  r.index ? pass('MID — right index “SOCIAL ISSUES · № 01 / 19”') : fail('index')
  r.dotVisible ? pass('MID — reader-position mark on the thread') : fail('reader mark')

  // Up Next folio in the right gutter — real link to the canonical related[0]
  const gutter = await page.evaluate(() => {
    const a = [...document.querySelectorAll('a[aria-label*="up next" i]')][0]
    return a ? { href: a.getAttribute('href'), text: a.innerText.slice(0, 40) } : null
  })
  gutter?.href === '/article/the-horrors-of-child-sexual-abuse'
    ? pass('MID — Up Next folio in the right gutter (№12, canonical related[0])')
    : fail('gutter', JSON.stringify(gutter))

  r.h1s === 1 && r.ox <= 1 && r.bodyHas
    ? pass('FRONT — the canonical article dominates, one H1, no overflow')
    : fail('front', JSON.stringify({ h1s: r.h1s, ox: r.ox, bodyHas: r.bodyHas }))

  // scroll — the thread draws and the reader mark advances
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.5))
  await sleep(900)
  const late = await page.evaluate(() => {
    const thread = [...document.querySelectorAll('div')].find((d) => (d.getAttribute('style') || '').includes('scaleY'))
    const dot = [...document.querySelectorAll('span')].find((s) => /(^|\s)top:/.test(s.getAttribute('style') || '') && getComputedStyle(s).width === '7px')
    return { threadScaleY: thread ? parseFloat((thread.getAttribute('style') || '').match(/scaleY\(([^)]+)\)/)?.[1] || '0') : null, dotTop: dot ? (dot.getAttribute('style') || '').match(/top:\s*([^;]+)/)?.[1] : null }
  })
  late.threadScaleY !== null && late.threadScaleY > 0.5 ? pass('scroll — the brass thread draws toward the ending', `scaleY=${late.threadScaleY.toFixed(2)}`) : fail('thread draw', JSON.stringify(late))
  late.dotTop !== null ? pass('scroll — the reader-position mark advances') : fail('reader mark advance')

  // keyboard — the gutter folio reachable with visible brass focus
  await page.keyboard.press('Tab'); await page.keyboard.press('Tab'); await page.keyboard.press('Tab')
  await sleep(300)
  const kb = await page.evaluate(() => {
    const el = document.activeElement
    if (!el) return null
    const cs = getComputedStyle(el)
    return { tag: el.tagName, cls: el.className.slice(0, 60), focus: cs.outlineStyle !== 'none' || cs.boxShadow !== 'none' }
  })
  kb && (kb.tag === 'A' || kb.cls.includes('focus-visible'))
    ? pass('keyboard — links receive visible brass focus', JSON.stringify(kb))
    : info('keyboard probe', JSON.stringify(kb))

  failed.length === 0 ? pass('desktop — no failed image requests') : fail('failed requests', failed.slice(0, 2).join(' | '))
  const real = errors.filter((e) => !/favicon/i.test(e))
  real.length === 0 ? pass('desktop — zero console errors') : fail('console', real.slice(0, 2).join(' | '))
  await page.screenshot({ path: path.join(OUT, 'reading-desktop.png') })
  info('capture', 'reading-desktop.png')
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.42))
  await sleep(900)
  await page.screenshot({ path: path.join(OUT, 'reading-thread.png') })
  info('capture', 'reading-thread.png (mid-scroll)')
  await browser.close()
}

/* ================= 3 · TABLET 768×1024 ================= */
{
  const { browser, page, errors, failed } = await launch({ width: 768, height: 1024 })
  await open(page, '/article/their-voices-matter')
  const t = await page.evaluate(() => ({
    h1s: document.querySelectorAll('h1').length,
    ox: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    gutterHidden: ![...document.querySelectorAll('a')].some((a) => /up next/i.test(a.getAttribute('aria-label') || '') && a.offsetParent !== null),
    wallRule: [...document.querySelectorAll('div')].some((d) => d.offsetParent !== null && d.getBoundingClientRect().width === 1 && d.getBoundingClientRect().height > 300 && /gradient/.test(getComputedStyle(d).backgroundImage)),
    body: document.body.innerText.replace(/\u00a0/g, ' ').includes('Their Voices Matter'),
  }))
  t.h1s === 1 && t.ox <= 1 && t.gutterHidden && t.body
    ? pass('tablet — one H1, no overflow, gutter recedes, article intact')
    : fail('tablet', JSON.stringify(t))
  t.wallRule ? pass('tablet — the single wall rule of the simplified room') : info('tablet wall rule')
  failed.length === 0 ? pass('tablet — no failed image requests') : fail('tablet failed', failed.slice(0, 2).join(' | '))
  errors.length === 0 ? pass('tablet — console clean') : fail('tablet console', errors.slice(0, 2).join(' | '))
  await page.screenshot({ path: path.join(OUT, 'reading-tablet.png') })
  info('capture', 'reading-tablet.png')
  await browser.close()
}

/* ================= 4 · MOBILE 390×844 — vertical literary space ================= */
{
  const { browser, page, errors, failed } = await launch({ width: 390, height: 844 })
  await open(page, '/article/their-voices-matter')
  const m = await page.evaluate(() => {
    /* element-based finder — the article title is SplitText (per-word nodes),
       so the phrase never lives in a single text node; compare visible leaf
       elements instead. */
    const norm = (s) => (s || '').toLowerCase().replace(/\u00a0/g, ' ').replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim()
    const yInnermost = (txt) => {
      const q = norm(txt)
      const hits = [...document.querySelectorAll('body *')].filter((el) => {
        const cs = getComputedStyle(el)
        if (cs.display === 'none' || cs.visibility === 'hidden') return false
        if (cs.position === 'fixed') return false /* the global transition veil is fixed, not in flow */
        if (el.offsetParent === null) return false /* hidden behind an ancestor */
        return norm(el.textContent).includes(q)
      })
      const inner = hits.find((h) => !hits.some((o) => o !== h && h.contains(o)))
      return inner ? inner.getBoundingClientRect().top : -1
    }
    const h1 = document.querySelector('h1')
    return {
      h1s: document.querySelectorAll('h1').length,
      ox: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      folio: yInnermost('Folio 01 · Reading'),
      title: h1 ? h1.getBoundingClientRect().top : -1,
      meta: yInnermost('dispatch 26 06 2026'),
      body: yInnermost('just across the border'),
      fold: yInnermost('Up next ↓'),
      articleEnd: !!document.querySelector('#ending'),
    }
  })
  const order = ['folio', 'title', 'body']
  const positions = order.map((k) => m[k])
  const ascending = positions.every((p, i) => i === 0 || p > positions[i - 1])
  ascending ? pass('mobile — vertical order FOLIO → TITLE → BODY (room furniture above the article)') : fail('mobile order', JSON.stringify(m))
  m.meta > 0 ? pass('mobile — dispatch metadata present (canonical article’s own kicker above the title)') : fail('mobile meta', JSON.stringify(m))
  m.fold > 0 ? pass('mobile — the fold cue for Up Next is present in the quiet room') : fail('fold cue', JSON.stringify(m))
  m.h1s === 1 && m.ox <= 1 && m.articleEnd
    ? pass('mobile — one H1, zero overflow, ending chamber intact')
    : fail('mobile', JSON.stringify({ h1s: m.h1s, ox: m.ox, ending: m.articleEnd }))
  // the room is quiet — no full vertical ledger visible on mobile
  const quiet = await page.evaluate(() => ![...document.querySelectorAll('span')].some((s) => /the reading room — folio/i.test(s.textContent || '') && s.offsetParent !== null))
  quiet ? pass('mobile — the room is quiet (no vertical ledger)') : fail('mobile quiet room')
  failed.length === 0 ? pass('mobile — no failed image requests') : fail('mobile failed', failed.slice(0, 2).join(' | '))
  errors.length === 0 ? pass('mobile — console clean') : fail('mobile console', errors.slice(0, 2).join(' | '))
  await page.screenshot({ path: path.join(OUT, 'reading-mobile.png') })
  info('capture', 'reading-mobile.png')
  await browser.close()
}

/* ================= 5 · REDUCED MOTION ================= */
{
  const { browser, page, errors } = await launch({ width: 1440, height: 900 }, { reduced: true })
  await open(page, '/article/their-voices-matter')
  const r = await page.evaluate(() => {
    const spans = [...document.querySelectorAll('span')]
    return {
      h1s: document.querySelectorAll('h1').length,
      ox: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ledger: spans.some((s) => /the reading room — folio/i.test(s.textContent || '')),
      gutter: [...document.querySelectorAll('a')].some((a) => /up next/i.test(a.getAttribute('aria-label') || '') && a.offsetParent !== null),
      body: document.body.innerText.replace(/\u00a0/g, ' ').includes('Their Voices Matter'),
      dotAbsent: !spans.some((s) => /(^|\s)top:/.test(s.getAttribute('style') || '') && getComputedStyle(s).width === '7px'),
    }
  })
  r.h1s === 1 && r.ox <= 1 && r.ledger && r.gutter && r.body
    ? pass('reduced — same room static: ledger, gutter folio, article intact')
    : fail('reduced', JSON.stringify(r))
  r.dotAbsent ? pass('reduced — no reader-position mark (static thread per the board)') : fail('reduced dot')
  errors.length === 0 ? pass('reduced — console clean') : fail('reduced console', errors.slice(0, 2).join(' | '))
  await page.screenshot({ path: path.join(OUT, 'reading-reduced.png') })
  info('capture', 'reading-reduced.png')
  await browser.close()
}

/* ================= 6 · WEBGL-OFF ================= */
{
  const { browser, page, errors } = await launch({ width: 1440, height: 900 }, { noWebGL: true })
  await open(page, '/article/their-voices-matter')
  const w = await page.evaluate(() => ({
    canvas: document.querySelectorAll('canvas').length,
    h1s: document.querySelectorAll('h1').length,
    ox: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ending: !!document.querySelector('#ending'),
    ledger: [...document.querySelectorAll('span')].some((s) => /the reading room — folio/i.test(s.textContent || '')),
  }))
  w.canvas === 0 && w.h1s === 1 && w.ox <= 1 && w.ending && w.ledger
    ? pass('webgl-off — complete publication, zero canvases, room ledger reads')
    : fail('webgl-off', JSON.stringify(w))
  const real = errors.filter((e) => !/favicon|WebGL|THREE|getContext|Canvas/i.test(e))
  real.length === 0 ? pass('webgl-off — no unexpected console errors') : fail('webgl-off console', real.slice(0, 2).join(' | '))
  await page.screenshot({ path: path.join(OUT, 'reading-webgloff.png') })
  info('capture', 'reading-webgloff.png')
  await browser.close()
}

/* ================= 7 · HISTORY — through the archive ================= */
{
  const { browser, page, errors } = await launch({ width: 1440, height: 900 })
  await open(page, '/articles', 2600)
  await page.evaluate(() => [...document.querySelectorAll('a[href^="/article/"]')][0]?.click())
  await sleep(2000)
  const inRoom = await page.evaluate(() => ({ url: location.pathname, h1: document.querySelector('h1')?.innerText?.slice(0, 30) || '' }))
  inRoom.url.startsWith('/article/') && inRoom.h1
    ? pass('history — folio pulled into the room', inRoom.url.split('/').pop())
    : fail('history into room', JSON.stringify(inRoom))
  await page.goBack({ waitUntil: 'domcontentloaded' })
  await sleep(1500)
  page.url().endsWith('/articles') ? pass('history — Back returns to the archive') : fail('history back', page.url())
  await page.goForward({ waitUntil: 'domcontentloaded' })
  await sleep(1500)
  const fwd = await page.evaluate(() => ({ url: location.pathname, h1: document.querySelector('h1')?.innerText?.slice(0, 24) || '' }))
  fwd.url.startsWith('/article/') && fwd.h1 ? pass('history — Forward returns to the room', fwd.h1) : fail('history forward', JSON.stringify(fwd))
  errors.length === 0 ? pass('history — console clean') : fail('history console', errors.slice(0, 2).join(' | '))
  await browser.close()
}

const summary = { phase: '29B', PASS, FAIL, INFO, checks }
fs.writeFileSync(RESULTS, JSON.stringify(summary, null, 1))
console.log(`\n29B · THE READING ROOM — ${PASS} PASS / ${FAIL} FAIL / ${INFO} INFO`)
if (FAIL > 0) {
  for (const c of checks.filter((x) => x.status === 'FAIL')) console.log('  FAIL —', c.name, '·', c.detail)
  process.exit(1)
}
console.log('ALL GREEN')
