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

function call({ method, origin, body, headers: extra = {} } = {}) {
  const headers = {}
  const response = { statusCode: 200, body: undefined, headers }
  const res = {
    setHeader(name, value) { headers[name] = value },
    status(code) { response.statusCode = code; return { end() {}, json(value) { response.body = value } } },
  }
  const requestHeaders = { ...(origin ? { origin } : {}), ...extra }
  return handler({ method, headers: requestHeaders, body, socket: {} }, res).then(() => response)
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

// Rate-limit regression coverage for the client-attribution fix. The endpoint
// previously keyed the limiter on x-forwarded-for[0], which the caller controls,
// so rotating that one header minted a fresh bucket per request.
const ORIGIN = 'https://verlyse-react.vercel.app'
const signup = { email: 'synthetic@example.test' }

// A stable platform-set address with a rotating caller-controlled leftmost hop.
const rotated = []
for (let i = 0; i < 11; i += 1) {
  rotated.push(await call({
    method: 'POST', origin: ORIGIN, body: signup,
    headers: { 'x-vercel-forwarded-for': '203.0.113.10', 'x-forwarded-for': `198.51.100.${i}` },
  }))
}
expect('first request from a caller is allowed', rotated[0].statusCode === 503)
expect('rotating x-forwarded-for no longer bypasses the limit', rotated[10].statusCode === 429
  && rotated[10].body?.error === 'too-many-requests')
expect('rate-limit headers are still reported', rotated[0].headers['X-RateLimit-Limit'] === '10'
  && rotated[10].headers['Retry-After'] !== undefined)

// The rightmost hop is the address the nearest proxy appended, so requests that
// differ only in their caller-supplied leftmost entry share one bucket.
const rightmost = []
for (let i = 0; i < 11; i += 1) {
  rightmost.push(await call({
    method: 'POST', origin: ORIGIN, body: signup,
    headers: { 'x-forwarded-for': `192.0.2.${i}, 203.0.113.30` },
  }))
}
expect('the rightmost x-forwarded-for hop is attributed', rightmost[10].statusCode === 429)

// Non-address header text must not select a bucket of its own, or arbitrary
// strings would both bypass the limit and grow the map without bound.
const garbage = []
for (let i = 0; i < 12; i += 1) {
  garbage.push(await call({
    method: 'POST', origin: ORIGIN, body: signup,
    headers: { 'x-forwarded-for': `not-an-address-${i}` },
  }))
}
expect('non-address header text shares one bucket', garbage.some((r) => r.statusCode === 429))

const failures = checks.filter(([, ok]) => !ok).map(([name]) => name)
if (failures.length) {
  console.error(`Newsletter smoke test failed: ${failures.join('; ')}`)
  process.exit(1)
}
console.log(`Newsletter smoke test passed (${checks.length} synthetic checks; no provider contacted).`)
