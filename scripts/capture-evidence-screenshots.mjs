#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import puppeteer from 'puppeteer-core'

const BASE_URL = process.env.TEST_URL || 'http://127.0.0.1:5173'
const SHOTS_DIR = 'audit/screenshots-evidence'

const TARGET_ROUTES = [
  { route: '/', name: '01-home-cover' },
  { route: '/articles', name: '02-articles-archive' },
  { route: '/article/their-voices-matter', name: '03-article-detail' },
  { route: '/categories/stories', name: '04-category-stories' },
  { route: '/creators', name: '05-creators-wall' },
  { route: '/creator/alina-javed', name: '06-creator-dossier' },
  { route: '/submit', name: '07-submit-desk' },
  { route: '/about', name: '08-about-colophon' },
  { route: '/community', name: '09-community-commons' },
  { route: '/contact', name: '10-contact-correspondence' },
  { route: '/room', name: '11-spatial-room' },
]

async function run() {
  await mkdir(SHOTS_DIR, { recursive: true })
  console.log(`Starting evidence screenshot capture against ${BASE_URL}...`)

  const browser = await puppeteer.launch({
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/tmp/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })

  const evidence = []

  for (const { route, name } of TARGET_ROUTES) {
    const url = `${BASE_URL}${route}`
    console.log(`Navigating to ${route}...`)
    await page.goto(url, { waitUntil: 'domcontentloaded' })

    // Click skip intro if visible
    try {
      const skipBtn = await page.$('button')
      const text = await page.evaluate(el => el?.innerText, skipBtn)
      if (text && text.includes('SKIP')) {
        await skipBtn.click()
      }
    } catch {}

    await new Promise((r) => setTimeout(r, 600))

    // Check StringTune attributes in DOM
    const stringTuneElements = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('[string], [data-string], [string-id]'))
      return els.map((el) => ({
        tag: el.tagName.toLowerCase(),
        string: el.getAttribute('string') || el.getAttribute('data-string'),
        stringId: el.getAttribute('string-id') || el.getAttribute('data-string-id'),
        hasInited: el.hasAttribute('string-inited'),
      }))
    })

    const shotPath = join(SHOTS_DIR, `${name}.png`)
    await page.screenshot({ path: shotPath })

    evidence.push({
      route,
      name,
      screenshot: shotPath,
      stringTuneCount: stringTuneElements.length,
      sampleElements: stringTuneElements.slice(0, 5),
    })

    console.log(`  ✓ Captured ${name}.png — found ${stringTuneElements.length} StringTune elements in DOM`)
  }

  await browser.close()

  await writeFile(
    join(SHOTS_DIR, 'evidence-summary.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), evidence }, null, 2)
  )

  console.log(`\nEvidence capture complete! All screenshots saved to ${SHOTS_DIR}/\n`)
}

run().catch((err) => {
  console.error('Evidence capture error:', err)
  process.exit(1)
})
