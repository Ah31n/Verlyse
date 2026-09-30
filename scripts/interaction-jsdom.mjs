#!/usr/bin/env node
/**
 * Runs the jsdom interaction flows.
 *
 * Bundles the TSX with Vite SSR (the same mechanism as ssr-smoke and the
 * route registry loader), installs a jsdom window, and executes.
 *
 * This is a complement to the Playwright suites, not a replacement: it
 * verifies DOM behaviour only. Layout, paint, overflow, contrast and WebGL
 * still require a real browser.
 */
import { build } from 'vite'
import react from '@vitejs/plugin-react'
import { JSDOM } from 'jsdom'
import { rm } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { join } from 'node:path'

const outDir = join(process.cwd(), '.jsdom-run')

/* ---- jsdom environment, installed before the bundle is imported ------- */
const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', {
  url: 'https://verlysemedia.kesug.com/',
  pretendToBeVisual: true,
})

const g = globalThis
g.window = dom.window
g.document = dom.window.document
Object.defineProperty(g, 'navigator', { value: dom.window.navigator, configurable: true, writable: true })
g.HTMLElement = dom.window.HTMLElement
g.HTMLInputElement = dom.window.HTMLInputElement
g.Element = dom.window.Element
g.Node = dom.window.Node
g.Event = dom.window.Event
g.CustomEvent = dom.window.CustomEvent
g.KeyboardEvent = dom.window.KeyboardEvent
g.MouseEvent = dom.window.MouseEvent
g.getComputedStyle = dom.window.getComputedStyle
/* The publication calls bare `localStorage`, not `window.localStorage`. */
g.localStorage = dom.window.localStorage
g.sessionStorage = dom.window.sessionStorage
g.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0)
g.cancelAnimationFrame = (id) => clearTimeout(id)
g.IS_REACT_ACT_ENVIRONMENT = true

/* APIs jsdom does not implement that the publication uses */
const noopObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return [] }
}
g.IntersectionObserver = noopObserver
g.ResizeObserver = noopObserver
dom.window.IntersectionObserver = noopObserver
dom.window.ResizeObserver = noopObserver
dom.window.matchMedia = dom.window.matchMedia || ((q) => ({
  matches: false, media: q, onchange: null,
  addEventListener() {}, removeEventListener() {},
  addListener() {}, removeListener() {}, dispatchEvent() { return false },
}))
g.matchMedia = dom.window.matchMedia
dom.window.scrollTo = () => {}
g.scrollTo = () => {}

await build({
  configFile: false,
  plugins: [react()],
  logLevel: 'silent',
  /* React's act() is only available in the development build. */
  mode: 'development',
  define: { 'process.env.NODE_ENV': '"development"' },
  resolve: { conditions: ['browser', 'import', 'module', 'default'] },
  ssr: { noExternal: true, target: 'webworker' },
  build: {
    ssr: 'scripts/interaction-jsdom.tsx',
    outDir,
    emptyOutDir: true,
    minify: false,
    rollupOptions: { output: { entryFileNames: 'run.js' } },
  },
})

const mod = await import(pathToFileURL(join(outDir, 'run.js')).href)
const { report, passed, total, ok } = await mod.run()

console.log(report)
console.log(`\njsdom interaction flows: ${passed}/${total} passed.`)

await rm(outDir, { recursive: true, force: true })

/* jsdom keeps timers and a window alive; close it and exit deterministically
   so this can run in CI without hanging. */
dom.window.close()
process.exit(ok ? 0 : 1)
