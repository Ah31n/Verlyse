import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useSeo } from '../hooks/useSeo'
import Reveal from '../components/ui/Reveal'
import { BRAND, CATEGORIES } from '../data/content'
import { CrashZoom } from '../components/cinematic'
import {
  FloralWord,
  HaikeiContourPlane,
} from '../components/ui/EditorialCraftSystem'

/** A quiet field-level note — shown only when the line needs attention.
    Linked to its input via aria-describedby; a single form-level live region
    announces validation state so multiple simultaneous alerts never collide. */
function FieldHint({ id, show, children }: { id: string; show: boolean; children: ReactNode }) {
  if (!show) return null
  return (
    <p id={id} className="font-serif text-sm italic leading-snug text-[#E8A2A2]">
      {children}
    </p>
  )
}

export const VERCEL_SUBMIT_ENDPOINT = 'https://verlyse-react.vercel.app/api/submit'
export const MAX_COVER_BYTES = 4 * 1024 * 1024
export const ACCEPTED_COVER_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
] as const

/**
 * Resolve the submission API target:
 * - On the canonical static InfinityFree host (`verlysemedia.kesug.com`), where
 *   `/api/*` is not backed by a serverless runtime, call the Vercel serverless
 *   endpoint directly (`https://verlyse-react.vercel.app/api/submit`).
 * - On Vercel or local dev/preview/test origins, call same-origin `/api/submit`.
 */
export function resolveSubmitEndpoint(hostname?: string): string {
  const host =
    hostname ?? (typeof window !== 'undefined' ? window.location.hostname : '')
  if (host === 'verlysemedia.kesug.com' || host === 'www.verlysemedia.kesug.com') {
    return VERCEL_SUBMIT_ENDPOINT
  }
  return '/api/submit'
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

interface DraftSnapshot {
  name: string
  email: string
  handle: string
  title: string
  category: string
  description: string
  work: string
  fileName: string
}

export function buildSubmissionMailtoHref(draft: DraftSnapshot): string {
  const params = new URLSearchParams({
    subject: `Submission — ${draft.title || 'Untitled piece'}`,
    body: [
      `Name: ${draft.name}`,
      `Email: ${draft.email}`,
      draft.handle ? `Handle: ${draft.handle}` : '',
      `Title: ${draft.title}`,
      `Category: ${draft.category}`,
      draft.description ? `Description: ${draft.description}` : '',
      '',
      '--- the work ---',
      draft.work,
      draft.fileName
        ? `\n[Cover image to attach manually in your mail app before pressing Send: ${draft.fileName}]`
        : '',
    ]
      .filter(Boolean)
      .join('\n'),
  })
  return `mailto:${BRAND.email}?${params.toString()}`
}

type SubmissionUiState = 'idle' | 'invalid' | 'sending' | 'accepted' | 'failed'

export default function Submit() {
  useSeo({
    path: '/submit',
    title: 'Submit',
    description: 'Send your story to Verlyse Media. Every feature begins as a submission.',
  })

  const formRef = useRef<HTMLFormElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const inFlightRef = useRef(false)
  const [uiState, setUiState] = useState<SubmissionUiState>('idle')
  const [errors, setErrors] = useState<string[]>([])
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState('')
  const [fileError, setFileError] = useState('')
  const [deliveryError, setDeliveryError] = useState('')
  const [draftOpened, setDraftOpened] = useState(false)
  const [lastDraft, setLastDraft] = useState<DraftSnapshot | null>(null)
  const [acceptedMeta, setAcceptedMeta] = useState<{
    title: string
    attachmentIncluded: boolean
    attachmentName: string
  } | null>(null)

  const sending = uiState === 'sending'
  const accepted = uiState === 'accepted'

  const clearFieldError = (field: string) => {
    setErrors((prev) => (prev.includes(field) ? prev.filter((k) => k !== field) : prev))
    formRef.current?.querySelector<HTMLElement>(`[name="${field}"]`)?.classList.remove('is-invalid')
  }

  const clearCoverSelection = () => {
    setCoverFile(null)
    setFileName('')
    setFileError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  /** Validate a chosen cover file before upload — MIME type, non-empty, and size limit. */
  const onCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      setCoverFile(null)
      setFileName('')
      setFileError('')
      return
    }
    if (!(ACCEPTED_COVER_MIMES as readonly string[]).includes(file.type)) {
      setFileError('The desk accepts JPG, PNG, WEBP, AVIF or GIF covers — please choose a valid image file.')
      e.target.value = ''
      setCoverFile(null)
      setFileName('')
      return
    }
    if (file.size === 0) {
      setFileError('That image file appears to be empty — please choose a non-empty cover image.')
      e.target.value = ''
      setCoverFile(null)
      setFileName('')
      return
    }
    if (file.size > MAX_COVER_BYTES) {
      setFileError('That image is over 4 MB — please send a smaller cover (up to 4 MB).')
      e.target.value = ''
      setCoverFile(null)
      setFileName('')
      return
    }
    setFileError('')
    setCoverFile(file)
    setFileName(file.name)
  }

  const describeServerError = (status: number, code?: string): string => {
    if (code === 'provider-unconfigured' || status === 503) {
      return 'The submission service is currently unconfigured on this deployment — your manuscript and selected cover image are still intact on this page. Retry once configured, or open an email draft below.'
    }
    if (code === 'file-too-large' || status === 413) {
      return 'The selected cover image exceeds the upload size limit (4 MB max) — please choose a smaller image and retry.'
    }
    if (
      code === 'invalid-image-signature' ||
      code === 'invalid-image-type' ||
      code === 'empty-file' ||
      status === 415
    ) {
      return 'The selected file could not be verified as a valid JPG, PNG, WEBP, AVIF, or GIF image — please choose another image or clear the cover selection.'
    }
    if (code === 'too-many-requests' || status === 429) {
      return 'Too many submission attempts in a short window — please wait a few minutes and retry, or open an email draft below.'
    }
    if (code === 'invalid-fields' || status === 422) {
      return 'Some required submission fields were rejected by the server — please check your entries and retry.'
    }
    if (code === 'upstream-timeout' || status === 504) {
      return 'The submission service timed out while contacting the mail relay — your words and selected cover image remain intact below. Please retry or open an email draft.'
    }
    return 'The submission could not be delivered to the server right now — your words and selected cover image remain intact on this page. Please retry or open an email draft below.'
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (inFlightRef.current || sending || accepted) return
    const form = e.currentTarget
    const data = new FormData(form)
    const name = String(data.get('name') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    const handle = String(data.get('handle') ?? '').trim()
    const title = String(data.get('title') ?? '').trim()
    const category = String(data.get('category') ?? '').trim()
    const description = String(data.get('description') ?? '').trim()
    const work = String(data.get('work') ?? '').trim()
    const gotcha = String(data.get('_gotcha') ?? '').trim()
    const original = data.get('original') === 'on'

    const bad: string[] = []
    if (!name) bad.push('name')
    if (!email) bad.push('email')
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) bad.push('email')
    if (!title) bad.push('title')
    if (!category) bad.push('category')
    if (!work) bad.push('work')
    if (!original) bad.push('original')

    form.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'))
    bad.forEach((k) => form.querySelector<HTMLElement>(`[name="${k}"]`)?.classList.add('is-invalid'))
    setErrors(bad)

    if (bad.length > 0 || fileError) {
      setUiState('invalid')
      setDeliveryError('')
      if (bad.length > 0) {
        form.querySelector<HTMLElement>(`[name="${bad[0]}"]`)?.focus()
      } else {
        fileInputRef.current?.focus()
      }
      return
    }

    const activeFile = coverFile ?? fileInputRef.current?.files?.[0] ?? null
    const snapshot: DraftSnapshot = {
      name,
      email,
      handle,
      title,
      category,
      description,
      work,
      fileName: activeFile?.name ?? fileName,
    }
    inFlightRef.current = true
    setLastDraft(snapshot)
    setDeliveryError('')
    setDraftOpened(false)
    setUiState('sending')

    const outbound = new FormData()
    outbound.append('kind', 'submission')
    outbound.append('name', name)
    outbound.append('email', email)
    if (handle) outbound.append('handle', handle)
    outbound.append('title', title)
    outbound.append('category', category)
    if (description) outbound.append('description', description)
    outbound.append('work', work)
    outbound.append('original', 'on')
    if (gotcha) outbound.append('_gotcha', gotcha)
    if (activeFile) {
      outbound.append('cover', activeFile, activeFile.name)
    }

    try {
      const res = await fetch(resolveSubmitEndpoint(), {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: outbound,
      })
      const payload = (await res.json().catch(() => ({}))) as {
        ok?: boolean
        accepted?: boolean
        error?: string
        attachmentIncluded?: boolean
        attachmentName?: string | null
      }

      if (res.ok && payload.ok === true) {
        setAcceptedMeta({
          title,
          attachmentIncluded: Boolean(payload.attachmentIncluded ?? activeFile),
          attachmentName: payload.attachmentName ?? activeFile?.name ?? '',
        })
        setUiState('accepted')
        return
      }

      setDeliveryError(describeServerError(res.status, payload.error))
      setUiState('failed')
    } catch {
      setDeliveryError(describeServerError(0))
      setUiState('failed')
    } finally {
      inFlightRef.current = false
    }
  }

  const resetForm = () => {
    formRef.current?.reset()
    setUiState('idle')
    setErrors([])
    setCoverFile(null)
    setFileName('')
    setFileError('')
    setDeliveryError('')
    setDraftOpened(false)
    setLastDraft(null)
    setAcceptedMeta(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const hasValidationAlert = errors.length > 0 || Boolean(fileError)

  return (
    <>
      <section className="relative overflow-hidden border-b border-white/10 bg-wine-deep pb-14 pt-[clamp(7rem,16vh,10rem)]">
        {/* the desk lamp — a warm, directional light over the desk */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(80%_55%_at_50%_-6%,rgba(232,217,168,0.16),transparent_62%),radial-gradient(110%_85%_at_50%_0%,rgba(92,18,36,0.35),transparent_60%),linear-gradient(175deg,#4A1120_0%,#2A0F18_60%,#15050B_100%)]" />
          <HaikeiContourPlane tone="dark" seed={8} className="opacity-20" />
          <span aria-hidden="true" className="absolute left-1/2 top-0 h-[3px] w-[34vw] max-w-[520px] -translate-x-1/2 bg-gradient-to-b from-gold/50 to-transparent" />
        </div>
        <div className="relative mx-auto w-full max-w-page px-[clamp(1.25rem,4vw,4.75rem)]">
          <Reveal><p className="eyebrow">Submissions — open · writer → work → piece → desk</p></Reveal>
          <div className="relative mt-8">
            <CrashZoom className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2">
              <span aria-hidden="true" className="block select-none whitespace-nowrap text-center font-serif text-[clamp(3.4rem,9vw,7.5rem)] font-semibold leading-none text-transparent [-webkit-text-stroke:1px_rgba(184,145,70,0.08)]">
                THE EDITORIAL DESK
              </span>
            </CrashZoom>
            <h1 className="relative font-serif text-[clamp(2.8rem,7.5vw,6rem)] font-light leading-[0.92] tracking-[-0.02em] text-ivory">
              <span className="relative">The editorial <FloralWord variant="magnolia">desk</FloralWord></span>
            </h1>
          </div>
          <Reveal delay={0.15}>
            <p className="mt-6 max-w-[52ch] text-lg leading-[1.8] text-white/70">
              “{BRAND.submitCta}”
            </p>
          </Reveal>
          <Reveal delay={0.22}>
            <p className="mt-4 max-w-[52ch] text-base leading-[1.8] text-white/60">
              Every feature in this magazine began as someone’s kept notebook page, late-night draft, or quiet painting. The desk reads everything, credits the writer by name, and answers with care. Send the one you keep rereading.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-9 flex flex-wrap items-center gap-x-2 gap-y-3" role="group" aria-label="What Verlyse accepts — seven departments">
              <span className="mr-2 font-mono text-[9px] uppercase tracking-[0.28em] text-white/60">The desk accepts —</span>
              {CATEGORIES.map((c) => (
                <span
                  key={c.slug}
                  className="inline-flex items-center gap-2 border border-ivory/20 px-3.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-ivory/75"
                  title={`${c.name} — ${c.blurb}`}
                >
                  <span aria-hidden="true" style={{ color: c.accent }}>{c.motif}</span>
                  {c.name}
                </span>
              ))}
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/60">…and ideas for a room not opened yet</span>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative border-t border-white/10 pb-[clamp(5rem,12vh,9rem)] pt-[clamp(3rem,7vh,5rem)]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(60%_90%_at_50%_0%,rgba(232,217,168,0.07),transparent_70%)]" />
        <div className="mx-auto grid max-w-page grid-cols-1 gap-[clamp(3rem,6vw,7rem)] px-[clamp(1.75rem,5.5vw,4.75rem)] lg:grid-cols-[1.15fr_0.85fr]">
          {/* Form */}
          <form
            ref={formRef}
            onSubmit={onSubmit}
            data-submission-state={uiState}
            className="flex max-w-[640px] flex-col gap-10"
            noValidate
          >
            {accepted ? (
              /* ——— Verified server acceptance screen ——— */
              <div role="status" aria-live="polite" className="border-t border-gold/30 pt-10">
                <p className="kicker">Accepted by the submission system</p>
                <h2 className="mt-5 font-serif text-[clamp(2rem,3.6vw,3rem)] font-light leading-[1.05] tracking-[-0.015em] text-ivory">
                  Your submission has been received — <em className="italic text-gold">the desk writes back</em>
                </h2>
                <p className="mt-6 max-w-[46ch] font-serif text-lg font-light italic leading-[1.7] text-white/75">
                  {acceptedMeta?.title ? `“${acceptedMeta.title}”` : 'Your piece'} has been accepted by the Verlyse submission server and queued for the editorial desk. Every submission is read, and every featured writer is credited by name.
                </p>
                {acceptedMeta?.attachmentIncluded && acceptedMeta.attachmentName ? (
                  <p className="mt-4 max-w-[46ch] font-mono text-[10px] uppercase leading-[2] tracking-[0.24em] text-[#A8C9A2]">
                    Cover image uploaded &amp; attached: {acceptedMeta.attachmentName}
                  </p>
                ) : null}
                <p className="mt-6 max-w-[44ch] font-mono text-[10px] uppercase leading-[2] tracking-[0.28em] text-white/55">
                  Accepted by server · credited by name · answered from {BRAND.email}
                </p>
                <button type="button" onClick={resetForm} className="btn btn-ghost mt-10">
                  Send another piece
                </button>
              </div>
            ) : (
              <>
                {/* Honeypot field — hidden from humans and assistive tech */}
                <div aria-hidden="true" className="sr-only">
                  <label htmlFor="sf-gotcha">Leave this field blank</label>
                  <input id="sf-gotcha" name="_gotcha" type="text" tabIndex={-1} autoComplete="off" />
                </div>

                {/* ——— I · the writer ——— */}
                <div>
                  <p className="kicker">I — the writer</p>
                  <div className="mt-6 grid grid-cols-1 gap-8 border-t border-white/10 pt-6 sm:grid-cols-2">
                    <div className="field">
                      <label className="field-label" htmlFor="sf-name">Full name</label>
                      <input
                        className="field-input"
                        id="sf-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        aria-invalid={errors.includes('name') ? 'true' : undefined}
                        aria-describedby={errors.includes('name') ? 'sf-name-err' : undefined}
                        onInput={() => clearFieldError('name')}
                      />
                      <FieldHint id="sf-name-err" show={errors.includes('name')}>Please sign your name.</FieldHint>
                    </div>
                    <div className="field">
                      <label className="field-label" htmlFor="sf-email">Email</label>
                      <input
                        className="field-input"
                        id="sf-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        aria-invalid={errors.includes('email') ? 'true' : undefined}
                        aria-describedby={errors.includes('email') ? 'sf-email-err' : undefined}
                        onInput={() => clearFieldError('email')}
                      />
                      <FieldHint id="sf-email-err" show={errors.includes('email')}>An email is needed — the desk writes back.</FieldHint>
                    </div>
                    <div className="field sm:col-span-2">
                      <label className="field-label" htmlFor="sf-handle">Instagram / social handle <span className="text-white/60">— optional</span></label>
                      <input className="field-input" id="sf-handle" name="handle" type="text" autoComplete="username" />
                    </div>
                  </div>
                </div>

                {/* ——— II · the work ——— */}
                <div>
                  <p className="kicker">II — the work</p>
                  <div className="mt-6 grid grid-cols-1 gap-8 border-t border-white/10 pt-6 sm:grid-cols-2">
                    <div className="field sm:col-span-2">
                      <label className="field-label" htmlFor="sf-title">Title of the work</label>
                      <input
                        className="field-input"
                        id="sf-title"
                        name="title"
                        type="text"
                        aria-invalid={errors.includes('title') ? 'true' : undefined}
                        aria-describedby={errors.includes('title') ? 'sf-title-err' : undefined}
                        onInput={() => clearFieldError('title')}
                      />
                      <FieldHint id="sf-title-err" show={errors.includes('title')}>Every piece needs a title.</FieldHint>
                    </div>
                    <div className="field sm:col-span-2">
                      <label className="field-label" htmlFor="sf-cat">Category</label>
                      <div className="relative">
                        <select
                          className="field-input w-full cursor-pointer appearance-none pr-10"
                          id="sf-cat"
                          name="category"
                          defaultValue=""
                          aria-invalid={errors.includes('category') ? 'true' : undefined}
                          aria-describedby={errors.includes('category') ? 'sf-cat-err' : undefined}
                          onChange={() => clearFieldError('category')}
                        >
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
                      <FieldHint id="sf-cat-err" show={errors.includes('category')}>Choose a department.</FieldHint>
                    </div>
                    <div className="field sm:col-span-2">
                      <label className="field-label" htmlFor="sf-desc">Short description / excerpt <span className="text-white/60">— optional</span></label>
                      <textarea
                        className="field-input field-area !min-h-20"
                        id="sf-desc"
                        name="description"
                        rows={3}
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
                        aria-invalid={errors.includes('work') ? 'true' : undefined}
                        aria-describedby={errors.includes('work') ? 'sf-work-err' : undefined}
                        onInput={() => clearFieldError('work')}
                      />
                      <FieldHint id="sf-work-err" show={errors.includes('work')}>The work itself is required.</FieldHint>
                    </div>
                    <div className="field">
                      <label className="field-label" htmlFor="sf-cover">Cover / supporting image <span className="text-white/60">— optional (JPG, PNG, WEBP, AVIF, GIF up to 4 MB)</span></label>
                      <div className="mt-1 flex flex-wrap items-center justify-between gap-4 border border-dashed border-gold/30 px-5 py-4 transition-colors duration-500 focus-within:border-gold hover:border-gold/60">
                        <span className="min-w-0 flex-1 truncate font-serif text-base italic text-white/70">
                          {coverFile
                            ? `Selected cover: ${fileName} (${formatBytes(coverFile.size)})`
                            : 'Choose a cover plate, photograph, or scan'}
                        </span>
                        <div className="flex shrink-0 items-center gap-2">
                          {fileName && (
                            <button
                              type="button"
                              onClick={clearCoverSelection}
                              className="border border-white/20 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.24em] text-white/70 transition-colors hover:border-gold hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                            >
                              Clear
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="cursor-pointer border border-gold/50 px-4 py-2 font-mono text-[9px] uppercase tracking-[0.28em] text-gold transition-colors hover:border-gold hover:bg-gold/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                          >
                            {fileName ? 'Change' : 'Choose'}
                          </button>
                        </div>
                        <input
                          ref={fileInputRef}
                          id="sf-cover"
                          type="file"
                          name="cover"
                          accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                          aria-invalid={fileError ? 'true' : undefined}
                          aria-describedby={
                            fileError
                              ? 'sf-cover-err sf-cover-note'
                              : fileName
                                ? 'sf-cover-status sf-cover-note'
                                : 'sf-cover-note'
                          }
                          className="sr-only"
                          onChange={onCoverChange}
                        />
                      </div>
                      {fileError ? (
                        <FieldHint id="sf-cover-err" show>{fileError}</FieldHint>
                      ) : coverFile ? (
                        <p id="sf-cover-status" className="mt-2 font-mono text-[9px] uppercase tracking-[0.22em] text-gold-lit/85">
                          Cover ready to upload ({fileName} · {formatBytes(coverFile.size)}) — transmitted as binary image data with your submission.
                        </p>
                      ) : null}
                      <p id="sf-cover-note" className="mt-2 max-w-[48ch] text-xs leading-[1.7] text-white/65">
                        Your selected cover image is uploaded directly to the submission endpoint (verified by file signature, up to 4 MB). If the server is unavailable and you open a manual email draft instead, attach the image file in your mail app before pressing Send.
                      </p>
                    </div>
                  </div>
                </div>

                {/* ——— IV · the promise — rights, originality, the window ——— */}
                <div>
                  <p className="kicker">IV — the promise</p>
                  <div className="mt-6 border-t border-white/10 pt-6">
                    <label
                      htmlFor="sf-original"
                      className={`flex cursor-pointer items-start gap-4 border px-5 py-5 transition-colors duration-500 ${
                        errors.includes('original') ? 'border-[#E8A2A2]/70' : 'border-white/15 hover:border-gold/45'
                      }`}
                    >
                      <input
                        type="checkbox"
                        id="sf-original"
                        name="original"
                        aria-invalid={errors.includes('original') ? 'true' : undefined}
                        aria-describedby={errors.includes('original') ? 'sf-original-err' : undefined}
                        onChange={() => clearFieldError('original')}
                        className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-[#B89146] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                      />
                      <span className="text-sm leading-[1.8] text-white/70">
                        <span className="block font-mono text-[10px] uppercase tracking-[0.26em] text-ivory">Originality &amp; rights — confirmed</span>
                        <span className="mt-2 block">
                          I wrote or made this work myself, or I hold the right to send it. If a tool helped design the presentation, I will say so — the desk discloses the same way on its own posts. The byline, and the ownership of the words, stay mine.
                        </span>
                      </span>
                    </label>
                    <FieldHint id="sf-original-err" show={errors.includes('original')}>The desk needs this before the piece can be read.</FieldHint>
                    <p className="mt-5 max-w-[58ch] font-mono text-[9px] uppercase leading-[2.1] tracking-[0.22em] text-white/60">
                      Privacy — your name, email, handle, manuscript, and optional cover image are sent to the Verlyse submission endpoint to forward this submission to {BRAND.email}. Submission addresses are not added to the newsletter list, and work is published only if selected and credited to you. Questions about a submission may be sent to {BRAND.email}.
                    </p>
                    <p className="mt-3 max-w-[58ch] font-mono text-[9px] uppercase leading-[2.1] tracking-[0.22em] text-white/60">
                      Review window — the desk reads every received submission and replies from {BRAND.email} as pieces are reviewed for upcoming issues.
                    </p>
                  </div>
                </div>

                {/* ——— the final action ——— */}
                <div className="flex flex-col items-start gap-5">
                  <button
                    type="submit"
                    disabled={sending}
                    aria-busy={sending}
                    className="btn btn-gold self-start disabled:pointer-events-none disabled:opacity-60"
                  >
                    {sending
                      ? coverFile
                        ? 'Uploading cover & sending…'
                        : 'Sending the piece…'
                      : uiState === 'failed'
                        ? 'Retry submission'
                        : 'Submit the piece'}
                  </button>

                  {hasValidationAlert && (
                    <p role="alert" className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#E8A2A2]">
                      A few required lines remain — the desk has marked them ({errors.length + (fileError ? 1 : 0)} {errors.length + (fileError ? 1 : 0) === 1 ? 'item' : 'items'}).
                    </p>
                  )}

                  {!hasValidationAlert && uiState === 'failed' && deliveryError && (
                    <div
                      role="alert"
                      data-testid="submit-delivery-alert"
                      className="w-full max-w-[56ch] border border-[#E8A2A2]/55 bg-wine-deep/80 px-5 py-5 text-left"
                    >
                      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#E8A2A2]">
                        Submission not yet delivered — action needed
                      </p>
                      <p className="mt-2 text-sm leading-[1.75] text-ivory/90">
                        {deliveryError}
                      </p>
                      {lastDraft && (
                        <div className="mt-4 flex flex-col items-start gap-3 border-t border-white/10 pt-4">
                          <a
                            href={buildSubmissionMailtoHref(lastDraft)}
                            onClick={() => setDraftOpened(true)}
                            className="inline-flex items-center gap-2 border border-gold/60 px-4 py-2 font-mono text-[9px] uppercase tracking-[0.24em] text-gold no-underline transition-colors hover:border-gold hover:bg-gold/10"
                          >
                            Open email draft in your mail app ({BRAND.email})
                          </a>
                          <p className="text-xs leading-[1.7] text-white/65">
                            Opening an email draft does not automatically send your submission: you must still press <strong>Send</strong> in your mail app
                            {lastDraft.fileName
                              ? `, and manually attach "${lastDraft.fileName}" because mailto: links cannot attach local image files automatically.`
                              : '.'}
                          </p>
                          {draftOpened && (
                            <p role="status" className="font-mono text-[9px] uppercase tracking-[0.22em] text-gold">
                              Email draft requested — attach any cover image and press Send in your mail client to complete delivery.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <p aria-live="polite" className="max-w-[52ch] text-sm leading-[1.8] text-white/60">
                    {sending
                      ? 'The piece is crossing to the submission server — one moment.'
                      : 'We carefully curate each submission — every post is more than content; the writer keeps the byline, the tools are disclosed, and the desk answers.'}
                  </p>
                  <p className="font-mono text-[9px] uppercase leading-[2] tracking-[0.30em] text-white/60">
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
                ['05', 'Where to send it', BRAND.email + ' — or this page’s own submission form, the desk’s way in.'],
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
