import { build } from 'esbuild'
const out = await build({ entryPoints:['src/data/content.ts'], bundle:true, format:'esm', write:false, platform:'neutral' })
const code = out.outputFiles[0].text
const mod = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'))
const { ARTICLES, AUTHORS, CATEGORIES, COMMUNITY_STATS } = mod
console.log('articles:', ARTICLES.length)
console.log('authors:', AUTHORS.length)
console.log('authors ids:', AUTHORS.map(a=>a.id).join(', '))
console.log('cat counts sum:', CATEGORIES.reduce((s,c)=>s+c.count,0))
const byCat = {}
for (const a of ARTICLES) byCat[a.category] = (byCat[a.category]||0)+1
console.log('actual per-category:', JSON.stringify(byCat))
console.log('CATEGORIES:', CATEGORIES.map(c=>`${c.name}=${c.count}`).join(', '))
const likes = ARTICLES.reduce((s,a)=>s+(a.likes||0),0)
const comments = ARTICLES.reduce((s,a)=>s+(a.comments||0),0)
console.log('sum likes:', likes, 'sum comments:', comments)
console.log('dates range:', ARTICLES.map(a=>a.date).sort()[0], '...', ARTICLES.map(a=>a.date).sort().slice(-1)[0])
const uniqAuthors = new Set(ARTICLES.map(a=>a.authorId))
console.log('unique authors on articles:', uniqAuthors.size)
console.log('COMMUNITY_STATS:', JSON.stringify(COMMUNITY_STATS))
