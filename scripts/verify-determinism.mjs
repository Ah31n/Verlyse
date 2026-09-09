/* eslint-disable no-console */
import { chromium } from '@playwright/test'
import * as fs from 'node:fs'
const BASE = 'http://127.0.0.1:5173'
const OUT = 'audit'
const results = {}
function pass(id, ok, detail) { results[id] = { status: ok ? 'PASS' : 'FAIL', detail } }

async function run() {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  // Collect the StoryEnding3D data-scene-kind + data-ending across reloads for the same article.
  async function collect(slug) {
    let data = null
    for (let i = 0; i < 2; i++) {
      await page.goto(BASE + '/article/' + slug, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1400)
      const v = await page.evaluate(() => {
        const el = document.querySelector('[data-ending]')
        return el ? { ending: el.getAttribute('data-ending'), kind: el.getAttribute('data-scene-kind'), phase: el.getAttribute('data-phase') } : null
      })
      if (!data) data = v
      else if (data.ending !== v.ending || data.kind !== v.kind) data = { ...data, changed: true }
    }
    return data
  }
  let a = await collect('their-voices-matter')
  let b = await collect('3-13')
  a = { ...a, changed: undefined }
  b = { ...b, changed: undefined }
  pass('deterministic-same-article', a && !a.changed && b && !b.changed, `tvm=${a?.kind} 3-13=${b?.kind} (stable across reloads)`)
  pass('story-specific-distinct', a?.kind === 'voices' && b?.kind === 'clock', `distinct sceneKinds ${a?.kind} vs ${b?.kind}`)
  fs.writeFileSync(`${OUT}/verify-determinism.json`, JSON.stringify({ results }, null, 2))
  await browser.close()
  for (const [k, v] of Object.entries(results)) console.log(`  [${v.status}] ${k}: ${v.detail}`)
}
run().catch((e) => { console.error(e); process.exit(1) })
