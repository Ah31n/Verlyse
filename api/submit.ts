/**
 * Verlyse Media — Editorial Submission & Correspondence Serverless Boundary (`/api/submit`).
 *
 * Security & data-handling contract:
 *  - Dedicated server-side endpoint for `/submit` (`kind="submission"`, `multipart/form-data`
 *    with optional binary cover image) and `/contact` (`kind="contact"`, correspondence).
 *  - Never reuses `BUTTONDOWN_API_KEY` or `api/newsletter.ts`, and never exposes credentials
 *    in client `VITE_*` variables.
 *  - Enforces strict Kesug-only cross-origin CORS allowlisting in production
 *    (`https://verlysemedia.kesug.com` and `https://www.verlysemedia.kesug.com`;
 *    localhost preview ports in non-prod; same-origin requests permitted when `Origin` host
 *    matches request `Host`).
 *  - Independently validates required fields, email syntax, honeypot (`_gotcha` / `website`),
 *    binary image magic-byte signatures (`image/jpeg`, `image/png`, `image/webp`, `image/avif`,
 *    `image/gif`), consistent 4 MB size limit (`MAX_COVER_BYTES = 4 * 1024 * 1024`),
 *    and sanitized attachment filenames.
 *  - Rejects any request that sends a filename string without actual binary image bytes
 *    (`filename-only-not-accepted`).
 *  - Returns HTTP `503` `{ ok: false, error: "provider-unconfigured" }` when no server mail
 *    provider credential (`VERLYSE_MAIL_PROVIDER` / `RESEND_API_KEY` / `VERLYSE_MAIL_WEBHOOK_URL`)
 *    is configured.
 */

import { isIP } from 'node:net'

export const MAX_COVER_BYTES = 4 * 1024 * 1024
const MAX_MULTIPART_TOTAL_BYTES = MAX_COVER_BYTES + 256 * 1024
export const ALLOWED_COVER_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
] as const
export type AllowedCoverMime = (typeof ALLOWED_COVER_MIMES)[number]

const MIME_EXTENSION: Record<AllowedCoverMime, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif',
  'image/gif': '.gif',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DEFAULT_DESK_EMAIL = 'Verlysemedia.09@gmail.com'
const DEFAULT_FROM_EMAIL = 'Verlyse Editorial Desk <onboarding@resend.dev>'

const PRODUCTION_ALLOWED_ORIGINS = [
  'https://verlysemedia.kesug.com',
  'https://www.verlysemedia.kesug.com',
]

const DEV_ALLOWED_ORIGINS = [
  ...PRODUCTION_ALLOWED_ORIGINS,
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173',
]

function isProductionRuntime(): boolean {
  return (
    process.env.NODE_ENV === 'production' ||
    process.env.VERCEL_ENV === 'production'
  )
}

function allowedOrigins(): Set<string> {
  const prod = isProductionRuntime()
  const raw = process.env.ALLOWED_ORIGINS
  const list = raw
    ? raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : prod
      ? PRODUCTION_ALLOWED_ORIGINS
      : DEV_ALLOWED_ORIGINS
  const filtered = prod
    ? list.filter(
        (origin) => !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin),
      )
    : list
  return new Set(filtered)
}

function isSameOriginRequest(req: SubmitRequest, origin: string | undefined): boolean {
  if (!origin) return true
  const rawHost =
    req.headers?.['x-forwarded-host'] ?? req.headers?.host ?? req.headers?.Host
  const host = (Array.isArray(rawHost) ? rawHost[0] : rawHost ?? '')
    .split(',')[0]
    .trim()
    .toLowerCase()
  if (!host) return false
  try {
    return new URL(origin).host.toLowerCase() === host
  } catch {
    return false
  }
}

/* ---- Rate limiting ----------------------------------------------------- */
const WINDOW_MS = 10 * 60 * 1000
const MAX_REQUESTS = 8
const hits = new Map<string, { count: number; resetAt: number }>()

export function resetSubmitRateLimitForTests(): void {
  hits.clear()
}

function parseIp(raw: string | undefined): string | null {
  if (!raw) return null
  const candidate = raw.trim().replace(/^::ffff:/i, '')
  return isIP(candidate) ? candidate : null
}

function clientKey(req: SubmitRequest): string {
  const h = req.headers || {}
  const platformHeader =
    h['x-vercel-forwarded-for'] ?? h['cf-connecting-ip'] ?? h['x-real-ip']
  const fromPlatform = Array.isArray(platformHeader)
    ? platformHeader[0]
    : platformHeader
  if (fromPlatform) {
    const parts = fromPlatform.split(',')
    const ip = parseIp(parts[parts.length - 1])
    if (ip) return ip
  }

  const xff = h['x-forwarded-for']
  const rawXff = Array.isArray(xff) ? xff[xff.length - 1] : xff
  if (rawXff) {
    const hops = rawXff.split(',')
    const ip = parseIp(hops[hops.length - 1])
    if (ip) return ip
  }

  return parseIp(req.socket?.remoteAddress) ?? 'unattributed'
}

function rateLimit(key: string): {
  allowed: boolean
  remaining: number
  resetSeconds: number
} {
  const now = Date.now()
  if (hits.size > 500) {
    for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k)
  }
  const cur = hits.get(key)
  if (!cur || cur.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return {
      allowed: true,
      remaining: MAX_REQUESTS - 1,
      resetSeconds: Math.ceil(WINDOW_MS / 1000),
    }
  }
  cur.count += 1
  const resetSeconds = Math.max(1, Math.ceil((cur.resetAt - now) / 1000))
  return {
    allowed: cur.count <= MAX_REQUESTS,
    remaining: Math.max(0, MAX_REQUESTS - cur.count),
    resetSeconds,
  }
}

/* ---- Magic-byte image signature & filename sanitization ---------------- */
export function detectImageMimeFromBytes(
  bytes: Uint8Array,
): AllowedCoverMime | null {
  if (!bytes || bytes.byteLength < 4) return null

  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg'
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes.byteLength >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'image/png'
  }

  // GIF: GIF87a or GIF89a
  if (
    bytes.byteLength >= 6 &&
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38 &&
    (bytes[4] === 0x37 || bytes[4] === 0x39) &&
    bytes[5] === 0x61
  ) {
    return 'image/gif'
  }

  // WebP: RIFF....WEBP
  if (
    bytes.byteLength >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'image/webp'
  }

  // AVIF: ISO BMFF box 'ftyp' at bytes 4..7 and 'avif' or 'avis' brand in bytes 8..31
  if (
    bytes.byteLength >= 12 &&
    bytes[4] === 0x66 &&
    bytes[5] === 0x74 &&
    bytes[6] === 0x79 &&
    bytes[7] === 0x70
  ) {
    const headerAscii = Buffer.from(
      bytes.subarray(8, Math.min(bytes.byteLength, 36)),
    ).toString('latin1')
    if (headerAscii.includes('avif') || headerAscii.includes('avis')) {
      return 'image/avif'
    }
  }

  return null
}

export function sanitizeCoverFilename(
  rawFilename: string,
  mime: AllowedCoverMime,
): string {
  const base = rawFilename
    .replace(/^.*[/\\]/, '')
    .replace(/[\x00-\x1f\x7f"'`<>|?*:\\/]+/g, '')
    .replace(/\.\.+/g, '.')
    .replace(/\s+/g, '-')
    .replace(/[^A-Za-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')

  const stem = (base ? base.replace(/\.[A-Za-z0-9]{1,6}$/, '') : 'cover-plate')
    .slice(0, 64)
    .replace(/^[-.]+|[-.]+$/g, '') || 'cover-plate'

  return `${stem}${MIME_EXTENSION[mime]}`
}

export interface ValidatedCoverAttachment {
  safeFilename: string
  mimeType: AllowedCoverMime
  buffer: Buffer
}

interface RawUploadedFile {
  filename: string
  contentType: string
  buffer: Buffer
}

interface ParsedSubmissionInput {
  fields: Record<string, string>
  file: RawUploadedFile | null
}

/* ---- RFC 7578 multipart/form-data parser ------------------------------- */
function extractBoundary(contentType: string): string | null {
  const m = contentType.match(/boundary=(?:"([^"]+)"|([^\s;]+))/i)
  const b = (m?.[1] ?? m?.[2] ?? '').trim()
  return b.length > 0 && b.length <= 128 ? b : null
}

function parseMultipartBuffer(
  rawBuf: Buffer,
  boundary: string,
): ParsedSubmissionInput {
  const dashBoundary = Buffer.from(`--${boundary}`, 'utf8')
  const closeBoundary = Buffer.from(`--${boundary}--`, 'utf8')

  if (
    rawBuf.indexOf(dashBoundary) === -1 ||
    rawBuf.indexOf(closeBoundary) === -1
  ) {
    throw new MultipartParseError('malformed-multipart')
  }

  const fields: Record<string, string> = {}
  let file: RawUploadedFile | null = null

  let pos = rawBuf.indexOf(dashBoundary)
  while (pos !== -1) {
    const afterBoundary = pos + dashBoundary.length
    if (
      rawBuf[afterBoundary] === 0x2d &&
      rawBuf[afterBoundary + 1] === 0x2d
    ) {
      // Reached closing `--boundary--`
      break
    }

    let partStart = afterBoundary
    if (rawBuf[partStart] === 0x0d && rawBuf[partStart + 1] === 0x0a) {
      partStart += 2
    } else if (rawBuf[partStart] === 0x0a) {
      partStart += 1
    } else {
      throw new MultipartParseError('malformed-multipart')
    }

    const nextBoundaryPos = rawBuf.indexOf(dashBoundary, partStart)
    if (nextBoundaryPos === -1) {
      throw new MultipartParseError('malformed-multipart')
    }

    // Trim trailing CRLF or LF before the next `--boundary`
    let partEnd = nextBoundaryPos
    if (
      partEnd >= partStart + 2 &&
      rawBuf[partEnd - 2] === 0x0d &&
      rawBuf[partEnd - 1] === 0x0a
    ) {
      partEnd -= 2
    } else if (partEnd >= partStart + 1 && rawBuf[partEnd - 1] === 0x0a) {
      partEnd -= 1
    }

    const partSlice = rawBuf.subarray(partStart, partEnd)
    let headerEnd = partSlice.indexOf(Buffer.from('\r\n\r\n'))
    let sepLen = 4
    if (headerEnd === -1) {
      headerEnd = partSlice.indexOf(Buffer.from('\n\n'))
      sepLen = 2
    }
    if (headerEnd === -1) {
      throw new MultipartParseError('malformed-multipart')
    }

    const rawHeaders = partSlice.subarray(0, headerEnd).toString('utf8')
    const bodySlice = Buffer.from(partSlice.subarray(headerEnd + sepLen))

    const dispMatch = rawHeaders.match(
      /content-disposition:\s*form-data;([^\r\n]+)/i,
    )
    if (!dispMatch) {
      throw new MultipartParseError('malformed-multipart')
    }
    const dispParams = dispMatch[1]
    const nameMatch = dispParams.match(/\bname="([^"]+)"/i)
    if (!nameMatch) {
      throw new MultipartParseError('malformed-multipart')
    }
    const fieldName = nameMatch[1]
    const filenameMatch = dispParams.match(/\bfilename="([^"]*)"/i)
    const ctMatch = rawHeaders.match(/content-type:\s*([^\r\n;]+)/i)
    const partContentType = (ctMatch?.[1] ?? '').trim().toLowerCase()

    if (filenameMatch !== null) {
      const fname = filenameMatch[1]
      if (fname !== '' || bodySlice.byteLength > 0) {
        if (bodySlice.byteLength > MAX_COVER_BYTES) {
          throw new MultipartParseError('file-too-large', 413)
        }
        file = {
          filename: fname || 'cover-upload',
          contentType: partContentType,
          buffer: bodySlice,
        }
      }
    } else {
      fields[fieldName] = bodySlice.toString('utf8')
    }

    pos = nextBoundaryPos
  }

  return { fields, file }
}

class MultipartParseError extends Error {
  statusCode: number
  code: string
  constructor(code: string, statusCode = 400) {
    super(code)
    this.code = code
    this.statusCode = statusCode
  }
}

/* ---- Request types ----------------------------------------------------- */
interface SubmitRequest {
  method?: string
  url?: string
  headers?: Record<string, string | string[] | undefined>
  body?: unknown
  socket?: { remoteAddress?: string }
  [Symbol.asyncIterator]?: () => AsyncIterator<Uint8Array | Buffer | string>
}

interface SubmitResponse {
  setHeader(name: string, value: string): void
  status(code: number): {
    end(): void
    json(body: Record<string, unknown>): void
  }
}

async function readStreamBuffer(
  req: SubmitRequest,
  maxBytes: number,
): Promise<Buffer> {
  if (Buffer.isBuffer(req.body)) {
    if (req.body.byteLength > maxBytes) {
      throw new MultipartParseError('file-too-large', 413)
    }
    return req.body
  }
  if (req.body instanceof Uint8Array) {
    const buf = Buffer.from(req.body)
    if (buf.byteLength > maxBytes) {
      throw new MultipartParseError('file-too-large', 413)
    }
    return buf
  }
  if (typeof req.body === 'string') {
    const buf = Buffer.from(req.body, 'latin1')
    if (buf.byteLength > maxBytes) {
      throw new MultipartParseError('file-too-large', 413)
    }
    return buf
  }

  if (typeof req[Symbol.asyncIterator] === 'function') {
    const chunks: Buffer[] = []
    let total = 0
    for await (const chunk of req as AsyncIterable<Uint8Array | Buffer | string>) {
      const buf =
        typeof chunk === 'string'
          ? Buffer.from(chunk, 'utf8')
          : Buffer.from(chunk)
      total += buf.byteLength
      if (total > maxBytes) {
        throw new MultipartParseError('file-too-large', 413)
      }
      chunks.push(buf)
    }
    return Buffer.concat(chunks)
  }

  return Buffer.alloc(0)
}

async function parseRequestPayload(
  req: SubmitRequest,
): Promise<ParsedSubmissionInput> {
  const rawCt = req.headers?.['content-type'] ?? req.headers?.['Content-Type']
  const contentType = (Array.isArray(rawCt) ? rawCt[0] : rawCt ?? '').trim()

  // 1. Native FormData object (e.g., JSDOM / synthetic fetch harness)
  if (
    req.body &&
    typeof req.body === 'object' &&
    !Buffer.isBuffer(req.body) &&
    !(req.body instanceof Uint8Array) &&
    typeof (req.body as FormData).entries === 'function' &&
    typeof (req.body as FormData).getAll === 'function'
  ) {
    const fd = req.body as FormData
    const fields: Record<string, string> = {}
    let file: RawUploadedFile | null = null
    for (const [k, v] of fd.entries()) {
      if (typeof v === 'string') {
        fields[k] = v
      } else if (v && typeof (v as Blob).arrayBuffer === 'function') {
        const blob = v as File
        const ab = await blob.arrayBuffer()
        const buf = Buffer.from(ab)
        if ((blob.name && blob.name.length > 0) || buf.byteLength > 0) {
          if (buf.byteLength > MAX_COVER_BYTES) {
            throw new MultipartParseError('file-too-large', 413)
          }
          file = {
            filename: blob.name || 'cover-upload',
            contentType: (blob.type || '').toLowerCase(),
            buffer: buf,
          }
        }
      }
    }
    return { fields, file }
  }

  // 2. Multipart/form-data binary payload
  if (/^multipart\/form-data/i.test(contentType)) {
    const boundary = extractBoundary(contentType)
    if (!boundary) {
      throw new MultipartParseError('malformed-multipart', 400)
    }
    const rawBuf = await readStreamBuffer(req, MAX_MULTIPART_TOTAL_BYTES)
    if (rawBuf.byteLength === 0) {
      throw new MultipartParseError('malformed-multipart', 400)
    }
    return parseMultipartBuffer(rawBuf, boundary)
  }

  // 3. JSON payload (used by /contact or no-file submissions)
  if (
    req.body &&
    typeof req.body === 'object' &&
    !Buffer.isBuffer(req.body) &&
    !(req.body instanceof Uint8Array)
  ) {
    const obj = req.body as Record<string, unknown>
    if (
      (typeof obj.fileName === 'string' && obj.fileName.trim() !== '') ||
      (typeof obj.coverName === 'string' && obj.coverName.trim() !== '')
    ) {
      throw new MultipartParseError('filename-only-not-accepted', 400)
    }
    const fields: Record<string, string> = {}
    for (const [k, v] of Object.entries(obj)) {
      if (v !== undefined && v !== null) {
        fields[k] = String(v)
      }
    }
    return { fields, file: null }
  }

  const rawBuf = await readStreamBuffer(req, 256 * 1024)
  if (rawBuf.byteLength > 0) {
    try {
      const parsed = JSON.parse(rawBuf.toString('utf8')) as Record<
        string,
        unknown
      >
      if (
        (typeof parsed.fileName === 'string' &&
          parsed.fileName.trim() !== '') ||
        (typeof parsed.coverName === 'string' && parsed.coverName.trim() !== '')
      ) {
        throw new MultipartParseError('filename-only-not-accepted', 400)
      }
      const fields: Record<string, string> = {}
      for (const [k, v] of Object.entries(parsed)) {
        if (v !== undefined && v !== null) {
          fields[k] = String(v)
        }
      }
      return { fields, file: null }
    } catch (err) {
      if (err instanceof MultipartParseError) throw err
      throw new MultipartParseError('invalid-payload', 400)
    }
  }

  throw new MultipartParseError('invalid-payload', 400)
}

function validateCoverAttachment(
  rawFile: RawUploadedFile | null,
):
  | { ok: true; attachment: ValidatedCoverAttachment | null }
  | { ok: false; status: number; error: string } {
  if (!rawFile) return { ok: true, attachment: null }

  if (rawFile.buffer.byteLength === 0) {
    return { ok: false, status: 400, error: 'empty-file' }
  }

  if (rawFile.buffer.byteLength > MAX_COVER_BYTES) {
    return { ok: false, status: 413, error: 'file-too-large' }
  }

  const detectedMime = detectImageMimeFromBytes(rawFile.buffer)
  if (!detectedMime) {
    return { ok: false, status: 415, error: 'invalid-image-signature' }
  }

  const declared = rawFile.contentType.trim().toLowerCase()
  if (declared && declared !== 'application/octet-stream') {
    if (
      !(ALLOWED_COVER_MIMES as readonly string[]).includes(declared) ||
      declared !== detectedMime
    ) {
      return { ok: false, status: 415, error: 'invalid-image-type' }
    }
  }

  const safeFilename = sanitizeCoverFilename(rawFile.filename, detectedMime)
  return {
    ok: true,
    attachment: {
      safeFilename,
      mimeType: detectedMime,
      buffer: rawFile.buffer,
    },
  }
}

export default async function handler(
  req: SubmitRequest,
  res: SubmitResponse,
): Promise<void> {
  const originHeader = req.headers?.origin
  const origin = Array.isArray(originHeader) ? originHeader[0] : originHeader
  const allowed = allowedOrigins()
  const corsAllowed = Boolean(origin && allowed.has(origin))
  const sameOrigin = isSameOriginRequest(req, origin)

  res.setHeader('Vary', 'Origin')
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')

  if (corsAllowed && origin) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept')
    res.setHeader('Access-Control-Max-Age', '86400')
  }

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS')
    res.status(405).json({ ok: false, error: 'method-not-allowed' })
    return
  }

  if (origin && !corsAllowed && !sameOrigin) {
    res.status(403).json({ ok: false, error: 'forbidden-origin' })
    return
  }

  const limit = rateLimit(clientKey(req))
  res.setHeader('X-RateLimit-Limit', String(MAX_REQUESTS))
  res.setHeader('X-RateLimit-Remaining', String(limit.remaining))
  res.setHeader('X-RateLimit-Reset', String(limit.resetSeconds))
  if (!limit.allowed) {
    res.setHeader('Retry-After', String(limit.resetSeconds))
    res.status(429).json({ ok: false, error: 'too-many-requests' })
    return
  }

  let parsed: ParsedSubmissionInput
  try {
    parsed = await parseRequestPayload(req)
  } catch (err) {
    if (err instanceof MultipartParseError) {
      res.status(err.statusCode).json({ ok: false, error: err.code })
      return
    }
    res.status(400).json({ ok: false, error: 'invalid-payload' })
    return
  }

  const { fields, file } = parsed

  // Reject any attempt to pass a filename string without actual binary bytes
  if (!file && (fields.fileName?.trim() || fields.coverName?.trim())) {
    res.status(400).json({ ok: false, error: 'filename-only-not-accepted' })
    return
  }

  // Honeypot trap
  if ((fields._gotcha && fields._gotcha.trim() !== '') || (fields.website && fields.website.trim() !== '')) {
    res.status(200).json({ ok: true, accepted: true })
    return
  }

  const kind = fields.kind === 'contact' ? 'contact' : 'submission'

  if (kind === 'contact') {
    const name = (fields.name ?? '').trim()
    const email = (fields.email ?? '').trim()
    const subject = (fields.subject ?? '').trim()
    const message = (fields.message ?? '').trim()
    const lane = (fields.lane ?? '').trim().slice(0, 120)

    const bad: string[] = []
    if (!name || name.length > 160) bad.push('name')
    if (!email || email.length > 254 || !EMAIL_RE.test(email)) bad.push('email')
    if (!subject || subject.length > 240) bad.push('subject')
    if (!message || message.length > 20000) bad.push('message')

    if (bad.length > 0) {
      res.status(422).json({ ok: false, error: 'invalid-fields', fields: bad })
      return
    }

    await deliverToDesk(
      {
        kind: 'contact',
        replyTo: email,
        subject: `[Verlyse Correspondence${lane ? ` · ${lane}` : ''}] ${subject}`,
        textBody: [
          'Verlyse Media — Correspondence Desk',
          lane ? `Lane: ${lane}` : '',
          `Name: ${name}`,
          `Email: ${email}`,
          `Subject: ${subject}`,
          '',
          '--- Message ---',
          message,
        ]
          .filter(Boolean)
          .join('\n'),
        attachment: null,
        metadata: { kind: 'contact', lane, name, email, subject, message },
      },
      res,
    )
    return
  }

  // Default: `kind === 'submission'`
  const name = (fields.name ?? '').trim()
  const email = (fields.email ?? '').trim()
  const handle = (fields.handle ?? '').trim().slice(0, 120)
  const title = (fields.title ?? '').trim()
  const category = (fields.category ?? '').trim()
  const description = (fields.description ?? fields.pitch ?? '').trim().slice(0, 4000)
  const work = (fields.work ?? fields.body ?? '').trim()
  const originalRaw = (fields.original ?? '').trim().toLowerCase()
  const originalConfirmed =
    originalRaw === 'on' || originalRaw === 'true' || originalRaw === '1'

  const bad: string[] = []
  if (!name || name.length > 160) bad.push('name')
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) bad.push('email')
  if (!title || title.length > 240) bad.push('title')
  if (!category || category.length > 80) bad.push('category')
  if (!work || work.length > 60000) bad.push('work')
  if (!originalConfirmed) bad.push('original')

  if (bad.length > 0) {
    res.status(422).json({ ok: false, error: 'invalid-fields', fields: bad })
    return
  }

  const coverCheck = validateCoverAttachment(file)
  if (!coverCheck.ok) {
    res.status(coverCheck.status).json({ ok: false, error: coverCheck.error })
    return
  }

  const attachment = coverCheck.attachment

  await deliverToDesk(
    {
      kind: 'submission',
      replyTo: email,
      subject: `[Verlyse Submission · ${category}] ${title} — ${name}`,
      textBody: [
        'Verlyse Media — Editorial Submission',
        `Name: ${name}`,
        `Email: ${email}`,
        handle ? `Handle: ${handle}` : '',
        `Title: ${title}`,
        `Department: ${category}`,
        description ? `Excerpt / Pitch: ${description}` : '',
        `Originality & rights confirmed: yes`,
        attachment
          ? `Attached cover image: ${attachment.safeFilename} (${attachment.mimeType}, ${attachment.buffer.byteLength} bytes)`
          : 'Attached cover image: none',
        '',
        '--- Manuscript / Work ---',
        work,
      ]
        .filter(Boolean)
        .join('\n'),
      attachment,
      metadata: {
        kind: 'submission',
        name,
        email,
        handle,
        title,
        category,
        description,
        work,
        original: true,
      },
    },
    res,
  )
}

interface OutboundEnvelope {
  kind: 'submission' | 'contact'
  replyTo: string
  subject: string
  textBody: string
  attachment: ValidatedCoverAttachment | null
  metadata: Record<string, unknown>
}

async function deliverToDesk(
  envelope: OutboundEnvelope,
  res: SubmitResponse,
): Promise<void> {
  const explicitProvider = (process.env.VERLYSE_MAIL_PROVIDER ?? '').trim().toLowerCase()
  const resendKey = (process.env.RESEND_API_KEY ?? '').trim()
  const webhookUrl = (process.env.VERLYSE_MAIL_WEBHOOK_URL ?? '').trim()

  const useResend =
    explicitProvider === 'resend'
      ? Boolean(resendKey)
      : explicitProvider === 'webhook'
        ? false
        : Boolean(resendKey)
  const useWebhook =
    explicitProvider === 'webhook'
      ? Boolean(webhookUrl)
      : explicitProvider === 'resend'
        ? false
        : Boolean(webhookUrl)

  if (!useResend && !useWebhook) {
    res.status(503).json({ ok: false, error: 'provider-unconfigured' })
    return
  }

  const timeoutMs = Math.max(
    50,
    Number(process.env.VERLYSE_SUBMIT_TIMEOUT_MS) || 8000,
  )
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    let upstream: Response
    if (useResend) {
      const toEmail =
        (process.env.VERLYSE_SUBMISSION_TO_EMAIL ?? '').trim() ||
        DEFAULT_DESK_EMAIL
      const fromEmail =
        (process.env.VERLYSE_SUBMISSION_FROM_EMAIL ?? '').trim() ||
        DEFAULT_FROM_EMAIL

      const payload: Record<string, unknown> = {
        from: fromEmail,
        to: [toEmail],
        reply_to: envelope.replyTo,
        subject: envelope.subject,
        text: envelope.textBody,
      }

      if (envelope.attachment) {
        payload.attachments = [
          {
            filename: envelope.attachment.safeFilename,
            content: envelope.attachment.buffer.toString('base64'),
            content_type: envelope.attachment.mimeType,
          },
        ]
      }

      upstream = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })
    } else {
      const webhookSecret = (
        process.env.VERLYSE_MAIL_WEBHOOK_SECRET ?? ''
      ).trim()
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (webhookSecret) {
        headers['X-Verlyse-Webhook-Secret'] = webhookSecret
      }
      upstream = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...envelope.metadata,
          subject: envelope.subject,
          text: envelope.textBody,
          attachment: envelope.attachment
            ? {
                filename: envelope.attachment.safeFilename,
                contentType: envelope.attachment.mimeType,
                byteLength: envelope.attachment.buffer.byteLength,
                contentBase64: envelope.attachment.buffer.toString('base64'),
              }
            : null,
        }),
        signal: controller.signal,
      })
    }

    if (upstream.ok) {
      res.status(200).json({
        ok: true,
        accepted: true,
        kind: envelope.kind,
        attachmentIncluded: Boolean(envelope.attachment),
        attachmentName: envelope.attachment?.safeFilename ?? null,
        attachmentBytes: envelope.attachment?.buffer.byteLength ?? 0,
      })
      return
    }

    res.status(502).json({ ok: false, error: 'upstream-rejected' })
  } catch (err) {
    const isAbort =
      err instanceof Error &&
      (err.name === 'AbortError' || /aborted|timeout/i.test(err.message))
    res.status(isAbort ? 504 : 502).json({
      ok: false,
      error: isAbort ? 'upstream-timeout' : 'upstream-unavailable',
    })
  } finally {
    clearTimeout(timer)
  }
}
