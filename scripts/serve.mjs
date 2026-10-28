/**
 * Verlyse Media — static preview & local API server.
 * Serves the production build (dist/) with SPA fallback AND mounts the local
 * `/api/submit` and `/api/newsletter` serverless boundaries on 0.0.0.0 so the
 * live-preview and Playwright environments can exercise them end-to-end.
 * Run:  node scripts/serve.mjs
 */
import http from 'node:http'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join, extname, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const DIST = join(ROOT, 'dist')
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

const apiCache = new Map()
async function loadApiHandler(name) {
  if (apiCache.has(name)) return apiCache.get(name)
  const tmpDir = '/tmp/verlyse-local-api'
  await mkdir(tmpDir, { recursive: true })
  const srcPath = join(ROOT, 'api', `${name}.ts`)
  const src = await readFile(srcPath, 'utf8')
  const compiled = ts.transpileModule(src, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ES2022,
    },
  }).outputText
  const outPath = join(tmpDir, `${name}.mjs`)
  await writeFile(outPath, compiled)
  const mod = await import(`file://${outPath}?v=${Date.now()}`)
  apiCache.set(name, mod.default)
  return mod.default
}

function adaptResponse(res) {
  let code = 200
  const headers = {}
  return {
    setHeader(k, v) {
      headers[k] = v
      res.setHeader(k, v)
    },
    status(c) {
      code = c
      return {
        end() {
          res.writeHead(code, headers)
          res.end()
        },
        json(obj) {
          headers['Content-Type'] = 'application/json; charset=utf-8'
          res.writeHead(code, headers)
          res.end(JSON.stringify(obj))
        },
      }
    },
  }
}

const server = http.createServer(async (req, res) => {
  const pathname = decodeURIComponent((req.url || '/').split('?')[0])

  if (pathname === '/api/submit' || pathname === '/api/newsletter') {
    try {
      const apiName = pathname === '/api/submit' ? 'submit' : 'newsletter'
      const handler = await loadApiHandler(apiName)
      await handler(req, adaptResponse(res))
    } catch {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' })
      res.end(JSON.stringify({ ok: false, error: 'internal-error' }))
    }
    return
  }

  let p = pathname
  if (p === '/') p = '/index.html'
  const file = normalize(join(DIST, p))
  if (!file.startsWith(normalize(DIST))) {
    res.writeHead(403)
    return res.end('Forbidden')
  }
  let target = file
  if (!existsSync(target) || statSync(target).isDirectory()) {
    const dirIndex = join(target, 'index.html')
    target = existsSync(dirIndex) ? dirIndex : join(DIST, 'index.html')
  }
  const ext = extname(target)
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
