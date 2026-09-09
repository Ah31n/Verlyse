#!/usr/bin/env node
/* Build the SSR smoke entry with Vite, then render every route in Node.
   No browser required — this is the fast structural gate before deploy:
   it catches crash-in-render regressions on the whole publication. */
import { build } from 'vite'
import react from '@vitejs/plugin-react'
import { writeFile, mkdir, rm } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { join } from 'node:path'

const outDir = join(process.cwd(), '.ssr-smoke')

await mkdir(outDir, { recursive: true })
await build({
  configFile: false,
  plugins: [react()],
  logLevel: 'silent',
  build: {
    ssr: 'scripts/ssr-smoke.tsx',
    outDir,
    emptyOutDir: true,
    rollupOptions: { output: { entryFileNames: 'ssr-smoke.js' } },
  },
})

/* stubs for module-time browser access in the client-only components */
globalThis.matchMedia = globalThis.matchMedia ?? (() => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }))

const entry = await import(pathToFileURL(join(outDir, 'ssr-smoke.js')).href)
const report = entry.run()
console.log(report)
await rm(outDir, { recursive: true, force: true })
if (report.includes('SMOKE FAIL')) process.exit(1)
