/* eslint-disable no-console */
import { chromium } from '@playwright/test'
import * as fs from 'node:fs'
const BASE = 'http://127.0.0.1:5173'
const results = {}
function pass(id, ok, detail) { results[id] = { status: ok ? 'PASS' : 'FAIL', detail } }

async function run() {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  const errs = []
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()) })
  page.on('pageerror', (e) => errs.push(String(e.message || e)))

  // Homepage selector exists with the required heading + 4 options
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  const hasHeading = await page.evaluate(() => document.body.textContent.includes('Read a plate. Shift the atmosphere.'))
  const optionCount = await page.evaluate(() => {
    const tabs = document.querySelectorAll('[role=tab]')
    return tabs.length
  })
  const optionTitles = await page.evaluate(() => [...document.querySelectorAll('[role=tab]')].map((t) => t.textContent))
  pass('selector-heading', hasHeading, 'heading present')
  pass('selector-4-options', optionCount === 4, `tabs=${optionCount}`)
  pass('selector-options-content', optionTitles.some((t) => t.includes('Their Voices Matter')) && optionTitles.some((t) => t.includes('3:13')), optionTitles.join(' | ').slice(0, 140))

  // Selecting a plate updates aria-selected (state sync)
  const tabs = page.locator('[role=tab]')
  await tabs.nth(1).click()
  await page.waitForTimeout(600)
  const selectedStates = await page.evaluate(() => [...document.querySelectorAll('[role=tab]')].map((t) => t.getAttribute('aria-selected')))
  pass('selector-selection-sync', selectedStates[1] === 'true', `aria-selected=${JSON.stringify(selectedStates)}`)

  // StoryEnding3D sceneKind differs across two articles
  const kinds = {}
  for (const slug of ['their-voices-matter', '3-13']) {
    await page.goto(BASE + '/article/' + slug, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1200)
    kinds[slug] = await page.evaluate(() => document.querySelector('[data-ending]')?.getAttribute('data-scene-kind'))
  }
  pass('scene-kind-distinct', kinds['their-voices-matter'] === 'voices' && kinds['3-13'] === 'clock', JSON.stringify(kinds))

  fs.writeFileSync('audit/verify-spatial.json', JSON.stringify({ results, consoleErrors: errs }, null, 2))
  await browser.close()
  console.log('=== SPATIAL VERIFY ===')
  for (const [k, v] of Object.entries(results)) console.log(`  [${v.status}] ${k}: ${v.detail}`)
  console.log('  console errors:', errs.length)
}
run().catch((e) => { console.error(e); process.exit(1) })
