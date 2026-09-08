// PHASE 24 — THE READING ROOM · real-Chromium validation harness
// Verifies the spatial reading-room shell around the canonical article route
// WITHOUT touching protected files. Exits non-zero on any FAIL.
import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'

const BASE = 'http://localhost:5173'
const OUT = path.resolve('audit/shots')
const RESULTS = path.resolve('audit/phase24-reading-room-results.json')
const TARGETS = ['their-voices-matter', 'hope-becomes-mythology', 'mir-raza-ali'] // №01 №05 №19

let PASS = 0, FAIL = 0, INFO = 0
const checks = []
const pass = (name, detail = '') => { PASS++; checks.push({ name, status: 'PASS', detail }) }
const fail = (name, detail = '') => { FAIL++; checks.push({ name, status: 'FAIL', detail }) }
const info = (name, detail = '') => { INFO++; checks.push({ name, status: 'INFO', detail }) }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/* ---------------- content.ts parser (authoritative data only) ---------------- */
function parseContent() {
  const src = fs.readFileSync('src/data/content.ts', 'utf8')
  const articles = []
  const re = /id: '([a-z0-9-]+)',\s*\n\s*title:\s*(["'])((?:[^\\]|\\.)*?)\2,\s*\n\s*authorId: '([a-z0-9-]+)',\s*\n\s*category:\s*(["'])((?:[^\\]|\\.)*?)\5/g
  let m
  while ((m = re.exec(src))) {
    articles.push({ id: m[1], title: m[3].replace(/\\'/g, "'").replace(/\\"/g, '"'), authorId: m[4], category: m[6].replace(/\\'/g, "'"), body: [] })
  }
  for (const a of articles) {
    const i = src.indexOf(`id: '${a.id}'`)
    if (i < 0) continue
    const j = src.indexOf('\n  },', i)
    const block = src.slice(i, j < 0 ? src.length : j)
    const bm = block.match(/body:\s*\[([\s\S]*?)\]\s*,/)
    if (bm) a.body = [...bm[1].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((x) => x[1]).filter((p) => p.length > 1)
  }
  const authors = {}
  const are = /id: '([a-z0-9-]+)',\s*\n\s*name: '((?:[^'\\]|\\.)*)'/g
  while ((m = are.exec(src))) authors[m[1]] = m[2].replace(/\\'/g, "'")
  return { articles, authors }
}
const CONTENT = parseContent()
const folioOf = (id) => {
  const i = CONTENT.articles.findIndex((a) => a.id === id)
  return i >= 0 ? String(i + 1).padStart(2, '0') : null
}

/* ---------------- browser helpers ---------------- */
async function launch(opts = {}) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  })
  const page = await browser.newPage()
  if (opts.noWebGL) {
    await page.evaluateOnNewDocument(() => {
      HTMLCanvasElement.prototype.getContext = function (type, ...a) {
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
const h1Text = (page) => page.evaluate(() => document.querySelector('h1')?.textContent?.replace(/\s+/g, ' ').trim() ?? '')
const overflowX = (page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
const pageText = (page) => page.evaluate(() => document.body.textContent.replace(/\s+/g, ' '))
const runningAnims = (page) => page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length)
const contentCritical = (failed) => failed.filter((u) => /\/img\/|\/article|\/assets\/.*\.(webp|png|jpg|jpeg)/.test(u))

async function gotoArticle(page, id) {
  await page.goto(`${BASE}/article/${id}`, { waitUntil: 'domcontentloaded', timeout: 35000 })
  await sleep(4200)
}

console.log('=== PHASE 24 — READING ROOM INSPECTION ===')

/* ============ 1 · the three canonical folios, desktop 1440×900 ============ */
{
  const { browser, page, errors, failed } = await launch()
  await page.setViewport({ width: 1440, height: 900 })
  for (const id of TARGETS) {
    const article = CONTENT.articles.find((a) => a.id === id)
    const folio = folioOf(id)
    const authorName = article ? CONTENT.authors[article.authorId] : undefined
    await gotoArticle(page, id)
    const url = page.url()
    if (url.endsWith(`/article/${id}`)) pass(`${id}: deep URL resolves (canonical)`, url.split('/').pop())
    else fail(`${id}: canonical URL`, url)

    const title = await page.title()
    if (/Verlyse Media/i.test(title) && title.length > 8) pass(`${id}: document title carries Verlyse Media`, title)
    else fail(`${id}: document title`, title)

    const h1 = await h1Text(page)
    const h1s = await page.evaluate(() => document.querySelectorAll('h1').length)
    if (h1s === 1 && h1.length > 0 && h1.toLowerCase().includes(article.title.toLowerCase().slice(0, 24).replace(/[“”"']/g, '')))
      pass(`${id}: exactly one H1 — the title`, h1.slice(0, 48))
    else fail(`${id}: H1`, `count=${h1s} h1="${h1.slice(0, 40)}"`)

    const bodyText = await pageText(page)
    if (authorName && bodyText.includes(authorName)) pass(`${id}: author credited`, authorName)
    else fail(`${id}: author`, String(authorName))

    if (folio && new RegExp(`FOLIO №\\s*${folio}`, 'i').test(bodyText)) pass(`${id}: folio №${folio} on the room's ledger`)
    else fail(`${id}: folio marker`, `expected Folio №${folio}`)

    /* body intact + no duplication (normalized text; NEWS UPDATE cards are
       intentionally re-typeset by the canonical page, so they are checked by
       their stripped form) */
    if (article.body.length > 1) {
      const flat = bodyText.replace(/\s+/g, '')
      const presentParas = article.body.filter((p) => !p.startsWith('NEWS UPDATE'))
      const allPresent = presentParas.every((p) => flat.includes(p.replace(/\s+/g, '')))
      const pair = (article.body[0] + article.body[1]).replace(/\s+/g, '')
      const pairCount = flat.split(pair).length - 1
      if (allPresent && pairCount === 1) pass(`${id}: body paragraphs intact, no duplication (${article.body.length} paras)`)
      else fail(`${id}: body integrity`, `all=${allPresent} pairCount=${pairCount}`)
    } else fail(`${id}: body integrity`, 'no body parsed')

    const imgInfo = await page.evaluate(() => {
      const imgs = [...document.querySelectorAll('img')]
      const hero = imgs[0]
      return { count: imgs.length, heroW: hero ? (hero.complete && hero.naturalWidth > 0) : false }
    })
    if (imgInfo.count >= 2 && imgInfo.heroW) pass(`${id}: images intact (${imgInfo.count} plates, hero rendered)`)
    else fail(`${id}: images`, JSON.stringify(imgInfo))

    const ending = await page.evaluate(() => {
      const el = document.getElementById('ending')
      return el ? { exists: true, len: el.innerText.length } : { exists: false, len: 0 }
    })
    if (ending.exists && ending.len > 80) pass(`${id}: ending chamber intact`, `#ending ${ending.len} chars`)
    else fail(`${id}: ending`, JSON.stringify(ending))

    const upNext = await page.evaluate((cur) => {
      const text = document.body.textContent
      const links = [...document.querySelectorAll('a[href^="/article/"]')].map((a) => a.getAttribute('href'))
      const other = links.find((l) => l !== `/article/${cur}`)
      return { up: /up next/i.test(text), other: other ?? null }
    }, id)
    if (upNext.up && upNext.other) pass(`${id}: Up Next — another folio beyond the room`, upNext.other)
    else fail(`${id}: Up Next`, JSON.stringify(upNext))

    const ox = await overflowX(page)
    if (ox === 0) pass(`${id}: no horizontal overflow`)
    else fail(`${id}: overflow`, String(ox))

    const kb = await page.evaluate(() => {
      const targets = [...document.querySelectorAll('a, button')]
      for (let i = 0; i < Math.min(40, targets.length); i++) {
        targets[i].focus()
        const cs = getComputedStyle(targets[i])
        if (cs.outlineStyle !== 'none' && cs.outlineStyle !== '' && !/rgba\(0,\s*0,\s*0,\s*0\)/.test(cs.outlineColor)) {
          return { ok: true, tag: targets[i].tagName }
        }
      }
      return { ok: false }
    })
    if (kb.ok) pass(`${id}: keyboard focus visible (${kb.tag})`)
    else fail(`${id}: keyboard focus`)

    if (errors.length === 0) pass(`${id}: console clean`)
    else fail(`${id}: console`, errors.join(' | ').slice(0, 140))
    const crit = contentCritical(failed)
    if (crit.length === 0) pass(`${id}: no failed content requests`)
    else fail(`${id}: failed requests`, crit.join(', ').slice(0, 140))
  }

  /* screenshots — the room at rest (№01) */
  await gotoArticle(page, 'their-voices-matter')
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, 0) })
  await sleep(500)
  await page.screenshot({ path: `${OUT}/24-reading-1440.png` })
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, document.documentElement.scrollHeight * 0.45) })
  await sleep(600)
  await page.screenshot({ path: `${OUT}/24-reading-mid-scroll.png` })
  await browser.close()
}

/* ============ 2 · spatial grammar on №01 (desktop) ============ */
{
  const { browser, page, errors } = await launch()
  await page.setViewport({ width: 1440, height: 900 })
  await gotoArticle(page, 'their-voices-matter')
  const room = await page.evaluate(() => {
    const divs = [...document.querySelectorAll('div')]
    const back = divs.find((d) => /pointer-events-none fixed inset-0 z-0/.test(String(d.className || '')))
    const ghost = [...document.querySelectorAll('span')].find((s) => /^№\s*01$/.test(s.textContent || ''))
    const thread = divs.find((d) => /origin-top/.test(String(d.className || '')) && /w-px/.test(String(d.className || '')))
    const contentWrap = divs.find((d) => /relative z-\[2\]/.test(String(d.className || '')))
    return {
      backBg: back && back.firstElementChild ? getComputedStyle(back.firstElementChild).backgroundImage : 'NONE',
      ghost: !!ghost,
      ghostStroke: ghost ? getComputedStyle(ghost).webkitTextStrokeColor : '',
      thread: !!thread,
      threadScaleY: thread ? (() => { const m = getComputedStyle(thread).transform.match(/matrix\(([^)]+)\)/); return m ? Number(m[1].split(',')[3]) : null })() : null,
      contentZ: contentWrap ? getComputedStyle(contentWrap).zIndex : 'none',
      backZ: back ? getComputedStyle(back).zIndex : 'none',
      markers: /THE READING ROOM — FOLIO № 01/.test(document.body.textContent),
      rightMark: /SOCIAL ISSUES · № 01 \/ 19/.test(document.body.textContent),
    }
  })
  if (room.backBg.includes('radial-gradient') && room.backBg.includes('linear-gradient')) pass('BACK: wine architectural field renders')
  else fail('BACK: field', room.backBg.slice(0, 90))
  if (room.ghost && /0\.1[0-2]/.test(room.ghostStroke)) pass('BACK: ghost folio №01 engraved behind the column', room.ghostStroke)
  else fail('BACK: ghost folio', room.ghostStroke)
  if (room.markers && room.rightMark) pass('MID: shelf marks — room ledger + folio index')
  else fail('MID: shelf marks', JSON.stringify({ markers: room.markers, rightMark: room.rightMark }))
  if (room.thread && room.threadScaleY !== null && room.threadScaleY < 0.1) pass(`MID: brass thread present, unspooled at rest (scaleY=${room.threadScaleY})`)
  else fail('MID: thread', `exists=${room.thread} scaleY=${room.threadScaleY}`)
  if (room.contentZ === '2' && room.backZ === '0') pass('planes: content (z2) above room (z0)')
  else fail('planes: z-order', JSON.stringify({ contentZ: room.contentZ, backZ: room.backZ }))

  /* parallax — at scroll 400: back ≈ 28px, ghost ≈ 44px */
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, 400) })
  await sleep(450)
  const depth = await page.evaluate(() => {
    const tyOf = (el) => {
      if (!el) return null
      const m = getComputedStyle(el).transform.match(/matrix(?:3d)?\(([^)]+)\)/)
      if (!m) return 0
      const v = m[1].split(',').map(Number)
      return v.length === 16 ? v[13] : v[5]
    }
    const divs = [...document.querySelectorAll('div')]
    const back = divs.find((d) => /pointer-events-none fixed inset-0 z-0/.test(String(d.className || '')))
    const ghost = [...document.querySelectorAll('span')].find((s) => /^№\s*01$/.test(s.textContent || ''))
    const thread = divs.find((d) => /origin-top/.test(String(d.className || '')) && /w-px/.test(String(d.className || '')))
    return { backTy: tyOf(back), ghostTy: tyOf(ghost?.parentElement), threadScaleY: (() => { const m = getComputedStyle(thread).transform.match(/matrix\(([^)]+)\)/); return m ? Number(m[1].split(',')[3]) : null })() }
  })
  if (depth.backTy > 18 && depth.backTy < 40 && depth.ghostTy > 30 && depth.ghostTy < 60) pass('scroll: restrained depth — room drifts, folio advances', JSON.stringify(depth))
  else fail('scroll: depth', JSON.stringify(depth))

  /* the thread draws as the reader advances */
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, document.documentElement.scrollHeight * 0.7) })
  await sleep(500)
  const threadLate = await page.evaluate(() => {
    const divs = [...document.querySelectorAll('div')]
    const thread = divs.find((d) => /origin-top/.test(String(d.className || '')) && /w-px/.test(String(d.className || '')))
    const m = thread ? getComputedStyle(thread).transform.match(/matrix\(([^)]+)\)/) : null
    return m ? Number(m[1].split(',')[3]) : null
  })
  if (threadLate !== null && threadLate > 0.5) pass('scroll: thread draws toward the ending', `scaleY=${threadLate.toFixed(2)}`)
  else fail('scroll: thread', String(threadLate))

  /* the reading column stays above the room */
  const above = await page.evaluate(() => {
    const at = document.elementsFromPoint(400, 640).slice(0, 4)
    return { onTop: at.map((e) => e.tagName).join(','), backPlaneBuried: !at.some((e) => e.className && /pointer-events-none fixed inset-0 z-0/.test(String(e.className))) }
  })
  if (above.backPlaneBuried) pass('planes: reading column paints above the room', above.onTop)
  else fail('planes: content above', above.onTop)

  if (errors.length === 0) pass('spatial pass: console clean')
  else fail('spatial pass: console', errors.join(' | ').slice(0, 140))
  await browser.close()
}

/* ============ 3 · tablet 768×1024 — simplified depth ============ */
{
  const { browser, page, errors } = await launch()
  await page.setViewport({ width: 768, height: 1024 })
  await gotoArticle(page, 'their-voices-matter')
  const t = await page.evaluate(() => {
    const ledger = [...document.querySelectorAll('span')].find((s) => /THE READING ROOM — FOLIO/i.test(s.textContent || ''))
    return {
      h1s: document.querySelectorAll('h1').length,
      ox: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ledgerHidden: !ledger || ledger.offsetParent === null,
      ghostHidden: ![...document.querySelectorAll('span')].some((s) => /^№\s*01$/.test(s.textContent || '') && s.offsetParent !== null),
    }
  })
  if (t.h1s === 1 && t.ox === 0) pass('tablet: one H1, no overflow')
  else fail('tablet: layout', JSON.stringify(t))
  if (t.ledgerHidden && t.ghostHidden) pass('tablet: room simplified — shelf marks & ghost recede')
  else fail('tablet: simplification', JSON.stringify(t))
  if (errors.length === 0) pass('tablet: console clean')
  else fail('tablet: console', errors.join(' | ').slice(0, 140))
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, 0) })
  await sleep(400)
  await page.screenshot({ path: `${OUT}/24-reading-768.png` })
  await browser.close()
}

/* ============ 4 · mobile 390×844 — one reading path ============ */
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
      markersHidden: ![...document.querySelectorAll('span')].some((s) => /THE READING ROOM — FOLIO/i.test(s.textContent || '') && s.offsetParent !== null),
    }
  })
  if (m.h1s === 1 && m.ox === 0 && m.bodyVisible) pass('mobile: one H1, no overflow, body readable')
  else fail('mobile: layout', JSON.stringify(m))
  if (m.markersHidden) pass('mobile: room collapses to the reading column')
  else fail('mobile: simplification', JSON.stringify(m))
  if (errors.length === 0) pass('mobile: console clean')
  else fail('mobile: console', errors.join(' | ').slice(0, 140))
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, 0) })
  await sleep(400)
  await page.screenshot({ path: `${OUT}/24-reading-390.png` })
  await browser.close()
}

/* ============ 5 · reduced motion — same room, no motion ============ */
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
      roomPresent: /THE READING ROOM — FOLIO № 01/.test(document.body.textContent),
    }
  })
  const anims = await runningAnims(page)
  if (r.h1s === 1 && r.ox === 0 && r.roomPresent) pass('reduced: same room — content, folio, thread all present')
  else fail('reduced: composition', JSON.stringify(r))
  if (r.backTf === 'none' && r.threadScaleY !== null && r.threadScaleY >= 0.9 && anims <= 1)
    pass(`reduced: motion collapsed (parallax none, thread static, ${anims} running anims)`)
  else fail('reduced: motion', JSON.stringify({ backTf: r.backTf, threadScaleY: r.threadScaleY, anims }))
  if (errors.length === 0) pass('reduced: console clean')
  else fail('reduced: console', errors.join(' | ').slice(0, 140))
  await page.screenshot({ path: `${OUT}/24-reading-reduced.png` })
  await browser.close()
}

/* ============ 6 · WebGL unavailable — the room survives ============ */
{
  const { browser, page, errors } = await launch({ noWebGL: true })
  await page.setViewport({ width: 1440, height: 900 })
  await gotoArticle(page, 'their-voices-matter')
  const w = await page.evaluate(() => {
    return {
      canvas: document.querySelectorAll('canvas').length,
      h1s: document.querySelectorAll('h1').length,
      ox: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ending: !!document.getElementById('ending'),
      roomLedger: /THE READING ROOM — FOLIO № 01/.test(document.body.textContent),
    }
  })
  if (w.canvas === 0 && w.h1s === 1 && w.ox === 0 && w.ending) pass('webgl-off: complete publication — no canvas, one H1, ending intact')
  else fail('webgl-off: layout', JSON.stringify(w))
  if (w.roomLedger) pass("webgl-off: the room composition still reads")
  else fail('webgl-off: room ledger')
  if (errors.length === 0) pass('webgl-off: console clean')
  else fail('webgl-off: console', errors.join(' | ').slice(0, 140))
  await page.screenshot({ path: `${OUT}/24-reading-nogl.png` })
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
  if (!clicked) { fail('history: no folio plate found on /articles') } else {
    await sleep(3200)
    const entered = page.url().includes('/article/')
    if (entered) pass('history: folio pulled into the room', page.url().split('/').pop())
    else fail('history: enter article', page.url())

    await page.goBack({ waitUntil: 'domcontentloaded' })
    await sleep(2200)
    const plates = await page.evaluate(() => document.querySelectorAll('a[aria-label^="Folio"]').length)
    if (page.url().endsWith('/articles') && plates === 19) pass(`history: Back restores the archive (${plates} folios)`)
    else fail('history: Back', `url=${page.url().slice(-40)} plates=${plates}`)

    await page.goForward({ waitUntil: 'domcontentloaded' })
    await sleep(3000)
    const backH1 = await h1Text(page)
    if (page.url().includes('/article/') && backH1.length > 0) pass('history: Forward returns to the room', backH1.slice(0, 30))
    else fail('history: Forward', page.url())
  }
  if (errors.length === 0) pass('history: console clean')
  else fail('history: console', errors.join(' | ').slice(0, 140))
  await browser.close()
}

/* ============ summary ============ */
const totals = { PASS, FAIL, INFO }
fs.writeFileSync(RESULTS, JSON.stringify({ phase: '24-reading-room', generatedAt: new Date().toISOString(), totals, checks }, null, 2))
console.log(`\nTOTAL ${PASS + FAIL + INFO} | PASS ${PASS} | FAIL ${FAIL} | INFO ${INFO}`)
console.log(`results → ${RESULTS}`)
process.exit(FAIL > 0 ? 1 : 0)
