import puppeteer from 'puppeteer'
const b=await puppeteer.launch({args:['--no-sandbox','--disable-dev-shm-usage'],headless:'new'})
const p=await b.newPage(); await p.setViewport({width:1440,height:900})
await p.goto('http://localhost:5173/',{waitUntil:'domcontentloaded',timeout:30000})
await new Promise(r=>setTimeout(r,2600))
const read=async(label)=>{
  const r=await p.evaluate(()=>{
    const out={ghost:'',copy:''}
    const big=[...document.querySelectorAll('p')].find(el=>/whitespace-nowrap/.test(el.className)&&/font-serif/.test(el.className)&&el.textContent.trim()==='Verlyse')
    if(big) out.ghost=getComputedStyle(big.parentElement).transform
    const copy=[...document.querySelectorAll('div')].find(el=>/pb-28/.test(el.className)&&/pt-44/.test(el.className)&&el.parentElement?.tagName==='SECTION')
    if(copy) out.copy=getComputedStyle(copy).transform
    return out
  })
  console.log(label,JSON.stringify(r))
}
await read('top')
await p.evaluate(()=>window.scrollTo(0,400)); await new Promise(r=>setTimeout(r,400))
await read('scrolled 400')
await p.evaluate(()=>window.scrollTo(0,800)); await new Promise(r=>setTimeout(r,400))
await read('scrolled 800')
// reduced motion
await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}])
await p.reload({waitUntil:'domcontentloaded'}); await new Promise(r=>setTimeout(r,2600))
await p.evaluate(()=>window.scrollTo(0,800)); await new Promise(r=>setTimeout(r,400))
await read('reduced scrolled 800')
await b.close()
