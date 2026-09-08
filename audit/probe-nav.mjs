import puppeteer from 'puppeteer'
const b=await puppeteer.launch({args:['--no-sandbox','--disable-dev-shm-usage'],headless:'new'})
const p=await b.newPage(); await p.setViewport({width:1440,height:900})
const check=async(path,expect)=>{
  await p.goto('http://localhost:5173'+path,{waitUntil:'domcontentloaded',timeout:30000})
  await new Promise(r=>setTimeout(r,1500))
  const active=await p.evaluate(()=>Array.from(document.querySelectorAll('header a[aria-current="page"]')).map(a=>a.innerText.trim()).join('|'))
  console.log(`${path}: active nav = "${active}" ${active.includes(expect)?'✅':'❌ expect '+expect}`)
}
await check('/articles','Articles')
await check('/creator/alina-javed','Featured Creators')
await check('/ambassadors','Brand Ambassador')
await check('/article/mir-raza-ali','Articles')
// deep link straight to an article
await p.goto('http://localhost:5173/article/their-voices-matter',{waitUntil:'domcontentloaded',timeout:30000})
await new Promise(r=>setTimeout(r,1800))
console.log('deep link article h1:',(await p.evaluate(()=>document.querySelector('h1')?.innerText||'')).slice(0,30))
// browser back + forward
await p.goBack({waitUntil:'domcontentloaded',timeout:30000}); await new Promise(r=>setTimeout(r,1200))
console.log('after back:',p.url().split('/').slice(-1)[0]||'/')
await p.goForward({waitUntil:'domcontentloaded',timeout:30000}); await new Promise(r=>setTimeout(r,1200))
console.log('after forward:',p.url().split('/').slice(-1)[0]||'/')
// keyboard focus on nav link visible
await p.keyboard.press('Tab'); await p.keyboard.press('Tab')
const focusStyle=await p.evaluate(()=>{const a=document.activeElement;const cs=getComputedStyle(a);return {tag:a.tagName,outline:cs.outlineStyle,boxShadow:cs.boxShadow.slice(0,40)}})
console.log('nav keyboard focus:',JSON.stringify(focusStyle))
await b.close()
