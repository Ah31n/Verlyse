/* eslint-disable no-console */
import { chromium } from '@playwright/test'
import * as fs from 'node:fs'
const BASE = 'http://127.0.0.1:5173'
const OUT = 'audit'

async function run() {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  const results = {}

  async function measure(label, route) {
    await page.goto(BASE + route, { waitUntil: 'load' })
    // inject performance observers before/at load
    await page.evaluate(() => {
      window.__perf = { lcp: 0, cls: 0, longtasks: 0, fcp: 0 }
      try {
        new PerformanceObserver((list) => { for (const e of list.getEntries()) if (e.entryType === 'largest-contentful-paint') window.__perf.lcp = Math.round(e.startTime) }).observe({ type: 'largest-contentful-paint', buffered: true })
        new PerformanceObserver((list) => { let cum = 0; for (const e of list.getEntries()) if (e.entryType === 'layout-shift') cum += e.value; window.__perf.cls = Math.round(cum * 1000) / 1000 }).observe({ type: 'layout-shift', buffered: true })
        new PerformanceObserver((list) => { for (const e of list.getEntries()) window.__perf.fcp = Math.round(e.startTime) }).observe({ type: 'paint', buffered: true })
      } catch (e) {}
      // long tasks from buffered PerformanceObserver
      try { new PerformanceObserver((list) => { window.__perf.longtasks = list.getEntries().length }).observe({ type: 'longtask', buffered: true }) } catch (e) {}
    })
    await page.waitForTimeout(4000)
    const perf = await page.evaluate(() => window.__perf || {})
    const res = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0]
      const entries = performance.getEntriesByType('resource')
      const threeBytes = entries.filter((r) => r.name.includes('three') || r.name.includes('@react-three')).reduce((a, r) => a + (r.transferSize || 0), 0)
      const jsTotal = entries.filter((r) => r.initiatorType === 'script').reduce((a, r) => a + (r.transferSize || 0), 0)
      const imgTotal = entries.filter((r) => r.initiatorType === 'img').reduce((a, r) => a + (r.transferSize || 0), 0)
      return { domContentLoaded: nav ? Math.round(nav.domContentLoadedEventEnd) : null, loadEvent: nav ? Math.round(nav.loadEventEnd) : null, transferKb: Math.round(nav.transferSize / 1024) || null, threeBytes, jsTotal, imgTotal }
    })
    results[label] = { route, ...perf, ...res }
  }

  await measure('home', '/')
  await measure('home_after_three_load', '/') // ensure three chunk requested
  await measure('article_313', '/article/3-13')

  // check whether the three chunk actually loads separately / lazily
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  const resources = await page.evaluate(() => performance.getEntriesByType('resource').map((r) => ({ name: r.name.split('/').pop(), kb: Math.round((r.transferSize || 0) / 1024) })))
  const threeChunk = resources.find((r) => r.name.startsWith('three-'))
  results.threeChunk = threeChunk || 'NOT requested on initial load (on-demand)'

  fs.writeFileSync(`${OUT}/performance-audit.json`, JSON.stringify(results, null, 2))
  await browser.close()
  console.log('=== PERFORMANCE AUDIT ===')
  console.log(JSON.stringify(results, null, 2))
}
run().catch((e) => { console.error(e); process.exit(1) })
