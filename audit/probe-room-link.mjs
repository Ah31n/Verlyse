import puppeteer from 'puppeteer'
const b=await puppeteer.launch({args:['--no-sandbox','--disable-dev-shm-usage'],headless:'new'})
const p=await b.newPage(); await p.setViewport({width:1440,height:900})
await p.goto('http://localhost:5173/articles',{waitUntil:'domcontentloaded',timeout:30000})
await new Promise(r=>setTimeout(r,1600))
const href=await p.evaluate(()=>Array.from(document.querySelectorAll('footer a[href="/room"]')).map(a=>a.innerText))
console.log('footer /room link:',JSON.stringify(href))
if(href.length){ await p.evaluate(()=>document.querySelector('footer a[href="/room"]')?.click()); await new Promise(r=>setTimeout(r,1600)); console.log('navigated to:',p.url()) }
const h1=await p.evaluate(()=>document.querySelector('h1')?.innerText||'')
console.log('room h1:',h1.slice(0,30))
await b.close()
