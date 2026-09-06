#!/usr/bin/env node
/* Synthetic, provider-free smoke tests for the newsletter boundary. */
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import ts from 'typescript'

const temp = '/tmp/verlyse-newsletter-smoke'
await rm(temp, { recursive: true, force: true })
await mkdir(temp, { recursive: true })
const source = await (await import('node:fs/promises')).readFile(join(process.cwd(), 'api/newsletter.ts'), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText
await writeFile(join(temp, 'newsletter.mjs'), compiled)
const { default: handler } = await import(`file://${temp}/newsletter.mjs?${Date.now()}`)
process.env.BUTTONDOWN_API_KEY = ''

function call({ method, origin, body } = {}) {
  const headers = {}
  const response = { statusCode: 200, body: undefined, headers }
  const res = {
    setHeader(name, value) { headers[name] = value },
    status(code) { response.statusCode = code; return { end() {}, json(value) { response.body = value } } },
  }
  return handler({ method, headers: origin ? { origin } : {}, body, socket: {} }, res).then(() => response)
}

const checks = []
const expect = (name, condition) => checks.push([name, Boolean(condition)])
const allowed = await call({ method: 'OPTIONS', origin: 'https://verlyse-react.vercel.app' })
expect('allowed OPTIONS returns 204', allowed.statusCode === 204)
expect('allowed origin is echoed', allowed.headers['Access-Control-Allow-Origin'] === 'https://verlyse-react.vercel.app')
const blocked = await call({ method: 'OPTIONS', origin: 'https://example.invalid' })
expect('disallowed origin is not echoed', !blocked.headers['Access-Control-Allow-Origin'])
const get = await call({ method: 'GET', origin: 'https://verlyse-react.vercel.app' })
expect('GET is rejected', get.statusCode === 405)
const invalid = await call({ method: 'POST', origin: 'https://verlyse-react.vercel.app', body: { email: 'not-an-email' } })
expect('invalid email is rejected', invalid.statusCode === 400 && invalid.body?.error === 'invalid-email')
const unconfigured = await call({ method: 'POST', origin: 'https://verlyse-react.vercel.app', body: { email: 'synthetic@example.test' } })
expect('provider-not-configured is safe', unconfigured.statusCode === 503 && unconfigured.body?.error === 'not-configured')

const failures = checks.filter(([, ok]) => !ok).map(([name]) => name)
if (failures.length) {
  console.error(`Newsletter smoke test failed: ${failures.join('; ')}`)
  process.exit(1)
}
console.log(`Newsletter smoke test passed (${checks.length} synthetic checks; no provider contacted).`)
