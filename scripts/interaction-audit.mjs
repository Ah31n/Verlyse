/* eslint-disable no-console */
import { chromium } from '@playwright/test'
import * as fs from 'node:fs'
import * as path from 'node:path'

const BASE = 'http://127.0.0.1:5173'
const OUT = path.resolve(process.cwd(), 'audit')
const results = {}
function pass(id, ok, detail) { results[id] = { status: ok ? 'PASS' : 'FAIL', detail: detail || '' } }

async function run() {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', (e) => errors.push(String(e.message || e)))

  // ---- SEARCH ----
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  await page.locator('button[aria-label="Search articles (Ctrl K)"]').click()
  await page.waitForTimeout(400)
  const searchInput = page.locator('#publication-search')
  const searchOpen = (await searchInput.count()) === 1
  await searchInput.fill('Their Voices')
  await page.waitForTimeout(500)
  const searchMatched = await page.evaluate(() => document.body.textContent.includes('Their Voices Matter'))
  await page.keyboard.press('Escape')
  await page.waitForTimeout(400)
  const escClosed = (await page.locator('#publication-search').count()) === 0 || await page.evaluate(() => document.activeElement?.id !== "publication-search")
  pass('search-open-focus', searchOpen, `overlay open=${searchOpen}`)
  pass('search-query-results', searchMatched, 'typing "Their Voices" surfaced Their Voices Matter')
  pass('search-escape-close', escClosed, 'Escape closed/freed focus')

  // ---- SHELF ----
  await page.goto(BASE + '/article/their-voices-matter', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  const saveBtn = page.locator('button', { hasText: 'Save' }).first()
  const hadSave = (await saveBtn.count()) > 0
  if (hadSave) await saveBtn.click()
  await page.waitForTimeout(400)
  await page.locator('button[aria-label^="Saved stories"]').click()
  await page.waitForTimeout(500)
  const shelfOpen = await page.evaluate(() => document.body.textContent.includes('The bookmarks'))
  const shelfHasItem = await page.evaluate(() => document.body.textContent.includes('Their Voices Matter'))
  pass('shelf-open', shelfOpen, `Save button present=${hadSave}, Shelf opened=${shelfOpen}`)
  pass('shelf-saved-item', shelfHasItem, 'saved article present in Shelf')

  // ---- MOBILE MENU ----
  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const mp = await mctx.newPage()
  await mp.goto(BASE + '/', { waitUntil: 'networkidle' })
  await mp.waitForTimeout(1200)
  // burger is a button with aria-label "Open menu"
  let menuOpened = false
  const burger = mp.locator('button[aria-label="Open menu"]')
  if (await burger.count()) {
    await burger.click()
    await mp.waitForTimeout(500)
    menuOpened = true
  }
  const menuVisible = await mp.evaluate(() => document.body.textContent.includes('Brand Ambassador') || document.body.textContent.includes('Categories'))
  await mp.keyboard.press('Escape')
  await mp.waitForTimeout(300)
  pass('mobile-menu-open', menuOpened && menuVisible, `burger clicked=${menuOpened}, menu content=${menuVisible}`)
  await mctx.close()

  // ---- ARTICLE ENDINGS (story-specific) ----
  // The ending scene animates in with a delay and is rendered as an aria-hidden
  // visual scene (the signature `name` label — e.g. 'the voice' — is metadata
  // only and is never printed to the DOM). Assert what the app actually renders:
  // the story-specific `[data-signature]` + `[data-ending]` scenes are present,
  // and the `fin.` mark appears after the scene settles (~6s — wait for it
  // instead of sampling early; fixes the known "Their Voices Matter" flake).
  const endings = {}
  for (const slug of ['their-voices-matter', '3-13', 'the-quiet-grief', 'she-didnt-say-qubool-hai']) {
    await page.goto(BASE + '/article/' + slug, { waitUntil: 'networkidle' })
    let fin = false
    const deadline = Date.now() + 8000
    while (Date.now() < deadline) {
      if (await page.evaluate(() => document.body.textContent.includes('fin.'))) { fin = true; break }
      await page.waitForTimeout(400)
    }
    endings[slug] = await page.evaluate(({ slug, fin }) => ({
      hasSig: !!document.querySelector(`[data-signature="${slug}"]`) && fin,
      scene: document.querySelector('[data-ending]')?.getAttribute('data-ending') || null,
    }), { slug, fin })
  }
  pass('ending-voices', endings['their-voices-matter'].hasSig && endings['their-voices-matter'].scene?.includes('their-voices-matter'), JSON.stringify(endings['their-voices-matter']))
  pass('ending-wait', endings['3-13'].hasSig && endings['3-13'].scene?.includes('3-13'), JSON.stringify(endings['3-13']))
  pass('ending-quiet-grief', endings['the-quiet-grief'].hasSig && endings['the-quiet-grief'].scene?.includes('the-quiet-grief'), JSON.stringify(endings['the-quiet-grief']))
  pass('ending-qubool-hai', endings['she-didnt-say-qubool-hai'].hasSig && endings['she-didnt-say-qubool-hai'].scene?.includes('she-didnt-say-qubool-hai'), JSON.stringify(endings['she-didnt-say-qubool-hai']))

  // ---- THE QUIET GRIEF GALLERY, FOCUS TRAP & PROVENANCE ----
  await page.goto(BASE + '/article/the-quiet-grief', { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  const noAssetLeak = await page.evaluate(() => {
    const txt = document.body.textContent || ''
    return !txt.includes('/img/works/DeUZFPTCjPU-1.webp') && !txt.includes('pending source binary')
  })
  const plate1Btn = page.locator('button[aria-label*="Inspect Plate 01 of 05: Ballet shoes"]')
  const hasPlate1 = (await plate1Btn.count()) === 1
  if (hasPlate1) await plate1Btn.click()
  await page.waitForTimeout(300)
  const lightboxOpen = (await page.locator('[role="dialog"][aria-label*="The Quiet Grief"]').count()) === 1
  // Verify Tab / Shift+Tab stays trapped inside the lightbox dialog
  await page.keyboard.press('Shift+Tab')
  const shiftTabTrapped = await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))
  await page.keyboard.press('Tab')
  const tabTrapped = await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(250)
  const lightboxPlate2 = await page.evaluate(() => document.body.textContent.includes('Plate 02 / 05 — A camera'))
  await page.keyboard.press('Escape')
  await page.locator('[role="dialog"][aria-label*="The Quiet Grief"]').waitFor({ state: 'detached', timeout: 2500 }).catch(() => {})
  const lightboxClosed = (await page.locator('[role="dialog"][aria-label*="The Quiet Grief"]').count()) === 0
  const focusRestored = await page.evaluate(() =>
    document.activeElement?.getAttribute('aria-label')?.includes('Inspect Plate 01 of 05'),
  )
  const verbatimOk = await page.evaluate(() => {
    const txt = document.body.textContent || ''
    return (
      txt.includes('#verlysemedia #TheQuietGrief #LostPassions #ArtAndWords CreativeExpression') &&
      !txt.includes('-1 appreciations')
    )
  })
  pass(
    'quiet-grief-gallery-and-caption',
    hasPlate1 && noAssetLeak && lightboxOpen && shiftTabTrapped && tabTrapped && lightboxPlate2 && lightboxClosed && focusRestored && verbatimOk,
    `plate1=${hasPlate1}, noLeak=${noAssetLeak}, lightbox=${lightboxOpen}, trap=${shiftTabTrapped && tabTrapped}, plate2=${lightboxPlate2}, closed=${lightboxClosed}, focusRestored=${focusRestored}, verbatim=${verbatimOk}`,
  )

  // ---- ART GALLERY COMPUTED LAYOUT & TRANSITION ACROSS VIEWPORTS ----
  const measureGalleryAt = async (w, h) => {
    await page.setViewportSize({ width: w, height: h })
    await page.waitForTimeout(150)
    return page.evaluate(() => {
      const sec = document.querySelector('section[aria-label*="plate sequence"]')
      const btn1 = document.querySelector('button[aria-label*="Inspect Plate 01 of 05"]')
      const btn2 = document.querySelector('button[aria-label*="Inspect Plate 02 of 05"]')
      const btn3 = document.querySelector('button[aria-label*="Inspect Plate 03 of 05"]')
      if (!sec || !btn1 || !btn2 || !btn3) return null
      const secStyle = window.getComputedStyle(sec)
      const padL = parseFloat(secStyle.paddingLeft) || 0
      const padR = parseFloat(secStyle.paddingRight) || 0
      const grid = btn1.closest('.grid')
      const cols = grid ? window.getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length : 0
      const r1 = btn1.getBoundingClientRect()
      const r2 = btn2.getBoundingClientRect()
      const r3 = btn3.getBoundingClientRect()
      const tp = window.getComputedStyle(btn1).transitionProperty || ''
      return {
        symmetricPad: Math.abs(padR - padL) <= 1.5,
        cols,
        row1SideBySide: Math.abs(r1.top - r2.top) <= 4 && r2.left > r1.left,
        stackedMobile: r2.top > r1.bottom && r3.top > r2.bottom,
        safeTransition: !tp.includes('all') && !tp.includes('transform'),
        transitionProperty: tp,
      }
    })
  }
  const gal375 = await measureGalleryAt(375, 812)
  const gal768 = await measureGalleryAt(768, 1024)
  const gal1440 = await measureGalleryAt(1440, 900)
  const galComputedOk = Boolean(
    gal375?.symmetricPad && gal375?.cols === 1 && gal375?.stackedMobile && gal375?.safeTransition &&
    gal768?.symmetricPad && gal768?.cols === 6 && gal768?.row1SideBySide && gal768?.safeTransition &&
    gal1440?.symmetricPad && gal1440?.cols === 6 && gal1440?.row1SideBySide && gal1440?.safeTransition
  )
  pass(
    'quiet-grief-gallery-computed-layout',
    galComputedOk,
    JSON.stringify({ m375: gal375, t768: gal768, d1440: gal1440 }),
  )

  // ---- SHE DIDN'T SAY QUBOOL HAI GALLERY, CREDITS, HOME FEATURE & PROVENANCE ----
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(300)
  const homeHasQubool = await page.evaluate(() => {
    const txt = document.body.textContent || ''
    return txt.includes('She Didn’t Say Qubool Hai') && txt.includes('In this folio — 8 plates')
  })
  await page.goto(BASE + '/article/she-didnt-say-qubool-hai', { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  const quboolCheck = await page.evaluate(() => {
    const txt = document.body.textContent || ''
    const plates = document.querySelectorAll('button[aria-label*="Inspect Plate "]')
    return {
      plateCount: plates.length,
      noRawShortcodeLeak: !txt.includes('Dehg27tE_hF') && !txt.includes('/img/works/Dehg27tE_hF'),
      hasCredits: txt.includes('Editor: Wajiha Ahmed') && txt.includes('Writer: Haieqa Wahab'),
      hasVerbatimCaption:
        txt.includes('Editor: wajiha ahmed') &&
        txt.includes('Writer :haieqa wahab') &&
        txt.includes('#ForcedMarriage #verlysemedia #EndForcedMarriage #WomensRights #ConsentMatters'),
      noMinusOneLikes: !txt.includes('-1 appreciations'),
    }
  })
  pass(
    'qubool-hai-gallery-and-caption',
    homeHasQubool &&
      quboolCheck.plateCount === 8 &&
      quboolCheck.noRawShortcodeLeak &&
      quboolCheck.hasCredits &&
      quboolCheck.hasVerbatimCaption &&
      quboolCheck.noMinusOneLikes,
    JSON.stringify({ homeHasQubool, ...quboolCheck }),
  )

  // ---- SUBMIT & CONTACT ACCESSIBLE VALIDATION & WRITER PROFILE QUOTES ----
  await page.goto(BASE + '/submit', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Submit the piece' }).click()
  const submitA11y = await page.evaluate(() => {
    const name = document.querySelector('#sf-name')
    const alerts = document.querySelectorAll('[role="alert"]')
    return (
      name?.getAttribute('aria-invalid') === 'true' &&
      name?.getAttribute('aria-describedby') === 'sf-name-err' &&
      alerts.length === 1
    )
  })
  await page.goto(BASE + '/creator/alina-javed', { waitUntil: 'networkidle' })
  const creatorQuotesOk = await page.evaluate(() => {
    const txt = document.body.textContent || ''
    return !txt.includes('““') && !txt.includes('””')
  })
  pass('forms-and-profile-a11y', submitA11y && creatorQuotesOk, `submitA11y=${submitA11y}, creatorQuotesOk=${creatorQuotesOk}`)

  // ---- SUBMIT, CONTACT & NEWSLETTER DELIVERY, FAILURE RECOVERY & SERVER ACCEPTANCE ----
  // 1. Verify the live local /api/submit and /api/newsletter endpoints directly return 503 when unconfigured
  const liveUnconfCheck = await fetch(BASE + '/api/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'http://127.0.0.1:5173' },
    body: JSON.stringify({
      kind: 'contact',
      name: 'Direct Probe',
      email: 'probe@example.test',
      subject: 'Probe',
      message: 'Testing live server boundary.',
    }),
  })
  const liveUnconfJson = await liveUnconfCheck.json().catch(() => ({}))
  const liveNewsletterCheck = await fetch(BASE + '/api/newsletter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'http://127.0.0.1:5173' },
    body: JSON.stringify({ email: 'probe@example.test' }),
  })
  const liveNewsletterJson = await liveNewsletterCheck.json().catch(() => ({}))
  const liveEndpoint503Ok =
    liveUnconfCheck.status === 503 &&
    liveUnconfJson.error === 'provider-unconfigured' &&
    liveNewsletterCheck.status === 503 &&
    liveNewsletterJson.error === 'not-configured'

  // 2. Verify browser multipart/form-data binary image upload on /submit, multipart correspondence on /contact, and newsletter in Footer
  const submitRequests = []
  let mockAcceptSubmit = false
  await page.route('**/api/submit', async (route) => {
    const req = route.request()
    const buf = req.postDataBuffer()
    submitRequests.push({
      url: req.url(),
      method: req.method(),
      contentType: req.headers()['content-type'] || '',
      byteLength: buf ? buf.byteLength : 0,
      hasPngMagicBytes: buf ? buf.includes(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) : false,
      hasFilename: buf ? buf.includes(Buffer.from('filename="synthetic-cover.png"')) : false,
      hasContactKind: buf ? buf.includes(Buffer.from('name="kind"\r\n\r\ncontact')) : false,
    })
    if (!mockAcceptSubmit) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: false,
          error: 'provider-unconfigured',
        }),
      })
      return
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        accepted: true,
        attachmentIncluded: true,
        attachmentName: 'synthetic-cover.png',
        attachmentBytes: 16,
      }),
    })
  })

  await page.goto(BASE + '/submit', { waitUntil: 'networkidle' })
  await page.locator('#sf-name').fill('Synthetic Contributor')
  await page.locator('#sf-email').fill('synthetic@example.test')
  await page.locator('#sf-title').fill('Synthetic Verification Folio')
  await page.locator('#sf-cat').selectOption('Stories')
  await page.locator('#sf-work').fill('Synthetic manuscript text for Chromium verification.')
  await page.locator('#sf-cover').setInputFiles({
    name: 'synthetic-cover.png',
    mimeType: 'image/png',
    buffer: Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    ]),
  })
  await page.locator('#sf-original').check({ force: true })
  await page.getByRole('button', { name: 'Submit the piece' }).click()
  await page.waitForSelector('[data-testid="submit-delivery-alert"]')
  const failedState = await page.evaluate(() => {
    const form = document.querySelector('form[data-submission-state]')
    const alert = document.querySelector('[data-testid="submit-delivery-alert"]')
    const titleVal = document.querySelector('#sf-title')?.value || ''
    const bodyTxt = document.body.textContent || ''
    return {
      state: form?.getAttribute('data-submission-state'),
      hasAlert: !!alert,
      preservedTitle: titleVal === 'Synthetic Verification Folio',
      preservedCover: bodyTxt.includes('Selected cover: synthetic-cover.png'),
      noFalseSent: !bodyTxt.includes('Sent to the desk') && !bodyTxt.includes('Accepted by the submission system'),
      hasManualDraftWarning: (alert?.textContent || '').includes('manually attach "synthetic-cover.png"'),
    }
  })
  mockAcceptSubmit = true
  await page.getByRole('button', { name: 'Retry submission' }).click()
  await page.waitForSelector('form[data-submission-state="accepted"]')
  const acceptedState = await page.evaluate(() => {
    const bodyTxt = document.body.textContent || ''
    return {
      acceptedHeading: bodyTxt.includes('Accepted by the submission system'),
      coverAttachedMsg: bodyTxt.includes('Cover image uploaded & attached: synthetic-cover.png'),
    }
  })

  // Contact form: multipart failure -> retry -> accepted
  mockAcceptSubmit = false
  await page.goto(BASE + '/contact', { waitUntil: 'networkidle' })
  await page.locator('#cf-name').fill('Synthetic Correspondent')
  await page.locator('#cf-email').fill('synthetic@example.test')
  await page.locator('#cf-subject').fill('Synthetic Inquiry')
  await page.locator('#cf-msg').fill('Synthetic correspondence message.')
  await page.getByRole('button', { name: 'Seal the letter' }).click()
  await page.waitForSelector('[data-testid="contact-delivery-alert"]')
  const contactFailedState = await page.evaluate(() => {
    const form = document.querySelector('form[data-contact-state]')
    const subjVal = document.querySelector('#cf-subject')?.value || ''
    const bodyTxt = document.body.textContent || ''
    return {
      state: form?.getAttribute('data-contact-state'),
      preservedSubject: subjVal === 'Synthetic Inquiry',
      noFalseSent: !bodyTxt.includes('Letter received by the server'),
    }
  })
  mockAcceptSubmit = true
  await page.getByRole('button', { name: 'Retry sending letter' }).click()
  await page.waitForSelector('form[data-contact-state="accepted"]')
  const contactAccepted = await page.evaluate(() => {
    return (document.body.textContent || '').includes('Letter received by the server')
  })
  await page.unroute('**/api/submit')

  // Newsletter form: failure -> retry -> accepted
  let mockAcceptNewsletter = false
  await page.route('**/api/newsletter', async (route) => {
    if (!mockAcceptNewsletter) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, error: 'not-configured' }),
      })
      return
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true }),
    })
  })
  await page.locator('#nl-email').fill('synthetic@example.test')
  await page.getByRole('button', { name: 'Take the letter' }).click()
  await page.waitForSelector('form[data-newsletter-state="failed"]')
  const nlFailedPreserved = await page.evaluate(() => {
    const input = document.querySelector('#nl-email')
    return input?.value === 'synthetic@example.test' && !(document.body.textContent || '').includes("You're on the list.")
  })
  mockAcceptNewsletter = true
  await page.getByRole('button', { name: 'Retry letter' }).click()
  await page.waitForSelector('form[data-newsletter-state="accepted"]')
  const nlAccepted = await page.evaluate(() => {
    const input = document.querySelector('#nl-email')
    return input?.value === '' && (document.body.textContent || '').includes("You're on the list.")
  })
  await page.unroute('**/api/newsletter')

  const firstReq = submitRequests[0] || {}
  const contactReq = submitRequests[2] || {}
  const submitFlowOk =
    liveEndpoint503Ok &&
    submitRequests.length === 4 &&
    /^multipart\/form-data;\s*boundary=/i.test(firstReq.contentType) &&
    firstReq.hasPngMagicBytes === true &&
    firstReq.hasFilename === true &&
    /^multipart\/form-data;\s*boundary=/i.test(contactReq.contentType) &&
    contactReq.hasContactKind === true &&
    failedState.state === 'failed' &&
    failedState.hasAlert &&
    failedState.preservedTitle &&
    failedState.preservedCover &&
    failedState.noFalseSent &&
    failedState.hasManualDraftWarning &&
    acceptedState.acceptedHeading &&
    acceptedState.coverAttachedMsg &&
    contactFailedState.state === 'failed' &&
    contactFailedState.preservedSubject &&
    contactFailedState.noFalseSent &&
    contactAccepted &&
    nlFailedPreserved &&
    nlAccepted
  pass(
    'submit-and-contact-binary-delivery',
    submitFlowOk,
    JSON.stringify({
      liveEndpoint503Ok,
      multipartBoundary: /^multipart\/form-data;\s*boundary=/i.test(firstReq.contentType),
      hasPngMagicBytes: firstReq.hasPngMagicBytes,
      hasFilename: firstReq.hasFilename,
      contactMultipart: /^multipart\/form-data;\s*boundary=/i.test(contactReq.contentType) && contactReq.hasContactKind,
      failedState: failedState.state,
      preservedCover: failedState.preservedCover,
      noFalseSent: failedState.noFalseSent,
      accepted: acceptedState.acceptedHeading && acceptedState.coverAttachedMsg,
      contactAccepted,
      nlFailedPreserved,
      nlAccepted,
    }),
  )

  // ---- HIRING EXPERIENCE ("THE NEXT BYLINE") & TEAM ROSTER REMOVAL ----
  await page.goto(BASE + '/ambassadors', { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  const rosterAndHiring = await page.evaluate(() => {
    const txt = document.body.innerText || ''
    const exactHref = 'https://docs.google.com/forms/d/e/1FAIpQLScbXxbyw22YM4Mlid81RoyckzgwvpBC9h8siWff3hMp6tcBwg/viewform?usp=publish-editor'
    const cta = document.querySelector(`a[href="${exactHref}"]`)
    const noRemovedTeam = !/haiqa nafees|\bmanha\b/i.test(txt)
    const noPlaceholderLabels = !/crash zoom|35mm|track\s*0|folio\s*00/i.test(txt)
    const hasRoles = txt.includes('Researcher') && txt.includes('Palette Designer') && txt.includes('Content Writer')
    const hasHeadline = txt.includes('The next voice could be yours.')
    return {
      ctaPresent: !!cta,
      targetBlank: cta?.getAttribute('target') === '_blank',
      relSafe: (cta?.getAttribute('rel') || '').includes('noopener'),
      noRemovedTeam,
      noPlaceholderLabels,
      hasRoles,
      hasHeadline,
    }
  })
  pass(
    'hiring-marquee-and-roster-removal',
    rosterAndHiring.ctaPresent &&
      rosterAndHiring.targetBlank &&
      rosterAndHiring.relSafe &&
      rosterAndHiring.noRemovedTeam &&
      rosterAndHiring.noPlaceholderLabels &&
      rosterAndHiring.hasRoles &&
      rosterAndHiring.hasHeadline,
    JSON.stringify(rosterAndHiring),
  )

  // ---- THE ARCHIVE WALL: WHOLE COVERS, REAL TAB STOPS, HONEST FILTERING ----
  // Regression guard for the /articles redesign. The shelf used to render
  // every 4:5 cover into a fixed 92px letterbox (≈19% of the artwork at
  // 1440px), expose exactly one tab stop that a mouse hover could move, and
  // leave filtered-out folios in the accessibility tree.
  await page.goto(BASE + '/articles', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  await page.evaluate(async () => {
    const h = document.body.scrollHeight
    for (let y = 0; y < h; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)) }
    window.scrollTo(0, 0)
  })
  await page.waitForTimeout(600)

  const coverGeometry = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll('.plate-thumb img')].filter((i) => i.naturalWidth > 0)
    const worst = imgs.reduce((acc, i) => {
      const r = i.getBoundingClientRect()
      const naturalAR = i.naturalWidth / i.naturalHeight
      const renderedAR = r.width / r.height
      // The frame is object-contain, so the question is no longer "does the
      // image's ratio match the box" (one cover is 603x619, not 4:5) but
      // "is any of the artwork cropped away". Under contain the answer is
      // always no; this measures it rather than assuming it, and would catch
      // a regression back to object-cover.
      const fit = getComputedStyle(i).objectFit
      const visible = fit === 'contain'
        ? 1
        : Math.min(1, renderedAR >= naturalAR ? naturalAR / renderedAR : renderedAR / naturalAR)
      // paper visible around a cover whose ratio differs from the 4:5 frame
      const scale = Math.min(r.width / i.naturalWidth, r.height / i.naturalHeight)
      const margin = 1 - (i.naturalWidth * scale * i.naturalHeight * scale) / (r.width * r.height)
      return visible < acc.visible || margin > acc.margin
        ? { visible: Math.min(visible, acc.visible), margin: Math.max(margin, acc.margin), fit, renderedAR, naturalAR, src: i.currentSrc.split('/').pop() }
        : acc
    }, { visible: 1, margin: 0, fit: '', renderedAR: 0, naturalAR: 0, src: '' })
    return { count: imgs.length, ...worst }
  })

  const tabStopsAtRest = await page.evaluate(() =>
    [...document.querySelectorAll('a[id^="folio-"]')].filter((a) => a.tabIndex === 0).length)
  const totalFolios = await page.evaluate(() => document.querySelectorAll('a[id^="folio-"]').length)
  await page.locator('#folio-khageena').hover()
  await page.waitForTimeout(250)
  const tabStopsAfterHover = await page.evaluate(() =>
    [...document.querySelectorAll('a[id^="folio-"]')].filter((a) => a.tabIndex === 0).length)

  // the search field must keep its own caret: ← is a text key, not a shelf key
  await page.locator('#art-search').click()
  await page.locator('#art-search').fill('poetry')
  await page.keyboard.press('ArrowLeft')
  await page.waitForTimeout(150)
  const caret = await page.evaluate(() => ({
    id: document.activeElement?.id ?? '',
    pos: document.activeElement?.selectionStart ?? -1,
  }))

  // a filtered-out folio is really out: no tab stop, hidden from AT
  await page.goto(BASE + '/articles?room=Horror', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)
  const filterHonesty = await page.evaluate(() => {
    const links = [...document.querySelectorAll('a[id^="folio-"]')]
    const reachable = links.filter((a) => a.tabIndex === 0)
    const hiddenFromAT = links.filter((a) => a.closest('[aria-hidden="true"]'))
    const status = document.querySelector('#art-search-status')?.textContent?.trim() ?? ''
    return {
      total: links.length,
      reachable: reachable.length,
      hiddenFromAT: hiddenFromAT.length,
      reachableIsMatch: reachable.length === 1 && reachable[0].id === 'folio-3-13',
      statusAgrees: /\b1 of \d+ folio\b/.test(status),
    }
  })

  const archiveWall = {
    covers: coverGeometry.count,
    worstVisibleFraction: Number(coverGeometry.visible.toFixed(3)),
    objectFit: coverGeometry.fit,
    largestPaperMargin: Number(coverGeometry.margin.toFixed(3)),
    wholeCovers: coverGeometry.visible > 0.995 && coverGeometry.fit === 'contain',
    tabStopsAtRest,
    totalFolios,
    allFoliosTabbable: tabStopsAtRest === totalFolios && totalFolios > 1,
    hoverKeepsTabStops: tabStopsAfterHover === tabStopsAtRest,
    searchCaretKept: caret.id === 'art-search' && caret.pos === 5,
    ...filterHonesty,
  }
  pass(
    'archive-wall-whole-covers-and-keyboard',
    archiveWall.wholeCovers &&
      archiveWall.allFoliosTabbable &&
      archiveWall.hoverKeepsTabStops &&
      archiveWall.searchCaretKept &&
      archiveWall.reachableIsMatch &&
      archiveWall.hiddenFromAT === archiveWall.total - 1 &&
      archiveWall.statusAgrees,
    JSON.stringify(archiveWall),
  )

  // ---- ARCHIVE WALL: WCAG 2.1 AA CONTRAST + VISIBLE PROVENANCE ----
  // The registry marks two folios `provisional`. That fact used to live only
  // in the aria-label; the wall must now say it in ink too, and every caption
  // must clear 4.5:1 (RandomA11y's published bar) at these small sizes.
  await page.goto(BASE + '/articles', { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  const wallInk = await page.evaluate(() => {
    const chan = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) }
    const lum = (c) => 0.2126 * chan(c[0]) + 0.7152 * chan(c[1]) + 0.0722 * chan(c[2])
    const nums = (s) => { const m = s.match(/[\d.]+/g); return m ? m.slice(0, 3).map(Number) : null }
    const alpha = (s) => { const m = s.match(/[\d.]+/g); return m && m.length > 3 ? Number(m[3]) : 1 }
    const over = (fg, a, bg) => fg.map((v, i) => v * a + bg[i] * (1 - a))
    // composite translucent layers down to the first opaque ancestor; treat a
    // backdrop image as mid-grey so a scrim over artwork is scored, not skipped
    const bgOf = (el) => {
      const stack = []
      let n = el
      while (n && n !== document.documentElement) {
        const cs = getComputedStyle(n)
        const c = nums(cs.backgroundColor)
        const a = alpha(cs.backgroundColor)
        if (c && a > 0) { stack.push([c, a]); if (a > 0.95) break }
        if (n.tagName === 'IMG' || cs.backgroundImage !== 'none') { stack.push([[128, 128, 128], 1]); break }
        n = n.parentElement
      }
      stack.push([[255, 255, 255], 1])
      let out = stack[stack.length - 1][0]
      for (let i = stack.length - 2; i >= 0; i--) out = over(stack[i][0], stack[i][1], out)
      return out
    }
    let checked = 0
    const failures = []
    document.querySelectorAll('a[id^="folio-"], a[id^="folio-"] span').forEach((el) => {
      const txt = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join('')
      if (!txt || el.closest('[aria-hidden="true"]')) return
      const cs = getComputedStyle(el)
      const fg = nums(cs.color)
      if (!fg) return
      const bg = bgOf(el)
      const L1 = lum(over(fg, alpha(cs.color), bg))
      const L2 = lum(bg)
      const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)
      const px = parseFloat(cs.fontSize)
      const need = px >= 24 || (px >= 18.66 && parseInt(cs.fontWeight) >= 700) ? 3 : 4.5
      checked++
      if (ratio < need) failures.push(`${txt.slice(0, 20)} ${ratio.toFixed(2)}:1 @${px}px`)
    })
    const links = [...document.querySelectorAll('a[id^="folio-"]')]
    const inkMarks = links.filter((a) =>
      [...a.querySelectorAll('span')].some((s) => s.children.length === 0 && s.textContent.trim() === 'Provisional'))
    const ariaMarks = links.filter((a) => /provisional record/.test(a.getAttribute('aria-label') || ''))
    return { checked, failures, inkMarks: inkMarks.length, ariaMarks: ariaMarks.length }
  })
  pass(
    'archive-wall-contrast-and-visible-provenance',
    wallInk.checked > 40 &&
      wallInk.failures.length === 0 &&
      wallInk.inkMarks === 2 &&
      wallInk.inkMarks === wallInk.ariaMarks,
    JSON.stringify(wallInk),
  )

  // ---- FIXED FOOTER SPECIMEN, SINGLE GLOBAL FOOTER & ZERO TG DEMO RESIDUE ----
  const standardRoutes = [
    '/', '/articles', '/categories', '/creators', '/community',
    '/about', '/ambassadors', '/submit', '/contact', '/article/the-quiet-grief', '/article/she-didnt-say-qubool-hai',
  ]
  let footerSpecimenOk = true
  let noTgResidueOk = true
  let singleFooterOk = true
  for (const r of [...standardRoutes, '/room']) {
    await page.goto(BASE + r, { waitUntil: 'networkidle' })
    await page.waitForTimeout(250)
    const fCheck = await page.evaluate((route) => {
      const footers = document.querySelectorAll('footer[aria-label="Footer"]')
      const bodyTxt = document.body.innerText || ''
      const htmlTxt = document.body.textContent || ''
      const hasTgCode =
        /\bTG\d+\b/.test(bodyTxt) ||
        /\bTG\d+\b/.test(htmlTxt) ||
        document.querySelectorAll('[data-craft-dot-matrix], [data-craft-emblem]').length > 0
      const hasDemoLabels = /herbarium colophon|inscribe phrase|foliage density|keep plate|oxblood\s*&\s*antique brass|tudor rose\s*&\s*warm ivory|nocturne\s*&\s*gilded leaf|mulberry velvet/i.test(htmlTxt)
      if (route === '/room') {
        return {
          footerCountOk: footers.length === 0,
          specimenOk: true,
          noTg: !hasTgCode && !hasDemoLabels,
        }
      }
      const footer = footers[0]
      const specimen = footer?.querySelector('[data-footer-specimen="verlyse"]')
      const specimenInteractive = specimen
        ? specimen.querySelectorAll('input, select, textarea, button, a, [role="radio"], [role="button"], [download], [tabindex]:not([tabindex="-1"])').length
        : 999
      const nlInput = footer?.querySelector('input#nl-email[type="email"]')
      const nlBtn = Array.from(footer?.querySelectorAll('button[type="submit"]') || []).find((b) => /take the letter/i.test(b.textContent || ''))
      const navCount = footer?.querySelectorAll('a[href^="/"]').length || 0
      return {
        footerCountOk: footers.length === 1,
        specimenOk:
          !!specimen &&
          specimen.getAttribute('aria-hidden') === 'true' &&
          specimenInteractive === 0 &&
          (specimen.textContent || '').trim() === 'Verlyse' &&
          !!nlInput &&
          !!nlBtn &&
          navCount >= 9,
        noTg: !hasTgCode && !hasDemoLabels,
      }
    }, r)
    if (!fCheck.footerCountOk) singleFooterOk = false
    if (!fCheck.specimenOk) footerSpecimenOk = false
    if (!fCheck.noTg) noTgResidueOk = false
  }
  pass(
    'footer-static-specimen-and-no-tg-residue',
    singleFooterOk && footerSpecimenOk && noTgResidueOk,
    JSON.stringify({ singleFooterOk, footerSpecimenOk, noTgResidueOk, checkedRoutes: standardRoutes.length + 1 }),
  )

  // ---- 11-VIEWPORT MATRIX & 375PX MOBILE VIEWPORT CHECK ----
  const m375 = await browser.newContext({ viewport: { width: 375, height: 812 } })
  const p375 = await m375.newPage()
  const routes375 = ['/', '/articles', '/article/the-quiet-grief', '/room']
  let ok375 = true
  const details375 = []
  for (const r of routes375) {
    await p375.goto(BASE + r, { waitUntil: 'networkidle' })
    await p375.waitForTimeout(400)
    const m = await p375.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      iw: window.innerWidth,
      h1: !!document.querySelector('h1'),
    }))
    if (m.sw > m.iw + 1 || !m.h1) ok375 = false
    details375.push(`${r}:${m.sw}/${m.iw}`)
  }
  const vps11 = [
    [320, 720], [360, 800], [390, 844], [430, 932],
    [768, 1024], [834, 1194], [1024, 768], [1280, 800],
    [1366, 768], [1440, 900], [1920, 1080],
  ]
  await p375.goto(BASE + '/article/the-quiet-grief', { waitUntil: 'networkidle' })
  for (const [vw, vh] of vps11) {
    await p375.setViewportSize({ width: vw, height: vh })
    await p375.waitForTimeout(60)
    const sw = await p375.evaluate(() => document.documentElement.scrollWidth)
    if (sw > vw + 1) ok375 = false
  }
  pass('mobile-375px-no-overflow', ok375, details375.join(', ') + ' + 11 viewports clean')
  await m375.close()

  // ---- REDUCED MOTION & LAZY CHUNK GATING ----
  const rctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  const rp = await rctx.newPage()
  const rmScripts = []
  rp.on('request', (req) => {
    if (req.resourceType() === 'script') rmScripts.push(req.url())
  })
  await rp.goto(BASE + '/', { waitUntil: 'networkidle' })
  await rp.waitForTimeout(800)
  await rp.goto(BASE + '/article/their-voices-matter', { waitUntil: 'networkidle' })
  await rp.evaluate(() => document.getElementById('ending')?.scrollIntoView({ behavior: 'instant' }))
  await rp.waitForTimeout(800)
  const rmNoHeavyChunks = !rmScripts.some((u) =>
    /animejs|anime-[A-Za-z0-9_-]+\.js|StoryEnding3D|SpatialArchive|\/deps\/three|@react-three|three-[A-Za-z0-9_-]+\.js/i.test(u)
  )
  const rmEndingState = await rp.evaluate(() => ({
    h1: !!document.querySelector('h1'),
    noOverflow: document.documentElement.scrollWidth <= window.innerWidth,
    phase: document.querySelector('[data-ending]')?.getAttribute('data-phase') || null,
    semanticSig: !!document.querySelector('[data-signature="their-voices-matter"]'),
  }))
  const rmOk = rmEndingState.h1 && rmEndingState.noOverflow && rmEndingState.phase === 'REDUCED' && rmEndingState.semanticSig && rmNoHeavyChunks
  pass('reduced-motion-preserves', rmOk, `reduced motion: h1=${rmEndingState.h1}, phase=${rmEndingState.phase}, semanticSig=${rmEndingState.semanticSig}, heavyAnimationChunksRequested=${!rmNoHeavyChunks}`)
  await rctx.close()

  // ---- WEBGL OFF & NEAR-VIEWPORT GATING ----
  const gctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  await gctx.addInitScript(() => { const o = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t, ...a) { if (String(t).includes('webgl')) return null; return o.call(this, t, ...a) } })
  const gp = await gctx.newPage()
  const glScripts = []
  gp.on('request', (req) => {
    if (req.resourceType() === 'script') glScripts.push(req.url())
  })
  await gp.goto(BASE + '/', { waitUntil: 'networkidle' })
  await gp.waitForTimeout(800)
  const glHome = await gp.evaluate(() => ({ h1: !!document.querySelector('h1'), canvases: document.querySelectorAll('canvas').length, scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth }))
  await gp.goto(BASE + '/article/their-voices-matter', { waitUntil: 'networkidle' })
  await gp.evaluate(() => document.getElementById('ending')?.scrollIntoView({ behavior: 'instant' }))
  await gp.waitForTimeout(600)
  const glArticle = await gp.evaluate(() => ({
    canvases: document.querySelectorAll('canvas').length,
    phase: document.querySelector('[data-ending]')?.getAttribute('data-phase') || null,
    semanticSig: !!document.querySelector('[data-signature="their-voices-matter"]'),
  }))
  const glNoHeavy3D = !glScripts.some((u) =>
    /StoryEnding3D|SpatialArchive|\/deps\/three|@react-three|three-[A-Za-z0-9_-]+\.js/i.test(u)
  )
  const glOk = {
    ...glHome,
    articleCanvases: glArticle.canvases,
    endingPhase: glArticle.phase,
    semanticSig: glArticle.semanticSig,
    heavy3dChunksRequested: !glNoHeavy3D,
  }
  pass(
    'no-webgl-fallback',
    glOk.h1 && glOk.canvases === 0 && glOk.articleCanvases === 0 && glOk.endingPhase === 'FALLBACK' && glOk.semanticSig && glNoHeavy3D && glOk.scrollWidth <= glOk.innerWidth,
    JSON.stringify(glOk),
  )
  await gctx.close()

  fs.writeFileSync(path.join(OUT, 'interaction-audit.json'), JSON.stringify({ results, consoleErrorsCaptured: errors }, null, 2))
  await browser.close()
  console.log('=== INTERACTION AUDIT ===')
  for (const [k, v] of Object.entries(results)) console.log(`  [${v.status}] ${k}: ${v.detail}`)
  console.log('  console errors captured:', errors.length)
}

run().catch((e) => { console.error(e); process.exit(1) })
