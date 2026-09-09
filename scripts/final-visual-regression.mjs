/* eslint-disable no-console */
import { chromium } from '@playwright/test'
import * as fs from 'node:fs'
import * as path from 'node:path'
const BASE = 'http://127.0.0.1:5173'
const OUT = path.resolve('audit/screenshots/final')

async function scrollFull(page, step = 400) {
  // scroll through the whole page so whileInView reveals fire, then back to a capture point
  await page.evaluate(async (step) => {
    const se = document.scrollingElement || document.documentElement
    for (let y = 0; y < se.scrollHeight; y += step) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 90)) }
    window.scrollTo(0, 0)
  }, step)
  await page.waitForTimeout(700)
}

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT, name + '.png'), fullPage: true })
  console.log('  shot', name)
}

async function run() {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch()
  const shots = [
    { route: '/', name: 'home', vp: { w: 1440, h: 900 } },
    { route: '/', name: 'home-tablet', vp: { w: 768, h: 1024 } },
    { route: '/', name: 'home-mobile', vp: { w: 390, h: 844 } },
    { route: '/articles', name: 'archive-desktop', vp: { w: 1440, h: 900 } },
    { route: '/articles', name: 'archive-mobile', vp: { w: 390, h: 844 } },
    { route: '/article/their-voices-matter', name: 'article-tvm-desktop', vp: { w: 1440, h: 900 } },
    { route: '/article/their-voices-matter', name: 'article-tvm-mobile', vp: { w: 390, h: 844 } },
    { route: '/article/3-13', name: 'article-313-desktop', vp: { w: 1440, h: 900 } },
    { route: '/article/3-13', name: 'article-313-mobile', vp: { w: 390, h: 844 } },
    { route: '/creators', name: 'creators-desktop', vp: { w: 1440, h: 900 } },
    { route: '/creators', name: 'creators-mobile', vp: { w: 390, h: 844 } },
  ]
  for (const s of shots) {
    const ctx = await browser.newContext({ viewport: { width: s.vp.w, height: s.vp.h } })
    const page = await ctx.newPage()
    await page.goto(BASE + s.route, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1200)
    await scrollFull(page)
    await shot(page, s.name)
    await ctx.close()
  }

  // Story endings + footer — scrolled to bottom
  for (const s of [{ route: '/article/their-voices-matter', name: 'ending-tvm', vp: { w: 1440, h: 900 } }, { route: '/article/3-13', name: 'ending-313', vp: { w: 1440, h: 900 } }]) {
    const ctx = await browser.newContext({ viewport: { width: s.vp.w, height: s.vp.h } })
    const page = await ctx.newPage()
    await page.goto(BASE + s.route, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1200)
    await page.locator('#ending').scrollIntoViewIfNeeded()
    await page.waitForTimeout(2600)
    await shot(page, s.name)
    await ctx.close()
  }
  // footer at true bottom
  for (const s of [{ route: '/', name: 'footer-desktop', vp: { w: 1440, h: 900 } }, { route: '/', name: 'footer-mobile', vp: { w: 390, h: 844 } }]) {
    const ctx = await browser.newContext({ viewport: { width: s.vp.w, height: s.vp.h } })
    const page = await ctx.newPage()
    await page.goto(BASE + s.route, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1200)
    await scrollFull(page)
    await page.evaluate(() => window.scrollTo(0, document.scrollingElement.scrollHeight))
    await page.waitForTimeout(400)
    // viewport crop at the bottom
    await page.screenshot({ path: path.join(OUT, s.name + '.png') })
    console.log('  shot', s.name)
    await ctx.close()
  }
  await browser.close()
  console.log('Done — final visual regression captured to', OUT)
}
run().catch((e) => { console.error(e); process.exit(1) })
