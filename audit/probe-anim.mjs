import puppeteer from 'puppeteer'
const b=await puppeteer.launch({args:['--no-sandbox','--disable-dev-shm-usage'],headless:'new'})
const p=await b.newPage(); await p.setViewport({width:1440,height:900})
// Home infinite animations
await p.goto('http://localhost:5173/',{waitUntil:'domcontentloaded',timeout:30000})
await new Promise(r=>setTimeout(r,2500))
const inf=await p.evaluate(()=>Array.from(document.querySelectorAll('*')).filter(el=>{const cs=getComputedStyle(el);return cs.animationName!=='none'&&cs.animationIterationCount==='infinite'}).map(el=>({tag:el.tagName,cls:(el.className||'').toString().slice(0,60),anim:getComputedStyle(el).animationName})))
console.log('HOME infinite:',JSON.stringify(inf,null,1))
// About infinite
await p.goto('http://localhost:5173/about',{waitUntil:'domcontentloaded',timeout:30000})
await new Promise(r=>setTimeout(r,2200))
const ainf=await p.evaluate(()=>Array.from(document.querySelectorAll('*')).filter(el=>{const cs=getComputedStyle(el);return cs.animationName!=='none'&&cs.animationIterationCount==='infinite'}).map(el=>({tag:el.tagName,cls:(el.className||'').toString().slice(0,60),anim:getComputedStyle(el).animationName})))
console.log('ABOUT infinite:',JSON.stringify(ainf))
// reduced-motion Home running animations
await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}])
await p.goto('http://localhost:5173/',{waitUntil:'domcontentloaded',timeout:30000})
await new Promise(r=>setTimeout(r,2500))
const run=await p.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').map(a=>{const t=a.effect?.target;return {tag:t?.tagName,cls:(t?.className||'').toString().slice(0,50),anim:a.animationName||a.constructor.name}}))
console.log('HOME reduced running:',run.length)
console.log(JSON.stringify(run.slice(0,12),null,1))
await b.close()
