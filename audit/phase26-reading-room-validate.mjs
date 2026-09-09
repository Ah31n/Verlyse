// PHASE 26 — THE READING ROOM · real-Chromium validation (Penpot Phase-25 fidelity)
// /article/:id — wine room around the canonical article, with ledger, index,
// registration ticks, thread + reader mark, and the Up Next folio in the gutter.
// Exits non-zero on any FAIL.
import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'

const BASE = 'http://localhost:5173'
const OUT = path.resolve('audit/shots')
const RESULTS = path.resolve('audit/phase26-reading-room-results.json')
const TARGETS = ['their-voices-matter', 'hope-becomes-mythology', 'mir-raza-ali'] // №01 №05 №19

let PASS = 0, FAIL = 0, INFO = 0
const checks = []
const pass = (name, detail = '') => { PASS++; checks.push({ name, status: 'PASS', detail }) }
const fail = (name, detail = '') => { FAIL++; checks.push({ name, status: 'FAIL', detail }) }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/* ---------------- content.ts parser (authoritative) ---------------- */
function parseContent() {
  const src = fs.readFileSync('src/data/content.ts', 'utf8')
  const articles = []
  const re = /id: '([a-z0-9-]+)',\s*\n\s*title:\s*(["'])((?:[^\\]|\\.)*?)\2,\s*\n\s*authorId: '([a-z0-9-]+)',\s*\n\s*category:\s*(["'])((?:[^\\]|\\.)*?)\5/g
  let m
  while ((m = re.exec(src))) articles.push({ id: m[1], title: m[3].replace(/\\'/g, "'"), authorId: m[4], category: m[6].replace(/\\'/g, "'"), body: [] })
  for (const a of articles) {
    const i = src.indexOf(`id: '${a.id}'`)
    const j = src.indexOf('\n  },', i)
    const block = src.slice(i, j < 0 ? src.length : j)
    const bm = block.match(/body:\s*\[([\s\S]*?)\]\s*,/)
    if (bm) a.body = [...bm[1].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((x) => x[1]).filter((p) => p.length > 1)
  }
  const authors = {}
  const are = /id: '([a-z0-9-]+)',\s*\n\s*name:\s*(["'])((?:[^\\]|\\.)*?)\2/g
  while ((m = are.exec(src))) authors[m[1]] = m[3].replace(/\\'/g, "'")
  const folioOf = (id) => {
    const i = articles.findIndex((a) => a.id === id)
    return i >= 0 ? String(i + 1).padStart(2, '0') : '—'
  }
  return { articles, authors, folioOf }
}
const CONTENT = parseContent()

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
const pageText = (page) => page.evaluate(() => document.body.textContent.replace(/\s+/g, ' '))
const runningAnims = (page) => page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length)

async function gotoArticle(page, id) {
  await page.goto(`${BASE}/article/${id}`, { waitUntil: 'domcontentloaded', timeout: 35000 })
  await sleep(4500)
}

console.log('=== PHASE 26 — READING ROOM INSPECTION ===')

/* ============ 1 · the three canonical folios, desktop 1440×900 ============ */
{
  const { browser, page, errors, failed } = await launch()
  await page.setViewport({ width: 1440, height: 900 })
  for (const id of TARGETS) {
    const article = CONTENT.articles.find((a) => a.id === id)
    const folio = CONTENT.folioOf(id)
    const authorName = article ? CONTENT.authors[article.authorId] : undefined
    await gotoArticle(page, id)

    if (page.url().endsWith(`/article/${id}`)) pass(`${id}: canonical route resolves`)
    else fail(`${id}: canonical route`, page.url())

    const title = await page.title()
    if (/Verlyse Media/i.test(title)) pass(`${id}: title carries Verlyse Media`)
    else fail(`${id}: title`, title)

    const h1 = await page.evaluate(() => document.querySelectorAll('h1').length)
    if (h1 === 1) pass(`${id}: exactly one H1`)
    else fail(`${id}: H1`, String(h1))

    const body = await pageText(page)
    if (body.includes(`THE READING ROOM — FOLIO № ${folio}`)) pass(`${id}: ledger — THE READING ROOM — FOLIO № ${folio}`)
    else fail(`${id}: ledger`, `expected FOLIO № ${folio}`)
    if (body.includes(`${article.category.toUpperCase()} · № ${folio} / 19`)) pass(`${id}: index — ${article.category.toUpperCase()} · № ${folio} / 19`)
    else fail(`${id}: index`)

    const ghost = await page.evaluate((f) => [...document.querySelectorAll('span')].some((s) => /^№\s*F$/.test(s.textContent || '')), folio)
    const ghost2 = await page.evaluate((f) => [...document.querySelectorAll('span')].some((s) => s.textContent?.trim() === `№ ${f}`), folio)
    if (ghost2) pass(`${id}: ghost folio № ${folio} behind the column`)
    else fail(`${id}: ghost folio`)

    if (authorName && body.includes(authorName)) pass(`${id}: creator credited`, authorName)
    else fail(`${id}: creator`, String(authorName))

    /* body intact, no duplication (whitespace-flattened) */
    const flat = body.replace(/\s+/g, '')
    const present = article.body.filter((p) => !p.startsWith('NEWS UPDATE')).every((p) => flat.includes(p.replace(/\s+/g, '')))
    const pair = (article.body[0] + article.body[1]).replace(/\s+/g, '')
    const pairCount = flat.split(pair).length - 1
    if (present && pairCount === 1) pass(`${id}: body intact, no duplication (${article.body.length} paras)`)
    else fail(`${id}: body`, `all=${present} pair=${pairCount}`)

    const img = await page.evaluate(() => {
      const imgs = [...document.querySelectorAll('img')]
      return imgs.length >= 2 && imgs[0]?.complete && imgs[0]?.naturalWidth > 0
    })
    if (img) pass(`${id}: images intact`)
    else fail(`${id}: images`)

    const ending = await page.evaluate(() => {
      const el = document.getElementById('ending')
      return el ? el.innerText.length > 80 : false
    })
    if (ending) pass(`${id}: ending chamber intact`)
    else fail(`${id}: ending`)

    /* Up Next — canonical related section + the room's gutter plate */
    const upNext = await page.evaluate((cur) => {
      const links = [...document.querySelectorAll('a[href^="/article/"]')].map((a) => a.getAttribute('href'))
      return { other: links.find((l) => l !== `/article/${cur}`) ?? null, text: /up next/i.test(document.body.textContent) }
    }, id)
    if (upNext.text && upNext.other) pass(`${id}: Up Next intact — another folio beyond the room`, upNext.other)
    else fail(`${id}: Up Next`, JSON.stringify(upNext))

    const ox = await overflowX(page)
    if (ox === 0) pass(`${id}: no horizontal overflow`)
    else fail(`${id}: overflow`, String(ox))

    const crit = failed.filter((u) => /\/img\/|\/assets\//.test(u))
    if (crit.length === 0) pass(`${id}: no failed content requests`)
    else fail(`${id}: failed requests`, crit.join(',').slice(0, 140))
    if (errors.length === 0) pass(`${id}: console clean`)
    else fail(`${id}: console`, errors.join(' | ').slice(0, 140))
  }
  await page.screenshot({ path: `${OUT}/26-reading-1440.png` })
  await browser.close()
}

/* ============ 2 · the room's spatial grammar (№01, desktop) ============ */
{
  const { browser, page, errors } = await launch()
  await page.setViewport({ width: 1440, height: 900 })
  await gotoArticle(page, 'their-voices-matter')
  const r = await page.evaluate(() => {
    const divs = [...document.querySelectorAll('div')]
    const back = divs.find((d) => /pointer-events-none fixed inset-0 z-0/.test(String(d.className || '')))
    const thread = divs.find((d) => /origin-top/.test(String(d.className || '')) && /w-px/.test(String(d.className || '')))
    const dot = [...document.querySelectorAll('span')].find((s) => /rounded-full/.test(String(s.className || '')))
    const gutter = document.querySelector('a[aria-label*="up next"]')
    const m = thread ? getComputedStyle(thread).transform.match(/matrix\(([^)]+)\)/) : null
    return {
      backBg: back && back.firstElementChild ? getComputedStyle(back.firstElementChild).backgroundImage : 'NONE',
      threadScaleY: m ? Number(m[1].split(',')[3]) : null,
      dotVisible: !!dot && dot.offsetParent !== null,
      gutter: gutter ? gutter.getAttribute('href') : null,
      gutterVisible: !!gutter && gutter.offsetParent !== null,
      gutterLabel: gutter ? gutter.getAttribute('aria-label') : null,
    }
  })
  if (r.backBg.includes('radial-gradient')) pass('BACK: wine room renders')
  else fail('BACK', r.backBg.slice(0, 80))
  if (r.threadScaleY !== null && r.threadScaleY < 0.1) pass(`MID: thread present, unspooled at rest (scaleY=${r.threadScaleY})`)
  else fail('MID: thread', String(r.threadScaleY))
  if (r.dotVisible) pass('MID: reader-position mark on the thread')
  else fail('MID: reader mark')
  if (r.gutter === '/article/the-horrors-of-child-sexual-abuse' && r.gutterVisible && r.gutterLabel?.includes('Open folio 12'))
    pass('MID: Up Next folio waiting in the right gutter — №12, canonical', r.gutter)
  else fail('MID: Up Next gutter', JSON.stringify(r))

  /* scroll: thread draws, dot travels */
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, document.documentElement.scrollHeight * 0.6) })
  await sleep(500)
  const late = await page.evaluate(() => {
    const divs = [...document.querySelectorAll('div')]
    const thread = divs.find((d) => /origin-top/.test(String(d.className || '')) && /w-px/.test(String(d.className || '')))
    const m = thread ? getComputedStyle(thread).transform.match(/matrix\(([^)]+)\)/) : null
    const dot = [...document.querySelectorAll('span')].find((s) => /rounded-full/.test(String(s.className || '')))
    return { threadScaleY: m ? Number(m[1].split(',')[3]) : null, dotTop: dot ? Math.round(dot.getBoundingClientRect().top) : null }
  })
  if (late.threadScaleY !== null && late.threadScaleY > 0.5) pass('scroll: thread draws toward the ending', `scaleY=${late.threadScaleY.toFixed(2)}`)
  else fail('scroll: thread', String(late.threadScaleY))
  if (late.dotTop !== null) pass('scroll: reader mark advances', `top=${late.dotTop}px`)
  else fail('scroll: reader mark')

  /* keyboard focus on the gutter folio */
  const kb = await page.evaluate(() => {
    const a = document.querySelector('a[aria-label*="up next"]')
    if (!a) return { ok: false }
    a.focus()
    const cs = getComputedStyle(a)
    return { ok: cs.outlineStyle !== 'none' && cs.outlineStyle !== '' && !/rgba\(0,\s*0,\s*0,\s*0\)/.test(cs.outlineColor) }
  })
  if (kb.ok) pass('keyboard: gutter folio has visible focus')
  else fail('keyboard: gutter folio')

  if (errors.length === 0) pass('spatial pass: console clean')
  else fail('spatial pass: console', errors.join(' | ').slice(0, 140))
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, 0) })
  await sleep(400)
  await page.screenshot({ path: `${OUT}/26-reading-1440.png` })
  await browser.close()
}

/* ============ 3 · tablet 768×1024 — simplified room ============ */
{
  const { browser, page, errors } = await launch()
  await page.setViewport({ width: 768, height: 1024 })
  await gotoArticle(page, 'their-voices-matter')
  const t = await page.evaluate(() => ({
    h1s: document.querySelectorAll('h1').length,
    ox: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    gutterHidden: (() => { const g = document.querySelector('a[aria-label*="up next"]'); return !g || g.offsetParent === null })(),
  }))
  if (t.h1s === 1 && t.ox === 0 && t.gutterHidden) pass('tablet: one H1, no overflow, gutter folio recedes')
  else fail('tablet', JSON.stringify(t))
  if (errors.length === 0) pass('tablet: console clean')
  else fail('tablet: console', errors.join(' | ').slice(0, 140))
  await page.screenshot({ path: `${OUT}/26-reading-768.png` })
  await browser.close()
}

/* ============ 4 · mobile 390×844 — vertical literary space ============ */
{
  const { browser, page, errors } = await launch()
  await page.setViewport({ width: 390, height: 844 })
  await gotoArticle(page, 'their-voices-matter')
  const m = await page.evaluate(() => {
    const paras = [...document.querySelectorAll('p')]
    const firstBody = paras.find((p) => /Just across the border/.test(p.textContent || ''))
    return {
      h1s: document.querySelectorAll('h1').length,
      ox: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      bodyVisible: !!firstBody && firstBody.getBoundingClientRect().width > 0,
      markersHidden: ![...document.querySelectorAll('span')].some((s) => /THE READING ROOM — FOLIO/.test(s.textContent || '') && s.offsetParent !== null),
    }
  })
  if (m.h1s === 1 && m.ox === 0 && m.bodyVisible && m.markersHidden) pass('mobile: one H1, no overflow, room quiet, body readable')
  else fail('mobile', JSON.stringify(m))
  if (errors.length === 0) pass('mobile: console clean')
  else fail('mobile: console', errors.join(' | ').slice(0, 140))
  await page.screenshot({ path: `${OUT}/26-reading-390.png` })
  await browser.close()
}

/* ============ 5 · reduced motion — the room, static ============ */
{
  const { browser, page, errors } = await launch({ reduce: true })
  await page.setViewport({ width: 1440, height: 900 })
  await gotoArticle(page, 'their-voices-matter')
  const r = await page.evaluate(() => {
    const divs = [...document.querySelectorAll('div')]
    const back = divs.find((d) => /pointer-events-none fixed inset-0 z-0/.test(String(d.className || '')))
    const thread = divs.find((d) => /origin-top/.test(String(d.className || '')) && /w-px/.test(String(d.className || '')))
    const m = thread ? getComputedStyle(thread).transform.match(/matrix\(([^)]+)\)/) : null
    const tf = thread ? getComputedStyle(thread).transform : null
    return {
      h1s: document.querySelectorAll('h1').length,
      ox: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      backTf: back ? getComputedStyle(back).transform : null,
      threadScaleY: m ? Number(m[1].split(',')[3]) : tf === 'none' ? 1 : null,
      dotHidden: ![...document.querySelectorAll('span')].some((s) => /rounded-full/.test(String(s.className || '')) && s.offsetParent !== null),
      gutter: !!document.querySelector('a[aria-label*="up next"]'),
      ledger: /THE READING ROOM — FOLIO № 01/.test(document.body.textContent),
    }
  })
  const anims = await runningAnims(page)
  if (r.h1s === 1 && r.ox === 0 && r.ledger && r.gutter) pass('reduced: same room — ledger, gutter folio, article intact')
  else fail('reduced: composition', JSON.stringify(r))
  if (r.backTf === 'none' && r.threadScaleY !== null && r.threadScaleY >= 0.9 && r.dotHidden && anims <= 1)
    pass(`reduced: static — thread full, no reader mark, ${anims} running`)
  else fail('reduced: motion', JSON.stringify({ backTf: r.backTf, threadScaleY: r.threadScaleY, dotHidden: r.dotHidden, anims }))
  if (errors.length === 0) pass('reduced: console clean')
  else fail('reduced: console', errors.join(' | ').slice(0, 140))
  await page.screenshot({ path: `${OUT}/26-reading-reduced.png` })
  await browser.close()
}

/* ============ 6 · WebGL unavailable — complete publication ============ */
{
  const { browser, page, errors } = await launch({ noWebGL: true })
  await page.setViewport({ width: 1440, height: 900 })
  await gotoArticle(page, 'their-voices-matter')
  const w = await page.evaluate(() => ({
    canvas: document.querySelectorAll('canvas').length,
    h1s: document.querySelectorAll('h1').length,
    ox: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ending: !!document.getElementById('ending'),
    ledger: /THE READING ROOM — FOLIO № 01/.test(document.body.textContent),
  }))
  if (w.canvas === 0 && w.h1s === 1 && w.ox === 0 && w.ending && w.ledger) pass('webgl-off: complete publication — no canvas, room ledger reads, ending intact')
  else fail('webgl-off', JSON.stringify(w))
  if (errors.length === 0) pass('webgl-off: console clean')
  else fail('webgl-off: console', errors.join(' | ').slice(0, 140))
  await page.screenshot({ path: `${OUT}/26-reading-nogl.png` })
  await browser.close()
}

/* ============ 7 · Back / Forward — the archive restores ============ */
{
  const { browser, page, errors } = await launch()
  await page.setViewport({ width: 1440, height: 900 })
  await page.goto(`${BASE}/articles`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await sleep(2500)
  const clicked = await page.evaluate(() => {
    const plate = document.querySelector('a[aria-label^="Folio"]')
    if (!plate) return false
    plate.click()
    return true
  })
  if (!clicked) { fail('history: no folio plate on /articles') } else {
    await sleep(3400)
    if (page.url().includes('/article/')) pass('history: folio pulled into the room', page.url().split('/').pop())
    else fail('history: enter article', page.url())

    await page.goBack({ waitUntil: 'domcontentloaded' })
    await sleep(2400)
    const plates = await page.evaluate(() => document.querySelectorAll('a[aria-label^="Folio"]').length)
    if (page.url().endsWith('/articles') && plates === 19) pass(`history: Back restores the archive (${plates} folios)`)
    else fail('history: Back', `plates=${plates}`)

    await page.goForward({ waitUntil: 'domcontentloaded' })
    await sleep(3200)
    const h1 = await page.evaluate(() => document.querySelector('h1')?.textContent?.trim() ?? '')
    if (page.url().includes('/article/') && h1.length > 0) pass('history: Forward returns to the room', h1.slice(0, 30))
    else fail('history: Forward', page.url())
  }
  if (errors.length === 0) pass('history: console clean')
  else fail('history: console', errors.join(' | ').slice(0, 140))
  await browser.close()
}

/* ============ 8 · mid-scroll depth capture ============ */
{
  const { browser, page } = await launch()
  await page.setViewport({ width: 1440, height: 900 })
  await gotoArticle(page, 'their-voices-matter')
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, document.documentElement.scrollHeight * 0.4) })
  await sleep(700)
  await page.screenshot({ path: `${OUT}/26-reading-mid-scroll.png` })
  await browser.close()
}

/* ============ summary ============ */
const totals = { PASS, FAIL, INFO }
fs.writeFileSync(RESULTS, JSON.stringify({ phase: '26-reading-room', generatedAt: new Date().toISOString(), totals, checks }, null, 2))
console.log(`\nTOTAL ${PASS + FAIL + INFO} | PASS ${PASS} | FAIL ${FAIL} | INFO ${INFO}`)
console.log(`results → ${RESULTS}`)
process.exit(FAIL > 0 ? 1 : 0)
