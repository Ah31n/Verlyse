import { Link } from 'react-router-dom'
import { useState, type FormEvent } from 'react'
import { BRAND } from '../../data/content'
import Reveal from '../ui/Reveal'

const SOCIALS = [
  { label: 'Instagram', href: 'https://instagram.com/verlyse.media' },
  { label: 'Email', href: 'mailto:Verlysemedia.09@gmail.com' },
]

function Newsletter() {
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState<{ kind: 'ok' | 'dup' | 'err'; text: string } | null>(null)

  /** Deliver the address to the desk's letter list — the Vercel serverless
      function (never an API key in the client) adds it to the subscriber list. */
  const subscribe = async (e: FormEvent) => {
    e.preventDefault()
    const v = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      setStatus({ kind: 'err', text: 'Please enter a valid email address.' })
      return
    }
    if (sending) return
    setSending(true)
    setStatus(null)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: v }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.ok) {
        setStatus({
          kind: data.duplicate || data.blocked ? 'dup' : 'ok',
          text: data.duplicate ? "You're already on the list." : data.blocked ? 'This address could not be added — the list guards itself against spam.' : "You're on the list.",
        })
        setEmail('')
      } else {
        setStatus({ kind: 'err', text: 'The letter could not be sent — try again in a moment.' })
      }
    } catch {
      setStatus({ kind: 'err', text: 'The letter could not be sent — try again in a moment.' })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex w-full flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-[40ch]">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-gold">The Verlyse Letter</p>
        <p className="mt-4 font-serif text-xl font-light italic leading-[1.55] text-ivory/85">
          Occasional letters — new features, quiet news, and nothing invented.
        </p>
      </div>
      <div className="w-full max-w-[560px]">
        <form onSubmit={subscribe} noValidate className="flex w-full flex-col gap-3 border-b border-gold/40 pb-1 sm:flex-row sm:items-stretch">
          <label htmlFor="nl-email" className="sr-only">Email address</label>
          <input
            id="nl-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            autoComplete="email"
            disabled={sending}
            className="min-w-0 flex-1 bg-transparent px-1 py-2 font-serif text-lg italic text-ivory outline-none placeholder:text-ivory/35 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={sending}
            aria-busy={sending}
            className="btn btn-gold shrink-0 whitespace-nowrap !px-10 disabled:pointer-events-none disabled:opacity-60"
          >
            Take the letter
          </button>
        </form>
        {status && (
          <div role="status" className="mt-4 space-y-1.5">
            <p className={`font-mono text-[10px] uppercase tracking-[0.28em] ${status.kind === 'err' ? 'text-[#E8A2A2]' : 'text-[#A8C9A2]'}`}>
              {status.text}
            </p>
            {status.kind !== 'err' && (
              <p className="font-serif text-sm italic leading-snug text-ivory/70">
                We&rsquo;ll send the next letter when there&rsquo;s something worth saying.
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
    <footer className="border-t border-white/10 bg-charcoal" aria-label="Footer">
      {/* the closing invitation */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-page px-[clamp(1.75rem,5.5vw,4.75rem)] py-[clamp(4.5rem,9vh,7rem)]">
          <Reveal>
            <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-[1fr_auto]">
              <p className="max-w-[24ch] font-serif text-[clamp(2.2rem,5vw,4.2rem)] font-light leading-[1.08] tracking-[-0.015em] text-ivory">
                Where vision <em className="italic text-gold">becomes a voice</em> — and the next voice could be yours.
              </p>
              <p className="max-w-[34ch] font-serif text-lg font-light italic leading-[1.7] text-white/60">
                {BRAND.submitCta}
              </p>
            </div>
          </Reveal>
        </div>
      </div>

      {/* the letter — its own full-width band so the CTA keeps a wide,
          horizontal composition on desktop */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-page px-[clamp(1.75rem,5.5vw,4.75rem)] py-14">
          <Reveal>
            <Newsletter />
          </Reveal>
        </div>
      </div>

      {/* the colophon */}
      <div className="mx-auto max-w-page px-[clamp(1.75rem,5.5vw,4.75rem)] py-16 max-[979px]:pb-32">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1.2fr]">
          {/* masthead */}
          <Reveal>
            <p className="font-serif text-2xl">
              Verlyse <em className="italic text-gold">Media</em>
            </p>
            <p className="mt-4 max-w-[30ch] text-sm leading-[1.8] text-white/55">{BRAND.bio}</p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank" rel="noopener noreferrer"
                  className="pb-1 font-mono text-[10px] uppercase tracking-[0.28em] text-ivory/70 no-underline transition-colors hover:text-gold max-[767px]:py-2"
                >
                  {s.label} ↗
                </a>
              ))}
            </div>
          </Reveal>

          {/* index columns */}
          {INDEX.map((col, ci) => (
            <Reveal key={col.label} delay={0.06 + ci * 0.05}>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">{col.label}</p>
              <ul className="mt-5 space-y-3">
                {col.links.map(([label, to]) => (
                  <li key={to}>
                    <Link to={to} className="group relative font-serif text-lg font-light text-ivory/85 no-underline transition-colors hover:text-gold max-[767px]:inline-block max-[767px]:py-1">
                      {label}
                      <span aria-hidden="true" className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-gold/60 transition-transform duration-500 ease-out group-hover:scale-x-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}

        </div>

        {/* small print — the imprint */}
        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 font-mono text-[10px] uppercase tracking-[0.28em] text-white/50">
          <p>© {new Date().getFullYear()} Verlyse Media · {BRAND.handle}</p>
          <p className="hidden md:inline">Nineteen features · fifteen creators · one room</p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="pb-1 font-mono text-[10px] uppercase tracking-[0.28em] text-ivory/70 no-underline transition-colors hover:text-gold max-[767px]:py-2"
          >
            Back to the top ↑
          </button>
        </div>

        {/* the back cover — the magazine's ghost, the last impression */}
        <div aria-hidden="true" className="pointer-events-none mt-12 select-none overflow-hidden">
          <p className="whitespace-nowrap text-center font-serif text-[clamp(5.5rem,17vw,15rem)] font-semibold leading-[0.78] text-transparent [-webkit-text-stroke:1px_rgba(184,145,70,0.12)]">
            Verlyse
          </p>
          <p className="mt-3 text-center font-mono text-[9px] uppercase tracking-[0.34em] text-white/55">
            {BRAND.tagline} — the conversation is the magazine
          </p>
        </div>
      </div>
    </footer>
  )
}
