// Phase 31B — capture current implementation at all viewports + interaction states.
import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'

const BASE = 'http://localhost:5173'
const OUT = path.resolve('audit/shots/phase31b')
fs.mkdirSync(OUT, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--use-gl=swiftshader'] })

async function shot(route, name, vw, vh, opts = {}) {
  const page = await browser.newPage()
  await page.setViewport({ width: vw, height: vh })
  if (opts.reduced) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  const errs = []
  page.on('pageerror', (e) => errs.push(String(e).slice(0, 100)))
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 100)) })
  await page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await sleep(opts.settle ?? 6000)
  if (opts.scrollY) await page.evaluate((y) => window.scrollTo(0, y), opts.scrollY)
  await sleep(1200)
  await page.screenshot({ path: path.join(OUT, name) })
  const meta = await page.evaluate(() => ({
    ox: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    h1: document.querySelectorAll('h1').length,
    h1text: document.querySelector('h1')?.textContent.trim().slice(0, 60) ?? null,
    sh: document.documentElement.scrollHeight,
    errs: [],
  }))
  meta.errs = errs
  await page.close()
  return meta
}

const results = {}
results['entrance-1440'] = await shot('/', 'entrance-1440.png', 1440, 900)
results['entrance-768'] = await shot('/', 'entrance-768.png', 768, 1024)
results['entrance-390'] = await shot('/', 'entrance-390.png', 390, 844)
results['entrance-reduced'] = await shot('/', 'entrance-reduced.png', 1440, 900, { reduced: true })
results['archive-1440'] = await shot('/articles', 'archive-1440.png', 1440, 900)
results['archive-768'] = await shot('/articles', 'archive-768.png', 768, 1024)
results['archive-390'] = await shot('/articles', 'archive-390.png', 390, 844)
results['archive-reduced'] = await shot('/articles', 'archive-reduced.png', 1440, 900, { reduced: true })
results['wings-1440'] = await shot('/categories', 'wings-1440.png', 1440, 900)
results['wings-768'] = await shot('/categories', 'wings-768.png', 768, 1024)
results['wings-390'] = await shot('/categories', 'wings-390.png', 390, 844)
results['wings-reduced'] = await shot('/categories', 'wings-reduced.png', 1440, 900, { reduced: true })

// interaction states
const p = await browser.newPage()
await p.setViewport({ width: 1440, height: 900 })
await p.goto(BASE + '/articles', { waitUntil: 'domcontentloaded', timeout: 45000 })
await sleep(5000)
await p.focus('#folio-3')
await sleep(900)
await p.screenshot({ path: path.join(OUT, 'archive-selected.png') })
results['archive-selected'] = await p.evaluate(() => ({ sel: document.activeElement?.getAttribute('aria-label') }))
await p.close()

const p2 = await browser.newPage()
await p2.setViewport({ width: 1440, height: 900 })
await p2.goto(BASE + '/categories?room=Poetry', { waitUntil: 'domcontentloaded', timeout: 45000 })
await sleep(5000)
await p2.screenshot({ path: path.join(OUT, 'wings-selected.png') })
results['wings-selected'] = await p2.evaluate(() => ({ sel: document.querySelector('[aria-pressed="true"]')?.textContent.trim() ?? null }))
await p2.close()

fs.writeFileSync(path.join(OUT, 'capture-meta.json'), JSON.stringify(results, null, 1))
console.log('captured', Object.keys(results).length, 'states')
for (const [k, v] of Object.entries(results)) console.log(`  ${k}: ox=${v.ox} h1=${v.h1} errs=${(v.errs || []).length}`)
await browser.close()
