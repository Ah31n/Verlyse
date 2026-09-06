import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useSeo } from '../hooks/useSeo'
import Reveal from '../components/ui/Reveal'
import { BRAND } from '../data/content'

/** A quiet note beneath a letter-line — shown only when the line needs attention. */
function LetterHint({ show, children }: { show: boolean; children: ReactNode }) {
  if (!show) return null
  return (
    <p role="alert" className="mt-2 font-serif text-sm italic leading-snug text-[#B33A3A]">
      {children}
    </p>
  )
}

/**
 * Contact — write to the desk.
 * The form is a letter: a sheet of paper, fields set as letter-lines,
 * a signature that fills as the writer types their name, and a seal
 * that is pressed when the letter is sent. When the seal is pressed,
 * the letter becomes its acknowledgement.
 */
export default function Contact() {
  useSeo({
path: '/contact',
    title: 'Contact',
    description: 'Write to Verlyse Media — submissions, questions, or a note about a feature that stayed with you.',
  })

  const formRef = useRef<HTMLFormElement>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [name, setName] = useState('')
  const [sealed, setSealed] = useState(false)
  const [sending, setSending] = useState(false)
  const [viaBackend, setViaBackend] = useState(true)

  /** Deliver the letter to the desk — posts to the forwarding service so it
      arrives in the Verlyse Media inbox; if the network path fails, the
      writer's mail app opens with everything prefilled instead. */
  const sendLetter = async (payload: Record<string, string>): Promise<boolean> => {
    try {
      const res = await fetch('https://formsubmit.co/ajax/Verlysemedia.09@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ _subject: `Letter — ${payload.subject}`, _captcha: 'false', ...payload }),
      })
      if (res.ok) return true
    } catch {
      /* fall through to the mail fallback */
    }
    const params = new URLSearchParams({
      subject: `Letter — ${payload.subject}`,
      body: [
        `Name: ${payload.name}`,
        `Email: ${payload.email}`,
        `Subject: ${payload.subject}`,
        '',
        payload.message,
      ].join('\n'),
    })
    window.location.href = `mailto:${BRAND.email}?${params.toString()}`
    return false
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const fields: Array<[string, string]> = [
      ['name', String(data.get('name') ?? '').trim()],
      ['email', String(data.get('email') ?? '').trim()],
      ['subject', String(data.get('subject') ?? '').trim()],
      ['message', String(data.get('message') ?? '').trim()],
    ]

    const bad: string[] = []
    const email = fields.find(([k]) => k === 'email')?.[1] ?? ''
    fields.forEach(([k, v]) => {
      if (!v) bad.push(k)
    })
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) bad.push('email')

    form.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'))
    bad.forEach((k) => form.querySelector<HTMLElement>(`[name="${k}"]`)?.classList.add('is-invalid'))
    setErrors(bad)

    if (bad.length) {
      setSealed(false)
      form.querySelector<HTMLElement>(`[name="${bad[0]}"]`)?.focus()
      return
    }

    setErrors([])
    setSending(true)
    const ok = await sendLetter({
      name: fields[0][1],
      email: fields[1][1],
      subject: fields[2][1],
      message: fields[3][1],
    })
    setSending(false)
    setViaBackend(ok)
    setSealed(true)
  }

  const resetLetter = () => {
    formRef.current?.reset()
    setName('')
    setErrors([])
    setSealed(false)
  }

  return (
    <>
      <section className="relative flex min-h-[58svh] items-end overflow-hidden border-b border-white/10 bg-wine-deep pb-20 pt-[clamp(7rem,15vh,10rem)]">
        {/* the quietest of the two desks — low light, intimate */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_0%,rgba(232,217,168,0.12),transparent_60%),radial-gradient(110%_85%_at_50%_0%,rgba(92,18,36,0.32),transparent_62%),linear-gradient(175deg,#3E0D17_0%,#2A0F18_58%,#15050B_100%)]" />
        </div>
        <div className="relative mx-auto w-full max-w-page px-[clamp(1.25rem,4vw,4.75rem)] text-center">
          <Reveal><p className="eyebrow">Verlyse Media — the desk</p></Reveal>
          <h1 className="relative mt-8 font-serif text-[clamp(2.6rem,7vw,5.5rem)] font-light leading-[0.92] tracking-[-0.02em] text-ivory">
            <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none whitespace-nowrap font-serif text-[clamp(3.2rem,8.5vw,7rem)] font-semibold leading-none text-transparent [-webkit-text-stroke:1px_rgba(184,145,70,0.13)]">
              THE CORRESPONDENCE DESK
            </span>
            <span className="relative">The correspondence <em className="italic text-gold">desk</em></span>
          </h1>
          <Reveal delay={0.2}>
            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.3em] text-gold/85">
              Write to the publication — a letter, not a form
            </p>
          </Reveal>
          <Reveal delay={0.25}>
            <p className="mx-auto mt-6 max-w-[52ch] text-lg leading-[1.8] text-white/70">
              Submissions, questions, or a note about a feature that stayed with you. Every letter is read.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-white/10 py-[clamp(6rem,14vh,11rem)]">
        <div className="mx-auto grid max-w-page grid-cols-1 gap-[clamp(3rem,6vw,7rem)] px-[clamp(1.75rem,5.5vw,4.75rem)] lg:grid-cols-[0.9fr_1.1fr]">
          {/* The desk */}
          <div>
            <Reveal><p className="kicker">The desk — contact notes</p></Reveal>
            <Reveal delay={0.05}>
              <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.3em] text-white/50">Letters — read, answered</p>
            </Reveal>
            <ul className="mt-8 border-t border-white/10">
              {[
                ['Email', BRAND.email, `mailto:${BRAND.email}`],
                ['Instagram', BRAND.handle, BRAND.instagram],
                ['Everything else', 'A letter through the form, or a comment beneath any feature', null],
              ].map(([role, value, href], i) => (
                <Reveal key={role} delay={i * 0.08} as="li">
                  <div className="flex flex-col gap-2 border-b border-white/10 py-6">
                    <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">{role}</span>
                    {href ? (
                      href.startsWith('http') ? (
                        <a href={href} rel="noopener noreferrer" target="_blank" className="font-serif text-2xl font-normal italic text-ivory no-underline transition-colors hover:text-gold">{value}</a>
                      ) : (
                        <a href={href} className="font-serif text-2xl font-normal italic text-ivory no-underline transition-colors hover:text-gold">{value}</a>
                      )
                    ) : (
                      <span className="font-serif text-2xl font-normal italic text-ivory/85">{value}</span>
                    )}
                  </div>
                </Reveal>
              ))}
            </ul>
            <Reveal delay={0.3}>
              <p className="mt-8 max-w-[40ch] font-serif text-base font-light italic leading-[1.7] text-ivory/65">
                The desk is small, and it answers everything — a question, a note about a feature that stayed with you, or the beginning of the next one.
              </p>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.28em] leading-[2] text-white/50">
                Every letter is read · every comment is answered · nothing is invented
              </p>
            </Reveal>
          </div>

          {/* The letter */}
          <form ref={formRef} onSubmit={onSubmit} noValidate aria-label="Write a letter to the desk">
            <Reveal>
              <div className="relative max-w-[640px] border border-wine/15 bg-[#F2EADA] px-6 py-10 text-wine shadow-[0_60px_140px_rgba(0,0,0,0.55)] sm:px-10 md:px-12 md:py-14 sm:rotate-[-0.6deg] sm:transition-transform sm:duration-700 sm:ease-[cubic-bezier(0.16,1,0.3,1)] sm:focus-within:rotate-0">
                {/* the wax seal on the flap — a quiet promise, pressed in wine */}
                <span aria-hidden="true" className="absolute -top-4 left-1/2 hidden h-9 w-9 -translate-x-1/2 rotate-6 items-center justify-center rounded-full border-2 border-wine bg-wine shadow-[inset_0_0_0_2px_rgba(242,234,218,0.18)] sm:flex">
                  <span className="font-serif text-[11px] italic leading-none text-[#F2EADA]">VM</span>
                </span>

                {sealed ? (
                  /* ——— the acknowledgement — the letter is sealed and received ——— */
                  <div className="flex flex-col items-center py-6 text-center">
                    <motion.span
                      aria-hidden="true"
                      initial={{ scale: 2.1, opacity: 0, rotate: -16 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                      className="grid h-16 w-16 place-items-center rounded-full border-[3px] border-wine bg-wine shadow-[inset_0_0_0_3px_rgba(242,234,218,0.16),0_14px_30px_rgba(59,13,23,0.45)]"
                    >
                      <span className="font-serif text-lg italic leading-none text-[#F2EADA]">VM</span>
                    </motion.span>
                    <p className="mt-8 font-mono text-[9px] uppercase tracking-[0.30em] text-wine/70">The seal is pressed</p>
                    <h2 className="mt-4 font-serif text-[clamp(1.9rem,3vw,2.6rem)] font-light italic leading-[1.2] text-wine">
                      Letter sealed
                    </h2>
                    <p className="mt-4 max-w-[40ch] font-serif text-base font-light italic leading-[1.8] text-wine/80">
                      Your correspondence has been received by Verlyse Media.
                    </p>
                    <p className="mt-3 font-mono text-[8px] uppercase tracking-[0.30em] text-wine/60">
                      Read · Answered · Read again
                    </p>
                    {!viaBackend && (
                      <p className="mt-5 max-w-[38ch] text-sm italic leading-[1.8] text-wine/75">
                        Your mail app should have opened with the letter written out — if it didn’t, send it directly to {BRAND.email}.
                      </p>
                    )}
                    <button type="button" onClick={resetLetter} className="btn btn-seal mt-10">
                      Write another letter
                    </button>
                  </div>
                ) : (
                  <>
                    {/* letterhead */}
                    <div className="flex items-end justify-between gap-6 border-b border-wine/15 pb-5">
                      <p className="font-mono text-[9px] uppercase tracking-[0.30em] text-wine/80">Verlyse Media — the desk</p>
                      <p className="hidden font-mono text-[9px] uppercase tracking-[0.30em] text-wine/70 sm:block">Read · Answered · Read again</p>
                    </div>

                    <p className="mt-9 font-serif text-[clamp(1.5rem,2.4vw,2rem)] font-light italic leading-[1.3] text-wine">
                      To the Editors —
                    </p>

                    {/* the letter-lines */}
                    <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2">
                      <div className="field">
                        <label className="field-label !text-wine/80" htmlFor="cf-name">Your name</label>
                        <input
                          className="letter-input"
                          id="cf-name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          placeholder="your name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                        <LetterHint show={errors.includes('name')}>Please sign your name.</LetterHint>
                      </div>
                      <div className="field">
                        <label className="field-label !text-wine/80" htmlFor="cf-email">Email</label>
                        <input className="letter-input" id="cf-email" name="email" type="email" autoComplete="email" placeholder="your@email.com" />
                        <LetterHint show={errors.includes('email')}>An email is needed for the reply.</LetterHint>
                      </div>
                      <div className="field sm:col-span-2">
                        <label className="field-label !text-wine/80" htmlFor="cf-subject">Subject</label>
                        <input className="letter-input" id="cf-subject" name="subject" type="text" placeholder="what the letter is about" />
                        <LetterHint show={errors.includes('subject')}>A subject helps the desk sort the post.</LetterHint>
                      </div>
                      <div className="field sm:col-span-2">
                        <label className="field-label !text-wine/80" htmlFor="cf-msg">The letter itself</label>
                        <textarea
                          className="letter-input min-h-[8.5rem] resize-y leading-[1.9]"
                          id="cf-msg"
                          name="message"
                          rows={6}
                          placeholder="Write it as you would to a reader, not a form —"
                        />
                        <LetterHint show={errors.includes('message')}>The letter itself is empty.</LetterHint>
                      </div>
                    </div>

                    {/* closing — the signature fills as the writer writes */}
                    <div className="mt-10 flex flex-wrap items-end justify-between gap-x-10 gap-y-8 border-t border-wine/15 pt-8">
                      <div className="min-w-[240px]">
                        <p className="font-serif text-lg font-light italic leading-[1.4] text-wine">With thanks,</p>
                        <p aria-hidden="true" className="mt-3 min-h-[2.2rem] font-serif text-[1.7rem] font-light italic leading-none text-wine" style={{ transform: 'rotate(-1.5deg)' }}>
                          {name || <span className="text-wine/30">— your name, when you write it</span>}
                        </p>
                        <p className="mt-2 font-mono text-[8px] uppercase tracking-[0.30em] text-wine/70">Signs itself as you write</p>
                      </div>
                      <div className="flex flex-col items-start gap-4">
                        <button type="submit" disabled={sending} aria-busy={sending} className="btn btn-seal disabled:pointer-events-none disabled:opacity-60">
                          {sending ? 'Sealing the letter…' : 'Seal the letter — send'}
                        </button>
                        {errors.length > 0 && (
                          <p role="status" className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#B33A3A]">
                            A few lines remain — the desk has marked them.
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="mt-12 max-w-[46ch] font-mono text-[10px] uppercase tracking-[0.28em] leading-[2] text-white/60">
                No account needed · no tracking · the desk reads everything it receives
              </p>
            </Reveal>
          </form>
        </div>
      </section>
    </>
  )
}
