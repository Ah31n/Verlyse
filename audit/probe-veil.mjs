import puppeteer from 'puppeteer'
const b=await puppeteer.launch({args:['--no-sandbox','--disable-dev-shm-usage'],headless:'new'})
const p=await b.newPage()
await p.setViewport({width:1440,height:900})
await p.goto('http://localhost:5173/articles',{waitUntil:'domcontentloaded',timeout:30000})
await new Promise(r=>setTimeout(r,1600))
await p.focus('a[aria-label^="Folio"]')
for(let i=0;i<18;i++){await p.keyboard.press('ArrowRight');await new Promise(r=>setTimeout(r,60))}
await new Promise(r=>setTimeout(r,300))
const active=await p.evaluate(()=>document.activeElement?.getAttribute('aria-label')||'no-active')
console.log('activeElement before Enter:',active)
await p.keyboard.press('Enter')
for(const t of [150,400,900,1600]){
  await new Promise(r=>setTimeout(r,t==150?150:t-([150,400,900,1600][[150,400,900,1600].indexOf(t)-1]||0)))
  const veil=await p.evaluate(()=>{
    const v=Array.from(document.querySelectorAll('div')).find(d=>(d.className||'').includes('z-[1150]')&&(d.className||'').includes('bg-[#2A0F18]'))
    return v?{txt:v.innerText.trim().replace(/\s+/g,' '),op:getComputedStyle(v).opacity}:null
  })
  console.log(`+${t}ms url=${p.url().split('/').pop()} veil=`,JSON.stringify(veil))
}
await b.close()
