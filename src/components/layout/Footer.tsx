import { Link } from 'react-router-dom'
import { useRef, useState, type FormEvent } from 'react'
import { BRAND, LEDGER } from '../../data/content'
import Reveal from '../ui/Reveal'
import { UnderlineLink } from '../ui/primitives'
import { spotlight } from '../../lib/stringTune/attrs'
import {
  FloralWord,
  VerlyseBackCoverSpecimen,
} from '../ui/EditorialCraftSystem'

const SOCIALS = [
  { label: 'Instagram', href: 'https://instagram.com/verlyse.media' },
  { label: 'Email', href: 'mailto:Verlysemedia.09@gmail.com' },
]

const VERCEL_NEWSLETTER_ENDPOINT = 'https://verlyse-react.vercel.app/api/newsletter'

/**
 * Resolve the newsletter API target:
 * - On the canonical static InfinityFree host (`verlysemedia.kesug.com`), where
 *   `/api/*` is not backed by a serverless runtime, call the Vercel serverless
 *   endpoint directly (`https://verlyse-react.vercel.app/api/newsletter`),
 *   which is permitted by `connect-src` in both `public/.htaccess` and
 *   `vercel.json` and by `PRODUCTION_ALLOWED_ORIGINS` in `api/newsletter.ts`.
 * - On Vercel or local dev/preview/test origins, call same-origin `/api/newsletter`.
 */
export function resolveNewsletterEndpoint(hostname?: string): string {
  const host =
    hostname ?? (typeof window !== 'undefined' ? window.location.hostname : '')
  if (host === 'verlysemedia.kesug.com' || host === 'www.verlysemedia.kesug.com') {
    return VERCEL_NEWSLETTER_ENDPOINT
  }
  return '/api/newsletter'
}

function Newsletter() {
  const inFlightRef = useRef(false)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState<{ kind: 'ok' | 'dup' | 'err'; text: string } | null>(null)

  const describeNewsletterError = (httpStatus: number, code?: string, blocked?: boolean): string => {
    if (blocked || code === 'blocked') {
      return 'This address could not be added — the list guards itself against spam. Your address is still in the field above if you wish to try another.'
    }
    if (code === 'not-configured' || httpStatus === 503) {
      return 'The newsletter service is currently unconfigured on this deployment — your address is preserved above so you can retry or write to the desk.'
    }
    if (code === 'too-many-requests' || httpStatus === 429) {
      return 'Too many subscription attempts in a short window — please wait a moment and retry.'
    }
    if (code === 'timeout' || httpStatus === 504) {
      return 'The newsletter service timed out — your address is preserved above so you can retry.'
    }
    return 'The letter could not be sent — your address is preserved above so you can retry in a moment.'
  }

  /** Deliver the address to the desk's letter list — the Vercel serverless
      function (never an API key in the client) adds it to the subscriber list. */
  const subscribe = async (e: FormEvent) => {
    e.preventDefault()
    if (inFlightRef.current || sending) return
    const v = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      setStatus({ kind: 'err', text: 'Please enter a valid email address.' })
      return
    }
    inFlightRef.current = true
    setSending(true)
    setStatus(null)
    try {
      const res = await fetch(resolveNewsletterEndpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: v }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean
        duplicate?: boolean
        blocked?: boolean
        error?: string
      }
      if (res.ok && data.ok === true && !data.blocked) {
        setStatus({
          kind: data.duplicate ? 'dup' : 'ok',
          text: data.duplicate ? "You're already on the list." : "You're on the list.",
        })
        setEmail('')
      } else {
        setStatus({
          kind: 'err',
          text: describeNewsletterError(res.status, data.error, data.blocked),
        })
      }
    } catch {
      setStatus({
        kind: 'err',
        text: describeNewsletterError(0),
      })
    } finally {
      inFlightRef.current = false
      setSending(false)
    }
  }

  const newsletterState = sending
    ? 'sending'
    : status?.kind === 'ok' || status?.kind === 'dup'
      ? 'accepted'
      : status?.kind === 'err'
        ? 'failed'
        : 'idle'

  return (
    <div {...spotlight()} className="st-spotlit grid grid-cols-1 gap-8 p-4 -m-4 lg:grid-cols-12 lg:items-end lg:gap-12">
      <div className="lg:col-span-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-gold">The Verlyse Letter</p>
        <p className="mt-3 max-w-[38ch] font-serif text-xl font-light italic leading-[1.55] text-ivory/85">
          Occasional letters — new features, quiet news, and nothing invented.
        </p>
      </div>
      <div className="lg:col-span-7">
        <label
          htmlFor="nl-email"
          className="mb-2 block font-mono text-[9px] uppercase tracking-[0.28em] text-ivory/65"
        >
          Email address for The Verlyse Letter
        </label>
        <form
          onSubmit={subscribe}
          noValidate
          data-newsletter-state={newsletterState}
          className="flex w-full flex-col gap-3 border-b border-gold/40 pb-1.5 sm:flex-row sm:items-stretch"
        >
          <input
            id="nl-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address…"
            autoComplete="email"
            disabled={sending}
            aria-invalid={status?.kind === 'err' ? 'true' : undefined}
            className="min-w-0 flex-1 bg-transparent px-1 py-2 font-serif text-lg italic text-ivory outline-none placeholder:text-ivory/60 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={sending}
            aria-busy={sending}
            className="btn btn-gold shrink-0 whitespace-nowrap !px-10 disabled:pointer-events-none disabled:opacity-60"
          >
            {sending ? 'Sending…' : status?.kind === 'err' ? 'Retry letter' : 'Take the letter'}
          </button>
        </form>
        {status && (
          <div role={status.kind === 'err' ? 'alert' : 'status'} className="mt-4 space-y-1.5">
            <p className={`font-mono text-[10px] uppercase tracking-[0.28em] ${status.kind === 'err' ? 'text-[#E8A2A2]' : 'text-[#A8C9A2]'}`}>
              {status.text}
            </p>
            {status.kind !== 'err' ? (
              <p className="font-serif text-sm italic leading-snug text-ivory/70">
                We&rsquo;ll send the next letter when there&rsquo;s something worth saying.
              </p>
            ) : (
              /* The list lives behind a serverless function that the static
                 primary host may not be able to reach. If the request fails
                 for any reason, the desk is still reachable — never leave a
                 reader believing they subscribed when they did not. */
              <p className="font-serif text-sm italic leading-snug text-ivory/70">
                You can also write to{' '}
                <a
                  href={`mailto:${BRAND.email}?subject=${encodeURIComponent('The Verlyse Letter')}&body=${encodeURIComponent('Please add this address to the letter list.')}`}
                  className="border-b border-gold/50 text-gold no-underline transition-colors hover:text-ivory"
                >
                  {BRAND.email}
                </a>{' '}
                and the desk will add you by hand.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const INDEX = [
  { label: 'The archive', links: [['Articles', '/articles'], ['Categories', '/categories'], ['Featured Creators', '/creators'], ['The room — a spatial walk', '/room']] },
  { label: 'The magazine', links: [['About', '/about'], ['Community', '/community'], ['Brand Ambassador', '/ambassadors']] },
  { label: 'The desk', links: [['Submit', '/submit'], ['Contact', '/contact']] },
]

export default function Footer() {
  return (
    <footer className="relative z-10 max-lg:pb-[62px] border-t border-white/10 bg-charcoal" aria-label="Footer">
      {/* Band 1: The closing invitation */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-page px-[clamp(1.75rem,5.5vw,4.75rem)] py-[clamp(4.5rem,9vh,7rem)]">
          <Reveal>
            <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-7">
                <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-gold-lit/85">
                  Colophon · Issue № {LEDGER.issueNo}
                </p>
                <p className="max-w-[22ch] font-serif text-[clamp(2.2rem,4.8vw,4.1rem)] font-light leading-[1.06] tracking-[-0.015em] text-ivory">
                  Where vision <FloralWord variant="rose">becomes a voice</FloralWord> — and the next voice could be yours.
                </p>
              </div>
              <div className="lg:col-span-5 lg:border-l lg:border-white/10 lg:pl-10">
                <p className="max-w-[36ch] font-serif text-lg font-light italic leading-[1.7] text-white/65">
                  {BRAND.submitCta}
                </p>
                <div className="mt-5">
                  <UnderlineLink to="/submit">Send your work to the desk</UnderlineLink>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Band 2: The Verlyse Letter — horizontal subscription ledger */}
      <div className="border-b border-white/10 bg-charcoal">
        <div className="mx-auto max-w-page px-[clamp(1.75rem,5.5vw,4.75rem)] py-14">
          <div className="relative z-10">
            <Newsletter />
          </div>
        </div>
      </div>

      {/* Band 3: Architectural 4-column site index & Band 4: Single back-cover imprint */}
      <div className="mx-auto max-w-page px-[clamp(1.75rem,5.5vw,4.75rem)] py-16 max-[979px]:pb-32">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-0 lg:divide-x lg:divide-white/10">
          {/* Masthead & social correspondence */}
          <Reveal className="lg:col-span-4 lg:pr-10">
            <p className="font-serif text-2xl text-ivory">
              Verlyse <em className="italic text-gold">Media</em>
            </p>
            <p className="mt-4 max-w-[36ch] text-sm leading-[1.8] text-white/55 lg:max-w-[30ch]">{BRAND.bio}</p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
              {SOCIALS.map((s) => {
                const isExternalHttp = /^https?:/i.test(s.href)
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target={isExternalHttp ? '_blank' : undefined}
                    rel={isExternalHttp ? 'noopener noreferrer' : undefined}
                    className="pb-1 font-mono text-[10px] uppercase tracking-[0.28em] text-ivory/75 no-underline transition-colors hover:text-gold max-[767px]:py-2"
                  >
                    {s.label} ↗
                  </a>
                )
              })}
            </div>
          </Reveal>

          {/* Three archival navigation columns */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 sm:gap-8 lg:col-span-8 lg:gap-0 lg:divide-x lg:divide-white/10">
            {INDEX.map((col, ci) => (
              <Reveal
                key={col.label}
                delay={0.06 + ci * 0.05}
                className={`${ci === 2 ? 'col-span-2 border-t border-white/10 pt-8 sm:col-span-1 sm:border-t-0 sm:pt-0' : 'col-span-1'} lg:px-8 first:lg:pl-10 last:lg:pr-0`}
              >
                <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">
                  <span aria-hidden="true" className="text-gold/75">0{ci + 1} /</span>
                  {col.label}
                </p>
                <ul className="mt-5 space-y-3">
                  {col.links.map(([label, to]) => (
                    <li key={to}>
                      <Link to={to} className="group relative inline-flex items-center gap-2 font-serif text-lg font-light text-ivory/85 no-underline transition-colors hover:text-gold max-[767px]:py-1">
                        <span>{label}</span>
                        <span aria-hidden="true" className="font-mono text-xs text-gold/0 transition-all duration-300 group-hover:translate-x-1 group-hover:text-gold-lit/85">→</span>
                        <span aria-hidden="true" className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-gold/60 transition-transform duration-500 ease-out group-hover:scale-x-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
                {col.label === 'The desk' && (
                  <p className="mt-6 border-t border-white/10 pt-4 font-mono text-[9px] uppercase leading-[1.9] tracking-[0.22em] text-white/60">
                    Issue № {LEDGER.issueNo} · {LEDGER.features} Folios
                    <span className="mt-1 block text-gold-lit/85">Submissions open for Issue № 02</span>
                  </p>
                )}
              </Reveal>
            ))}
          </div>
        </div>

        {/* Small print — the imprint */}
        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 font-mono text-[10px] uppercase tracking-[0.28em] text-white/65">
          <p>© {new Date().getFullYear()} Verlyse Media · {BRAND.handle}</p>
          <p className="hidden md:inline">{LEDGER.features} features · {LEDGER.creators} creators · one room</p>
          <button
            type="button"
            onClick={() => {
              const reduce = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
              window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
            }}
            className="pb-1 font-mono text-[10px] uppercase tracking-[0.28em] text-ivory/70 no-underline transition-colors hover:text-gold max-[767px]:py-2"
          >
            Back to the top ↑
          </button>
        </div>

        {/* The back cover — the magazine's single closing display wordmark */}
        <div className="mt-12 overflow-hidden">
          <VerlyseBackCoverSpecimen />
          <p className="mt-4 text-center font-mono text-[9px] uppercase tracking-[0.34em] text-white/55">
            {BRAND.tagline} — the conversation is the magazine
          </p>
        </div>
      </div>
    </footer>
  )
}
