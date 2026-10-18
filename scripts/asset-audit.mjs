/* eslint-disable no-console */
import { chromium } from '@playwright/test'
import * as fs from 'node:fs'
import * as path from 'node:path'

const BASE = 'http://127.0.0.1:5173'
const OUT = 'audit'

// 45-entry sampled role subset from the source registry (cover, inner figures, signatures, portraits, fonts, logo, posters)
const expected = {
  covers: [
    '/img/works/DaDY7WRkw0y-1.webp', '/img/poster-3-13-1.webp', '/img/works/DbYa5WSE5wf-1.webp',
    '/img/works/DbCuHgrEypR-1.webp', '/img/works/DbKynTxk_6F-1.webp', '/img/works/DaPbjVRE3nA-1.webp',
    '/img/works/DaMui9Ekrmy-1.webp', '/img/works/DacRGIOE9Sg-1.webp', '/img/works/DaXQtNiEzeH-1.webp',
    '/img/works/DakDJF9Ez1l-1.webp', '/img/works/DbQMFVEitsU-1.webp', '/img/works/Dar3wIXk02U-1.webp',
    '/img/works/Dae6nNME5bg-1.webp', '/img/works/Dbf7jnBk3ho-1.webp', '/img/works/Daw-mnAE_qe-1.webp',
    '/img/works/DbaNAZTk5X9-1.webp', '/img/works/DaSLuZek5Uj-1.webp', '/img/works/DaU7EU2E46N-1.webp',
    '/img/works/DciqQXTCilh-1.webp',
    '/img/works/DeUZFPTCjPU-1.webp', '/img/works/DeUZFPTCjPU-2.webp', '/img/works/DeUZFPTCjPU-3.webp',
    '/img/works/DeUZFPTCjPU-4.webp', '/img/works/DeUZFPTCjPU-5.webp',
  ],
  inner: ['/img/inner/afghanistan-photo.webp', '/img/inner/balochistan-photo.webp', '/img/inner/kashmir-photo.webp', '/img/inner/khageena-dish.webp', '/img/inner/students-painting.webp', '/img/inner/tasbih-calligraphy.webp', '/img/inner/water-cat-art.webp'],
  signature: ['/img/signatures/tvm-hero.webp'],
  portrait: ['/img/authors/alina-javed.jpg', '/img/authors/alina-javed-about.jpg', '/img/authors/adeena-irfan.jpg', '/img/authors/munkashay-javed.jpg', '/img/authors/syeda-tasbeeha-noman.jpg'],
  fonts: ['/fonts/CormorantGaramond-normal.woff2', '/fonts/CormorantGaramond-italic.woff2', '/fonts/Inter.woff2', '/fonts/IBMPlexMono.woff2'],
  logo: ['/favicon.svg'],
  poster: ['/img/poster-3-13-1.webp', '/img/poster-3-13-2.webp', '/img/poster-3-13-3.webp'],
}

function walkPublicAssets(dir, prefix = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const out = []
  for (const e of entries) {
    const rel = `${prefix}/${e.name}`
    if (e.isDirectory()) {
      out.push(...walkPublicAssets(path.join(dir, e.name), rel))
    } else if (/\.(webp|jpg|jpeg|png|svg|woff2)$/i.test(e.name)) {
      out.push(rel)
    }
  }
  return out.sort()
}

async function scrollPageToTriggerLazyAssets(page) {
  await page.evaluate(async () => {
    const imgs = Array.from(document.querySelectorAll('img'))
    for (const img of imgs) {
      img.scrollIntoView({ behavior: 'instant', block: 'center' })
      await new Promise((r) => setTimeout(r, 90))
    }
    window.scrollTo(0, document.documentElement.scrollHeight)
    await new Promise((r) => setTimeout(r, 150))
    window.scrollTo(0, 0)
  })
}

async function run() {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  const findings = {}
  const failedAll = []

  for (const [role, urls] of Object.entries(expected)) {
    findings[role] = { count: urls.length, resolved: 0, missing: [], wrongRole: [] }
    for (const u of new Set(urls)) {
      let ok = false
      try {
        const res = await page.request.get(BASE + u)
        ok = res.ok()
      } catch {
        ok = false
      }
      if (ok) findings[role].resolved++
      else {
        findings[role].missing.push(u)
        failedAll.push(u)
      }
    }
  }

  // Verify the complete public media + font inventory on disk and over HTTP
  const allPublicAssets = walkPublicAssets(path.resolve(process.cwd(), 'public'))
  const publicMissing = []
  let publicResolved = 0
  for (const u of allPublicAssets) {
    let ok = false
    try {
      const res = await page.request.get(BASE + u)
      ok = res.ok()
    } catch {
      ok = false
    }
    if (ok) publicResolved++
    else publicMissing.push(u)
  }
  const imageAndSvgAssets = allPublicAssets.filter((u) => !u.endsWith('.woff2'))
  const fontAssets = allPublicAssets.filter((u) => u.endsWith('.woff2'))

  // Also capture what a full homepage + article load actually requests (fonts/images)
  const reqs = []
  page.on('request', (r) => {
    if (r.resourceType() === 'image' || r.resourceType() === 'font') reqs.push(r.url())
  })
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await scrollPageToTriggerLazyAssets(page)
  await page.waitForTimeout(1000)
  await page.goto(BASE + '/article/their-voices-matter', { waitUntil: 'networkidle' })
  await scrollPageToTriggerLazyAssets(page)
  await page.waitForTimeout(1000)
  await page.goto(BASE + '/article/the-quiet-grief', { waitUntil: 'networkidle' })
  await scrollPageToTriggerLazyAssets(page)
  await page.waitForTimeout(1000)
  await page.goto(BASE + '/article/she-didnt-say-qubool-hai', { waitUntil: 'networkidle' })
  await scrollPageToTriggerLazyAssets(page)
  await page.waitForTimeout(1000)

  const pendingSourceAssets = [
    '/img/works/Dehg27tE_hF-1.webp',
    '/img/works/Dehg27tE_hF-2.webp',
    '/img/works/Dehg27tE_hF-3.webp',
    '/img/works/Dehg27tE_hF-4.webp',
    '/img/works/Dehg27tE_hF-5.webp',
    '/img/works/Dehg27tE_hF-6.webp',
    '/img/works/Dehg27tE_hF-7.webp',
    '/img/works/Dehg27tE_hF-8.webp',
    '/img/works/Dehg27tE_hF-9.webp',
  ]
  let totalRes = 0
  let totalExp = 0
  for (const f of Object.values(findings)) {
    totalExp += f.count
    totalRes += f.resolved
  }

  const inventorySummary = {
    roleSubsetTotal: totalExp,
    roleSubsetResolved: totalRes,
    publicImageAndSvgTotal: imageAndSvgAssets.length,
    publicFontTotal: fontAssets.length,
    publicMediaAndFontTotal: allPublicAssets.length,
    publicInventoryResolved: publicResolved,
    publicInventoryMissing: publicMissing,
  }

  fs.writeFileSync(
    path.join(OUT, 'asset-audit.json'),
    JSON.stringify(
      {
        findings,
        inventorySummary,
        pendingSourceAssets,
        liveRequests: [...new Set(reqs)],
        failedAll,
      },
      null,
      2
    )
  )
  await browser.close()

  console.log('=== ASSET AUDIT ===')
  for (const [role, f] of Object.entries(findings)) {
    console.log(
      `  ${role.padEnd(12)} ${f.resolved}/${f.count} resolved ${f.missing.length ? 'MISSING: ' + f.missing.join(', ') : ''}`
    )
  }
  console.log(
    `ROLE SUBSET: ${totalRes}/${totalExp} resolved | FULL PUBLIC INVENTORY: ${publicResolved}/${allPublicAssets.length} (${imageAndSvgAssets.length} images/SVGs + ${fontAssets.length} fonts) | missing: ${failedAll.length + publicMissing.length}`
  )
}
run().catch((e) => {
  console.error(e)
  process.exit(1)
})
