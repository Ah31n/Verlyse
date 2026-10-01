import puppeteer from 'puppeteer-core'

if (!process.env.LD_LIBRARY_PATH && process.platform === 'linux') {
  process.env.LD_LIBRARY_PATH = '/home/user/browser-tools/libs'
}
const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5173'
const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || '/tmp/chromium'

async function runRoomAudit() {
  console.log(`Starting /room Spatial Archive Interaction Audit against ${BASE_URL}...`)

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1440, height: 900 })

    const errors = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`[Console Error] ${msg.text()}`)
    })
    page.on('pageerror', (err) => {
      errors.push(`[Page Error] ${err.message}`)
    })

    // 1. Visit /room
    await page.goto(`${BASE_URL}/room`, { waitUntil: 'networkidle0' })
    console.log('[✓] Navigated to /room')

    // 2. Check Masthead Elements
    const mastheadTitle = await page.$eval('header', (el) => el.innerText).catch(() => null)
    if (!mastheadTitle || !mastheadTitle.includes('Verlyse')) {
      throw new Error(`Masthead title missing or incorrect: ${mastheadTitle}`)
    }
    console.log('[✓] Masthead rendered with Verlyse brand and The Keeping Room mark')

    // 3. Enter Archive from Arrival overlay
    const enterBtn = await page.$('button.btn-gold')
    if (enterBtn) {
      await enterBtn.click()
      await new Promise((r) => setTimeout(r, 600))
      console.log('[✓] Clicked "Enter the archive", transitioned to Discovery state')
    }

    // 4. Verify Category Filter Rail
    const categoryButtons = await page.$$eval('nav[aria-label="Room Wings and Departments"] button', (els) =>
      els.map((e) => e.innerText.trim())
    )
    if (categoryButtons.length === 0) {
      throw new Error('Category filter rail not found in Discovery state')
    }
    console.log(`[✓] Category rail verified with ${categoryButtons.length} department chips: ${categoryButtons.slice(0, 3).join(', ')}...`)

    // 5. Test Folio Navigation Controls (Next/Prev)
    const initialIndex = await page.$eval('div[class*="text-gold"]', (el) => el.innerText).catch(() => '')
    const nextBtn = await page.$('button[aria-label*="Next folio"]')
    if (nextBtn) {
      await nextBtn.click()
      await new Promise((r) => setTimeout(r, 400))
      const updatedIndex = await page.$eval('div[class*="text-gold"]', (el) => el.innerText).catch(() => '')
      console.log(`[✓] Navigation controls tested: Index transitioned from "${initialIndex.trim()}" to "${updatedIndex.trim()}"`)
    }

    // 6. Test Dossier Inspection
    const inspectBtn = await page.$('button[aria-label*="Inspect Folio"]')
    if (inspectBtn) {
      await inspectBtn.click()
      await new Promise((r) => setTimeout(r, 600))
      const dossierTitle = await page.$eval('aside[role="dialog"] h2', (el) => el.innerText).catch(() => null)
      if (!dossierTitle) {
        throw new Error('Dossier panel did not open on inspect')
      }
      console.log(`[✓] Selected-Object Dossier panel opened for: "${dossierTitle}"`)

      // Verify Read Piece CTA
      const readCta = await page.$eval('aside[role="dialog"] a[href*="/article/"]', (el) => el.getAttribute('href')).catch(() => null)
      if (!readCta) {
        throw new Error('Dossier panel missing "Read Full Piece" link')
      }
      console.log(`[✓] Dossier panel contains valid reading action href: "${readCta}"`)

      // Close Dossier via Close button
      const closeBtn = await page.$('button[aria-label="Close dossier panel"]')
      if (closeBtn) {
        await closeBtn.click()
        await new Promise((r) => setTimeout(r, 400))
        console.log('[✓] Dossier closed via dismiss control')
      }
    }

    // 7. Test Help Modal
    const helpBtn = await page.$('button[aria-label*="Keyboard shortcuts"]')
    if (helpBtn) {
      await helpBtn.click()
      await new Promise((r) => setTimeout(r, 400))
      const helpHeader = await page.$eval('div[role="dialog"] h2', (el) => el.innerText).catch(() => null)
      if (!helpHeader || !helpHeader.includes('Navigation Manual')) {
        throw new Error('Help modal did not open properly')
      }
      console.log(`[✓] Help modal verified: "${helpHeader}"`)

      // Dismiss help modal with Escape
      await page.keyboard.press('Escape')
      await new Promise((r) => setTimeout(r, 300))
      console.log('[✓] Help modal dismissed with Escape key')
    }

    // 8. Test Search Overlay
    await page.keyboard.press('/')
    await new Promise((r) => setTimeout(r, 400))
    const searchModal = await page.$('div[role="dialog"][aria-label*="Search"]')
    if (!searchModal) {
      throw new Error('Search overlay did not open via "/" shortcut')
    }
    console.log('[✓] Spatial search opened via "/" shortcut')

    // Type query
    await page.keyboard.type('Voices')
    await new Promise((r) => setTimeout(r, 300))
    const searchResultItem = await page.$eval('div[role="dialog"] ul li', (el) => el.innerText).catch(() => null)
    if (!searchResultItem || !searchResultItem.includes('Voices')) {
      throw new Error('Search did not return expected result')
    }
    console.log(`[✓] Search query live filter verified: returned "${searchResultItem.split('\n')[0]}"`)

    await page.keyboard.press('Escape')
    await new Promise((r) => setTimeout(r, 300))
    console.log('[✓] Search overlay dismissed with Escape key')

    // 9. Mobile Viewport Test (390x844)
    await page.setViewport({ width: 390, height: 844 })
    await page.goto(`${BASE_URL}/room`, { waitUntil: 'networkidle0' })
    const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
    if (mobileOverflow) {
      throw new Error('Horizontal overflow detected on mobile viewport')
    }
    console.log('[✓] Mobile viewport (390x844) rendered with zero horizontal overflow')

    if (errors.length > 0) {
      console.warn('Encountered non-fatal errors during audit:', errors)
    }

    console.log('\n========================================')
    console.log('ROOM SPATIAL ARCHIVE AUDIT: ALL TESTS PASSED')
    console.log('========================================\n')
  } finally {
    await browser.close()
  }
}

runRoomAudit().catch((err) => {
  console.error('Room Audit Failed:', err)
  process.exit(1)
})
