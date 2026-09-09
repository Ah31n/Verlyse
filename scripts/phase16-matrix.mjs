// PHASE 16 — full route matrix: direct load + hard refresh, console/page errors,
// failed requests, 404s, broken images, blank states, debug tokens.
import puppeteer from 'puppeteer'
import { readdirSync, statSync } from 'fs'
import { join, relative } from 'path'

const ROOT = 'http://localhost:4173'
const routes = ['/', '/about', '/articles', '/categories', '/community', '/submit', '/ambassadors', '/creators', '/contact']
const articles = ['3-13','a-students-worth','behind-every-headline','failure','forgive-me-mother','hope-becomes-mythology','if-hope-were-a-feather','intellect-lost-to-code','jaldi','khageena','mir-raza-ali','my-last-breath','tasbih-e-fatima','the-arts-deserve-respect','the-empty-waltz','the-garden-beyond-my-tower','the-horrors-of-child-sexual-abuse','their-voices-matter','water-cat']
const creators = ['abheesha-ghosh','adeena-irfan','alina-javed','anshujit-singh','craft-with-bro','hadia-raza','haieqa-wahab','haiqa-nafees','kazi-fatimataz-zahra','kenza-imene','mochjixx','munkashay-javed','shaza-fatima','syeda-tasbeeha-noman','verlyse-media','zuha-farhan']
const ALL = [...routes, ...articles.map(s=>`/article/${s}`), ...creators.map(s=>`/creator/${s}`)]

const expected = {
  '/': 'Where Vision Becomes A Voice',
  '/articles': 'Contents',
  '/ambassadors': 'Zainab Khan',
  '/categories': 'CATEGORIES',
  '/community': 'COMMUNITY',
  '/creators': 'Creators',
  '/about': 'ABOUT',
  '/submit': 'SUBMIT',
  '/contact': 'CONTACT',
}
// per-slug marker: the title text must appear
const titles = {
  '3-13':'3:13','a-students-worth':"Student's Worth",'behind-every-headline':'Behind Every Headline','failure':'Failure','forgive-me-mother':'Forgive Me, Mother','hope-becomes-mythology':'Hope Becomes Mythology','if-hope-were-a-feather':'If Hope Were A Feather','intellect-lost-to-code':'Intellect Lost to Code','jaldi':'Jaldi','khageena':'Khageena','mir-raza-ali':'Mir Raza Ali','my-last-breath':'My Last Breath','tasbih-e-fatima':'Tasbih-e-Fatima','the-arts-deserve-respect':'The Arts Deserve Respect','the-empty-waltz':'The Empty Waltz','the-garden-beyond-my-tower':'The Garden Beyond My Tower','the-horrors-of-child-sexual-abuse':'The Horrors','their-voices-matter':'Their Voices Matter','water-cat':'Water Cat'
}

const results = []
const m = await import('/tmp/verlyse-content.mjs')
const nameBySlug = Object.fromEntries(m.AUTHORS.map(a=>[a.id, a.name]))
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-gpu','--use-gl=swiftshader'] })

async function auditPage(page, url, pass) {
  const consoleErr = [], pageErr = [], failedReq = [], badStatus = [], brokenImg = []
  const onConsole = (m) => { if (m.type() === 'error') consoleErr.push(m.text().slice(0,160)) }
  const onPageErr = (e) => pageErr.push(String(e).slice(0,160))
  const onReqFail = (r) => failedReq.push(`${r.url().replace(ROOT,'')} :: ${r.failure()?.errorText}`)
  const onResp = (r) => { if (r.status() >= 400) badStatus.push(`${r.status()} ${r.url().replace(ROOT,'')}`) }
  page.on('console', onConsole); page.on('pageerror', onPageErr)
  page.on('requestfailed', onReqFail); page.on('response', onResp)
  let navErr = null
  try {
    if (pass === 'direct') await page.goto(ROOT + url, { waitUntil: 'networkidle2', timeout: 45000 })
    else await page.reload({ waitUntil: 'networkidle2', timeout: 45000 })
  } catch (e) { navErr = String(e).slice(0,120) }
  await new Promise(r=>setTimeout(r, 1200))
  let info = {}
  try {
    info = await page.evaluate(() => {
      const t = document.body.innerText || ''
      const imgs = Array.from(document.querySelectorAll('img'))
      const broken = imgs.filter(i => i.complete && i.naturalWidth === 0).map(i => (i.src||'').slice(-60))
      const h1 = document.querySelector('h1')?.textContent || ''
      return { textLen: t.length, h1, title: document.title, broken, hasUndefined: /\bundefined\b|\bNaN\b|\[object /.test(t) }
    })
  } catch {}
  page.off('console', onConsole); page.off('pageerror', onPageErr)
  page.off('requestfailed', onReqFail); page.off('response', onResp)
  return { navErr, consoleErr, pageErr, failedReq, badStatus, ...info }
}

for (const url of ALL) {
  const page = await b.newPage()
  await page.setViewport({ width: 1440, height: 900 })
  const direct = await auditPage(page, url, 'direct')
  await page.evaluate(() => document.documentElement.style.scrollBehavior = 'auto')
  const cdp = await page.target().createCDPSession()
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })
  const hard = await auditPage(page, url, 'hard')
  // expected marker
  let marker = expected[url]
  const mArt = url.match(/^\/article\/(.+)$/)
  const mCre = url.match(/^\/creator\/(.+)$/)
  if (mArt) marker = titles[mArt[1]]
  if (mCre) marker = nameBySlug[mCre[1]] || mCre[1]
  const markerOk = (direct.h1 + ' ' + direct.title + (direct.textLen ? '' : '')).includes(marker) ||
    await page.evaluate((mk) => (document.body.innerText || '').includes(mk), marker)
  const problems = [
    direct.navErr && `direct:${direct.navErr}`,
    hard.navErr && `hard:${hard.navErr}`,
    ...direct.consoleErr.map(e=>`direct console:${e}`),
    ...hard.consoleErr.map(e=>`hard console:${e}`),
    ...direct.pageErr.map(e=>`direct react:${e}`),
    ...hard.pageErr.map(e=>`hard react:${e}`),
    ...direct.badStatus.map(e=>`direct 4xx:${e}`),
    ...hard.badStatus.map(e=>`hard 4xx:${e}`),
    ...direct.failedReq.map(e=>`direct fail:${e}`),
    ...(direct.broken||[]).map(e=>`direct brokenimg:${e}`),
    ...(hard.broken||[]).map(e=>`hard brokenimg:${e}`),
    hard.textLen < 200 && `BLANK(hard,${hard.textLen})`,
    direct.hasUndefined && 'debug-token(direct)',
    hard.hasUndefined && 'debug-token(hard)',
    !markerOk && `missing-marker:${marker}`,
  ].filter(Boolean)
  results.push({ url, problems, ok: problems.length === 0, h1: direct.h1, textLen: hard.textLen })
  await page.close()
  const icon = problems.length === 0 ? '✓' : '✗'
  console.log(`${icon} ${url.padEnd(38)} ${problems.join(' | ')}`)
}

/* ---- asset sweep: every file under public/ must serve 200 ---- */
function walk(dir, out=[]) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f)
    if (statSync(p).isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}
const files = walk(join(process.cwd(), 'public'))
const badAssets = []
for (const f of files) {
  const url = '/' + relative(join(process.cwd(),'public'), f).split('\\').join('/')
  const st = await fetch(ROOT + url, { method: 'GET' }).then(r => r.status).catch(e => 'ERR:'+e.message)
  if (st !== 200) badAssets.push(`${url} -> ${st}`)
}
console.log(`\nASSET SWEEP: ${files.length} public files, bad: ${badAssets.length}`)
badAssets.forEach(x=>console.log('  ✗', x))

/* ---- hidden/temp files in public surface ---- */
const hidden = files.filter(f => /(^|[\/])(\.[^\/]+|tmp|temp|test|\.log$|\.bak$|~$)/i.test(f) && !f.includes('public/'))
console.log('HIDDEN/TEMP IN PUBLIC:', hidden.length ? hidden.join(', ') : 'none')

const failed = results.filter(r=>!r.ok)
console.log(`\n==== PHASE16 ROUTE MATRIX: ${results.length - failed.length}/${results.length} clean (${results.length} routes) ====`)
await b.close()
