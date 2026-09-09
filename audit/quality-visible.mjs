import puppeteer from 'puppeteer'
const b=await puppeteer.launch({args:['--no-sandbox','--disable-dev-shm-usage'],headless:'new'})
const p=await b.newPage(); await p.setViewport({width:1440,height:900})
const routes=['/','/articles','/article/mir-raza-ali','/categories','/creators','/creator/alina-javed','/ambassadors','/community','/about','/submit','/contact','/room']
const terms=['Three.js','WebGL','GSAP','Anime.js','MCP','AI website','The Keeping Room','neon','particles','glassmorphism','gradient blob']
const hits={}
let fails=[]
for(const r of routes){
  await p.goto(`http://localhost:5173${r}`,{waitUntil:'domcontentloaded',timeout:30000})
  await new Promise(s=>setTimeout(s,1400))
  const txt=(await p.evaluate(()=>document.body.innerText)).toLowerCase()
  const title=await p.title()
  for(const t of terms){ if(txt.includes(t.toLowerCase())){ (hits[t]??=[]).push(r) } }
  if(!p.url().includes(r.split('?')[0])) fails.push(`${r}->${p.url()}`)
  console.log(`${r}: 200, title="${title.slice(0,40)}"`)
}
console.log('\nVISIBLE-TEXT HITS:',JSON.stringify(hits,null,1))
console.log('ROUTE MISMATCHES:',fails.length?fails.join(', '):'none')
await b.close()
