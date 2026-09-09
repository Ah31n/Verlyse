import puppeteer from 'puppeteer'
const b=await puppeteer.launch({args:['--no-sandbox','--disable-dev-shm-usage'],headless:'new'})
const p=await b.newPage(); await p.setViewport({width:390,height:844})
await p.goto('http://localhost:5173/articles',{waitUntil:'domcontentloaded',timeout:30000})
await new Promise(r=>setTimeout(r,2200))
console.log('innerWidth:',await p.evaluate(()=>window.innerWidth))
const info=await p.evaluate(()=>{
  const links=Array.from(document.querySelectorAll('a[aria-label^="Folio"]'))
  return {count:links.length, first:links.slice(0,6).map(a=>{
    const par=a.parentElement, cs=getComputedStyle(par)
    return {label:(a.getAttribute('aria-label')||'').slice(0,22), op:cs.opacity, transform:cs.transform.slice(0,80)}
  })}
})
console.log(JSON.stringify(info,null,1))
await p.screenshot({path:'/home/user/verlyse-project/audit/shots/probe-mobile-shelf.png'})
await b.close()
