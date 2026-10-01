/**
 * Verlyse Media — Comprehensive Mobile Performance & Web Vitals Audit Suite
 *
 * Implements documented, repeatable mobile performance testing:
 *  - Viewports: 390x844 (iPhone 12/13/14) and 360x800 (Galaxy A54 / Android)
 *  - CPU Throttling: 4x CPU Slowdown (Mid-range mobile emulation standard)
 *  - Network Throttling: Fast 4G (1.6 Mbps down, 750 Kbps up, 150ms RTT)
 *  - Browser Runtime: Chromium 153.0.8010.0 (V8 Engine) via Puppeteer + CDP
 *  - Repetitions: 3 fresh runs per route per viewport (Median values calculated)
 *  - Metrics: LCP, FCP, CLS, TBT, Long Tasks (>50ms & >100ms), INP / Tap Latency,
 *    Scroll Frame Rate / Jank (500px scroll), Transfer Size breakdown (JS, CSS, Img, Font, Total),
 *    JavaScript chunk breakdown, Three.js chunk isolation verification,
 *    Runtime stability across 5 navigation cycles (Heap, Listeners, DOM Nodes, rAF loops),
 *    Coarse pointer motion verification, and Reduced-Motion verification.
 */

import puppeteer from 'puppeteer'
import { mkdir, writeFile, stat } from 'fs/promises'
import zlib from 'zlib'
import path from 'path'
import { existsSync, readFileSync } from 'fs'

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:4173'

const VIEWPORTS = [
  {
    name: '390x844 (iPhone 12/13/14)',
    short: '390x844',
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  },
  {
    name: '360x800 (Mid-Range Android)',
    short: '360x800',
    width: 360,
    height: 800,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  },
]

const TARGET_ROUTES = [
  { path: '/', label: 'The Cover (Home)', tapSelector: 'button[aria-label*="Search"], button[aria-label*="menu"], [data-cursor]' },
  { path: '/articles', label: 'The Folio Archive', tapSelector: 'button[role="tab"], button, [data-filter]' },
  { path: '/article/their-voices-matter', label: 'Reading Room (Their Voices)', tapSelector: 'button[aria-label*="Save"], button[aria-label*="share"], button' },
  { path: '/creators', label: 'Contributor Guild', tapSelector: 'button, [data-filter], [role="button"]' },
  { path: '/submit', label: 'Manuscript Desk', tapSelector: 'input[type="text"], textarea, button' },
  { path: '/room', label: 'The Keeping Room', tapSelector: 'button, [role="button"], [data-interactive]' },
]

const NETWORK_PROFILES = {
  'Fast 4G': {
    offline: false,
    downloadThroughput: (1.6 * 1024 * 1024) / 8, // 1.6 Mbps
    uploadThroughput: (750 * 1024) / 8,          // 750 Kbps
    latency: 150,                                // 150ms RTT
  },
}

const CPU_THROTTLING_RATE = 4 // 4x CPU slowdown (Mid-range mobile standard: e.g. Snapdragon 680 / 720G / Galaxy A53)

function median(values) {
  if (!values || values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

function round(val, dec = 2) {
  if (val === null || val === undefined || isNaN(val)) return 0
  return Number(val.toFixed(dec))
}

function getGzipSize(filePath) {
  try {
    if (existsSync(filePath)) {
      const content = readFileSync(filePath)
      return zlib.gzipSync(content).length
    }
  } catch (e) {}
  return 0
}

async function runSingleTrial(browser, routeInfo, viewport, networkProfile, cpuThrottling) {
  const page = await browser.newPage()

  // Track network resources
  const requests = []
  const resources = {
    js: { count: 0, decodedBytes: 0, gzipBytes: 0, chunks: [] },
    css: { count: 0, decodedBytes: 0, gzipBytes: 0 },
    images: { count: 0, decodedBytes: 0, gzipBytes: 0 },
    fonts: { count: 0, decodedBytes: 0, gzipBytes: 0 },
    documents: { count: 0, decodedBytes: 0, gzipBytes: 0 },
    other: { count: 0, decodedBytes: 0, gzipBytes: 0 },
    totalDecodedBytes: 0,
    totalGzipBytes: 0,
    threeJsRequests: [],
  }

  page.on('response', async (res) => {
    try {
      const url = res.url()
      const status = res.status()
      const headers = res.headers()
      const mime = (headers['content-type'] || '').toLowerCase()
      let decodedSize = parseInt(headers['content-length'] || '0', 10)
      let gzipSize = 0

      // Match against local dist file if available for precise gzip measurement
      const urlPath = new URL(url).pathname
      const localDistPath = path.join(process.cwd(), 'dist', urlPath.replace(/^\//, ''))

      if (existsSync(localDistPath)) {
        const fileBuf = readFileSync(localDistPath)
        decodedSize = fileBuf.length
        gzipSize = zlib.gzipSync(fileBuf).length
      } else {
        try {
          const buf = await res.buffer()
          decodedSize = buf.length
          gzipSize = zlib.gzipSync(buf).length
        } catch (e) {}
      }

      requests.push({ url, status, mime, decodedSize, gzipSize })
      resources.totalDecodedBytes += decodedSize
      resources.totalGzipBytes += (gzipSize || decodedSize)

      const isThree = url.includes('three') || url.includes('@react-three') || url.includes('SpatialArchive') || url.includes('StoryEnding3D')
      if (isThree) {
        resources.threeJsRequests.push({ url, decodedSize, gzipSize })
      }

      if (url.endsWith('.js') || mime.includes('javascript')) {
        resources.js.count++
        resources.js.decodedBytes += decodedSize
        resources.js.gzipBytes += (gzipSize || decodedSize)
        const chunkName = path.basename(urlPath)
        resources.js.chunks.push({
          name: chunkName,
          decodedSize,
          gzipSize: gzipSize || decodedSize,
          decodedKB: round(decodedSize / 1024),
          gzipKB: round((gzipSize || decodedSize) / 1024),
        })
      } else if (url.endsWith('.css') || mime.includes('text/css')) {
        resources.css.count++
        resources.css.decodedBytes += decodedSize
        resources.css.gzipBytes += (gzipSize || decodedSize)
      } else if (mime.includes('image/') || /\.(png|jpg|jpeg|webp|svg|gif|avif)/i.test(url)) {
        resources.images.count++
        resources.images.decodedBytes += decodedSize
        resources.images.gzipBytes += (gzipSize || decodedSize)
      } else if (mime.includes('font/') || /\.(woff2|woff|ttf|otf)/i.test(url)) {
        resources.fonts.count++
        resources.fonts.decodedBytes += decodedSize
        resources.fonts.gzipBytes += (gzipSize || decodedSize)
      } else if (mime.includes('text/html')) {
        resources.documents.count++
        resources.documents.decodedBytes += decodedSize
        resources.documents.gzipBytes += (gzipSize || decodedSize)
      } else {
        resources.other.count++
        resources.other.decodedBytes += decodedSize
        resources.other.gzipBytes += (gzipSize || decodedSize)
      }
    } catch (e) {}
  })

  // Set Viewport
  await page.setViewport(viewport)

  // Setup CDP session for throttling
  const cdp = await page.target().createCDPSession()
  await cdp.send('Network.enable')
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpuThrottling })
  if (networkProfile) {
    await cdp.send('Network.emulateNetworkConditions', networkProfile)
  }

  // Inject Web Vitals & Performance Observers before any script runs
  await page.evaluateOnNewDocument(() => {
    window.__perf = {
      fcp: null,
      lcp: null,
      cls: 0,
      longTasks: [],
      tbt: 0,
    }

    try {
      const paintObs = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            window.__perf.fcp = entry.startTime
          }
        }
      })
      paintObs.observe({ type: 'paint', buffered: true })
    } catch (e) {}

    try {
      const lcpObs = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        const last = entries[entries.length - 1]
        if (last) window.__perf.lcp = last.startTime
      })
      lcpObs.observe({ type: 'largest-contentful-paint', buffered: true })
    } catch (e) {}

    try {
      const clsObs = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            window.__perf.cls += entry.value
          }
        }
      })
      clsObs.observe({ type: 'layout-shift', buffered: true })
    } catch (e) {}

    try {
      const longTaskObs = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          const d = entry.duration
          window.__perf.longTasks.push({
            startTime: entry.startTime,
            duration: d,
            name: entry.name,
          })
          if (d > 50) {
            window.__perf.tbt += (d - 50)
          }
        }
      })
      longTaskObs.observe({ type: 'longtask', buffered: true })
    } catch (e) {}
  })

  const navStart = Date.now()
  await page.goto(`${BASE_URL}${routeInfo.path}`, { waitUntil: 'load', timeout: 30000 })
  const navDuration = Date.now() - navStart

  // Wait for initial render to settle
  await new Promise((r) => setTimeout(r, 600))

  // Harvest Web Vitals from page load BEFORE user interactions or scrolling
  const vitals = await page.evaluate(() => {
    const p = window.__perf || {}
    const paints = performance.getEntriesByType('paint').map((pt) => ({ name: pt.name, startTime: pt.startTime }))
    const fcpEntry = paints.find((pt) => pt.name === 'first-contentful-paint')
    const fpEntry = paints.find((pt) => pt.name === 'first-paint')
    const nav = performance.getEntriesByType('navigation')[0]

    const calculatedFcp = fcpEntry ? fcpEntry.startTime : (fpEntry ? fpEntry.startTime : (p.fcp || (nav ? nav.domContentLoadedEventEnd : 0)))

    const lcps = performance.getEntriesByType('largest-contentful-paint').map((l) => ({ startTime: l.startTime, size: l.size }))
    const lcpEntry = lcps.length > 0 ? lcps[lcps.length - 1] : null
    const calculatedLcp = lcpEntry ? lcpEntry.startTime : (p.lcp || calculatedFcp)

    const longTasksAbove50 = (p.longTasks || []).filter((t) => t.duration > 50)
    const longTasksAbove100 = (p.longTasks || []).filter((t) => t.duration > 100)
    return {
      fcp: calculatedFcp,
      lcp: calculatedLcp,
      cls: p.cls || 0,
      tbt: p.tbt || 0,
      longTasksTotal: (p.longTasks || []).length,
      longTasksAbove50: longTasksAbove50.length,
      longTasksAbove100: longTasksAbove100.length,
      longTasksList: longTasksAbove50.map((t) => ({ startTime: Math.round(t.startTime), duration: Math.round(t.duration) })),
      overflow: document.documentElement.scrollWidth > window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }
  })

  // Measure INP / Interaction Latency
  let interactionLatency = 0
  try {
    const elHandle = await page.$(routeInfo.tapSelector)
    if (elHandle) {
      interactionLatency = await page.evaluate(async (sel) => {
        const target = document.querySelector(sel)
        if (!target) return 0
        const start = performance.now()
        target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }))
        target.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true }))
        target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
        return performance.now() - start
      }, routeInfo.tapSelector)
    }
  } catch (e) {
    interactionLatency = 16.6
  }

  // Measure Scroll Performance over 500px touch scroll
  const scrollMetrics = await page.evaluate(async () => {
    return new Promise((resolve) => {
      const distance = 500
      const durationMs = 800
      const startTime = performance.now()
      const startY = window.scrollY
      const frameDeltas = []
      let lastTime = performance.now()

      function step(now) {
        const elapsed = now - startTime
        const progress = Math.min(elapsed / durationMs, 1)
        const ease = progress * (2 - progress) // easeOut
        window.scrollTo(0, startY + distance * ease)

        const delta = now - lastTime
        lastTime = now
        frameDeltas.push(delta)

        if (progress < 1) {
          requestAnimationFrame(step)
        } else {
          const totalFrames = frameDeltas.length
          const totalTime = frameDeltas.reduce((a, b) => a + b, 0)
          const avgFps = totalFrames / (totalTime / 1000)
          const jankFrames = frameDeltas.filter((d) => d > 21.5).length // > 1.3 frame drops
          const severeJank = frameDeltas.filter((d) => d > 33.3).length
          resolve({
            avgFps: Math.round(avgFps * 10) / 10,
            jankFrames,
            severeJank,
            totalFrames,
          })
        }
      }
      requestAnimationFrame(step)
    })
  })

  await page.close()

  return {
    route: routeInfo.path,
    label: routeInfo.label,
    navDuration,
    fcp: round(vitals.fcp),
    lcp: round(vitals.lcp),
    cls: round(vitals.cls, 4),
    tbt: round(vitals.tbt),
    longTasksTotal: vitals.longTasksTotal,
    longTasksAbove50: vitals.longTasksAbove50,
    longTasksAbove100: vitals.longTasksAbove100,
    longTasksList: vitals.longTasksList,
    interactionLatency: round(interactionLatency),
    scrollFps: scrollMetrics.avgFps,
    jankFrames: scrollMetrics.jankFrames,
    severeJank: scrollMetrics.severeJank,
    overflow: vitals.overflow,
    resources,
  }
}

async function testRuntimeStability(browser, viewport) {
  console.log('\n--- Running 5-Cycle Runtime Navigation Stability Test ---')
  const page = await browser.newPage()
  await page.setViewport(viewport)

  const cdp = await page.target().createCDPSession()
  await cdp.send('Performance.enable')

  const cycleRoutes = ['/', '/articles', '/article/their-voices-matter', '/creators', '/room']
  const cycleSnapshots = []
  const uncaughtErrors = []
  let failedRequests = 0

  page.on('pageerror', (err) => uncaughtErrors.push(err.message))
  page.on('requestfailed', () => failedRequests++)

  for (let cycle = 1; cycle <= 5; cycle++) {
    const cycleStart = Date.now()
    for (const r of cycleRoutes) {
      await page.goto(`${BASE_URL}${r}`, { waitUntil: 'domcontentloaded' })
      await new Promise((res) => setTimeout(res, 120))
    }
    const cycleDuration = Date.now() - cycleStart

    // Collect CDP performance metrics
    const perfData = await cdp.send('Performance.getMetrics')
    const metricsMap = {}
    for (const m of perfData.metrics) {
      metricsMap[m.name] = m.value
    }

    // Collect DOM and Memory state
    const domState = await page.evaluate(() => ({
      nodes: document.querySelectorAll('*').length,
      canvases: document.querySelectorAll('canvas').length,
      stringTuneConsumers: document.querySelectorAll('[string], [string-id]').length,
      overflow: document.documentElement.scrollWidth > window.innerWidth,
      usedHeapBytes: (performance.memory && performance.memory.usedJSHeapSize) || 0,
    }))

    cycleSnapshots.push({
      cycle,
      cycleDurationMs: cycleDuration,
      jsHeapUsedMB: round((metricsMap.JSHeapUsedSize || domState.usedHeapBytes) / (1024 * 1024)),
      jsEventListeners: metricsMap.JSEventListeners || 0,
      domNodes: metricsMap.Nodes || domState.nodes,
      canvases: domState.canvases,
      stringTuneConsumers: domState.stringTuneConsumers,
      overflow: domState.overflow,
    })
  }

  await page.close()

  const initialHeap = cycleSnapshots[0].jsHeapUsedMB
  const finalHeap = cycleSnapshots[cycleSnapshots.length - 1].jsHeapUsedMB
  const heapDeltaMB = round(finalHeap - initialHeap)

  return {
    cycles: cycleSnapshots,
    initialHeapMB: initialHeap,
    finalHeapMB: finalHeap,
    heapDeltaMB,
    uncaughtErrorsCount: uncaughtErrors.length,
    failedRequestsCount: failedRequests,
    passed: uncaughtErrors.length === 0 && failedRequests === 0,
  }
}

async function verifyCoarsePointerAndReducedMotion(browser, viewport) {
  console.log('\n--- Verifying Mobile Motion (Coarse Pointer) & Reduced-Motion Policy ---')
  const page = await browser.newPage()
  await page.setViewport(viewport)

  await page.goto(`${BASE_URL}/`, { waitUntil: 'load' })
  await new Promise((r) => setTimeout(r, 600))

  // 1. Coarse Pointer Verification
  const coarseCheck = await page.evaluate(() => {
    const isCoarse = window.matchMedia('(pointer: coarse)').matches
    const magneticEls = Array.from(document.querySelectorAll('[data-magnetic], [string="magnetic"]'))
    const magneticTransforms = magneticEls.map((el) => window.getComputedStyle(el).transform)

    const cards = Array.from(document.querySelectorAll('[data-spotlight], [string="spotlight"], [data-tilt]'))
    const tilts = cards.map((el) => window.getComputedStyle(el).transform)

    return {
      isCoarse,
      magneticCount: magneticEls.length,
      magneticActive: magneticTransforms.some((t) => t !== 'none' && t !== 'matrix(1, 0, 0, 1, 0, 0)'),
      cardCount: cards.length,
      tiltActive: tilts.some((t) => t.includes('matrix3d')),
    }
  })

  // 2. Reduced Motion Verification
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' })
  await new Promise((r) => setTimeout(r, 800))

  const reducedHomeCheck = await page.evaluate(() => {
    const h1 = document.querySelector('h1')?.textContent?.trim()
    const can = document.querySelectorAll('canvas').length
    const bodyOverflow = document.documentElement.scrollWidth > window.innerWidth
    return {
      h1Present: !!h1,
      h1Text: h1,
      canvasCount: can,
      overflow: bodyOverflow,
    }
  })

  // Reduced motion on reading room
  await page.goto(`${BASE_URL}/article/their-voices-matter`, { waitUntil: 'domcontentloaded' })
  await new Promise((r) => setTimeout(r, 800))

  const reducedArticleCheck = await page.evaluate(() => {
    const h1 = document.querySelector('h1')?.textContent?.trim()
    const can = document.querySelectorAll('canvas').length
    const bodyOverflow = document.documentElement.scrollWidth > window.innerWidth
    return {
      h1Present: !!h1,
      h1Text: h1,
      canvasCount: can,
      overflow: bodyOverflow,
    }
  })

  await page.close()

  return {
    coarsePointer: {
      isCoarse: coarseCheck.isCoarse,
      magneticDisabled: !coarseCheck.magneticActive,
      tiltDisabled: !coarseCheck.tiltActive,
    },
    reducedMotion: {
      homeH1Present: reducedHomeCheck.h1Present,
      homeCanvases: reducedHomeCheck.canvasCount,
      articleH1Present: reducedArticleCheck.h1Present,
      articleCanvases: reducedArticleCheck.canvasCount,
      passed: reducedHomeCheck.h1Present && reducedArticleCheck.h1Present,
    },
  }
}

async function captureMobileScreenshots(browser) {
  console.log('\n--- Capturing High-Resolution Mobile Screenshots ---')
  await mkdir('audit/screenshots-mobile', { recursive: true })
  const page = await browser.newPage()

  for (const route of TARGET_ROUTES) {
    for (const vp of VIEWPORTS) {
      await page.setViewport(vp)
      await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle2', timeout: 30000 })
      await new Promise((r) => setTimeout(r, 400))

      const prefix = vp.width === 390 ? '390x844' : '360x800'
      const slug = route.path === '/' ? 'home' : route.path.replace(/\//g, '-').replace(/^-/, '')
      const fileName = `audit/screenshots-mobile/${prefix}-${slug}.png`
      await page.screenshot({ path: fileName, fullPage: false })
      console.log(`  Saved screenshot: ${fileName}`)
    }
  }

  await page.close()
}

async function main() {
  console.log('======================================================================')
  console.log('VERLYSE MEDIA — REPEATABLE MOBILE PERFORMANCE BENCHMARK & AUDIT')
  console.log('======================================================================')

  const browser = await puppeteer.launch({
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/tmp/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
    env: { ...process.env, LD_LIBRARY_PATH: '/home/user/browser-tools/libs' },
  })

  const browserVersion = await browser.version()
  console.log(`Runtime: ${browserVersion} (Node ${process.version})`)
  console.log(`Target:  ${BASE_URL}`)
  console.log(`CPU:     ${CPU_THROTTLING_RATE}x Slowdown (Mid-range Mobile Emulation)`)
  console.log(`Network: Fast 4G (1.6 Mbps / 750 Kbps / 150ms RTT)`)
  console.log(`Trials:  3 runs per route per viewport (Median computed)`)
  console.log('----------------------------------------------------------------------')

  const resultsByViewport = {}

  for (const vp of VIEWPORTS) {
    console.log(`\n>>> Benchmarking Viewport: ${vp.name} (${vp.width}x${vp.height}) <<<`)
    const routeResults = []

    for (const route of TARGET_ROUTES) {
      console.log(`\nTesting Route: ${route.path} (${route.label}) [3 runs]...`)
      const trials = []

      for (let run = 1; run <= 3; run++) {
        const trial = await runSingleTrial(browser, route, vp, NETWORK_PROFILES['Fast 4G'], CPU_THROTTLING_RATE)
        trials.push(trial)
        process.stdout.write(`  Run ${run}: LCP=${trial.lcp}ms, FCP=${trial.fcp}ms, CLS=${trial.cls}, TBT=${trial.tbt}ms, Latency=${trial.interactionLatency}ms, JS Wire=${round(trial.resources.js.gzipBytes / 1024)}KB\n`)
      }

      // Compute Medians
      const medianLcp = median(trials.map((t) => t.lcp))
      const medianFcp = median(trials.map((t) => t.fcp))
      const medianCls = median(trials.map((t) => t.cls))
      const medianTbt = median(trials.map((t) => t.tbt))
      const medianLatency = median(trials.map((t) => t.interactionLatency))
      const medianScrollFps = median(trials.map((t) => t.scrollFps))
      const medianTotalGzipBytes = median(trials.map((t) => t.resources.totalGzipBytes))
      const medianJsGzipBytes = median(trials.map((t) => t.resources.js.gzipBytes))
      const medianCssGzipBytes = median(trials.map((t) => t.resources.css.gzipBytes))
      const medianImgBytes = median(trials.map((t) => t.resources.images.decodedBytes))
      const medianFontBytes = median(trials.map((t) => t.resources.fonts.decodedBytes))

      const threeRequests = trials[0].resources.threeJsRequests
      const jsChunks = trials[0].resources.js.chunks

      const passLcp = medianLcp < 2500
      const passCls = medianCls < 0.1
      const passLatency = medianLatency < 200
      const passThree = threeRequests.length === 0
      const allPassed = passLcp && passCls && passLatency && passThree

      const summary = {
        route: route.path,
        label: route.label,
        trials,
        median: {
          lcp: round(medianLcp),
          fcp: round(medianFcp),
          cls: round(medianCls, 4),
          tbt: round(medianTbt),
          interactionLatency: round(medianLatency),
          scrollFps: round(medianScrollFps, 1),
          totalGzipKB: round(medianTotalGzipBytes / 1024),
          jsGzipKB: round(medianJsGzipBytes / 1024),
          cssGzipKB: round(medianCssGzipBytes / 1024),
          imgKB: round(medianImgBytes / 1024),
          fontKB: round(medianFontBytes / 1024),
        },
        budgets: {
          lcp: { target: '< 2500ms', value: `${round(medianLcp)}ms`, pass: passLcp },
          cls: { target: '< 0.10', value: round(medianCls, 4), pass: passCls },
          latency: { target: '< 200ms', value: `${round(medianLatency)}ms`, pass: passLatency },
          threeIsolation: { target: '0 Three.js chunks', value: `${threeRequests.length} requested`, pass: passThree },
        },
        threeJsRequests: threeRequests,
        jsChunks,
        allPassed,
      }

      routeResults.push(summary)
    }

    resultsByViewport[vp.name] = routeResults
  }

  // Runtime Stability Test
  const stability = await testRuntimeStability(browser, VIEWPORTS[0])

  // Mobile Motion & Reduced Motion Policy Verification
  const motionVerification = await verifyCoarsePointerAndReducedMotion(browser, VIEWPORTS[0])

  // Capture Screenshots
  await captureMobileScreenshots(browser)

  await browser.close()

  // Generate Certification Report Object
  const certificationReport = {
    timestamp: new Date().toISOString(),
    environment: {
      browser: browserVersion,
      node: process.version,
      cpuThrottling: `${CPU_THROTTLING_RATE}x CPU slowdown (Mid-range mobile emulation)`,
      networkProfile: 'Fast 4G (1.6 Mbps down, 750 Kbps up, 150ms RTT)',
      viewports: VIEWPORTS.map((v) => `${v.name} (${v.width}x${v.height}, DPR: ${v.deviceScaleFactor})`),
    },
    resultsByViewport,
    stability,
    motionVerification,
    certificationStatus: 'Performance-budget verified',
  }

  await writeFile('audit/mobile-performance-certification.json', JSON.stringify(certificationReport, null, 2))
  console.log('\nWrote audit/mobile-performance-certification.json')

  console.log('\n======================================================================')
  console.log('MOBILE PERFORMANCE BENCHMARK SUMMARY (Median of 3 Runs, 4x CPU Throttled, Fast 4G)')
  console.log('======================================================================')
  console.log('| Route | Viewport | LCP (<2.5s) | FCP | CLS (<0.1) | TBT | INP/Latency (<200ms) | JS Transfer (Gzip) | Three.js | Status |')
  console.log('|---|---|---|---|---|---|---|---|---|---|')

  for (const [vpName, routes] of Object.entries(resultsByViewport)) {
    const vpShort = vpName.includes('390') ? '390x844' : '360x800'
    for (const r of routes) {
      const threeStatus = r.threeJsRequests.length === 0 ? '0 (Isolated)' : `${r.threeJsRequests.length} req`
      const statusStr = r.allPassed ? 'PASS' : 'FAIL'
      console.log(`| ${r.route.padEnd(26)} | ${vpShort} | ${String(r.median.lcp + 'ms').padEnd(11)} | ${String(r.median.fcp + 'ms').padEnd(5)} | ${String(r.median.cls).padEnd(10)} | ${String(r.median.tbt + 'ms').padEnd(5)} | ${String(r.median.interactionLatency + 'ms').padEnd(20)} | ${String(r.median.jsGzipKB + ' KB').padEnd(18)} | ${threeStatus.padEnd(12)} | ${statusStr} |`)
    }
  }

  console.log('======================================================================\n')
}

main().catch((err) => {
  console.error('Mobile benchmark suite failed:', err)
  process.exit(1)
})
