/* eslint-disable no-console */
import { chromium } from '@playwright/test'
import * as fs from 'node:fs'
import * as path from 'node:path'
const BASE = 'http://127.0.0.1:5173'
const OUT = path.resolve('audit/screenshots/final')

async function run() {
  const browser = await chromium.launch()
  for (const [name, vp] of Object.entries({ 'footer-desktop': { w: 1440, h: 900 }, 'footer-mobile': { w: 390, h: 844 } })) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } })
    const page = await ctx.newPage()
    await page.goto(BASE + '/', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1200)
    // scroll fully to the real bottom
    await page.evaluate(async () => { const se = document.scrollingElement; for (let y=0;y<se.scrollHeight;y+=500){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,60))} window.scrollTo(0,se.scrollHeight) })
    await page.waitForTimeout(800)
    const metrics = await page.evaluate(() => {
      const se = document.scrollingElement || document.documentElement
      const f = document.querySelector('footer') || document.querySelector('[role=contentinfo]')
      const fr = f ? f.getBoundingClientRect() : null
      const canvases = [...document.querySelectorAll('canvas')].filter((c) => { const r = c.getBoundingClientRect(); const vh = window.innerHeight; return r.top < vh && r.bottom > 0 })
      return {
        scrollHeight: se.scrollHeight,
        footerTop: fr ? Math.round(fr.top + window.scrollY) : null,
        footerBottom: fr ? Math.round(fr.bottom + window.scrollY) : null,
        footerAtBottom: fr ? Math.abs((fr.bottom + window.scrollY) - se.scrollHeight) <= 10 : false,
        footerOnScreen: fr ? fr.top < window.innerHeight && fr.bottom > 0 : false,
        footerBottomOnScreen: fr ? Math.round(fr.bottom) : null,
        visibleCanvasesOverFooter: canvases.length,
        footerTextReachable: fr ? window.scrollY + fr.top < se.scrollHeight : false,
      }
    })
    console.log(name, JSON.stringify(metrics))
    // screenshot the footer element region (bottom of viewport at true bottom)
    await ctx.close()
  }
  await browser.close()
}
run().catch((e) => { console.error(e); process.exit(1) })
