/* eslint-disable no-console */
import { chromium } from '@playwright/test'
import * as fs from 'node:fs'
import * as path from 'node:path'

/** Verify the spatial layer falls back cleanly when WebGL is unavailable. */
const BASE = 'http://127.0.0.1:5173'
const OUT = path.resolve(process.cwd(), 'docs/verlyse')

async function run() {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  // emulate no WebGL
  await ctx.addInitScript(() => {
    const orig = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (type, ...a) {
      if (String(type).includes('webgl')) return null
      return orig.call(this, type, ...a)
    }
  })
  const page = await ctx.newPage()
  const records = []
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) records.push({ kind: 'console', type: m.type(), text: m.text() }) })
  page.on('pageerror', (e) => records.push({ kind: 'pageerror', text: String(e.message || e) }))
  page.on('requestfailed', (r) => records.push({ kind: 'requestfailed', url: r.url(), error: r.failure()?.errorText }))

  const data = {}
  for (const route of ['/', '/article/their-voices-matter', '/article/3-13']) {
    await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 45000 })
    await page.waitForTimeout(1500)
    data[route] = await page.evaluate(() => {
      const se = document.scrollingElement || document.documentElement
      const canvases = [...document.querySelectorAll('canvas')]
      return {
        scrollHeight: se.scrollHeight,
        canvasCount: canvases.length,
        overflowX: se.scrollWidth > window.innerWidth,
        h1: document.querySelector('h1')?.textContent.trim().slice(0, 90),
      }
    })
  }
  fs.writeFileSync(path.join(OUT, 'webgl-off.json'), JSON.stringify({ routes: data, consoleErrors: records.length, records }, null, 2))
  await browser.close()
  console.log('WebGL-off results:', JSON.stringify(data, null, 2))
  console.log('Console/page errors with WebGL off:', records.length)
}

run().catch((e) => { console.error(e); process.exit(1) })
