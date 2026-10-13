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
  await page.locator('button[aria-label^="Saved stories"]').click()
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
  for (const slug of ['their-voices-matter', '3-13', 'the-quiet-grief']) {
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
  pass('ending-quiet-grief', endings['the-quiet-grief'].hasSig && endings['the-quiet-grief'].scene?.includes('the-quiet-grief'), JSON.stringify(endings['the-quiet-grief']))

  // ---- THE QUIET GRIEF GALLERY, FOCUS TRAP & PROVENANCE ----
  await page.goto(BASE + '/article/the-quiet-grief', { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  const noAssetLeak = await page.evaluate(() => {
    const txt = document.body.textContent || ''
    return !txt.includes('/img/works/DeUZFPTCjPU-1.webp') && !txt.includes('pending source binary')
  })
  const plate1Btn = page.locator('button[aria-label*="Inspect Plate 01 of 05: Ballet shoes"]')
  const hasPlate1 = (await plate1Btn.count()) === 1
  if (hasPlate1) await plate1Btn.click()
  await page.waitForTimeout(300)
  const lightboxOpen = (await page.locator('[role="dialog"][aria-label*="The Quiet Grief"]').count()) === 1
  // Verify Tab / Shift+Tab stays trapped inside the lightbox dialog
  await page.keyboard.press('Shift+Tab')
  const shiftTabTrapped = await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))
  await page.keyboard.press('Tab')
  const tabTrapped = await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(250)
  const lightboxPlate2 = await page.evaluate(() => document.body.textContent.includes('Plate 02 / 05 — A camera'))
  await page.keyboard.press('Escape')
  await page.waitForTimeout(500)
  const lightboxClosed = (await page.locator('[role="dialog"][aria-label*="The Quiet Grief"]').count()) === 0
  const focusRestored = await page.evaluate(() =>
    document.activeElement?.getAttribute('aria-label')?.includes('Inspect Plate 01 of 05'),
  )
  const verbatimOk = await page.evaluate(() => {
    const txt = document.body.textContent || ''
    return (
      txt.includes('#verlysemedia #TheQuietGrief #LostPassions #ArtAndWords CreativeExpression') &&
      !txt.includes('-1 appreciations')
    )
  })
  pass(
    'quiet-grief-gallery-and-caption',
    hasPlate1 && noAssetLeak && lightboxOpen && shiftTabTrapped && tabTrapped && lightboxPlate2 && lightboxClosed && focusRestored && verbatimOk,
    `plate1=${hasPlate1}, noLeak=${noAssetLeak}, lightbox=${lightboxOpen}, trap=${shiftTabTrapped && tabTrapped}, plate2=${lightboxPlate2}, closed=${lightboxClosed}, focusRestored=${focusRestored}, verbatim=${verbatimOk}`,
  )

  // ---- SUBMIT & CONTACT ACCESSIBLE VALIDATION & WRITER PROFILE QUOTES ----
  await page.goto(BASE + '/submit', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Submit the piece' }).click()
  const submitA11y = await page.evaluate(() => {
    const name = document.querySelector('#sf-name')
    const alerts = document.querySelectorAll('[role="alert"]')
    return (
      name?.getAttribute('aria-invalid') === 'true' &&
      name?.getAttribute('aria-describedby') === 'sf-name-err' &&
      alerts.length === 1
    )
  })
  await page.goto(BASE + '/creator/alina-javed', { waitUntil: 'networkidle' })
  const creatorQuotesOk = await page.evaluate(() => {
    const txt = document.body.textContent || ''
    return !txt.includes('““') && !txt.includes('””')
  })
  pass('forms-and-profile-a11y', submitA11y && creatorQuotesOk, `submitA11y=${submitA11y}, creatorQuotesOk=${creatorQuotesOk}`)

  // ---- HIRING EXPERIENCE ("THE NEXT BYLINE") & TEAM ROSTER REMOVAL ----
  await page.goto(BASE + '/ambassadors', { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  const rosterAndHiring = await page.evaluate(() => {
    const txt = document.body.innerText || ''
    const exactHref = 'https://docs.google.com/forms/d/e/1FAIpQLScbXxbyw22YM4Mlid81RoyckzgwvpBC9h8siWff3hMp6tcBwg/viewform?usp=publish-editor'
    const cta = document.querySelector(`a[href="${exactHref}"]`)
    const noRemovedTeam = !/haiqa nafees|\bmanha\b/i.test(txt)
    const noPlaceholderLabels = !/crash zoom|35mm|track\s*0|folio\s*00/i.test(txt)
    const hasRoles = txt.includes('Researcher') && txt.includes('Palette Designer') && txt.includes('Content Writer')
    const hasHeadline = txt.includes('The next voice could be yours.')
    return {
      ctaPresent: !!cta,
      targetBlank: cta?.getAttribute('target') === '_blank',
      relSafe: (cta?.getAttribute('rel') || '').includes('noopener'),
      noRemovedTeam,
      noPlaceholderLabels,
      hasRoles,
      hasHeadline,
    }
  })
  pass(
    'hiring-marquee-and-roster-removal',
    rosterAndHiring.ctaPresent &&
      rosterAndHiring.targetBlank &&
      rosterAndHiring.relSafe &&
      rosterAndHiring.noRemovedTeam &&
      rosterAndHiring.noPlaceholderLabels &&
      rosterAndHiring.hasRoles &&
      rosterAndHiring.hasHeadline,
    JSON.stringify(rosterAndHiring),
  )

  // ---- 11-VIEWPORT MATRIX & 375PX MOBILE VIEWPORT CHECK ----
  const m375 = await browser.newContext({ viewport: { width: 375, height: 812 } })
  const p375 = await m375.newPage()
  const routes375 = ['/', '/articles', '/article/the-quiet-grief', '/room']
  let ok375 = true
  const details375 = []
  for (const r of routes375) {
    await p375.goto(BASE + r, { waitUntil: 'networkidle' })
    await p375.waitForTimeout(400)
    const m = await p375.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      iw: window.innerWidth,
      h1: !!document.querySelector('h1'),
    }))
    if (m.sw > m.iw + 1 || !m.h1) ok375 = false
    details375.push(`${r}:${m.sw}/${m.iw}`)
  }
  const vps11 = [
    [320, 720], [360, 800], [390, 844], [430, 932],
    [768, 1024], [834, 1194], [1024, 768], [1280, 800],
    [1366, 768], [1440, 900], [1920, 1080],
  ]
  await p375.goto(BASE + '/article/the-quiet-grief', { waitUntil: 'networkidle' })
  for (const [vw, vh] of vps11) {
    await p375.setViewportSize({ width: vw, height: vh })
    await p375.waitForTimeout(60)
    const sw = await p375.evaluate(() => document.documentElement.scrollWidth)
    if (sw > vw + 1) ok375 = false
  }
  pass('mobile-375px-no-overflow', ok375, details375.join(', ') + ' + 11 viewports clean')
  await m375.close()

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
