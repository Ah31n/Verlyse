import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useSeo } from '../hooks/useSeo'
import Reveal from '../components/ui/Reveal'
import { BRAND, CATEGORIES } from '../data/content'

/** A quiet field-level note — shown only when the line needs attention. */
function FieldHint({ show, children }: { show: boolean; children: ReactNode }) {
  if (!show) return null
  return (
    <p role="alert" className="font-serif text-sm italic leading-snug text-[#E8A2A2]">
      {children}
    </p>
  )
}

export default function Submit() {
  useSeo({
path: '/submit',
    title: 'Submit',
    description: 'Send your story to Verlyse Media. Every feature begins as a submission.',
  })

  const formRef = useRef<HTMLFormElement>(null)
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [viaBackend, setViaBackend] = useState(true)
  const [errors, setErrors] = useState<string[]>([])
  const [fileName, setFileName] = useState('')

  /** Deliver the piece to the desk — posts to the forwarding service so it
      arrives in the Verlyse Media inbox; if the network path fails, the
      writer's mail app opens with everything prefilled instead. */
  const sendToDesk = async (payload: Record<string, string>): Promise<boolean> => {
    try {
      const res = await fetch('https://formsubmit.co/ajax/Verlysemedia.09@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ _subject: `Submission — ${payload.title}`, _captcha: 'false', ...payload }),
      })
      if (res.ok) return true
    } catch {
      /* fall through to the mail fallback */
    }
    const params = new URLSearchParams({
      subject: `Submission — ${payload.title}`,
      body: [
        `Name: ${payload.name}`,
        `Email: ${payload.email}`,
        payload.handle ? `Handle: ${payload.handle}` : '',
        `Title: ${payload.title}`,
        `Category: ${payload.category}`,
        payload.description ? `Description: ${payload.description}` : '',
        '',
        '--- the work ---',
        payload.work,
        payload.fileName ? `\n(cover image selected: ${payload.fileName} — please attach it to this email)` : '',
      ].filter(Boolean).join('\n'),
    })
    window.location.href = `mailto:${BRAND.email}?${params.toString()}`
    return false
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const name = String(data.get('name') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    const title = String(data.get('title') ?? '').trim()
    const work = String(data.get('work') ?? '').trim()
    const category = String(data.get('category') ?? '')

    const bad: string[] = []
    if (!name) bad.push('name')
    if (!email) bad.push('email')
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) bad.push('email')
    if (!title) bad.push('title')
    if (!category) bad.push('category')
    if (!work) bad.push('work')

    form.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'))
    bad.forEach((k) => form.querySelector<HTMLElement>(`[name="${k}"]`)?.classList.add('is-invalid'))
    setErrors(bad)

    if (bad.length) {
      form.querySelector<HTMLElement>(`[name="${bad[0]}"]`)?.focus()
      return
    }

    setSending(true)
    const ok = await sendToDesk({
      name,
      email,
      handle: String(data.get('handle') ?? '').trim(),
      title,
      category,
      description: String(data.get('description') ?? '').trim(),
      work,
      fileName,
    })
    setSending(false)
    setViaBackend(ok)
    setSent(true)
  }

  const resetForm = () => {
    formRef.current?.reset()
    setSent(false)
    setErrors([])
    setFileName('')
  }

  return (
    <>
      <section className="relative overflow-hidden border-b border-white/10 bg-wine-deep pb-14 pt-[clamp(7rem,16vh,10rem)]">
        {/* the desk lamp — a warm, directional light over the desk */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(80%_55%_at_50%_-6%,rgba(232,217,168,0.16),transparent_62%),radial-gradient(110%_85%_at_50%_0%,rgba(92,18,36,0.35),transparent_60%),linear-gradient(175deg,#4A1120_0%,#2A0F18_60%,#15050B_100%)]" />
          <span aria-hidden="true" className="absolute left-1/2 top-0 h-[3px] w-[34vw] max-w-[520px] -translate-x-1/2 bg-gradient-to-b from-gold/50 to-transparent" />
        </div>
        <div className="relative mx-auto w-full max-w-page px-[clamp(1.25rem,4vw,4.75rem)]">
          <Reveal><p className="eyebrow">Submissions — open · writer → work → piece → desk</p></Reveal>
          <h1 className="relative mt-8 font-serif text-[clamp(2.8rem,7.5vw,6rem)] font-light leading-[0.92] tracking-[-0.02em] text-ivory">
            <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none whitespace-nowrap text-center font-serif text-[clamp(3.4rem,9vw,7.5rem)] font-semibold leading-none text-transparent [-webkit-text-stroke:1px_rgba(184,145,70,0.14)]">
              THE EDITORIAL DESK
            </span>
            <span className="relative">The editorial <em className="italic text-gold">desk</em></span>
          </h1>
          <Reveal delay={0.15}>
            <p className="mt-6 max-w-[52ch] text-lg leading-[1.8] text-white/70">
              The platform puts it plainly: “Want to submit your work too? We’d love to feature it. Submit your work through the link in our bio.”
            </p>
          </Reveal>
          <Reveal delay={0.22}>
            <p className="mt-4 max-w-[52ch] text-base leading-[1.8] text-white/60">
              Every feature on this magazine began as someone’s kept notebook page, late-night draft, or quiet painting. The desk reads everything, credits the writer by name, and answers with care. Send the one you keep rereading.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="relative border-t border-white/10 py-[clamp(6rem,14vh,11rem)]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(60%_90%_at_50%_0%,rgba(232,217,168,0.07),transparent_70%)]" />
        <div className="mx-auto grid max-w-page grid-cols-1 gap-[clamp(3rem,6vw,7rem)] px-[clamp(1.75rem,5.5vw,4.75rem)] lg:grid-cols-[1.15fr_0.85fr]">
          {/* Form */}
          <form ref={formRef} onSubmit={onSubmit} className="flex max-w-[640px] flex-col gap-10" noValidate>
            {sent ? (
              /* ——— the acknowledgement — the piece has left the writer's hands ——— */
              <div className="border-t border-gold/30 pt-10">
                <p className="kicker">Sent to the desk</p>
                <h2 className="mt-5 font-serif text-[clamp(2rem,3.6vw,3rem)] font-light leading-[1.05] tracking-[-0.015em] text-ivory">
                  Your work is on the desk — <em className="italic text-gold">the desk writes back</em>
                </h2>
                <p className="mt-6 max-w-[44ch] font-serif text-lg font-light italic leading-[1.7] text-white/70">
                  Every submission is read, and every writer is credited by name. The desk will write back — to the address on the envelope.
                </p>
                <p className="mt-6 max-w-[44ch] font-mono text-[10px] uppercase leading-[2] tracking-[0.28em] text-white/55">
                  Received · read · answered — nothing is invented
                </p>
                {!viaBackend && (
                  <p className="mt-4 max-w-[44ch] text-sm leading-[1.8] text-white/60">
                    Your mail app should have opened with the piece written out — if it didn’t, send it directly to {BRAND.email}. The cover image’s filename travels with the submission; attach the file itself in the email if it opened.
                  </p>
                )}
                {viaBackend && fileName && (
                  <p className="mt-4 max-w-[44ch] text-sm leading-[1.8] text-white/60">
                    The cover image ({fileName}) is noted with the submission — the desk will ask for the file itself if the piece is selected.
                  </p>
                )}
                <button type="button" onClick={resetForm} className="btn btn-ghost mt-10">
                  Send another piece
                </button>
              </div>
            ) : (
              <>
                {/* ——— I · the writer ——— */}
                <div>
                  <p className="kicker">I — the writer</p>
                  <div className="mt-6 grid grid-cols-1 gap-8 border-t border-white/10 pt-6 sm:grid-cols-2">
                    <div className="field">
                      <label className="field-label" htmlFor="sf-name">Full name</label>
                      <input className="field-input" id="sf-name" name="name" type="text" autoComplete="name" />
                      <FieldHint show={errors.includes('name')}>Please sign your name.</FieldHint>
                    </div>
                    <div className="field">
                      <label className="field-label" htmlFor="sf-email">Email</label>
                      <input className="field-input" id="sf-email" name="email" type="email" autoComplete="email" />
                      <FieldHint show={errors.includes('email')}>An email is needed — the desk writes back.</FieldHint>
                    </div>
                    <div className="field sm:col-span-2">
                      <label className="field-label" htmlFor="sf-handle">Instagram / social handle <span className="text-white/40">— optional</span></label>
                      <input className="field-input" id="sf-handle" name="handle" type="text" autoComplete="username" placeholder="@yourname" />
                    </div>
                  </div>
                </div>

                {/* ——— II · the work ——— */}
                <div>
                  <p className="kicker">II — the work</p>
                  <div className="mt-6 grid grid-cols-1 gap-8 border-t border-white/10 pt-6 sm:grid-cols-2">
                    <div className="field sm:col-span-2">
                      <label className="field-label" htmlFor="sf-title">Title of the work</label>
                      <input className="field-input" id="sf-title" name="title" type="text" />
                      <FieldHint show={errors.includes('title')}>Every piece needs a title.</FieldHint>
                    </div>
                    <div className="field sm:col-span-2">
                      <label className="field-label" htmlFor="sf-cat">Category</label>
                      <div className="relative">
                        <select className="field-input w-full cursor-pointer appearance-none pr-10" id="sf-cat" name="category" defaultValue="">
                          <option value="" disabled>Choose a department…</option>
                          {CATEGORIES.map((c) => (
                            <option key={c.slug} value={c.name}>{c.name}</option>
                          ))}
                          <option value="Other">Other — open a new one</option>
                        </select>
                        <svg viewBox="0 0 24 24" aria-hidden="true" className="pointer-events-none absolute bottom-[1.05rem] right-1 h-4 w-4 fill-none stroke-gold [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]">
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </div>
                      <FieldHint show={errors.includes('category')}>Choose a department.</FieldHint>
                    </div>
                    <div className="field sm:col-span-2">
                      <label className="field-label" htmlFor="sf-desc">Short description / excerpt <span className="text-white/40">— optional</span></label>
                      <textarea
                        className="field-input field-area !min-h-20"
                        id="sf-desc"
                        name="description"
                        rows={3}
                        placeholder="A line or two about the piece — what it is, what it carries."
                      />
                    </div>
                  </div>
                </div>

                {/* ——— III · the piece ——— */}
                <div>
                  <p className="kicker">III — the piece</p>
                  <div className="mt-6 grid grid-cols-1 gap-8 border-t border-white/10 pt-6">
                    <div className="field">
                      <label className="field-label" htmlFor="sf-work">Full submission / article</label>
                      <textarea
                        className="field-input field-area"
                        id="sf-work"
                        name="work"
                        rows={10}
                        placeholder="Your story, in your words — or a note about the work you want featured."
                      />
                      <FieldHint show={errors.includes('work')}>The work itself is required.</FieldHint>
                    </div>
                    <div className="field">
                      <span className="field-label">Cover / supporting image <span className="text-white/40">— optional</span></span>
                      <label className="mt-1 flex cursor-pointer items-center justify-between gap-4 border border-dashed border-gold/30 px-5 py-4 transition-colors duration-500 hover:border-gold/60">
                        <span className="min-w-0 truncate font-serif text-base italic text-white/70">
                          {fileName || 'Choose a file — a cover plate, a photograph, a scan'}
                        </span>
                        <span className="shrink-0 border border-gold/50 px-4 py-2 font-mono text-[9px] uppercase tracking-[0.28em] text-gold">
                          Choose
                        </span>
                        <input
                          type="file"
                          name="cover"
                          accept="image/*"
                          aria-label="Cover image — optional"
                          className="sr-only"
                          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* ——— the final action ——— */}
                <div className="flex flex-col items-start gap-5">
                  <button type="submit" disabled={sending} aria-busy={sending} className="btn btn-gold self-start disabled:pointer-events-none disabled:opacity-60">
                    {sending ? 'Sending the piece…' : 'Submit the piece'}
                  </button>
                  <p className="max-w-[52ch] text-sm leading-[1.8] text-white/60">
                    We carefully curate each submission — every post is more than content; the writer keeps the byline, the tools are disclosed, and the desk answers.
                  </p>
                  <p className="font-mono text-[9px] uppercase leading-[2] tracking-[0.30em] text-white/45">
                    Delivered to the desk · credited by name · answered by {BRAND.email}
                  </p>
                </div>
              </>
            )}
          </form>

          {/* Guidelines */}
          <aside>
            <Reveal><p className="kicker">Guidelines</p></Reveal>
            <ol className="mt-8 border-t border-white/10">
              {[
                ['01', 'One piece at a time', 'Send the one you keep rereading — your best, not your most recent.'],
                ['02', 'Credit is a rule', 'The writer is named on every feature, by name and handle. That is the magazine\'s first promise.'],
                ['03', 'Transparency', 'If the presentation is designed with tools, the caption will say so. The writing stays yours.'],
                ['04', 'A response', 'The desk reads everything. If the story belongs in the magazine, it becomes a feature.'],
                ['05', 'Where to send it', BRAND.email + ' — or the submission form in the bio.'],
              ].map(([n, t, d], i) => (
                <Reveal key={n} delay={i * 0.08} as="li">
                  <div className="grid grid-cols-[44px_1fr] gap-4 border-b border-white/10 py-6">
                    <span className="pt-1 font-mono text-[10px] tracking-[0.28em] text-gold">{n}</span>
                    <div>
                      <p className="font-serif text-xl">{t}</p>
                      <p className="mt-2 max-w-[44ch] text-sm leading-relaxed text-white/60">{d}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ol>
            <Reveal delay={0.3} className="mt-10 border-l-2 border-gold pl-7">
              <p className="font-serif text-xl font-light italic text-ivory/85">
                “The next feature could be yours.”
              </p>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">— The Verlyse Media desk</p>
            </Reveal>
          </aside>
        </div>
      </section>
    </>
  )
}
