/**
 * Verlyse Media — "The Verlyse Letter" newsletter signup (`/api/newsletter`).
 *
 * Vercel serverless function: adds an email to the Buttondown subscriber
 * list. The API key lives ONLY in the server environment
 * (`BUTTONDOWN_API_KEY`) — never in client code.
 *
 * CORS is restricted to the canonical Kesug origins (`https://verlysemedia.kesug.com`,
 * `https://www.verlysemedia.kesug.com`) and the Vercel deployment origin
 * (`https://verlyse-react.vercel.app`), overridable via `ALLOWED_ORIGINS`.
 *
 * An in-memory rate limit (per attributed caller) protects the endpoint from
 * brute-force/abuse, with the standard X-RateLimit-* headers.
 */

/** Fixed-window limiter: 10 requests per minute per attributed caller. */
const RATE_LIMIT = 10
const RATE_WINDOW_MS = 60_000
/** Hard bound on distinct keys held at once. */
const MAX_TRACKED_KEYS = 5_000
/** Bucket for callers that cannot be attributed to an address. */
const UNATTRIBUTED = 'unattributed'
const hits = new Map<string, { count: number; resetAt: number }>()

/** Accept address literals only, so arbitrary header text cannot become a key. */
function isAddressLiteral(value: string): boolean {
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(value)) return true
  return value.includes(':') && /^[0-9a-fA-F:.]+$/.test(value)
}

function headerText(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return typeof value[0] === 'string' ? value[0] : ''
  return typeof value === 'string' ? value : ''
}

function clientIp(req: HandlerRequest): string {
  const candidates: string[] = []
  const vercel = headerText(req.headers['x-vercel-forwarded-for']).trim()
  if (vercel) candidates.push(vercel)
  const forwarded = headerText(req.headers['x-forwarded-for'])
  if (forwarded) {
    const hops = forwarded.split(',').map((hop) => hop.trim()).filter(Boolean)
    if (hops.length) candidates.push(hops[hops.length - 1])
  }
  const peer = (req.socket?.remoteAddress || '').replace(/^\[?::ffff:/, '').replace(/\]$/, '')
  if (peer) candidates.push(peer)
  for (const candidate of candidates) {
    if (isAddressLiteral(candidate)) return candidate
  }
  return UNATTRIBUTED
}

function liveEntry(ip: string, now: number): { count: number; resetAt: number } | undefined {
  const entry = hits.get(ip)
  if (!entry) return undefined
  if (entry.resetAt <= now) {
    hits.delete(ip)
    return undefined
  }
  return entry
}

function boundMemory(now: number): void {
  if (hits.size <= MAX_TRACKED_KEYS) return
  for (const key of Array.from(hits.keys())) {
    const entry = hits.get(key)
    if (!entry || entry.resetAt <= now) hits.delete(key)
    if (hits.size <= MAX_TRACKED_KEYS) return
  }
}

export function resetNewsletterRateLimitForTests(): void {
  hits.clear()
}

function rateLimit(req: HandlerRequest, res: HandlerResponse): boolean {
  const ip = clientIp(req)
  const now = Date.now()
  boundMemory(now)
  const entry = liveEntry(ip, now)
  if (!entry) {
    hits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    res.setHeader('X-RateLimit-Limit', String(RATE_LIMIT))
    res.setHeader('X-RateLimit-Remaining', String(RATE_LIMIT - 1))
    res.setHeader('Retry-After', String(Math.ceil(RATE_WINDOW_MS / 1000)))
    return false
  }
  entry.count += 1
  const remaining = Math.max(0, RATE_LIMIT - entry.count)
  res.setHeader('X-RateLimit-Limit', String(RATE_LIMIT))
  res.setHeader('X-RateLimit-Remaining', String(remaining))
  res.setHeader('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)))
  return entry.count > RATE_LIMIT
}

interface HandlerRequest {
  method?: string
  headers: Record<string, string | string[] | undefined>
  body?: unknown
  socket?: { remoteAddress?: string }
  [Symbol.asyncIterator]?: () => AsyncIterator<Uint8Array | Buffer | string>
}
interface HandlerResponse {
  setHeader(name: string, value: string | number | readonly string[]): void
  status(code: number): { end(): void; json(body: unknown): void }
}

const PRODUCTION_ALLOWED_ORIGINS = [
  'https://verlysemedia.kesug.com',
  'https://www.verlysemedia.kesug.com',
  'https://verlyse-react.vercel.app',
]

const DEV_ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173',
]

function isProductionRuntime(): boolean {
  return (
    process.env.VERCEL_ENV === 'production' ||
    process.env.NODE_ENV === 'production'
  )
}

function allowedOrigins(): Set<string> {
  const prod = isProductionRuntime()
  const configured = process.env.ALLOWED_ORIGINS
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
  const raw = configured?.length
    ? configured
    : prod
      ? PRODUCTION_ALLOWED_ORIGINS
      : [...PRODUCTION_ALLOWED_ORIGINS, ...DEV_ALLOWED_ORIGINS]
  const filtered = prod
    ? raw.filter((origin) => !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin))
    : raw
  return new Set(filtered)
}

function applyCors(req: HandlerRequest, res: HandlerResponse): boolean {
  const origin = headerText(req.headers.origin).trim()
  const allowed = allowedOrigins()
  const isAllowed = Boolean(origin && allowed.has(origin))
  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept')
  return !origin || isAllowed
}

async function readJsonBody(req: HandlerRequest): Promise<Record<string, unknown>> {
  if (
    req.body &&
    typeof req.body === 'object' &&
    !Buffer.isBuffer(req.body) &&
    !(req.body instanceof Uint8Array)
  ) {
    return req.body as Record<string, unknown>
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as Record<string, unknown>
    } catch {
      return {}
    }
  }
  if (Buffer.isBuffer(req.body) || req.body instanceof Uint8Array) {
    try {
      return JSON.parse(Buffer.from(req.body).toString('utf8')) as Record<string, unknown>
    } catch {
      return {}
    }
  }
  if (typeof req[Symbol.asyncIterator] === 'function') {
    const chunks: Buffer[] = []
    let total = 0
    for await (const chunk of req as AsyncIterable<Uint8Array | Buffer | string>) {
      const buf = typeof chunk === 'string' ? Buffer.from(chunk, 'utf8') : Buffer.from(chunk)
      total += buf.byteLength
      if (total > 16_384) return {}
      chunks.push(buf)
    }
    if (chunks.length > 0) {
      try {
        return JSON.parse(Buffer.concat(chunks).toString('utf8')) as Record<string, unknown>
      } catch {
        return {}
      }
    }
  }
  return {}
}

export default async function handler(req: HandlerRequest, res: HandlerResponse) {
  const originPermitted = applyCors(req, res)
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'SAMEORIGIN')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'method-not-allowed' })

  if (!originPermitted) {
    return res.status(403).json({ error: 'forbidden-origin' })
  }

  // Rate limit before doing any work
  if (rateLimit(req, res)) {
    return res.status(429).json({ error: 'too-many-requests' })
  }

  const body = await readJsonBody(req)
  const email = String(body.email ?? '').trim().toLowerCase()
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'invalid-email' })
  }

  const apiKey = (process.env.BUTTONDOWN_API_KEY ?? '').trim()
  if (!apiKey) return res.status(503).json({ error: 'not-configured' })

  const timeoutMs = Math.max(50, Number(process.env.VERLYSE_NEWSLETTER_TIMEOUT_MS) || 8_000)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const r = await fetch('https://api.buttondown.email/v1/subscribers', {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email_address: email }),
      signal: controller.signal,
    })

    if (r.ok) return res.status(201).json({ ok: true })

    const text = await r.text()
    if (r.status === 400 || r.status === 409) {
      if (/already|exist|subscribed|duplicate|collision/i.test(text)) {
        return res.status(200).json({ ok: true, duplicate: true })
      }
      if (/blocked|firewall|spam/i.test(text)) {
        return res.status(422).json({ ok: false, error: 'blocked', blocked: true })
      }
    }
    return res.status(502).json({ error: 'provider' })
  } catch (err) {
    const isAbort =
      err instanceof Error &&
      (err.name === 'AbortError' || /aborted|timeout/i.test(err.message))
    return res.status(isAbort ? 504 : 502).json({ error: isAbort ? 'timeout' : 'provider' })
  } finally {
    clearTimeout(timer)
  }
}
