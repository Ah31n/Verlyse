import puppeteer from 'puppeteer'
import fs from 'node:fs'
const BASE='http://localhost:5173', OUT='/home/user/verlyse-project/audit/shots'
fs.mkdirSync(OUT,{recursive:true})
const results=[]
const pass=(n,d='')=>results.push({check:n,status:'PASS',detail:d})
const fail=(n,d='')=>results.push({check:n,status:'FAIL',detail:d})
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms))
const b=await puppeteer.launch({args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'],headless:'new'})
const p=await b.newPage()
await p.setViewport({width:1440,height:900})
const errors=[]
p.on('pageerror',e=>errors.push(String(e)))
p.on('console',m=>m.type()==='error'&&errors.push(m.text()))

// go to articles, focus folio 19 via arrows, pull
await p.goto(`${BASE}/articles`,{waitUntil:'domcontentloaded',timeout:30000})
await sleep(1600)
await p.focus('a[aria-label^="Folio"]')
for(let i=0;i<18;i++){ await p.keyboard.press('ArrowRight'); await sleep(60) }
await sleep(400)
const focused = await p.evaluate(()=>document.querySelector('a[aria-current="true"]')?.getAttribute('aria-label')||'')
if(focused.includes('Mir Raza Ali')) pass('pull: focus on №19 Mir Raza Ali')
else fail('pull: focus №19', focused)

// Enter → threshold veil with folio label
// The veil mounts after the previous route's exit completes (~0.8s), then fades
// over 0.85s. Poll for it instead of sampling at a fixed 700ms — fixes the
// known timing race (veil found at ~900ms) without weakening the assertion.
await p.keyboard.press('Enter')
let veil = ''
for (let i = 0; i < 16; i++) {
  await sleep(100)
  veil = await p.evaluate(()=>{
    const vs=Array.from(document.querySelectorAll('div')).filter(d=>(d.className||'').includes('z-[1150]')&&(d.className||'').includes('bg-[#2A0F18]'))
    const active=vs.find(v=>parseFloat(getComputedStyle(v).opacity)>0.5)
    return active?active.innerText:''
  })
  if(/folio 19 · reading/i.test(veil)) break
}
if(/folio 19 · reading/i.test(veil)) pass(`pull: threshold announces "${veil.trim().replace(/\s+/g,' ')}"`)
else fail('pull: threshold label', veil)
await p.screenshot({path:`${OUT}/phase21-pull-veil.png`})
await sleep(1500)
const url=p.url()
if(url.includes('/article/mir-raza-ali')) pass('pull: handoff to canonical /article/mir-raza-ali')
else fail('pull: handoff', url)
await p.screenshot({path:`${OUT}/phase21-article-reading.png`})

// canonical reading page present (masthead + body)
const body=await p.evaluate(()=>document.body.innerText)
if(/verlyse media/i.test(body)&&/mir raza ali/i.test(body)) pass('reading: canonical ArticleDetail renders')
else fail('reading: ArticleDetail', body.slice(0,80))

// Back → returns to /articles archive
await p.goBack({waitUntil:'domcontentloaded',timeout:30000})
await sleep(1400)
if(p.url().includes('/articles')) pass('return: back lands on /articles archive')
else fail('return: back', p.url())
const plates=await p.evaluate(()=>document.querySelectorAll('a[aria-label^="Folio"]').length)
if(plates===19) pass('return: archive restored (19 folios)')
else fail('return: archive', String(plates))
if(errors.length===0) pass('console clean')
else fail('console', JSON.stringify(errors.slice(0,3)))
await b.close()
const fails=results.filter(r=>r.status==='FAIL')
console.log('\n=== PHASE 21 SLICE D/E VALIDATION ===')
for(const r of results) console.log(`${r.status==='PASS'?'✅':'❌'} ${r.check}${r.detail?' — '+r.detail:''}`)
console.log(`\nTOTAL ${results.length} | PASS ${results.length-fails.length} | FAIL ${fails.length}`)
fs.writeFileSync('/home/user/verlyse-project/audit/phase21-de-results.json',JSON.stringify(results,null,2))
process.exit(fails.length?1:0)
