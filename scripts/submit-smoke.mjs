#!/usr/bin/env node
/**
 * Synthetic, provider-free smoke & security tests for `/api/submit` (`api/submit.ts`).
 * Covers CORS/preflight, dev vs. prod origin allowlists, method validation,
 * malformed multipart input, filename-only rejection, required field validation,
 * magic-byte image signature verification (PNG, JPEG, WebP, GIF, AVIF),
 * spoofed MIME rejection, 4 MB size limit enforcement, filename sanitization,
 * provider-unconfigured (503), valid submission without image, valid submission
 * with real binary image bytes & outbound attachment verification, contact desk
 * delivery, upstream rejection (502), upstream timeout (504), and rate limiting (429).
 */
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import ts from 'typescript'

const temp = '/tmp/verlyse-submit-smoke'
await rm(temp, { recursive: true, force: true })
await mkdir(temp, { recursive: true })

const source = await readFile(join(process.cwd(), 'api/submit.ts'), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText
await writeFile(join(temp, 'submit.mjs'), compiled)

const {
  default: handler,
  MAX_COVER_BYTES,
  detectImageMimeFromBytes,
  sanitizeCoverFilename,
  resetSubmitRateLimitForTests,
} = await import(`file://${temp}/submit.mjs?${Date.now()}`)

const KESUG_ORIGIN = 'https://verlysemedia.kesug.com'
const ORIGIN = KESUG_ORIGIN

function buildMultipartBuffer(boundary, fields, filePart = null) {
  const chunks = []
  for (const [name, value] of Object.entries(fields)) {
    chunks.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`,
        'utf8',
      ),
    )
  }
  if (filePart) {
    chunks.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="${filePart.fieldName || 'cover'}"; filename="${filePart.filename}"\r\nContent-Type: ${filePart.contentType}\r\n\r\n`,
        'utf8',
      ),
    )
    chunks.push(Buffer.from(filePart.buffer))
    chunks.push(Buffer.from('\r\n', 'utf8'))
  }
  chunks.push(Buffer.from(`--${boundary}--\r\n`, 'utf8'))
  return Buffer.concat(chunks)
}

function call({ method = 'POST', origin = ORIGIN, body, headers: extra = {} } = {}) {
  const headers = {}
  const response = { statusCode: 200, body: undefined, headers }
  const res = {
    setHeader(name, value) {
      headers[name] = value
    },
    status(code) {
      response.statusCode = code
      return {
        end() {},
        json(value) {
          response.body = value
        },
      }
    },
  }
  const requestHeaders = { ...(origin ? { origin } : {}), ...extra }
  return handler({ method, headers: requestHeaders, body, socket: {} }, res).then(
    () => response,
  )
}

const VALID_FIELDS = {
  name: 'Synthetic Contributor',
  email: 'contributor@example.test',
  handle: '@synthetic.writer',
  title: 'The Lantern in the Courtyard',
  category: 'Creative Writing',
  description: 'A short meditation on memory.',
  work: 'Here is the full manuscript body of the synthetic test submission.',
  original: 'on',
}

// Authentic binary headers for the 5 allowed image formats
const PNG_BYTES = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
])
const JPEG_BYTES = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46])
const GIF_BYTES = Buffer.from('GIF89a\x01\x00\x01\x00\x80\x00\x00', 'latin1')
const WEBP_BYTES = Buffer.from('RIFF\x24\x00\x00\x00WEBPVP8 ', 'latin1')
const AVIF_BYTES = Buffer.from('\x00\x00\x00\x1cftypavif\x00\x00\x00\x00avifmif1', 'latin1')

const checks = []
const expect = (name, condition) => checks.push([name, Boolean(condition)])

process.env.RESEND_API_KEY = ''
process.env.VERLYSE_MAIL_WEBHOOK_URL = ''

// 1. CORS & Origin checks (Kesug-only cross-origin CORS in production)
const optKesug = await call({ method: 'OPTIONS', origin: KESUG_ORIGIN })
expect('allowed Kesug OPTIONS returns 204', optKesug.statusCode === 204)
expect(
  'canonical kesug.com origin is echoed on OPTIONS',
  optKesug.headers['Access-Control-Allow-Origin'] === KESUG_ORIGIN,
)

const optWwwKesug = await call({ method: 'OPTIONS', origin: 'https://www.verlysemedia.kesug.com' })
expect(
  'www.verlysemedia.kesug.com alias is echoed on OPTIONS',
  optWwwKesug.headers['Access-Control-Allow-Origin'] === 'https://www.verlysemedia.kesug.com',
)

const optNonKesug = await call({ method: 'OPTIONS', origin: 'https://other-site.vercel.app' })
expect(
  'non-Kesug cross-origin is not echoed in Access-Control-Allow-Origin',
  !optNonKesug.headers['Access-Control-Allow-Origin'],
)

const optBlocked = await call({ method: 'OPTIONS', origin: 'https://evil.invalid' })
expect(
  'disallowed origin is not echoed on OPTIONS',
  !optBlocked.headers['Access-Control-Allow-Origin'],
)

const postBlocked = await call({
  method: 'POST',
  origin: 'https://evil.invalid',
  body: VALID_FIELDS,
})
expect(
  'disallowed cross-origin POST returns 403 forbidden-origin',
  postBlocked.statusCode === 403 && postBlocked.body?.error === 'forbidden-origin',
)

const sameOriginPost = await call({
  method: 'POST',
  origin: 'https://verlyse-react.vercel.app',
  headers: { host: 'verlyse-react.vercel.app', 'content-type': 'application/json' },
  body: { kind: 'contact', name: 'A', email: 'a@b.co', subject: 'S', message: 'M' },
})
expect(
  'same-origin POST (Origin host === Host) is permitted without cross-origin CORS header',
  sameOriginPost.statusCode === 503 && !sameOriginPost.headers['Access-Control-Allow-Origin'],
)

process.env.NODE_ENV = 'development'
const devLocal = await call({ method: 'OPTIONS', origin: 'http://localhost:5173' })
expect(
  'localhost allowed in development runtime',
  devLocal.headers['Access-Control-Allow-Origin'] === 'http://localhost:5173',
)

process.env.NODE_ENV = 'production'
const prodLocal = await call({ method: 'OPTIONS', origin: 'http://localhost:5173' })
expect(
  'localhost excluded in production runtime',
  !prodLocal.headers['Access-Control-Allow-Origin'],
)
process.env.NODE_ENV = ''

// 2. Method check
const getRes = await call({ method: 'GET' })
expect(
  'GET is rejected with 405',
  getRes.statusCode === 405 && getRes.body?.error === 'method-not-allowed',
)

// 3. Magic-byte helper unit checks
expect('detects PNG magic bytes', detectImageMimeFromBytes(PNG_BYTES) === 'image/png')
expect('detects JPEG magic bytes', detectImageMimeFromBytes(JPEG_BYTES) === 'image/jpeg')
expect('detects GIF magic bytes', detectImageMimeFromBytes(GIF_BYTES) === 'image/gif')
expect('detects WebP magic bytes', detectImageMimeFromBytes(WEBP_BYTES) === 'image/webp')
expect('detects AVIF magic bytes', detectImageMimeFromBytes(AVIF_BYTES) === 'image/avif')
expect(
  'rejects non-image magic bytes',
  detectImageMimeFromBytes(Buffer.from('<html>not an image</html>')) === null,
)
expect(
  'sanitizes path traversal filenames',
  sanitizeCoverFilename('../../etc/passwd/my cover!.png', 'image/png') === 'my-cover.png',
)

// 4. Malformed multipart input
const noBoundary = await call({
  headers: { 'content-type': 'multipart/form-data' },
  body: Buffer.from('garbage'),
})
expect(
  'multipart without boundary returns 400 malformed-multipart',
  noBoundary.statusCode === 400 && noBoundary.body?.error === 'malformed-multipart',
)

const brokenBoundary = await call({
  headers: { 'content-type': 'multipart/form-data; boundary=----TestBoundary' },
  body: Buffer.from('------TestBoundary\r\nContent-Disposition: form-data; name="name"\r\n\r\nAlina'),
})
expect(
  'unclosed multipart boundary returns 400 malformed-multipart',
  brokenBoundary.statusCode === 400 && brokenBoundary.body?.error === 'malformed-multipart',
)

// 5. Filename-only rejection (never accept a filename string without bytes)
const filenameOnly = await call({
  headers: { 'content-type': 'application/json' },
  body: { ...VALID_FIELDS, fileName: 'cover.png' },
})
expect(
  'JSON payload with fileName only is rejected with 400 filename-only-not-accepted',
  filenameOnly.statusCode === 400 &&
    filenameOnly.body?.error === 'filename-only-not-accepted',
)

// 6. Missing required fields (422)
resetSubmitRateLimitForTests()
const boundary = '----VerlyseSmokeBoundary01'
const missingFieldsBuf = buildMultipartBuffer(boundary, {
  name: '',
  email: 'bad-email',
  title: '',
  category: '',
  work: '',
})
const invalidFieldsRes = await call({
  headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
  body: missingFieldsBuf,
})
expect(
  'missing required submission fields returns 422 invalid-fields',
  invalidFieldsRes.statusCode === 422 &&
    invalidFieldsRes.body?.error === 'invalid-fields' &&
    Array.isArray(invalidFieldsRes.body?.fields) &&
    invalidFieldsRes.body.fields.length === 6,
)

// 7. Disallowed file signature / spoofed MIME (415)
const spoofedPngBuf = buildMultipartBuffer(boundary, VALID_FIELDS, {
  filename: 'spoofed.png',
  contentType: 'image/png',
  buffer: Buffer.from('MZ-executable-or-plain-text-not-a-png'),
})
const spoofedRes = await call({
  headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
  body: spoofedPngBuf,
})
expect(
  'spoofed non-image bytes with image/png MIME returns 415 invalid-image-signature',
  spoofedRes.statusCode === 415 &&
    spoofedRes.body?.error === 'invalid-image-signature',
)

const mismatchedMimeBuf = buildMultipartBuffer(boundary, VALID_FIELDS, {
  filename: 'mismatch.jpg',
  contentType: 'image/jpeg',
  buffer: PNG_BYTES,
})
const mismatchedMimeRes = await call({
  headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
  body: mismatchedMimeBuf,
})
expect(
  'PNG bytes declared as image/jpeg returns 415 invalid-image-type',
  mismatchedMimeRes.statusCode === 415 &&
    mismatchedMimeRes.body?.error === 'invalid-image-type',
)

// 8. Oversized file (> MAX_COVER_BYTES = 4 MB) returns 413
expect('MAX_COVER_BYTES is exactly 4 MB (4,194,304 bytes)', MAX_COVER_BYTES === 4 * 1024 * 1024)
resetSubmitRateLimitForTests()
const oversizedBytes = Buffer.alloc(MAX_COVER_BYTES + 1024, 0x41)
PNG_BYTES.copy(oversizedBytes, 0)
const oversizedMultipart = buildMultipartBuffer(boundary, VALID_FIELDS, {
  filename: 'huge-cover.png',
  contentType: 'image/png',
  buffer: oversizedBytes,
})
const oversizedRes = await call({
  headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
  body: oversizedMultipart,
})
expect(
  'cover file over 4 MB limit returns 413 file-too-large',
  oversizedRes.statusCode === 413 && oversizedRes.body?.error === 'file-too-large',
)

// 9. Provider unconfigured returns 503
resetSubmitRateLimitForTests()
const validWithImageBuf = buildMultipartBuffer(boundary, VALID_FIELDS, {
  filename: '../../unsafe cover!.png',
  contentType: 'image/png',
  buffer: PNG_BYTES,
})
const unconfRes = await call({
  headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
  body: validWithImageBuf,
})
expect(
  'valid submission when provider is unconfigured returns 503 provider-unconfigured',
  unconfRes.statusCode === 503 &&
    unconfRes.body?.error === 'provider-unconfigured',
)

// 10. Valid submission WITHOUT image + Valid submission WITH real image bytes (mocking provider fetch)
const realFetch = globalThis.fetch
const providerCalls = []
process.env.RESEND_API_KEY = 'test-configured'

globalThis.fetch = async (url, init) => {
  providerCalls.push({
    url: String(url),
    method: init?.method,
    headers: init?.headers,
    body: init?.body ? JSON.parse(String(init.body)) : null,
  })
  return new Response(JSON.stringify({ id: 'email_synthetic_01' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

const noImageMultipart = buildMultipartBuffer(boundary, VALID_FIELDS, null)
const okNoImage = await call({
  headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
  body: noImageMultipart,
})
expect(
  'valid submission without image succeeds with 200 and attachmentIncluded=false',
  okNoImage.statusCode === 200 &&
    okNoImage.body?.ok === true &&
    okNoImage.body?.accepted === true &&
    okNoImage.body?.attachmentIncluded === false,
)

const okWithImage = await call({
  headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
  body: validWithImageBuf,
})
const lastCall = providerCalls[providerCalls.length - 1]
const sentAttachment = lastCall?.body?.attachments?.[0]
expect(
  'valid submission with image succeeds with 200 and attachmentIncluded=true',
  okWithImage.statusCode === 200 &&
    okWithImage.body?.ok === true &&
    okWithImage.body?.attachmentIncluded === true &&
    okWithImage.body?.attachmentName === 'unsafe-cover.png' &&
    okWithImage.body?.attachmentBytes === PNG_BYTES.byteLength,
)
expect(
  'outbound provider call contains exact base64 image bytes, sanitized filename, and verified MIME',
  Boolean(sentAttachment) &&
    sentAttachment.filename === 'unsafe-cover.png' &&
    sentAttachment.content_type === 'image/png' &&
    Buffer.from(sentAttachment.content, 'base64').equals(PNG_BYTES),
)

// 11. Contact correspondence endpoint path (multipart/form-data)
const contactMultipartBuf = buildMultipartBuffer(boundary, {
  kind: 'contact',
  name: 'Reader Correspondent',
  email: 'reader@example.test',
  subject: 'A note on Folio 21',
  message: 'Thank you for publishing this piece.',
})
const okContact = await call({
  headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
  body: contactMultipartBuf,
})
expect(
  'valid multipart contact correspondence succeeds with 200 and kind=contact',
  okContact.statusCode === 200 &&
    okContact.body?.ok === true &&
    okContact.body?.kind === 'contact',
)

// 12. Upstream provider rejection (502)
globalThis.fetch = async () =>
  new Response(JSON.stringify({ message: 'Upstream error' }), { status: 500 })
const rejectedRes = await call({
  headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
  body: validWithImageBuf,
})
expect(
  'upstream 500 rejection returns 502 upstream-rejected',
  rejectedRes.statusCode === 502 &&
    rejectedRes.body?.error === 'upstream-rejected',
)

// 13. Upstream provider timeout (504)
process.env.VERLYSE_SUBMIT_TIMEOUT_MS = '60'
globalThis.fetch = async (_url, init) =>
  new Promise((_resolve, reject) => {
    init?.signal?.addEventListener('abort', () => {
      const err = new Error('The operation was aborted')
      err.name = 'AbortError'
      reject(err)
    })
  })
const timeoutRes = await call({
  headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
  body: validWithImageBuf,
})
expect(
  'upstream timeout returns 504 upstream-timeout',
  timeoutRes.statusCode === 504 &&
    timeoutRes.body?.error === 'upstream-timeout',
)
process.env.VERLYSE_SUBMIT_TIMEOUT_MS = ''
process.env.RESEND_API_KEY = ''
globalThis.fetch = realFetch

// 14. Rate limiting (429)
resetSubmitRateLimitForTests()
const rateResponses = []
for (let i = 0; i < 9; i += 1) {
  rateResponses.push(
    await call({
      headers: {
        'content-type': `multipart/form-data; boundary=${boundary}`,
        'x-vercel-forwarded-for': '203.0.113.77',
        'x-forwarded-for': `198.51.100.${i}`,
      },
      body: noImageMultipart,
    }),
  )
}
expect(
  'rate limiter allows initial requests and blocks 9th request with 429 too-many-requests',
  rateResponses[0].statusCode === 503 &&
    rateResponses[8].statusCode === 429 &&
    rateResponses[8].body?.error === 'too-many-requests' &&
    rateResponses[8].headers['Retry-After'] !== undefined,
)

const failures = checks.filter(([, ok]) => !ok).map(([name]) => name)
if (failures.length > 0) {
  console.error(`Submit smoke test failed (${failures.length}): ${failures.join('; ')}`)
  process.exit(1)
}
console.log(
  `Submit smoke test passed (${checks.length}/${checks.length} synthetic checks; binary image bytes verified; no external provider contacted).`,
)
