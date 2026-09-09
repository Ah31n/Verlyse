// PHASE 16 — internal navigation chains, real clicks, landing verification.
import puppeteer from 'puppeteer'
const ROOT = 'http://localhost:4173'
const D = '/home/user/phase14-verify'
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-gpu','--use-gl=swiftshader'] })
const p = await b.newPage()
await p.setViewport({ width: 1440, height: 900 })
const out = []
function log(name, ok, detail) { out.push({ name, ok, detail }); console.log(`${ok?'✓':'✗'} ${name} :: ${detail}`) }

async function fresh(path) {
  await p.goto(ROOT + path, { waitUntil: 'networkidle2', timeout: 45000 })
  await new Promise(r=>setTimeout(r, 1800))
  await p.evaluate(() => { document.documentElement.style.scrollBehavior='auto'; window.scrollTo(0,0) })
}
async function clickFirst(text, tag = 'a') {
  const clicked = await p.evaluate(({ text, tag }) => {
    const els = Array.from(document.querySelectorAll(tag))
    const el = els.find(e => e.textContent.replace(/\s+/g,' ').trim().toLowerCase().includes(text.toLowerCase()))
    if (!el) return false
    el.scrollIntoView({ block: 'center' })
    el.click()
    return true
  }, { text, tag })
  await new Promise(r=>setTimeout(r, 1600))
  return clicked
}
const where = () => p.evaluate(() => ({ path: location.pathname, h1: document.querySelector('h1')?.textContent || '', text: (document.body.innerText||'').slice(0, 400) }))

/* 1. Home → Article (current feature) */
await fresh('/')
await clickFirst('READ THE CURRENT FEATURE')
let w = await where(); log('Home → Article (current feature)', w.path === '/article/their-voices-matter' && w.text.includes('Their Voices Matter'), `landed ${w.path}`)

/* 1b. Home → Article (latest work card) */
await fresh('/')
const card = await clickFirst('Mir Raza Ali')
w = await where(); log('Home → Article (latest work)', card && w.path === '/article/mir-raza-ali', `clicked=${card} landed ${w.path}`)

/* 2. Article → Creator */
await fresh('/article/mir-raza-ali')
const byline = await clickFirst('Verlyse Media', 'a')
w = await where(); log('Article → Creator (byline)', byline && w.path === '/creator/verlyse-media', `clicked=${byline} landed ${w.path}`)

/* 3. Article → Category */
await fresh('/article/mir-raza-ali')
const cat = await clickFirst('Social Issues', 'a')
w = await where(); log('Article → Category (kicker)', cat && w.path === '/categories', `clicked=${cat} landed ${w.path}`)

/* 4. Article → Related */
await fresh('/article/behind-every-headline')
await p.evaluate(async () => { const el = Array.from(document.querySelectorAll('h2,h3,p')).find(e=>/related/i.test(e.textContent)); el?.scrollIntoView() })
await new Promise(r=>setTimeout(r,1200))
const rel = await clickFirst('Mir Raza Ali', 'a')
w = await where(); log('Article → Related (behind → mir-raza)', rel && w.path === '/article/mir-raza-ali', `clicked=${rel} landed ${w.path}`)

/* 5. Article → Up Next */
await fresh('/article/behind-every-headline')
const up = await clickFirst('UP NEXT', 'a') || await clickFirst('their voices matter', 'a')
w = await where(); log('Article → Up Next', up && /^\/article\//.test(w.path) && w.path !== '/article/behind-every-headline', `clicked=${up} landed ${w.path}`)

/* 6. Search overlay → Article */
await fresh('/')
await p.evaluate(() => { const s = Array.from(document.querySelectorAll('button')).find(x => (x.getAttribute('aria-label')||'').toLowerCase().includes('search')); s?.click() })
await new Promise(r=>setTimeout(r, 1200))
const inp = await p.$('input')
await inp.type('Raza', { delay: 50 })
await new Promise(r=>setTimeout(r, 1400))
const res = await clickFirst('Mir Raza Ali', 'a')
w = await where(); log('Search → Article (Raza)', res && w.path === '/article/mir-raza-ali', `clicked=${res} landed ${w.path}`)

/* 7. Creator → Article */
await fresh('/creator/verlyse-media')
const work = await clickFirst('Mir Raza Ali', 'a')
w = await where(); log('Creator → Article', work && w.path === '/article/mir-raza-ali', `clicked=${work} landed ${w.path}`)

/* 8. Category → Article */
await fresh('/categories')
const si = await clickFirst('Social Issues', 'a')
await new Promise(r=>setTimeout(r, 900))
const inList = await p.evaluate(() => (document.body.innerText||'').includes('Mir Raza Ali'))
const art = await clickFirst('Mir Raza Ali', 'a')
w = await where(); log('Category → Article (Social Issues)', si && inList && art && w.path === '/article/mir-raza-ali', `si=${si} inList=${inList} art=${art} landed ${w.path}`)

/* 9. Footer → every destination */
await fresh('/about')
const footLinks = await p.evaluate(() => {
  const f = document.querySelector('footer')
  if (!f) return []
  return Array.from(f.querySelectorAll('a')).map(a => ({ text: a.textContent.replace(/\s+/g,' ').trim(), href: a.getAttribute('href') }))
})
let footBad = []
for (const l of footLinks) {
  await fresh('/about')
  const ok = await p.evaluate(({ text }) => {
    const f = document.querySelector('footer')
    const a = Array.from(f.querySelectorAll('a')).find(x => x.textContent.replace(/\s+/g,' ').trim() === text)
    if (!a) return false
    a.click(); return true
  }, { text: l.text })
  await new Promise(r=>setTimeout(r, 1400))
  const cur = await p.evaluate(() => location.pathname)
  // A footer link is good if the click fired and we land on a valid internal route
  // (staying on /about is only valid for an /about self-link).
  const self = (l.href === '/about' || l.href === 'about')
  const good = ok && cur.startsWith('/') && (cur !== '/about' || self || l.href === '/')
  if (!good) footBad.push(`${l.text} -> clicked=${ok} at=${cur} (href ${l.href})`)
}
log('Footer → every destination', footBad.length === 0, footBad.length ? footBad.join('; ') : `${footLinks.length} links all resolve (${footLinks.map(l=>l.text).join(', ')})`)

const bad = out.filter(o=>!o.ok)
console.log(`\n==== PHASE16 NAV CHAINS: ${out.length - bad.length}/${out.length} pass ====`)
await b.close()
