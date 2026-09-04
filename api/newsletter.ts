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
 * A simple in-memory rate limit (per IP) protects the endpoint from
 * brute-force/abuse, with the standard X-RateLimit-* headers. This is
 * instance-local only and is not distributed protection across serverless
 * instances; a shared rate-limit store is the follow-up hardening step.
 */

/** Simple sliding-window limiter: 10 requests per minute per IP. */
const RATE_LIMIT = 10
const RATE_WINDOW_MS = 60_000
const hits = new Map<string, { count: number; resetAt: number }>()

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

function clientIp(req: HandlerRequest): string {
  const fwd = req.headers['x-forwarded-for']
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim()
  return req.socket?.remoteAddress || 'unknown'
}

function rateLimit(req: HandlerRequest, res: HandlerResponse): boolean {
  const ip = clientIp(req)
  const now = Date.now()
  const entry = hits.get(ip)
  if (!entry || entry.resetAt <= now) {
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
