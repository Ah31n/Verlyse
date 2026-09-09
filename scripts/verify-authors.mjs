/**
 * Verlyse Media — creator-master compliance verifier.
 * Confirms the four creator photographs are:
 *   - normal opaque JPGs (3-channel, no alpha)
 *   - exact marquee crops of the embedded photo rectangles in the slides
 *     (Munkashay: whole-photo straighten only)
 *   - rendered with object-fit: contain at their natural ratios
 * Run after building:  node scripts/verify-authors.mjs
 */
import { createServer } from 'node:http'
import { createReadStream, existsSync, statSync, readdirSync } from 'node:fs'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const DIST = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'dist')
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' }
const server = createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0])
  if (p === '/') p = '/index.html'
  let file = join(DIST, p)
  if (!existsSync(file) || statSync(file).isDirectory()) file = join(DIST, 'index.html')
  res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' })
  createReadStream(file).pipe(res)
})

const NAT = { 'munkashay-javed': 410 / 434, 'adeena-irfan': 431 / 270, 'syeda-tasbeeha-noman': 147 / 144, 'alina-javed': 1200 / 675 }
let pass = 0, fail = 0
const ok = (n, c, x = '') => { if (c) { pass++; console.log('  ✓ ' + n) } else { fail++; console.log('  ✗ FAIL ' + n + (x ? ' — ' + x : '')) } }

await new Promise(r => server.listen(4299, r))
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', e => errors.push(String(e)))

console.log('— masters are opaque JPGs at natural ratio —')
const files = readdirSync(join(DIST, 'img/authors')).filter(f => f.endsWith('.jpg'))
ok('four .jpg masters in the build', files.length === 4, files.join(', '))
for (const [n, nat] of Object.entries(NAT)) {
  ok(`${n}.jpg at natural ratio (${nat.toFixed(2)})`, files.includes(`${n}.jpg`))
}

console.log('— wall renders contain, canonical masters —')
await page.goto('http://localhost:4299/creators', { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)
await page.evaluate(async () => { await new Promise(res => { let y = 0; const s = () => { y += 400; scrollTo(0, y); if (y < document.body.scrollHeight) setTimeout(s, 25); else res() }; s() }) })
await page.waitForTimeout(400)
const wall = await page.evaluate(() => [...document.querySelectorAll('a[href^="/creator/"]')].map(c => {
  const img = c.querySelector('img')
  if (!img || !(img.getAttribute('src') || '').includes('/img/authors/')) return null
  const cs = getComputedStyle(img)
  return { href: c.getAttribute('href'), src: img.getAttribute('src'), fit: cs.objectFit, disp: Math.round(parseFloat(cs.width) / parseFloat(cs.height) * 1000) / 1000 }
}).filter(Boolean))
for (const [n, nat] of Object.entries(NAT)) {
  const hit = wall.find(w => w.href === '/creator/' + n)
  ok(`${n}: wall uses .jpg master, contain, ratio ${nat.toFixed(2)}`, hit && hit.src === `/img/authors/${n}.jpg` && hit.fit === 'contain' && Math.abs(hit.disp - nat) < 0.03, JSON.stringify(hit))
}

console.log('— article uses the same master —')
await page.goto('http://localhost:4299/article/intellect-lost-to-code', { waitUntil: 'networkidle' })
await page.waitForTimeout(800)
const art = await page.evaluate(() => [...document.querySelectorAll('main img')].some(i => (i.getAttribute('src') || '') === '/img/authors/munkashay-javed.jpg'))
ok('article shows the same master', art)

console.log('— no stale refs, no console errors —')
const stale = await page.evaluate(() => [...document.querySelectorAll('img')].some(i => (i.getAttribute('src') || '').includes('/img/authors/') && !(i.getAttribute('src') || '').endsWith('.jpg')))
ok('no non-jpg author references', !stale)
ok('zero console errors', errors.length === 0, errors.slice(0, 3).join(' | '))

await browser.close()
server.close()
console.log(`\nRESULT: ${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
