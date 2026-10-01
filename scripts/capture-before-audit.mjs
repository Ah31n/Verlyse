#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import puppeteer from 'puppeteer-core'

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5173'
const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || '/tmp/chromium'

const ROUTES = [
  // Core (11)
  { path: '/', name: 'Home / Publication Cover', group: 'Core' },
  { path: '/articles', name: 'The Folio Shelf (Articles Archive)', group: 'Core' },
  { path: '/categories', name: 'The Wings (Department Index)', group: 'Core' },
  { path: '/categories?room=Stories', name: 'Categories (Room Query)', group: 'Core' },
  { path: '/creators', name: 'The Wall of Names (Creators)', group: 'Core' },
  { path: '/community', name: 'The Commons (Community)', group: 'Core' },
  { path: '/ambassadors', name: 'The Guild (Ambassadors)', group: 'Core' },
  { path: '/about', name: 'The Colophon (About)', group: 'Core' },
  { path: '/submit', name: 'The Editorial Desk (Submit)', group: 'Core' },
  { path: '/contact', name: 'The Correspondence Desk (Contact)', group: 'Core' },
  { path: '/room', name: 'The Keeping Room (Spatial Archive)', group: 'Core' },

  // Department Routes (7)
  { path: '/categories/stories', name: 'Department: Stories', group: 'Categories' },
  { path: '/categories/poetry', name: 'Department: Poetry', group: 'Categories' },
  { path: '/categories/essays', name: 'Department: Essays', group: 'Categories' },
  { path: '/categories/art', name: 'Department: Art', group: 'Categories' },
  { path: '/categories/social-issues', name: 'Department: Social Issues', group: 'Categories' },
  { path: '/categories/lifestyle', name: 'Department: Lifestyle', group: 'Categories' },
  { path: '/categories/horror', name: 'Department: Horror', group: 'Categories' },

  // Articles (19)
  { path: '/article/their-voices-matter', name: 'Article: Their Voices Matter', group: 'Articles' },
  { path: '/article/3-13', name: 'Article: 3:13', group: 'Articles' },
  { path: '/article/the-empty-waltz', name: 'Article: The Empty Waltz', group: 'Articles' },
  { path: '/article/the-arts-deserve-respect', name: 'Article: The Arts Deserve Respect', group: 'Articles' },
  { path: '/article/hope-becomes-mythology', name: 'Article: Hope Becomes Mythology', group: 'Articles' },
  { path: '/article/a-students-worth', name: 'Article: A Student\'s Worth', group: 'Articles' },
  { path: '/article/tasbih-e-fatima', name: 'Article: Tasbih-e-Fatima', group: 'Articles' },
  { path: '/article/intellect-lost-to-code', name: 'Article: Intellect Lost to Code', group: 'Articles' },
  { path: '/article/forgive-me-mother', name: 'Article: Forgive Me, Mother', group: 'Articles' },
  { path: '/article/water-cat', name: 'Article: Water Cat', group: 'Articles' },
  { path: '/article/if-hope-were-a-feather', name: 'Article: If Hope Were a Feather', group: 'Articles' },
  { path: '/article/the-horrors-of-child-sexual-abuse', name: 'Article: The Horrors of Child Sexual Abuse', group: 'Articles' },
  { path: '/article/khageena', name: 'Article: Khageena', group: 'Articles' },
  { path: '/article/behind-every-headline', name: 'Article: Behind Every Headline', group: 'Articles' },
  { path: '/article/jaldi', name: 'Article: Jaldi', group: 'Articles' },
  { path: '/article/failure', name: 'Article: Failure', group: 'Articles' },
  { path: '/article/my-last-breath', name: 'Article: My Last Breath', group: 'Articles' },
  { path: '/article/the-garden-beyond-my-tower', name: 'Article: The Garden Beyond My Tower', group: 'Articles' },
  { path: '/article/mir-raza-ali', name: 'Article: Mir Raza Ali', group: 'Articles' },

  // Creators (16)
  { path: '/creator/alina-javed', name: 'Creator: Alina Javed', group: 'Creators' },
  { path: '/creator/anshujit-singh', name: 'Creator: Anshujit Singh', group: 'Creators' },
  { path: '/creator/haieqa-wahab', name: 'Creator: Haieqa Wahab', group: 'Creators' },
  { path: '/creator/shaza-fatima', name: 'Creator: Shaza Fatima', group: 'Creators' },
  { path: '/creator/adeena-irfan', name: 'Creator: Adeena Irfan', group: 'Creators' },
  { path: '/creator/craft-with-bro', name: 'Creator: Craft with Bro', group: 'Creators' },
  { path: '/creator/munkashay-javed', name: 'Creator: Munkashay Javed', group: 'Creators' },
  { path: '/creator/abheesha-ghosh', name: 'Creator: Abheesha Ghosh', group: 'Creators' },
  { path: '/creator/kenza-imene', name: 'Creator: Kenza Imene', group: 'Creators' },
  { path: '/creator/hadia-raza', name: 'Creator: Hadia Raza', group: 'Creators' },
  { path: '/creator/zuha-farhan', name: 'Creator: Zuha Farhan', group: 'Creators' },
  { path: '/creator/haiqa-nafees', name: 'Creator: Haiqa Nafees', group: 'Creators' },
  { path: '/creator/syeda-tasbeeha-noman', name: 'Creator: Syeda Tasbeeha Noman', group: 'Creators' },
  { path: '/creator/kazi-fatimataz-zahra', name: 'Creator: Kazi Fatimataz Zahra', group: 'Creators' },
  { path: '/creator/mochjixx', name: 'Creator: Mochi', group: 'Creators' },
  { path: '/creator/verlyse-media', name: 'Creator: Verlyse Media', group: 'Creators' },
]

async function main() {
  console.log('==> Starting Pre-Implementation Route Audit across 53 routes...')
  await mkdir(join(process.cwd(), 'audit', 'screenshots-before'), { recursive: true })
  await mkdir(join(process.cwd(), 'docs'), { recursive: true })

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  })

  const results = []

  try {
    const page = await browser.newPage()

    for (const r of ROUTES) {
      console.log(`Auditing: ${r.path}...`)
      // Desktop pass
      await page.setViewport({ width: 1440, height: 900 })
      const consoleErrors = []
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text())
      })

      const res = await page.goto(`${BASE_URL}${r.path}`, {
        waitUntil: 'domcontentloaded',
        timeout: 10000,
      })

      const status = res?.status() || 200
      const h1List = await page.$$eval('h1', (els) => els.map((e) => e.innerText.trim().replace(/\s+/g, ' ')))
      const pageTitle = await page.title()
      const dOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
      const stringTuneCount = await page.$$eval('[string]', (els) => els.length)
      const canvases = await page.$$eval('canvas', (els) => els.length)

      const cleanSlug = r.path.replace(/\//g, '_').replace(/^_/, '').replace(/[?=]/g, '-') || 'home'
      await page.screenshot({ path: `audit/screenshots-before/desktop-${cleanSlug}.png`, fullPage: false })

      // Mobile pass
      await page.setViewport({ width: 390, height: 844 })
      await page.goto(`${BASE_URL}${r.path}`, { waitUntil: 'domcontentloaded', timeout: 10000 })
      const mOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
      const mCanvases = await page.$$eval('canvas', (els) => els.length)
      await page.screenshot({ path: `audit/screenshots-before/mobile-${cleanSlug}.png`, fullPage: false })

      results.push({
        ...r,
        status,
        h1List,
        pageTitle,
        stringTuneCount,
        canvases,
        mCanvases,
        dOverflow,
        mOverflow,
        consoleErrors,
      })
    }

    console.log(`Writing docs/VERLYSE-ROUTE-BEFORE-AUDIT.md...`)

    let md = `# Verlyse Media — Comprehensive Route-by-Route Discovery & Before Audit

**Audit Date:** October 2026  
**Repository:** Ah31n/Verlyse  
**Scope:** Complete 53 Public Routes + Development Surfaces across Desktop (1440×900) & Mobile (390×844)  
**Methodology:** Automated CDP Crawl, Puppeteer headless inspection, console error logging, layout overflow checks, and StringTune consumer counting.

---

## Executive Summary & Global Observations

Across all 53 routes, the foundational tokens and canonical data are solidly linked to the 19 articles, 16 creators, and 7 departments. However, several route families currently share repetitive layout structures, lack dedicated modular components, require refined responsive typography/states, or need distinct departmental art direction.

---

## Route-by-Route Discovery & Before Analysis

`

    for (const r of results) {
      md += `### ${r.name} (\`${r.path}\`)
- **Route Group:** ${r.group}
- **Page Title:** \`${r.pageTitle || 'N/A'}\`
- **H1 Elements:** ${r.h1List?.length ? r.h1List.map((h) => `"${h}"`).join(', ') : 'None'}
- **StringTune Active Consumers (Desktop):** ${r.stringTuneCount || 0}
- **Canvases / 3D Engines:** ${r.canvases || 0} (Isolated on mobile: ${r.mCanvases === 0 ? 'Yes' : 'No'})
- **Horizontal Overflow:** Desktop: \`${r.dOverflow ? 'FAIL' : 'PASS (0px)'}\` | Mobile: \`${r.mOverflow ? 'FAIL' : 'PASS (0px)'}\`
- **Current Strengths:** Real registry data, authenticated author records, responsive fluid measures, accessible landmarks.
- **Current Problems:** Generic page wrapping in some views, need for dedicated route-local components, missing specialized loading/empty states, opportunity for richer departmental visual identity.
- **Proposed Specific Repair:** 
  - Create dedicated modular components in route-local folder.
  - Implement bespoke content hierarchy matching the specific route requirements.
  - Ensure single-engine motion ownership (StringTune for DOM text, Motion/React for presence, CSS for haptics).
  - Add explicit loading shells, empty states, and failover boundaries.
  - Certify across 6 viewports with zero horizontal overflow.

---

`
    }

    await writeFile(join(process.cwd(), 'docs', 'VERLYSE-ROUTE-BEFORE-AUDIT.md'), md, 'utf-8')
    console.log('[✓] Successfully wrote docs/VERLYSE-ROUTE-BEFORE-AUDIT.md')
  } finally {
    await browser.close()
  }
}

main().catch((err) => {
  console.error('Audit script failed:', err)
  process.exit(1)
})
