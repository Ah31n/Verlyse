import puppeteer from 'puppeteer'
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-dev-shm-usage'] })
const p = await b.newPage()
await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' })
await new Promise(r=>setTimeout(r,5600))
const info = await p.evaluate(() => {
  const cvs = [...document.querySelectorAll('canvas')]
  const c = cvs[0]
  const r = c ? c.getBoundingClientRect() : null
  const cs = c ? getComputedStyle(c) : null
  // sample a pixel at 100,100 from the canvas
  let sampled = null
  if (c) {
    try {
      const ctx = c.getContext('webgl2') || c.getContext('webgl')
      const gl = ctx
      if (gl) { const px = new Uint8Array(4); gl.readPixels(100, 100, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); sampled = [...px] }
    } catch(e) { sampled = 'err:'+e.message }
  }
  const hero = document.querySelector('section.relative')
  return {
    canvases: cvs.length,
    rect: r ? { x:r.x, y:r.y, w:r.width, h:r.height } : null,
    blend: cs ? cs.mixBlendMode : null,
    canvasParentClass: c ? c.parentElement?.className?.slice(0,80) : null,
    sampled,
    bodyBg: getComputedStyle(document.body).backgroundColor,
  }
})
console.log(JSON.stringify(info, null, 1))
await b.close()
