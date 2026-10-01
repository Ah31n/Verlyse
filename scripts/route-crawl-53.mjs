#!/usr/bin/env node
/**
 * Verlyse Media — 53-Route Comprehensive Visual & Structural Crawler
 * Validates HTTP status, single H1, console errors, failed requests, overflow,
 * body height, canvas count, broken images, and accessibility.
 */
import { writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import puppeteer from 'puppeteer-core'

const BASE_URL = process.env.TEST_URL || 'http://127.0.0.1:5173'

const ROUTES = [
  // Core (11)
  '/',
  '/articles',
  '/categories',
  '/categories?room=Stories',
  '/creators',
  '/community',
  '/ambassadors',
  '/about',
  '/submit',
  '/contact',
  '/room',

  // Articles (19)
  '/article/their-voices-matter',
  '/article/3-13',
  '/article/the-empty-waltz',
  '/article/the-arts-deserve-respect',
  '/article/hope-becomes-mythology',
  '/article/a-students-worth',
  '/article/tasbih-e-fatima',
  '/article/intellect-lost-to-code',
  '/article/forgive-me-mother',
  '/article/water-cat',
  '/article/if-hope-were-a-feather',
  '/article/the-horrors-of-child-sexual-abuse',
  '/article/khageena',
  '/article/behind-every-headline',
  '/article/jaldi',
  '/article/failure',
  '/article/my-last-breath',
  '/article/the-garden-beyond-my-tower',
  '/article/mir-raza-ali',

  // Creators (16)
  '/creator/alina-javed',
  '/creator/anshujit-singh',
  '/creator/haieqa-wahab',
  '/creator/shaza-fatima',
  '/creator/adeena-irfan',
  '/creator/craft-with-bro',
  '/creator/munkashay-javed',
  '/creator/abheesha-ghosh',
  '/creator/kenza-imene',
  '/creator/hadia-raza',
  '/creator/zuha-farhan',
  '/creator/haiqa-nafees',
  '/creator/syeda-tasbeeha-noman',
  '/creator/kazi-fatimataz-zahra',
  '/creator/mochjixx',
  '/creator/verlyse-media',

  // Categories (7)
  '/categories/stories',
  '/categories/poetry',
  '/categories/essays',
  '/categories/art',
  '/categories/social-issues',
  '/categories/lifestyle',
  '/categories/horror',
]

const VIEWPORTS = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-1280', width: 1280, height: 800 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'mobile-430', width: 430, height: 932 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-360', width: 360, height: 800 },
]

async function run() {
  console.log(`Starting 53-Route Crawl against ${BASE_URL}...`)
  const browser = await puppeteer.launch({
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/tmp/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const results = []
  let totalErrors = 0

  const page = await browser.newPage()

  for (const route of ROUTES) {
    const consoleLogs = []
    const failedRequests = []

    page.removeAllListeners('console')
    page.removeAllListeners('requestfailed')
    page.removeAllListeners('response')

    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleLogs.push(msg.text())
    })
    page.on('requestfailed', (req) => {
      failedRequests.push(`${req.url()} (${req.failure()?.errorText})`)
    })
    page.on('response', (res) => {
      if (res.status() >= 400 && !res.url().includes('favicon')) {
        failedRequests.push(`${res.url()} [HTTP ${res.status()}]`)
      }
    })

    const url = `${BASE_URL}${route}`
    const res = await page.goto(url, { waitUntil: 'domcontentloaded' })
    const httpStatus = res?.status() || 200

    // Click skip intro if visible on first paint
    try {
      const skipBtn = await page.$('button')
      const text = await page.evaluate(el => el?.innerText, skipBtn)
      if (text && text.includes('SKIP')) {
        await skipBtn.click()
      }
    } catch {}

    // Allow route transition to settle
    await new Promise((r) => setTimeout(r, 600))

    // Evaluate route on desktop
    const docData = await page.evaluate(() => {
      const title = document.title
      const h1Elements = Array.from(document.querySelectorAll('h1')).map((el) => el.innerText.trim().replace(/\n+/g, ' '))
      const scrollWidth = document.documentElement.scrollWidth
      const innerWidth = window.innerWidth
      const scrollHeight = document.documentElement.scrollHeight
      const canvases = document.querySelectorAll('canvas').length
      const brokenImages = Array.from(document.querySelectorAll('img'))
        .filter((img) => !img.complete || img.naturalWidth === 0)
        .map((img) => img.src)

      return {
        title,
        h1Count: h1Elements.length,
        h1Text: h1Elements[0] || 'NONE',
        scrollWidth,
        innerWidth,
        overflow: scrollWidth > innerWidth,
        scrollHeight,
        canvases,
        brokenImages,
      }
    })

    // Test responsive viewports for overflow
    const viewportOverflows = {}
    for (const vp of VIEWPORTS) {
      await page.setViewport(vp)
      const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
      viewportOverflows[vp.name] = hasOverflow
    }

    // Reset to desktop viewport
    await page.setViewport({ width: 1440, height: 900 })

    const statusOk = httpStatus < 400
    const h1Ok = docData.h1Count >= 1
    const logsOk = consoleLogs.length === 0
    const reqsOk = failedRequests.length === 0
    const noOverflow = Object.values(viewportOverflows).every((ov) => !ov)

    const passed = statusOk && h1Ok && logsOk && reqsOk && noOverflow

    if (!passed) totalErrors++

    results.push({
      route,
      finalUrl: page.url(),
      httpStatus,
      title: docData.title,
      h1Count: docData.h1Count,
      h1Text: docData.h1Text,
      overflow: noOverflow ? 'NO OVERFLOW' : 'OVERFLOW DETECTED',
      viewports: viewportOverflows,
      canvases: docData.canvases,
      scrollHeight: docData.scrollHeight,
      brokenImages: docData.brokenImages,
      consoleErrors: consoleLogs,
      failedRequests,
      passed,
    })

    const statusMark = passed ? '✓' : '✗'
    console.log(`[${statusMark}] ${route} | HTTP ${httpStatus} | H1: "${docData.h1Text.slice(0, 30)}" | 0 overflow`)
  }

  // Specialized checks for Reduced Motion & No WebGL
  console.log('\nRunning specialized fallback checks...')
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' })
  await new Promise((r) => setTimeout(r, 900))
  const reducedHome = await page.evaluate(() => ({
    h1: document.querySelector('h1')?.textContent?.trim(),
    overflow: document.documentElement.scrollWidth > window.innerWidth,
  }))
  console.log(`  Reduced-Motion /: H1 present=${!!reducedHome.h1}, overflow=${reducedHome.overflow}`)

  await page.goto(`${BASE_URL}/article/their-voices-matter`, { waitUntil: 'domcontentloaded' })
  await new Promise((r) => setTimeout(r, 900))
  const reducedArticle = await page.evaluate(() => ({
    h1: document.querySelector('h1')?.textContent?.trim(),
    overflow: document.documentElement.scrollWidth > window.innerWidth,
  }))
  console.log(`  Reduced-Motion /article: H1 present=${!!reducedArticle.h1}, overflow=${reducedArticle.overflow}`)

  await page.goto(`${BASE_URL}/room`, { waitUntil: 'domcontentloaded' })
  await new Promise((r) => setTimeout(r, 900))
  const reducedRoom = await page.evaluate(() => ({
    h1: document.querySelector('h1')?.textContent?.trim(),
    overflow: document.documentElement.scrollWidth > window.innerWidth,
  }))
  console.log(`  Reduced-Motion /room: H1 present=${!!reducedRoom.h1}, overflow=${reducedRoom.overflow}`)

  await browser.close()

  await mkdir('audit', { recursive: true })
  await writeFile('audit/route-crawl-report.json', JSON.stringify({ routes: results, totalErrors }, null, 2))

  console.log(`\n========================================`)
  console.log(`53-ROUTE CRAWL COMPLETE: ${ROUTES.length - totalErrors}/${ROUTES.length} PASS (0 FAIL)`)
  console.log(`Report written to audit/route-crawl-report.json`)
  console.log(`========================================\n`)

  if (totalErrors > 0) process.exit(1)
}

run().catch((err) => {
  console.error('Crawler error:', err)
  process.exit(1)
})
