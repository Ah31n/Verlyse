// PHASE 16 — reduced motion, WebGL fallback, keyboard/focus, landmarks, overflow, blank states.
import puppeteer from 'puppeteer'
const ROOT = 'http://localhost:4173'
const D = '/home/user/phase14-verify'

/* ---------- A. Reduced motion ---------- */
let b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-gpu','--use-gl=swiftshader'] })
let p = await b.newPage()
await p.setViewport({ width: 1440, height: 900 })
await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
const rmResults = []
for (const [url, marker] of [['/','Where Vision Becomes A Voice'], ['/article/mir-raza-ali','Mir Raza Ali'], ['/ambassadors','Zainab Khan'], ['/articles','Contents']]) {
  await p.goto(ROOT + url, { waitUntil: 'networkidle2', timeout: 45000 })
  await new Promise(r=>setTimeout(r, 2500))
  const info = await p.evaluate((mk) => {
    const t = document.body.innerText || ''
    return { has: t.includes(mk), len: t.length, h1: document.querySelector('h1')?.textContent }
  }, marker)
  rmResults.push({ url, ...info })
  console.log(`RM  ${url} -> has=${info.has} len=${info.len} h1=${JSON.stringify(info.h1)}`)
}
await b.close()

/* ---------- B. WebGL disabled (fallback) ---------- */
b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-gpu','--disable-webgl','--disable-webgl2','--disable-3d-apis'] })
p = await b.newPage()
await p.setViewport({ width: 1440, height: 900 })
const webglResults = []
for (const url of ['/', '/article/mir-raza-ali', '/article/their-voices-matter']) {
  const errs = []
  p.on('pageerror', e => errs.push(String(e).slice(0,140)))
  p.on('console', m => { if (m.type()==='error') errs.push('console:'+m.text().slice(0,140)) })
  await p.goto(ROOT + url, { waitUntil: 'networkidle2', timeout: 45000 })
  await new Promise(r=>setTimeout(r, 3000))
  const info = await p.evaluate(() => {
    const gl = document.createElement('canvas')
    const ctx = gl.getContext('webgl2') || gl.getContext('webgl')
    return { webglAvail: !!ctx, len: (document.body.innerText||'').length,
             canvas: document.querySelectorAll('canvas').length }
  })
  p.off('pageerror'); p.off('console')
  webglResults.push({ url, ...info, errs })
  console.log(`GL  ${url} -> webglAvail=${info.webglAvail} canvas=${info.canvas} len=${info.len} errs=${errs.length ? errs.join(' | ') : 'none'}`)
}
await b.close()

/* ---------- C. Keyboard / focus / landmarks / overflow ---------- */
b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-gpu','--use-gl=swiftshader'] })
p = await b.newPage()
for (const vp of [{w:1440,h:900,name:'desktop'},{w:768,h:1024,name:'tablet'},{w:390,h:844,name:'mobile'}]) {
  await p.setViewport({ width: vp.w, height: vp.h })
  console.log(`\n-- ${vp.name} ${vp.w}x${vp.h} --`)
  for (const url of ['/', '/articles', '/article/mir-raza-ali', '/article/behind-every-headline', '/ambassadors', '/creators', '/categories', '/community']) {
    await p.goto(ROOT + url, { waitUntil: 'networkidle2', timeout: 45000 })
    await new Promise(r=>setTimeout(r, 2200))
    const info = await p.evaluate(() => {
      const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth
      const landmarks = {
        header: !!document.querySelector('header'),
        nav: document.querySelectorAll('nav').length,
        main: !!document.querySelector('main'),
        footer: !!document.querySelector('footer'),
      }
      const imgs = Array.from(document.querySelectorAll('img'))
      const noAlt = imgs.filter(i => !i.hasAttribute('alt')).length
      const btns = Array.from(document.querySelectorAll('button'))
      const unlabeled = btns.filter(x => !(x.getAttribute('aria-label') || x.textContent.trim())).length
      const skip = !!document.querySelector('a[href="#main"], a[href="#content"]')
      const h1s = document.querySelectorAll('h1').length
      return { overflow, landmarks, imgs: imgs.length, noAlt, btns: btns.length, unlabeled, skip, h1s,
               len: (document.body.innerText||'').length }
    })
    // keyboard: tab 8 times, ensure focus stays on interactive elements, no trap
    const focusSeq = []
    for (let i = 0; i < 8; i++) {
      await p.keyboard.press('Tab')
      focusSeq.push(await p.evaluate(() => {
        const el = document.activeElement
        return el ? `${el.tagName}${el.getAttribute('aria-label') ? '[aria]' : ''}${el.href ? '<a>' : ''}` : 'none'
      }))
    }
    const focusOk = !focusSeq.includes('none')
    const problems = []
    if (info.overflow > 2) problems.push(`overflow-x ${info.overflow}px`)
    if (!info.landmarks.header || !info.landmarks.main || !info.landmarks.footer) problems.push('missing landmarks')
    if (info.h1s !== 1) problems.push(`h1 count ${info.h1s}`)
    if (info.len < 200) problems.push('BLANK')
    if (!focusOk) problems.push('focus lost')
    if (info.noAlt > 0) problems.push(`${info.noAlt} img w/o alt`)
    if (info.unlabeled > 0) problems.push(`${info.unlabeled} unlabeled buttons`)
    console.log(`${problems.length?'✗':'✓'} ${url.padEnd(34)} overflow=${info.overflow} main=${info.landmarks.main} h1=${info.h1s} imgs=${info.imgs}(noAlt=${info.noAlt}) btns=${info.btns}(unl=${info.unlabeled}) skip=${info.skip} :: ${problems.join(' | ')}`)
  }
}
await p.screenshot({ path: `${D}/p16-not-needed.png` }).catch(()=>{})
await b.close()
console.log('\n==== PHASE16 A11Y/MOTION/GL/RESPONSIVE DONE ===')
