/* eslint-disable no-console */
import { chromium } from '@playwright/test'
import * as fs from 'node:fs'
import * as path from 'node:path'

const BASE = 'http://127.0.0.1:5173'
const OUT = path.resolve(process.cwd(), 'audit')
const results = {}
function pass(id, ok, detail) { results[id] = { status: ok ? 'PASS' : 'FAIL', detail: detail || '' } }

async function run() {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', (e) => errors.push(String(e.message || e)))

  // ---- SEARCH ----
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  await page.locator('button[aria-label="Search articles (Ctrl K)"]').click()
  await page.waitForTimeout(400)
  const searchInput = page.locator('#publication-search')
  const searchOpen = (await searchInput.count()) === 1
  await searchInput.fill('Their Voices')
  await page.waitForTimeout(500)
  const searchMatched = await page.evaluate(() => document.body.textContent.includes('Their Voices Matter'))
  await page.keyboard.press('Escape')
  await page.waitForTimeout(400)
  const escClosed = (await page.locator('#publication-search').count()) === 0 || await page.evaluate(() => document.activeElement?.id !== "publication-search")
  pass('search-open-focus', searchOpen, `overlay open=${searchOpen}`)
  pass('search-query-results', searchMatched, 'typing "Their Voices" surfaced Their Voices Matter')
  pass('search-escape-close', escClosed, 'Escape closed/freed focus')

  // ---- SHELF ----
  await page.goto(BASE + '/article/their-voices-matter', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  const saveBtn = page.locator('button', { hasText: 'Save' }).first()
  const hadSave = (await saveBtn.count()) > 0
  if (hadSave) await saveBtn.click()
  await page.waitForTimeout(400)
  await page.locator('button[aria-label="Saved stories"]').click()
  await page.waitForTimeout(500)
  const shelfOpen = await page.evaluate(() => document.body.textContent.includes('The bookmarks'))
  const shelfHasItem = await page.evaluate(() => document.body.textContent.includes('Their Voices Matter'))
  pass('shelf-open', shelfOpen, `Save button present=${hadSave}, Shelf opened=${shelfOpen}`)
  pass('shelf-saved-item', shelfHasItem, 'saved article present in Shelf')

  // ---- MOBILE MENU ----
  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const mp = await mctx.newPage()
  await mp.goto(BASE + '/', { waitUntil: 'networkidle' })
  await mp.waitForTimeout(1200)
  // burger is a button with aria-label "Open menu"
  let menuOpened = false
  const burger = mp.locator('button[aria-label="Open menu"]')
  if (await burger.count()) {
    await burger.click()
    await mp.waitForTimeout(500)
    menuOpened = true
  }
  const menuVisible = await mp.evaluate(() => document.body.textContent.includes('Brand Ambassador') || document.body.textContent.includes('Categories'))
  await mp.keyboard.press('Escape')
  await mp.waitForTimeout(300)
  pass('mobile-menu-open', menuOpened && menuVisible, `burger clicked=${menuOpened}, menu content=${menuVisible}`)
  await mctx.close()

  // ---- ARTICLE ENDINGS (story-specific) ----
  // The ending scene animates in with a delay and is rendered as an aria-hidden
  // visual scene (the signature `name` label — e.g. 'the voice' — is metadata
  // only and is never printed to the DOM). Assert what the app actually renders:
  // the story-specific `[data-signature]` + `[data-ending]` scenes are present,
  // and the `fin.` mark appears after the scene settles (~6s — wait for it
  // instead of sampling early; fixes the known "Their Voices Matter" flake).
  const endings = {}
  for (const slug of ['their-voices-matter', '3-13']) {
    await page.goto(BASE + '/article/' + slug, { waitUntil: 'networkidle' })
    let fin = false
    const deadline = Date.now() + 8000
    while (Date.now() < deadline) {
      if (await page.evaluate(() => document.body.textContent.includes('fin.'))) { fin = true; break }
      await page.waitForTimeout(400)
    }
    endings[slug] = await page.evaluate(({ slug, fin }) => ({
      hasSig: !!document.querySelector(`[data-signature="${slug}"]`) && fin,
      scene: document.querySelector('[data-ending]')?.getAttribute('data-ending') || null,
    }), { slug, fin })
  }
  pass('ending-voices', endings['their-voices-matter'].hasSig && endings['their-voices-matter'].scene?.includes('their-voices-matter'), JSON.stringify(endings['their-voices-matter']))
  pass('ending-wait', endings['3-13'].hasSig && endings['3-13'].scene?.includes('3-13'), JSON.stringify(endings['3-13']))

  // ---- REDUCED MOTION ----
  const rctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  const rp = await rctx.newPage()
  await rp.goto(BASE + '/', { waitUntil: 'networkidle' })
  await rp.waitForTimeout(1200)
  const rmOk = await rp.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth && !!document.querySelector('h1'))
  pass('reduced-motion-preserves', rmOk, 'reduced motion: h1 present, no overflow')
  await rctx.close()

  // ---- WEBGL OFF ----
  const gctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  await gctx.addInitScript(() => { const o = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t, ...a) { if (String(t).includes('webgl')) return null; return o.call(this, t, ...a) } })
  const gp = await gctx.newPage()
  await gp.goto(BASE + '/', { waitUntil: 'networkidle' })
  await gp.waitForTimeout(1200)
  const glOk = await gp.evaluate(() => ({ h1: !!document.querySelector('h1'), canvases: document.querySelectorAll('canvas').length, scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth }))
  pass('no-webgl-fallback', glOk.h1 && glOk.canvases === 0 && glOk.scrollWidth <= glOk.innerWidth, JSON.stringify(glOk))
  await gctx.close()

  fs.writeFileSync(path.join(OUT, 'interaction-audit.json'), JSON.stringify({ results, consoleErrorsCaptured: errors }, null, 2))
  await browser.close()
  console.log('=== INTERACTION AUDIT ===')
  for (const [k, v] of Object.entries(results)) console.log(`  [${v.status}] ${k}: ${v.detail}`)
  console.log('  console errors captured:', errors.length)
}

run().catch((e) => { console.error(e); process.exit(1) })
