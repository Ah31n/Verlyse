import puppeteer from 'puppeteer'
const b=await puppeteer.launch({args:['--no-sandbox','--disable-dev-shm-usage'],headless:'new'})
const p=await b.newPage(); await p.setViewport({width:1440,height:900})
await p.goto('http://localhost:5173/articles',{waitUntil:'domcontentloaded',timeout:30000})
await new Promise(r=>setTimeout(r,2200))
const info=await p.evaluate(()=>{
  const links=Array.from(document.querySelectorAll('a[aria-label^="Folio"]'))
  const rows={0:0,1:0,2:0}
  const plates=links.map((a,idx)=>{
    const par=a.parentElement
    const t=getComputedStyle(par).transform
    return {idx,label:(a.getAttribute('aria-label')||'').slice(0,18),op:parseFloat(getComputedStyle(par).opacity),transform:t}
  })
  // classify into rows by translateY
  const byRow={}
  for(const pl of plates){
    const m=pl.transform.match(/matrix3d\(([^)]+)\)/)||pl.transform.match(/matrix\(([^)]+)\)/)
    if(!m){byRow['?']=(byRow['?']||[]).concat(pl.idx);continue}
    const v=m[1].split(',').map(Number)
    const ty=v.length===16?v[13]:v[5]
    const key=ty<-80?0:ty>80?2:1
    byRow[key]=(byRow[key]||[]).concat(pl.idx)
  }
  return {count:plates.length, byRow}
})
console.log(JSON.stringify(info,null,1))
await p.screenshot({path:'/home/user/verlyse-project/audit/shots/22-articles-stacks.png'})
await b.close()
