/**
 * Verlyse Media — "The Verlyse Letter" newsletter signup.
 *
 * Vercel serverless function: adds an email to the Buttondown subscriber
 * list. The API key lives ONLY in the server environment
 * (BUTTONDOWN_API_KEY) — never in client code.
 *
 * CORS is enabled so the form works from any domain that serves the site
 * (Vercel production, the InfinityFree mirror, local previews).
 *
 * An in-memory rate limit (per attributed caller) protects the endpoint from
 * brute-force/abuse, with the standard X-RateLimit-* headers. Two properties to
 * keep in mind: the caller address is derived from platform-set headers rather
 * than the caller-controlled leftmost x-forwarded-for entry (see clientIp), and
 * the limiter is instance-local, so it is NOT distributed protection across
 * serverless instances. A shared rate-limit store remains the follow-up step.
 */

/** Fixed-window limiter: 10 requests per minute per attributed caller. */
const RATE_LIMIT = 10
const RATE_WINDOW_MS = 60_000
/** Hard bound on distinct keys held at once. The limiter is per-instance, so
 *  this caps worst-case memory growth; it is not a distributed guarantee. */
const MAX_TRACKED_KEYS = 5_000
/** Bucket for callers that cannot be attributed to an address. Fail closed:
 *  they share ONE limit instead of each minting a fresh one. */
const UNATTRIBUTED = 'unattributed'
const hits = new Map<string, { count: number; resetAt: number }>()

/** Accept address literals only, so arbitrary header text cannot become a key. */
function isAddressLiteral(value: string): boolean {
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(value)) return true
  // IPv6 (including IPv4-mapped) — hex digits, colons and at most one dotted quad.
  return value.includes(':') && /^[0-9a-fA-F:.]+$/.test(value)
}

function headerText(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return typeof value[0] === 'string' ? value[0] : ''
  return typeof value === 'string' ? value : ''
}

/**
 * Client address for rate limiting.
 *
 * This previously returned x-forwarded-for[0], which the caller supplies:
 * rotating that single header minted a fresh bucket on every request and
 * bypassed the limit entirely (CWE-290 — the same flaw fixed upstream in
 * go-chi GHSA-9g5q-2w5x-hmxf).
 *
 * Preference order, most to least trustworthy:
 *   1. x-vercel-forwarded-for — set by the Vercel edge from the real connection
 *      and preserved even when an upstream proxy overwrote x-forwarded-for.
 *   2. the RIGHTMOST x-forwarded-for entry — appended by the nearest hop, unlike
 *      the caller-controlled leftmost one.
 *   3. the socket peer address.
 *   4. a single shared bucket.
 *
 * Every candidate must parse as an address literal, so header text can neither
 * select a bucket nor inflate the map.
 */
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

/** Read the live entry, dropping it once its window has closed so idle callers
 *  stop occupying memory. */
function liveEntry(ip: string, now: number): { count: number; resetAt: number } | undefined {
  const entry = hits.get(ip)
  if (!entry) return undefined
  if (entry.resetAt <= now) {
    hits.delete(ip)
    return undefined
  }
  return entry
}

/** Opportunistic sweep, only once the map exceeds its bound. */
function boundMemory(now: number): void {
  if (hits.size <= MAX_TRACKED_KEYS) return
  for (const key of Array.from(hits.keys())) {
    const entry = hits.get(key)
    if (!entry || entry.resetAt <= now) hits.delete(key)
    if (hits.size <= MAX_TRACKED_KEYS) return
  }
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

/** Minimal structural types for the Vercel-compatible handler, so the API is
 *  type-safe without pulling the whole @vercel/node runtime in. */
interface HandlerRequest {
  method?: string
  headers: Record<string, string | string[] | undefined>
  body?: unknown
  socket?: { remoteAddress?: string }
}
interface HandlerResponse {
  setHeader(name: string, value: string | number | readonly string[]): void
  status(code: number): { end(): void; json(body: unknown): void }
}

const DEFAULT_ALLOWED_ORIGINS = [
  'https://verlyse-react.vercel.app',
  'http://localhost:5173',
  'http://localhost:4173',
]

function allowedOrigins(): Set<string> {
  const configured = process.env.ALLOWED_ORIGINS
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
  return new Set(configured?.length ? configured : DEFAULT_ALLOWED_ORIGINS)
}

function applyCors(req: HandlerRequest, res: HandlerResponse) {
  const origin = req.headers.origin
  if (typeof origin === 'string' && allowedOrigins().has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

export default async function handler(req: HandlerRequest, res: HandlerResponse) {
  applyCors(req, res)
  // Hardening headers
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'SAMEORIGIN')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'method-not-allowed' })

  // Rate limit before doing any work
  if (rateLimit(req, res)) {
    return res.status(429).json({ error: 'too-many-requests' })
  }

  const body = (req.body ?? {}) as Record<string, unknown>
  const email = String(body.email ?? '').trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'invalid-email' })
  }

  const apiKey = process.env.BUTTONDOWN_API_KEY
  if (!apiKey) return res.status(503).json({ error: 'not-configured' })

  try {
    const r = await fetch('https://api.buttondown.email/v1/subscribers', {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email_address: email }),
    })

    if (r.ok) return res.status(201).json({ ok: true })

    const text = await r.text()
    // A duplicate address is not an error — it is already on the list.
    if (r.status === 400 || r.status === 409) {
      if (/already|exist|subscribed|duplicate|collision/i.test(text)) {
        return res.status(200).json({ ok: true, duplicate: true })
      }
      // The provider's spam firewall declined this address (spam-trap
      // domains, disposable addresses, or a blocked sender). Tell the
      // visitor plainly — the desk still reads the form submission.
      if (/blocked|firewall|spam/i.test(text)) {
        return res.status(200).json({ ok: true, blocked: true })
      }
    }
    return res.status(502).json({ error: 'provider' })
  } catch {
    return res.status(502).json({ error: 'provider' })
  }
}
