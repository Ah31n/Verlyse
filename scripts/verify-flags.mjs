/* eslint-disable no-console */
import { chromium } from '@playwright/test'
import * as fs from 'node:fs'
const BASE = 'http://127.0.0.1:5173'
const OUT = 'audit'
const results = {}

async function run() {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()

  // 1. Search Escape — wait until the dialog fully unmounts
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  await page.locator('button[aria-label="Search articles (Ctrl K)"]').click()
  await page.waitForTimeout(400)
  await page.locator('#publication-search').fill('3:13')
  await page.waitForTimeout(400)
  await page.keyboard.press('Escape')
  // wait for overlay to be gone (AnimatePresence)
  let closed = false
  for (let i = 0; i < 30; i++) {
    const stillOpen = await page.locator('[aria-label="Search articles"][role=dialog]').count()
    const input = await page.locator('#publication-search').count()
    if (stillOpen === 0 && input === 0) { closed = true; break }
    await page.waitForTimeout(100)
  }
  const focusReturned = await page.evaluate(() => document.activeElement?.getAttribute('aria-label')?.includes('Search') ?? false)
  results['search-escape-mount-unmount'] = { status: closed ? 'PASS' : 'FAIL', detail: `dialog unmounted=${closed}, focus on trigger=${focusReturned}` }

  // 2. ending-voices — scene is story-specific + fin. appears after settle
  await page.goto(BASE + '/article/their-voices-matter', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  const scene = await page.evaluate(() => {
    const el = document.querySelector('[data-ending]')
    return { dataEnding: el?.getAttribute('data-ending'), phase: el?.getAttribute('data-phase') }
  })
  // wait for the 6s fin. to appear
  await page.waitForTimeout(6500)
  const finPresent = await page.evaluate(() => document.body.textContent.includes('fin.'))
  const otherScene = await page.evaluate(() => document.querySelector('[data-ending]')?.getAttribute('data-ending'))
  results['ending-voices-scene'] = { status: scene.dataEnding === 'ending-their-voices-matter' && finPresent ? 'PASS' : 'FAIL', detail: `scene=${scene.dataEnding} phase=${scene.phase} fin(present after6s)=${finPresent}` }

  await browser.close()
  fs.writeFileSync(`${OUT}/verify-flags.json`, JSON.stringify(results, null, 2))
  for (const [k, v] of Object.entries(results)) console.log(`  [${v.status}] ${k}: ${v.detail}`)
}
run().catch((e) => { console.error(e); process.exit(1) })
