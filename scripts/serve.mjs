/**
 * Verlyse Media — static preview server.
 * Serves the production build (dist/) with SPA fallback on 0.0.0.0 so the
 * live-preview environment can reach it. Run:  node scripts/serve.mjs
 */
import http from 'node:http'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { join, extname, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const DIST = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'dist')
const PORT = Number(process.env.PORT || 4173)

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
  '.json': 'application/json',
}

const server = http.createServer((req, res) => {
  let p = decodeURIComponent((req.url || '/').split('?')[0])
  if (p === '/') p = '/index.html'
  const file = normalize(join(DIST, p))
  if (!file.startsWith(normalize(DIST))) {
    res.writeHead(403)
    return res.end('Forbidden')
  }
  let target = file
  if (!existsSync(target) || statSync(target).isDirectory()) target = join(DIST, 'index.html')
  const ext = extname(target)
  // Preview server: never let the browser serve a stale page — HTML is
  // no-store; everything else is revalidated each request.
  const headers = {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Cache-Control': ext === '.html' ? 'no-store' : 'no-cache',
  }
  res.writeHead(200, headers)
  createReadStream(target).pipe(res)
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Verlyse Media preview → http://0.0.0.0:${PORT}`)
})
